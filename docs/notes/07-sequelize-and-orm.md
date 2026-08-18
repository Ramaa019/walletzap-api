# ORM, Sequelize y modelos: resumen completo

## Qué es un ORM, en el fondo

No es solo "SQL con sintaxis más fácil" — la idea central es el **mapeo
objeto-relacional**: cada **clase** (`Model`) representa una **tabla**,
cada **instancia** de esa clase representa una **fila**, y cada
**propiedad** representa una **columna**. Sequelize traduce automáticamente
entre "trabajar con objetos JS" y "ejecutar SQL contra Postgres" — como un
traductor al que le hablás en objetos y él genera el SQL por atrás.

Por qué usarlo en vez de SQL a mano:

- Evita reescribir el mismo `INSERT`/`SELECT`/`UPDATE` repetitivo para cada
  tabla.
- Las queries van parametrizadas automáticamente (mitiga SQL injection).
- Da validaciones y coerción de tipos en la capa de JS, antes de que el
  dato llegue a la DB.
- Se integra naturalmente con `async/await`.

Trade-off: para queries muy complejas de reporting a veces el ORM se queda
corto y hay que bajar a SQL crudo — no es el caso del MVP de WalletZap.

## Terminología de Sequelize

- **`Model`**: la clase que representa una tabla.
- **`DataTypes`**: el sistema de tipos propio de Sequelize (`STRING`,
  `INTEGER`, `UUID`, `ENUM`, `DECIMAL`, `BOOLEAN`) — cada uno se traduce a
  un tipo real de columna en Postgres.
- **`Model.init(atributos, opciones)`**: define las columnas y conecta el
  modelo con la instancia de `sequelize`.
- **`sync()` vs migraciones**: `sync()` crea/ajusta tablas automáticamente
  en base a los modelos — bueno para desarrollo. Las migraciones
  (`sequelize-cli`) dan control más fino para producción — no hace falta
  para el MVP.

## El patrón de clase en TypeScript

```ts
type UserCreationAttributes = Optional<UserInterface, 'id'>;

export class UserModel
  extends Model<UserInterface, UserCreationAttributes>
  implements UserInterface {
  declare id: string;
  declare email: string;
  // ...resto de los campos
}

UserModel.init({ /* columnas */ }, { sequelize, tableName: 'users' });
```

Piezas clave:

- **`Model<Attrs, CreationAttrs>`**: el primer genérico es "cómo luce un
  registro completo"; el segundo es "qué necesito para crear uno nuevo"
  (por eso `id` es opcional ahí — lo genera la DB, no el que llama a
  `.create()`).
- **`Optional<Interface, 'campo'>`**: helper de Sequelize que toma una
  interfaz y hace que un campo puntual sea opcional, sin tocar el resto.
  Distinto de `Omit<Interface, 'campo'>`, que **elimina** el campo por
  completo — no son intercambiables.
- **`declare campo: tipo`**: le dice a TypeScript "esta propiedad existe en
  runtime" sin generar un class field real (Sequelize la llena por atrás
  vía getters/setters). Sin esto, TS no sabe qué propiedades tiene una
  instancia.
- **`type X = Y` en vez de `interface X extends Y {}`**: si la interfaz no
  agrega miembros propios, es una promesa vacía — un alias directo con
  `type` dice lo mismo sin la ceremonia de más (esto lo agarró ESLint como
  error real, `no-empty-object-type`).

Por qué la clase (y no `sequelize.define()`, la alternativa más corta): con
`sequelize.define()` se pierde precisión de tipos y no hay forma limpia de
agregar métodos propios al prototipo — como `validatePassword` en
`UserModel`. Si un modelo no necesitara métodos propios, `define()` sería
una opción válida.

## Hooks: invariantes que siempre se cumplen

```ts
hooks: {
  beforeCreate: async (user) => {
    user.password = await bcrypt.hash(user.password, await bcrypt.genSalt(10));
  },
  beforeUpdate: async (user) => {
    if (user.changed('password')) {
      user.password = await bcrypt.hash(user.password, await bcrypt.genSalt(10));
    }
  },
},
```

El hasheo de `password` vive en el modelo (no en un futuro service) porque
tiene que pasar **siempre**, sin importar qué código llame a `.create()` o
`.update()` — un seed script, un admin panel, un test. Si dependiera de que
el service se acuerde de hashearlo, cualquier código nuevo que cree
usuarios podría olvidarse y guardar la contraseña en texto plano. El
`if (user.changed('password'))` en `beforeUpdate` evita re-hashear un
password que no cambió (si no estuviera, cada update de cualquier campo
rompería el hash existente).

**bcrypt vs bcryptjs**: se eligió `bcryptjs` (implementación 100% JS) sobre
`bcrypt` (bindings nativos en C++) para evitar problemas de compilación al
deployar en Render.

## Foreign keys y relaciones

Dos capas distintas, no confundir:

1. **A nivel de columna** (ya hecho en `Account.model.ts`): el `references`
   fuerza a Postgres a validar que el valor exista en la tabla referenciada.
   ```ts
   user_id: {
     type: DataTypes.UUID,
     allowNull: false,
     references: { model: 'users', key: 'id' },
     onDelete: 'CASCADE', // si se borra el User, se borran sus Accounts
   },
   ```
   Se apunta por **nombre de tabla** (`'users'`), no importando la clase
   `UserModel` — evita imports circulares entre modelos que se referencian
   mutuamente.
2. **Asociaciones** (`belongsTo`/`hasMany`) — todavía no hecho. Van en un
   archivo central aparte (una vez que existan los 4 modelos), y son lo que
   habilita cosas como `user.getAccounts()` o `include: [AccountModel]` en
   una query. `references` no las reemplaza — son complementarias.

## DECIMAL vs FLOAT para plata

`FLOAT` representa decimales en binario, y muchas fracciones (como `0.1`)
no tienen representación exacta ahí — por eso `0.1 + 0.2` da
`0.30000000000000004`. En un balance de cuenta esos errores se **acumulan**
con cada transacción. `DECIMAL(12, 2)` guarda el número como dígitos
exactos, sin esa aproximación.

Gotcha para más adelante: Sequelize devuelve los valores `DECIMAL` como
**string** (no `number`), justamente para no perder precisión al pasar por
JS. Va a haber que parsearlo explícitamente cuando se sumen/resten montos
(lógica de transacciones).

Un detalle de tipado que apareció escribiendo `errorHandler.ts` (intersección
de tipos, `&`) se documentó aparte, en `08-typescript-intersection-types.md`
— es un concepto de TypeScript en general, no algo específico de Sequelize.
