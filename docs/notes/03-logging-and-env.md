# Logging con `morgan` y el patrón `NODE_ENV`

## `morgan` — HTTP request logger

`morgan` es un middleware que loguea cada request HTTP que llega al
servidor: método, URL, status code de la respuesta, tiempo que tardó,
etc. Sin él, la terminal queda muda mientras probás la API — no hay
forma de saber qué está pasando salvo que pongas `console.log` a mano en
cada endpoint.

Analogía: es como el **portero/logbook de un edificio**. Cada vez que
alguien entra (una request), anota quién llegó, a qué piso iba, cuánto
tiempo estuvo, y cómo salió. Vos no tenés que estar mirando la puerta
todo el tiempo — cuando necesitás saber qué pasó, revisás el logbook.

```js
app.use(morgan('dev'));
```

`'dev'` es uno de los formatos predefinidos de la librería, pensado para
desarrollo: conciso y coloreado según el status code (verde 2xx, rojo
5xx). Ejemplo de lo que se ve en consola:

```
GET /health 200 2.145 ms - 45
POST /api/transactions 201 38.902 ms - 120
```

## `NODE_ENV` — en qué modo corre la app

`NODE_ENV` es una variable de entorno (convención muy usada, no es algo
mágico de Node) que indica el **modo** en el que corre la app:
`development`, `production`, o `test`.

Analogía: el **dial de modos de un lavarropas** — mismo lavarropas, mismo
código por dentro, pero según la posición del dial (delicado, normal,
centrifugado fuerte) se comporta distinto.

¿Quién la setea?

| Modo          | Quién la setea                                              |
| -------------- | ------------------------------------------------------------ |
| `development` | Vos, en `.env` (o ni se setea, y cae al fallback `\|\| 'development'`) |
| `test`         | Automático, lo setea Vitest antes de correr los tests        |
| `production`   | El hosting (Render), como variable de entorno del dashboard  |

Dato importante: `dotenv.config()` **no pisa** variables que ya existen
en `process.env`. Por eso, cuando Vitest setea `NODE_ENV=test` antes de
que arranque la app, `dotenv.config()` respeta ese valor y no lo
sobreescribe con lo que haya (o no haya) en `.env`.

## Por qué se combinan así en `index.ts`

```js
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}
```

Durante los tests, Supertest dispara muchas requests en segundos. Lo que
importa ver en la terminal en ese momento es el **resultado de los
tests** (qué pasó, qué falló, por qué) — no un access log de cada
request tapando esa info. Es un tema de señal vs. ruido: si un test
falla, el error útil lo da el *assertion* de Vitest/Supertest, no una
línea de `morgan`. Por eso se apaga específicamente en modo `test`, pero
se deja prendido en `development` (y normalmente también en
`production`, para tener visibilidad de qué requests llegan al server
real).
