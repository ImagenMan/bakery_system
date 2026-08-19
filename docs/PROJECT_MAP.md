# Vicky's Sourdough Donuts — Project Map

## 1. Project Overview

Vicky's Sourdough Donuts is a local bakery order-management system designed to replace the current combination of Google Sheets, Facebook Messenger, WhatsApp, phone orders, and in-person communication.

The system is intended to provide a shared order workflow for bakery staff across devices on the local network.

Primary operational goals:

- Capture customer orders reliably.
- Reduce errors caused by searching and editing spreadsheets.
- Keep customer and order information centralized.
- Support preorder and same-day counter-sale workflows.
- Track payments and partial payments.
- Track production and pickup quantities.
- Restrict sensitive actions such as special pricing to authorized users.
- Provide a foundation for future inventory, production, reporting, and promotion features.

---

## 2. Technology / Architecture

### Current stack

- Node.js
- Express
- SQLite
- better-sqlite3
- JavaScript
- HTML/CSS/JS frontend architecture
- Socket.io — server integration implemented; client notification workflow remains to be completed
- EJS and other frontend technologies may exist in earlier project work
- Raspberry Pi deployment for the bakery environment
- Git/GitHub for source control

### Runtime

Application entry point:

`server/app.js`

API routes:

`server/routes/index.js`

Database connection:

`server/config/database.js`

Database:

`data/bakery.db`

Schema:

`data/schema.sql`

Migrations:

`data/migrations/`

---

## 3. Database Architecture

The application uses SQLite with foreign-key enforcement enabled by the application database connection.

`server/config/database.js` explicitly enables:

`PRAGMA foreign_keys = ON`

The schema also enables foreign keys.

Database migrations are numbered and represent incremental schema changes.

Important migration history includes:

- `001_payment_constraints.sql` — payment validation protections
- `004_custom_order_items.sql` — custom/non-catalog order items
- `008_order_type.sql` — preorder vs counter-sale distinction
- `009_counter_sale_support.sql` — optional customer relationship for counter sales

---

## 4. Customers

Customers may have:

- name
- phone
- contact method
- preferred language
- address
- notes
- active status

A counter sale may optionally be associated with a customer.

A preorder requires a customer under the current order architecture.

---

## 5. Orders

The `orders` table represents the main transaction record.

Important fields include:

- `id`
- `order_number`
- `customer_id`
- `order_type`
- `status`
- `payment_status`
- `total_amount`
- `amount_paid`
- `pickup_date`
- `pickup_time`
- `delivery`
- `delivery_address`
- `notes`
- `created_by`
- timestamps

### Order types

Supported order types:

- `PREORDER`
- `COUNTER_SALE`

### Order statuses

Current supported statuses:

- `NEW`
- `CONFIRMED`
- `READY`
- `COMPLETED`
- `CANCELLED`

The exact lifecycle differs between preorders and counter sales.

---

## 6. Preorders

Preorders represent customer orders created for pickup or delivery at a planned time/date.

They may be:

- unpaid
- partially paid
- fully paid

They participate in the normal production and pickup workflow.

---

## 7. Counter Sales

Counter sales represent items sold directly at the bakery counter, including products that were made that day but were not previously entered as an order.

Counter-sale order numbers use:

`CS-YYMMDD-NNN`

Example:

`CS-260819-001`

The sequence number identifies the counter sale for that date.

### Counter-sale business rules

1. A counter sale is considered paid.
2. A counter sale may optionally have a customer.
3. Only admins may change the price.
4. Counter sales may contain catalog products.
5. Counter sales may contain custom/non-catalog items.
6. Completed counter sales cannot be edited.
7. Counter sales appear in the normal Orders list.
8. Counter sales are identified by `order_type`.
9. A counter sale automatically becomes `COMPLETED` when the transaction is finalized/paid.
10. A counter sale may be cancelled during the transaction process.
11. A cancelled sale does not automatically behave like a completed sale.
12. Counter-sale pricing must preserve the distinction between normal catalog pricing and an explicitly authorized special price.

---

## 8. Order Items

Order items belong to an order.

An item may reference:

