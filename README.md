# ⚡ WalletZap - API

Plataforma de control financiero personal diseñada para reducir a cero la fricción al registrar gastos diarios. Permite ingresar transacciones en segundos desde **WhatsApp** mediante procesamiento de texto y visualizar métricas y estados de cuenta desde un **Dashboard Web**.

---

## 🎯 Problema & Solución

* **Problema:** La mayoría de las aplicaciones de finanzas personales sufren de un alto índice de abandono debido a la pereza o complejidad que genera completar formularios detallados para compras pequeñas del día a día ("gastos hormiga").
* **Solución:** **WalletZap** permite registrar un gasto enviando un mensaje directo por WhatsApp (ejemplo: `harina 4000 efectivo` o `2 puchos 3900 mp`), procesando el mensaje automáticamente para actualizar el saldo de la cuenta correspondiente.

---

## 📂 Estructura del Proyecto

```text
walletzap-api/
├── src/
│   ├── config/       # Variables de entorno y configuraciones generales
│   ├── controllers/  # Manejadores de peticiones HTTP (req, res)
│   ├── db/           # Conexión e inicialización de Sequelize / PostgreSQL
│   ├── middlewares/  # Middlewares de Express (Auth, Validaciones, Errores)
│   ├── models/       # Modelos de Sequelize (User, Account, Transaction)
│   ├── routes/       # Definición de rutas y endpoints de la API
│   ├── services/     # Lógica de negocio (Parser de WhatsApp, Cálculos)
│   └── utils/        # Funciones auxiliares y helpers
├── .env              # Variables de entorno (no subidas a Git)
├── .gitignore        # Archivos excluidos de Git
└── README.md         # Documentación del proyecto

---

## 🛠️ Stack Tecnológico (Backend)

- **Entorno de ejecución:** Node.js (con WSL / Ubuntu)
- **Lenguaje:** TypeScript
- **Framework Web:** Express
- **ORM:** Sequelize
- **Base de Datos:** PostgreSQL (Alojado en Neon)
- **Gestor de paquetes:** `pnpm`
- **Linter & Formateador:** ESLint + Prettier

---

