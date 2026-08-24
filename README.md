# ⚡ WalletZap - API

A personal financial control platform designed to reduce daily expense tracking friction to zero. It allows users to log transactions in seconds via **WhatsApp** using natural language processing and visualize metrics and account statements on a **Web Dashboard**.

---

### 🎯 Problem & Solution

- **Problem:** Most personal finance applications suffer from a high abandonment rate (churn rate) due to the friction and complexity of filling out detailed forms for small, day-to-day purchases.
- **Solution:** **WalletZap** allows users to log an expense by simply sending a direct message via WhatsApp (e.g., `coffee $3900 mp` or `2 coffee $3900 mp`). The system automatically processes the message and updates the corresponding account balance.

---

### 📂 Project Structure

```text
walletzap-api/
├── docs/             # Project documentation and schemas
│   └── database/     # SQL files and database diagrams
├── src/
│   ├── config/       # Environment variables and general configurations
│   ├── controllers/  # HTTP request handlers (req, res)
│   ├── db/           # Sequelize / PostgreSQL connection and initialization
│   ├── interfaces/   # Interfaces for models
│   ├── middlewares/  # Express Middlewares (Auth, Validations, Errors)
│   ├── models/       # Sequelize Models (User, Account, Transaction)
│   ├── routes/       # API routes and endpoints definition
│   ├── services/     # Business logic (WhatsApp Parser, Calculations)
│   └── utils/        # Auxiliary functions and helpers
├── .env              # Environment variables (ignored by Git)
├── .env.example      # Example environment variables with placeholders
├── .gitignore        # Files ignored by Git
└── README.md         # Project documentation
```

---

## 🛠️ Tech Stack (Backend)

- **Runtime Environment:** Node.js (with WSL / Ubuntu)
- **Language:** TypeScript
- **Web Framework:** Express
- **ORM:** Sequelize
- **Database:** PostgreSQL (Hosted on Neon)
- **Package Manager:** `pnpm`
- **Linter & Formatter:** ESLint + Prettier

---

### 🗄️ Database Architecture

The application uses **PostgreSQL** hosted on **Neon**. Below is the entity-relationship summary for the MVP:

### Entities & Tables

| Table              | Description                            | Columns                                                            |
| :----------------- | :------------------------------------- | :----------------------------------------------------------------- |
| **`users`**        | Registered users in the platform       | `id`, `username`, `email`, `password`,`role`, `phone_number`       |
| **`accounts`**     | User payment methods / wallets         | `id`, `user_id`, `name`, `balance`,`type`, `is_default`            |
| **`categories`**   | Expense and income classification      | `id`, `user_id`, `name`, `type`                                    |
| **`transactions`** | Financial records (expenses & incomes) | `id`, `account_id`, `category_id`, `amount`, `type`, `description` |

> 📌 The raw SQL schema file is located at `docs/database/schema.sql`.

---
