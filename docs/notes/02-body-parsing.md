# Body parsing en Express: `express.json()` vs `express.urlencoded()`

## ¿Por qué hace falta esto?

Node no parsea el body de una request HTTP automáticamente. Lo que llega
al servidor es un **stream de bytes crudos** — Express (y Node) no saben
de antemano si eso es JSON, texto plano, un form, o cualquier otra cosa.
El header `Content-Type` le dice al servidor "qué idioma habla" ese body,
pero alguien tiene que traducirlo.

Analogía: pensá en el body de la request como un **paquete sellado que
llega por correo**. El middleware de body-parsing es la persona en
recepción que abre el paquete, lee el contenido (si sabe el idioma en el
que está escrito) y te entrega un resumen legible (`req.body`). Sin ese
paso, tenés un paquete cerrado — sabés que algo llegó, pero no lo podés
leer. `req.body` queda `undefined`.

## `express.json()`

Traduce paquetes escritos en **JSON** (`Content-Type: application/json`).
Es el formato que usan `fetch`/`axios` desde el frontend, y el que suele
usar cualquier webhook moderno (como el de WhatsApp Cloud API).

```
app.use(express.json({ limit: '10mb' }));
```

El `limit` pone un techo al tamaño del body — evita que alguien mande un
JSON gigante para saturar el servidor.

## `express.urlencoded()`

Traduce paquetes escritos en **`application/x-www-form-urlencoded`** —
el formato clásico con el que un `<form>` HTML de toda la vida (sin JS de
por medio) manda datos: `username=rama&password=1234`.

```
app.use(express.urlencoded({ extended: true }));
```

### La opción `extended`

Define qué librería usa por debajo para parsear ese string:

| Valor   | Librería                       | Qué entiende                                                                       |
| ------- | ------------------------------ | ---------------------------------------------------------------------------------- |
| `false` | `querystring` (nativo de Node) | Solo pares planos: `a=1&b=2`                                                       |
| `true`  | `qs`                           | Además objetos anidados y arrays: `user[name]=Rama` → `{ user: { name: 'Rama' } }` |

## Caso real: ¿por qué sacamos `express.urlencoded()` de WalletZap?

Aunque React use `<form>` como elemento visual (ej: pantalla de
register), el envío real de datos siempre pasa por un `onSubmit` que
hace `e.preventDefault()` y dispara `fetch()` manualmente — el browser
nunca llega a mandar el submit nativo, así que nunca se genera un
`Content-Type: x-www-form-urlencoded` de verdad.

Sumado a que el bot de WhatsApp también entrega los mensajes como JSON
vía webhook, **ningún cliente real del MVP le manda datos a la API en
formato urlencoded**. Es código que no se usa — mismo criterio que con
`credentials: true` en el `cors()`: no arregla un bug, no agrega una
feature, solo saca algo innecesario → commit tipo `refactor`.

> Regla general (YAGNI): si el scope actual no lo necesita, se saca. Git
> guarda el historial — si algún día hace falta, se puede recuperar o
> volver a agregar sin drama.
