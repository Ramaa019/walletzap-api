# WalletZap - Project Memory

## Role reminder

Claude acts as a mentor here, not an implementer — see the `mentor` output style
(`/output-style mentor`). This file complements that style with project-specific
facts; it does not replace it.

## The idea

**Problem it solves:** lack of consistency tracking daily expenses, caused by
the friction of traditional finance apps (open app, find category, select
account, save). Target: students, young professionals, anyone who wants to
track money but drops off after a few weeks due to the hassle of logging
small day-to-day purchases ("gastos hormiga").

**Differentiation:** "Una plataforma de control financiero que te permite
registrar cualquier gasto en 3 segundos enviando un mensaje de WhatsApp, para
luego consultar estadísticas y gestionar cuentas desde tu panel web."

**Competitors:** Monefy, Splitwise, Wallet, Excel/Sheets — none offer an
ultra-fast entry channel from an app people already use all day (WhatsApp)
without opening a dedicated app.

## MVP scope

Filter phrase: "Permitir al usuario registrar un gasto rápidamente por chat y
consultar el saldo/historial de sus cuentas en la web." Anything that doesn't
serve this directly is OUT of v1.

### In scope (v1)

**WhatsApp bot:**

- Link phone number to account via a unique PIN.
- Parse plain-text messages to register transactions:
  `[description] $[amount] [account]` (e.g. `cafe $3500 Mercado Pago`).
- Check current balance via `/cuentas` command.

**Web app:**

- User registration/login (JWT auth).
- Dashboard with total balance + breakdown by account (e.g. Efectivo,
  Mercado Pago).
- Editable/deletable transaction history.
- Profile section to generate the PIN for linking WhatsApp.

### Explicitly out of scope (v1)

- ❌ Automatic categorization or complex charts.
- ❌ Monthly budgets or overspending alerts.
- ❌ Real bank API integrations or multi-currency support.

## Tech stack

- **Backend:** Node.js + Express + TypeScript
- **ORM & DB:** Sequelize + PostgreSQL (hosted on Neon)
- **Frontend:** React + TypeScript (Vite)
- **Styling:** Tailwind CSS
- **Testing:** Vitest (unit) + Supertest (API integration) — brand new to the
  developer, see mentor style for how to approach teaching this.
- **WhatsApp integration:** whatsapp-web.js (or WhatsApp Cloud API)
- **Infra & versioning:** Git (Git Flow) + Render

## Roadmap (phases)

1. **Backend base, API & testing:** Sequelize models (`User`, `Account`,
   `Transaction`), DB connection to Neon, auth endpoints
   (`POST /api/auth/register`, `POST /api/auth/login`), Vitest setup,
   integration tests with Supertest for auth, CRUD for accounts
   (`/api/accounts`), transaction endpoint (`POST /api/transactions`) with
   balance updates, integration test for balance-after-transaction.
2. **Frontend (React + Tailwind):** init project with Vite, login/register
   screens, connect to backend + store JWT in `localStorage`, dashboard view
   (account cards + transaction list), profile view with PIN generation.
3. **WhatsApp bot & parser:** WhatsApp client module in Node.js,
   `parseWhatsAppMessage()` function, unit tests for the parser covering
   different text formats, `/vincular [PIN]` command to link phone to
   `user_id`, connect incoming messages to the transaction service.
4. **Deployment & docs:** DB to production on Neon, deploy backend + frontend
   on Render, write `README.md` (architecture, test commands, screenshots).

## Branching strategy — Git Flow

- `main`: stable/production code only.
- `develop`: integration branch, base for new work.
- `feature/<short-name>`: one branch per feature, branched from `develop`.
- `release/<version>`: stabilization before merging into `main`.
- `hotfix/<short-name>`: urgent fixes branched from `main`.

## Commits

- Language: English.
- Style: Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`. `style`).
- One logical, working unit of work per commit — not too big, not too granular.

## README.md

Update it when: setup/install steps change, new env vars are added, a new
endpoint or module is introduced, or an architecture decision is made.

## Code conventions

- All code, comments, and commit messages in English.
- Comments: brief, explain _why_ not _what_.
