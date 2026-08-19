# Middleware en Express

## ¿Qué es un middleware?

Un middleware es una función con la firma `(request, response, next) => { ... }`.

Cuando llega una petición (request) al servidor, Express la va pasando **en
cadena** por cada middleware registrado con `app.use(...)`, en el orden
exacto en que están definidos en el archivo principal (`index.ts`).

Un middleware puede:

- Leer o modificar la petición (`request`) y la respuesta (`response`).
- Cortar la cadena devolviendo una respuesta (`response.json()`,
  `response.status()`, ...). Ahí termina, no sigue a los siguientes.
- Llamar al siguiente middleware en la cadena con `next()`.
- Usar `next(error)` para saltar directamente al middleware que maneja los
  errores globales del servidor (`errorHandler.ts`).

Como `next()` es lo que pasa la posta al siguiente, **el orden en el que
definimos los middlewares en `index.ts` es sumamente importante**. Un orden
incorrecto puede generar bugs difíciles de rastrear: por ejemplo, si
intentamos leer `req.body` en una ruta antes de que corrió
`express.json()`, `req.body` va a llegar `undefined` porque nadie parseó
todavía el body crudo del request.

```
app.use(express.json({ limit: '10mb' }));
```

Esta línea agrega el middleware que parsea el body crudo (texto/bytes) de
un request con `Content-Type: application/json` y arma con eso un objeto JS
accesible en `req.body`. Si una ruta intenta usar `req.body` antes de que
este middleware haya corrido, no va a existir todavía.

---

## Middlewares usados en WalletZap

### `helmet()` — headers de seguridad HTTP

Por defecto, Express no configura casi ningún header de seguridad. `helmet()`
es en realidad **un combo de varios middlewares chiquitos**, cada uno
seteando un header HTTP puntual para mitigar un tipo de ataque conocido.
Los más relevantes que aplica por default:

- **`X-Content-Type-Options: nosniff`** — evita que el navegador "adivine"
  el tipo de contenido de una respuesta (MIME-sniffing), algo que se puede
  explotar para colar un script disfrazado de otro tipo de archivo.
- **`Strict-Transport-Security` (HSTS)** — le indica al navegador que, de
  ahora en más, hable con el sitio solo por HTTPS (nunca HTTP), para
  prevenir ataques de downgrade.
- **`X-Frame-Options`** — impide que el sitio se pueda embeber en un
  `<iframe>` ajeno (protección contra _clickjacking_: alguien pone tu web
  invisible encima de la suya para hacerte clickear cosas sin que te des
  cuenta).
- Elimina el header `X-Powered-By: Express` — no es una protección en sí
  misma, pero reduce la información gratuita que le das a un atacante sobre
  la tecnología que usás por detrás.

En resumen: son un montón de detalles de bajo nivel del protocolo HTTP que
normalmente no configuraríamos a mano uno por uno, así que `helmet()` da un
preset razonable por default.

### `cors()` — Same-Origin Policy y por qué existe

El concepto de fondo es la **Same-Origin Policy (SOP)**: por defecto, los
navegadores **no dejan que JavaScript acceda a recursos de un origen
distinto** al de la página que lo ejecuta. Es decir, si mi página
`ejA.com` quiere leer datos de `ejB.com`, el navegador no me va a dejar
tener esos datos, porque `ejB.com` no dio un permiso explícito para eso —
no es que "no me conozca", es que el navegador exige esa autorización
explícita y, si no está, asume que no está permitido.

**Analogía — la fiesta y la lista de invitados:**

Mi API (`tubanco.com`) es una fiesta que organizo en mi casa. En la
puerta hay un portero (**el navegador**) que decide quién entra —
no yo directamente, el portero es el que da la cara con cada visita.

Cuando alguien golpea la puerta pidiendo entrar, el portero le pregunta a
la organización: _"¿esta casa está en tu lista de invitados?"_ Yo, como
dueño de la fiesta, le dejé al portero una lista escrita de antemano (el
header `Access-Control-Allow-Origin`) con las casas que sí puedo dejar
pasar. Si `sitio-trucho.com` no está en esa lista, el portero no lo deja
entrar — no importa que haya golpeado bien la puerta, se queda afuera.

Un matiz importante: la fiesta (mi servidor) **igual se entera de que
golpearon** y prepara todo como si fuera a atenderlos — el portero es el
que corta el acceso a último momento, del lado del navegador, no del
lado de mi servidor. Por eso decimos que CORS lo hace cumplir el
navegador, no el servidor: mi servidor puede llegar a procesar el
pedido igual, pero el navegador no deja que el resultado vuelva al que
lo pidió si no estaba en la lista.

`cors()` es el middleware que arma esa lista de permisos: le dice al
navegador, vía headers, qué orígenes pueden leer las respuestas de mi API
— típicamente, el propio frontend (ej. `http://localhost:5173` en
desarrollo).

Config actual en `index.ts`:

```
cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true })
```

- **`origin`**: si existe la variable de entorno `CORS_ORIGIN`, toma ese
  valor como el/los dominio(s) permitidos. Si no existe, usa `'*'`, que le
  dice al navegador "cualquier origen puede leer las respuestas de esta
  API" (útil en desarrollo, pero hay que reemplazarlo por un dominio
  concreto en producción).

- **`credentials`**: es un candado **separado** del de `origin`. Por
  default, aunque el origen esté permitido, el navegador **no adjunta
  automáticamente la "tarjeta de acceso" (cookie) del usuario** en un
  request cross-origin. Para que sí viaje, tienen que estar de acuerdo los
  dos lados: el cliente tiene que pedirlo explícitamente
  (`fetch(url, { credentials: 'include' })`) y el servidor tiene que
  aceptarlo (`credentials: true` en `cors()`). Si cualquiera de los dos no
  lo pide, la cookie no viaja. Por eso, además, los navegadores **no
  permiten combinar `origin: '*'` con `credentials: true`**: sería
  autorizar a "cualquiera" a usar credenciales automáticas, lo mismo que
  la SOP existe para evitar.

> 🤔 **¿Necesitamos `credentials: true` en WalletZap?**
>
> _Respuesta:_ No. El plan del MVP es guardar el JWT en `localStorage` y
> mandarlo a mano en el header `Authorization` en cada request — es como
> si cada invitado mostrara su propia invitación en la mano cada vez, en
> vez de que el portero lo reconozca solo por una pulserita puesta de
> antemano (cookie). No dependemos de cookies de sesión, así que no
> necesitamos que el navegador comparta credenciales automáticas
> cross-origin. `credentials: true` solo tendría sentido si migráramos a
> auth basada en cookies.