- a catalog product, or
- a custom/non-catalog item

Important item fields include:

- product
- custom name
- quantity
- unit price
- notes
- production status

Catalog products normally use the catalog price.

An explicitly supplied custom price for a catalog item requires admin authorization.

Custom/non-catalog items are supported independently of the product catalog.

---

## 9. Pricing / Authorization

Pricing is enforced at the model layer rather than relying only on the UI.

### Normal catalog price

When a catalog product is added without a supplied custom price, the product's current catalog price is used.

### Special/custom catalog price

When a catalog product is supplied with an explicit alternate price:

- the price must pass money validation
- the requesting user must be an admin
- the alternate price is stored on the order item

This prevents a normal staff user from bypassing pricing authorization by calling the API directly.

### Future promotions

Negotiated/special prices and formal promotions should remain separate concepts.

A negotiated price represents an authorized price override for a specific transaction.

A promotion represents a reusable business rule such as:

- 6 for the price of 5
- baker's dozen
- scheduled discounts
- other promotional pricing

These should not be conflated in the architecture.

---

## 10. Payments

Payment status values:

- `UNPAID`
- `PARTIAL`
- `PAID`

The database contains triggers preventing invalid payment states and preventing `amount_paid` from exceeding `total_amount`.

Payments are recorded separately in the `payments` table.

Supported payment methods currently include:

- `CASH`
- `BANK_TRANSFER`

The model protects payment operations against overpayment.

### Payment protection

An order total cannot be reduced below the amount already paid.

This protects the accounting relationship between:

`total_amount`

and

`amount_paid`

---

## 11. Pickup Tracking

The system supports partial and multiple pickups.

Pickup history is recorded separately.

Business protections include:

- preventing pickup quantities greater than the ordered quantity
- preventing over-pickup
- preventing reduction of an item quantity below the quantity already picked up
- preventing deletion of an item after any quantity has been picked up

The order response exposes:

- quantity ordered
- quantity picked up
- quantity remaining

---

## 12. Authentication & Authorization

Authentication exists in the application.

Users have authorization levels/roles.

Sensitive operations must be protected at the backend/model layer.

Current important authorization rule:

**Only admins may use special/custom catalog pricing.**

Authorization should not depend solely on hiding UI controls.

API and model operations must enforce business-critical permissions independently.

---

## 13. API Map

Primary API routes are located in:

`server/routes/index.js`

Current order-related API capabilities include:

- list orders
- retrieve an order
- create an order
- add order items
- update order items
- remove order items
- update production status
- update order status
- record payments
- retrieve payment history
- record pickups
- retrieve pickup history

The API is being extended incrementally as business rules are hardened in the model layer.

---

## 14. Model Architecture

Primary order logic is located in:

`server/models/order.js`

The model is responsible for important business rules including:

- order creation
- order item creation
- pricing
- admin authorization for custom catalog pricing
- order total calculations
- payment validation
- payment status transitions
- pickup validation
- production status
- order status

Business-critical rules should remain enforced here even when UI validation exists.

---

## 15. Current Implementation Status

### Completed

- SQLite database integration
- better-sqlite3 deployment compatibility
- customer model/API foundation
- product model/API foundation
- authentication
- authorization foundation
- payment validation
- partial/multiple payments
- payment protection against reducing totals below paid amounts
- custom/non-catalog order items
- pickup tracking
- partial/multiple pickups
- production status tracking
- order status tracking
- admin-only custom catalog pricing
- `PREORDER` / `COUNTER_SALE` order type distinction
- counter-sale architecture/business rules defined

### In progress

- counter-sale schema support
- counter-sale transaction workflow
- counter-sale automatic completion
- counter-sale numbering
- counter-sale API behavior

### Not yet implemented

- counter-sale UI
- full promotion engine
- inventory system
- production planning system
- comprehensive reporting
- final dashboard/UI workflow

---

## 16. Counter-Sale Schema Milestone

Migration:

`009_counter_sale_support.sql`

Purpose:

Allow `orders.customer_id` to be nullable so counter sales may optionally be associated with a customer.

Existing orders must retain:

