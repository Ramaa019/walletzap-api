# Arrancar y bajar el proceso: `startServer`, señales y el bug del orden

## `authenticate()` vs `sync()` al arrancar

```js
await sequelize.authenticate();
console.log('Connection to PostgreSQL (Neon) established.');

// await sequelize.sync({ alter: false });
// console.log('Models synchronized with the database.');
```

- **`authenticate()`**: abre una conexión real contra Neon y valida que las
  credenciales/host/puerto sean correctos. Falla rápido (`catch` de abajo)
  si algo está mal configurado, **antes** de levantar el server con
  `app.listen()` — no tiene sentido aceptar requests si ni siquiera hay DB.
- **`sync()`**: compara los modelos de Sequelize contra las tablas reales
  en la DB y las crea/ajusta si hace falta. Está comentado porque todavía
  no existen modelos (`User`, `Account`, `Transaction`) — no hay nada que
  sincronizar todavía.

## Exit codes: cómo el proceso le avisa al orquestador si murió bien o mal

```js
} catch (error) {
  console.error('Fatal error starting server:', error);
  process.exit(1);
}
```

`process.exit(code)` no es solo "matar el proceso" — el número que le
pasás es un mensaje para quien esté gestionando ese proceso (Render,
Docker, PM2, Kubernetes):

- **`exit(0)`**: "terminé a propósito, todo bien" — salida limpia, como el
  `shutdown` graceful de abajo. El orquestador normalmente no reinicia
  solo porque sí.
- **`exit(1)`** (o cualquier código distinto de cero): "morí por un
  error" — señal de fallo. Muchos orquestadores interpretan esto como
  "reintentar/reiniciar el proceso".

Por eso si `sequelize.authenticate()` falla al arrancar, se sale con `1`:
le está diciendo a Render "esto fue un fallo real", no una parada
intencional.

## ¿Qué es una señal de proceso?

Cuando un programa corre en el sistema operativo, es un **proceso** con un
PID. El SO (o un humano desde la terminal) puede mandarle **señales** —
interrupciones cortas que le dicen "reaccioná a esto".

Dos que nos importan acá:

- **`SIGINT`**: la manda la terminal cuando apretás `Ctrl+C`.
- **`SIGTERM`**: la "señal educada" que usan los orquestadores (Render,
  Docker, Kubernetes) cuando quieren bajar o reiniciar el proceso — por
  ejemplo, durante un deploy.

La diferencia real no es "prod vs dev", es **quién la manda**: un humano en
una terminal (`SIGINT`) vs. la infraestructura que gestiona el proceso
(`SIGTERM`). En la práctica vas a ver más `SIGINT` en local y `SIGTERM` en
Render, pero la causa de fondo es esa.

En Node te suscribís a una señal igual que a cualquier evento:

```js
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
```

## Por qué "graceful" (con gracia)

Si el proceso muere de golpe (`process.exit()` sin más), corta lo que sea
que esté haciendo en ese instante — puede cortar una query a mitad de
camino o una response HTTP que todavía no llegó al cliente. Un graceful
shutdown primero termina ordenadamente lo que está en curso (cerrar el
server HTTP, cerrar la conexión a la DB) y **recién después** mata el
proceso.

## El bug: callback sin esperar vs. `await`

Primera versión de `shutdown`:

```js
if (server) {
  server.close(() => console.log('HTTP server closed.'));
}
await sequelize.close();
console.log('Database connection closed.');
```

`server.close(callback)` **no bloquea** — solo registra qué hacer cuando
termine de cerrar todas las conexiones activas, y el código sigue de largo
a la línea siguiente al toque. `await sequelize.close()`, en cambio, sí
bloquea. Resultado: si cerrar la DB era más rápido que drenar las
conexiones HTTP, `process.exit(0)` se ejecutaba **antes** de que el server
realmente terminara de cerrar — cortando cualquier request en curso.

## El fix: "promisificar" el callback

Para poder usar `await` con una función que solo ofrece callback, la
envolvés en una `Promise` y llamás a `resolve()` dentro de ese callback:

```js
await new Promise<void>((resolve) => {
  server.close(() => {
    resolve();
  });
});
console.log('HTTP server closed.');
```

Punto importante (donde caímos primero): la función que le pasás a
`new Promise(...)` (el "executor") corre **inmediatamente y de forma
síncrona** apenas se crea la promesa. Por eso el `console.log` no puede ir
suelto dentro del executor, junto a la llamada a `server.close()` — eso lo
imprimiría al toque, antes de que el cierre real termine. Tiene que ir
**después** del `await`, para que solo se imprima una vez que `resolve()`
se disparó de verdad.

Con este orden, `process.exit(0)` queda garantizado para ejecutarse recién
después de que el server HTTP y la conexión a la DB terminaron de cerrar
—no antes.

## Cómo se probó

A mano: correr el server, apretar `Ctrl+C`, y confirmar que los tres logs
salen siempre en el mismo orden (`SIGINT received...` → `HTTP server
closed.` → `Database connection closed.`), varias veces seguidas.
