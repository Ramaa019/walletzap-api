# Git Flow y convenciones de commits

## Branches

| Branch              | Para qué sirve                                                                                  | Sale de                                       | Vuelve a           |
| ------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------- | ------------------ |
| `main`              | Código estable/producción. Nunca se trabaja acá directo.                                        | —                                             | —                  |
| `develop`           | Rama de integración. Acá conviven todas las features ya terminadas, esperando release.          | `main` (una sola vez, al iniciar el proyecto) | —                  |
| `feature/<nombre>`  | Una feature nueva puntual (un endpoint, un modelo, un módulo).                                  | `develop`                                     | `develop`          |
| `release/<version>` | Estabilización final antes de pasar a producción (fixes chicos, no features nuevas).            | `develop`                                     | `main` y `develop` |
| `hotfix/<nombre>`   | Arreglo urgente directo sobre producción (bug crítico que no puede esperar al próximo release). | `main`                                        | `main` y `develop` |

En el estado actual del proyecto (todavía en desarrollo activo, sin release
todavía) vamos a usar sobre todo `develop` y `feature/*`.

## ¿Cuándo crear una branch nueva?

Criterio simple: **cada vez que arrancás una unidad de trabajo lógicamente
nueva** — un endpoint nuevo, un modelo nuevo, una tanda de repaso de
conceptos, etc. No hace falta una branch por cada archivo o cada commit
chiquito; sí una por cada "cosa" que tenga sentido revisar/mergear como
bloque.

```
git checkout develop
git pull
git checkout -b feature/nombre-corto-en-ingles
```

El nombre va en **kebab-case, en inglés**, describiendo qué se está haciendo
(ej: `feature/user-model`, `feature/auth-endpoints`, no `feature/cosas-nuevas`).

## Conventional Commits — tipos

| Type       | Cuándo usarlo                                                                                                                                   |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `feat`     | Agrega una funcionalidad nueva (un endpoint, una pantalla, un comando del bot).                                                                 |
| `fix`      | Corrige algo que estaba **roto** — un bug, un comportamiento incorrecto.                                                                        |
| `refactor` | Cambia código existente **sin** agregar una feature ni arreglar un bug — reestructurar, limpiar, simplificar, quitar algo que ya no hace falta. |
| `docs`     | Solo documentación (README, comentarios grandes, notas).                                                                                        |
| `test`     | Solo agrega o modifica tests, sin tocar la lógica de la app.                                                                                    |
| `chore`    | Tareas de mantenimiento que **no** tocan código de producción (`src/`) — configs de tooling, dependencias, scripts, CI.                         |
| `style`    | Cambios de formato/estilo puro que no afectan la lógica (ej: correr Prettier).                                                                  |

### Caso real: ¿`fix`, `refactor` o `chore`?

Tuvimos esta duda con un cambio puntual: sacar `credentials: true`
del `cors()` en `index.ts`, porque el MVP usa JWT en `localStorage` (header
`Authorization` manual) y no cookies de sesión, así que esa opción no hacía
falta.

- ¿Es `fix`? No — nada estaba roto. La app funcionaba igual con o sin esa
  línea.
- ¿Es `chore`? Se podría defender (es "housekeeping"), pero por convención
  `chore` se reserva para cambios que **no tocan `src/`** — y acá se modificó
  `src/index.ts`, un archivo de la app real.
- ¿Es `refactor`? Es lo que mejor encaja: cambia código existente, no agrega
  nada nuevo, no arregla un bug — simplifica una config para que quede
  alineada con lo que la app realmente necesita.

**Conclusión:** `refactor: remove unused credentials:true from cors config`

> 🤔 En la práctica vas a ver equipos que usan estos tipos de forma más
> relajada (por ejemplo, `chore` para cualquier limpieza chica, toque o no
> `src/`). Lo importante no es la regla perfecta, sino ser consistente
> dentro del proyecto — y saber justificar el criterio si alguien pregunta.

## Flujo típico end-to-end

```
git checkout develop
git pull

git checkout -b feature/nombre-corto

# ... trabajar, commitear en unidades lógicas ...
git add <archivos>
git commit -m "feat: add X"

git checkout develop
git merge feature/nombre-corto   # o vía Pull Request si se usa GitHub

git branch -d feature/nombre-corto   # limpieza, ya no hace falta
```