- IDs
- order numbers
- customers
- order types
- statuses
- payment information
- pickup information
- delivery information
- notes
- creator
- timestamps

The migration also preserves the payment validation triggers.

A database backup should exist before applying the migration.

---

## 17. Important Architectural Decisions

### Order type is stored explicitly

Preorders and counter sales share the core order architecture but are distinguished with:

`order_type`

Reason:

This allows common order/payment/item infrastructure while permitting different business rules and workflows.

### Counter sales remain orders

Counter sales are not implemented as an unrelated transaction system.

Reason:

They still need:

- items
- prices
- payments
- customers when applicable
- audit information
- cancellation
- reporting

Keeping them within the order architecture avoids duplicating those systems.

### Customer is optional for counter sales

Reason:

Many walk-in counter transactions do not require customer identification, while some customers may want the purchase associated with their customer record.

### Price authorization is enforced server-side

Reason:

UI-only authorization can be bypassed through direct API requests.

### Completed transactions are locked

Reason:

Changing completed sales creates accounting and audit problems.

Future corrections should use controlled adjustment mechanisms rather than silently changing completed transactions.

### Special prices and promotions are separate concepts

Reason:

A negotiated price is transaction-specific authorization; a promotion is a reusable business rule.

---

## 18. Git / Checkpoint Strategy

Git commits represent meaningful project milestones rather than every individual command.

Recent important checkpoint:

`7675c90 Add admin-only custom catalog pricing`

This established admin authorization for explicit catalog price overrides.

Counter-sale schema work should receive its own meaningful checkpoint after:

1. migration is applied successfully
2. database integrity is verified
3. model/API changes are implemented
4. tests pass

The project map should be updated at major architectural milestones rather than after every small change.

---

## 19. Known Technical Constraints / Debt

- SQLite is currently the production database.
- Raspberry Pi deployment compatibility is important.
- The application must remain compatible with the Raspberry Pi's existing Node.js/GLIBC environment.
- Database migrations must preserve existing production data.
- Business rules should be enforced server-side.
- The frontend should not become the sole source of validation.
- Existing test data remains in the development database and should not be confused with production business data.
- Database backups should be made before destructive schema migrations.

---

## 20. Next Planned Work

### Immediate

1. Apply and verify migration 009.
2. Update order model for counter-sale behavior.
3. Add counter-sale number generation.
4. Enforce counter-sale payment/completion rules.
5. Enforce completed-sale immutability.
6. Add/adjust API routes.
7. Test normal and edge-case counter-sale transactions.
8. Commit the completed counter-sale milestone.

### Later

- counter-sale UI
- order list filtering/display improvements
- promotion architecture
- inventory architecture
- production planning
- reporting
- dashboard refinement
- LAN/socket notification improvements

---

## 21. Guidance for AI Assistants

When working on this project:

1. Inspect the existing implementation before proposing changes.
2. Preserve established architecture unless there is a clear reason to change it.
3. Treat the database as production-sensitive.
4. Never assume a migration is safe without checking existing schema/data.
5. Preserve existing business rules when adding new features.
6. Enforce security-sensitive rules at the backend/model layer.
7. Do not duplicate business logic unnecessarily between routes and models.
8. Prefer incremental migrations over destructive reinitialization of the database.
9. Treat payment and pickup protections as accounting/integrity rules.
10. Do not silently change completed transactions.
11. Keep special pricing separate from future promotion logic.
12. Update this project map when major architecture, schema, business-rule, security, or milestone decisions are made.
13. Do not turn this document into a command-by-command development diary.
14. Before modifying an important subsystem, inspect the relevant schema, model, routes, and existing tests.
15. When uncertain about a business rule, ask before implementing it rather than inventing a rule.

---

## 22. Current Checkpoint

Date:

2026-08-19

Current branch:

`main`

Current committed HEAD:

`7675c90 Add admin-only custom catalog pricing`

Current working-tree additions:

- counter-sale migration
- project map
- database backup before counter-sale migration

Counter-sale migration status:

**Prepared but not yet applied.**

Next checkpoint:

**Apply migration 009, verify database integrity, then implement the counter-sale transaction behavior.**
