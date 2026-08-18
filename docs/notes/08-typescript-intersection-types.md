# TypeScript: intersección de tipos (`&`)

Ya conocíamos la unión (`|`): "esto **o** esto otro" — un valor que puede
ser de un tipo u otro. La intersección (`&`) es la contraparte: "esto **y**
esto otro, a la vez" — un valor que tiene que cumplir con **ambos** tipos
al mismo tiempo, combinando sus propiedades.

Analogía: un aviso de trabajo que pide "tiene que tener registro de
conducir **y** hablar inglés fluido" — no alcanza con cumplir una
condición, hay que cumplir las dos a la vez.

```ts
type Person = { name: string };
type Employee = { salary: number };
type Staff = Person & Employee; // tiene que tener name Y salary, las dos
```

Un valor de tipo `Staff` no es "un `Person` o un `Employee`" — es algo que
tiene **todas** las propiedades de los dos combinadas.

## Dónde se usó: `errorHandler.ts`

Se necesitaba un tipo para `err` que fuera "un `Error` normal (con
`message`, `stack`, etc.) **y además** pueda tener un `status` opcional" —
`status` no es parte de la clase `Error` nativa de JS, es una convención
propia: en el futuro, código que lance errores personalizados (ej. "usuario
no encontrado" → 404) le va a poner `.status` a mano antes de pasarlo a
`next(err)`, y este handler lo lee para decidir el código HTTP de
respuesta. Hoy en día nada le pone `.status` todavía — el tipo solo prepara
el terreno.

```ts
err: Error & { status?: number }
```

## El error que no hay que cometer: `any | Error`

`any` no es "una opción más" dentro de una unión — es el modo "dejá de
chequear tipos acá directamente". `any | Error` **colapsa a `any`** —
TypeScript anula el resto de la unión, no suma nada. Sacar `any` por
completo (no combinarlo con otra cosa) es la única forma de que el tipo
sea real y el warning de ESLint (`no-explicit-any`) desaparezca de verdad.
