CREATE TYPE transaction_type AS ENUM (
  'EXPENSE',
  'INCOME'
);

CREATE TABLE "users" (
  "id" uuid PRIMARY KEY,
  "username" varchar(50) NOT NULL,
  "email" varchar(255) UNIQUE NOT NULL,
  "password" varchar(255) NOT NULL,
  "phone_number" varchar(20) UNIQUE,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL
);

CREATE TABLE "accounts" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid NOT NULL,
  "name" varchar(50) NOT NULL,
  "balance" decimal(12,2) NOT NULL DEFAULT 0,
  "is_default" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL
);

CREATE TABLE "categories" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid,
  "name" varchar(50) NOT NULL,
  "type" transaction_type NOT NULL DEFAULT 'EXPENSE',
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL
);

CREATE TABLE "transactions" (
  "id" uuid PRIMARY KEY,
  "account_id" uuid NOT NULL,
  "category_id" uuid,
  "amount" decimal(12,2) NOT NULL,
  "type" transaction_type NOT NULL DEFAULT 'EXPENSE',
  "description" varchar(255) NOT NULL,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL
);

ALTER TABLE "accounts" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "categories" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "transactions" ADD FOREIGN KEY ("account_id") REFERENCES "accounts" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "transactions" ADD FOREIGN KEY ("category_id") REFERENCES "categories" ("id") DEFERRABLE INITIALLY IMMEDIATE;
