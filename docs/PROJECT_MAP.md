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

Checkpoint Sep 1 2026
I have asked GPT to rewrite our map and to include some of the newest features we have been working on. I will leave our original map here ONLY for a reference. From here on this is the newest version of our map and this is what we will be using.

# Vicky's Sourdough Donuts — Project Map

## 1. Purpose of This Document

This document is the architectural and operational memory of the Bakery System.

It records:

* important business rules
* architectural decisions
* database concepts
* security boundaries
* workflow decisions
* implementation status
* known technical constraints
* major lessons learned
* guidance for AI assistants working on the project

It is **not** a command-by-command development diary.

When a major architectural, business-rule, schema, security, or workflow decision is made, this document should be updated so that future development sessions begin from the correct understanding of the system.

The actual source code, database schema, migrations, and tests remain the final authority for what is implemented. This document describes the intended architecture and the current known state.

---

# 2. Project Overview

Vicky's Sourdough Donuts is a local bakery order-management and production workflow system.

The system is intended to replace the current combination of:

* Google Sheets
* Facebook Messenger
* WhatsApp
* phone orders
* in-person communication
* informal kitchen communication

The application is intended to provide a shared workflow for bakery staff across devices on the local network.

Primary operational goals:

* Capture customer orders reliably.
* Reduce errors caused by searching and editing spreadsheets.
* Keep customer and order information centralized.
* Support preorder and same-day counter-sale workflows.
* Track payments and partial payments.
* Track production and pickup quantities.
* Support shared bakery production workflows.
* Restrict sensitive actions such as special pricing to authorized users.
* Provide useful customer history.
* Provide a safe training environment for employees.
* Provide a foundation for future inventory, reporting, promotions, and dashboard features.

The guiding UX principle is:

> **Simple is King.**

The application should follow the real bakery workflow rather than forcing the bakery to adopt an unnecessarily complicated software workflow.

---

# 3. Core UX / Architecture Principles

These principles should guide future decisions.

## 3.1 Design around the worker

Worker-facing workflows should be:

* simple
* fast
* obvious
* low-friction
* tolerant of ordinary human mistakes

Avoid requiring workers to enter information that the system already knows.

Information should be recorded at the point where the responsible worker naturally knows it.

## 3.2 Do not over-engineer

Prefer the smallest architecture that correctly supports the bakery's real workflow.

Do not introduce:

* formal assignment systems
* unnecessary approval workflows
* complicated state machines
* duplicate data entry
* artificial enterprise-style processes

unless the bakery actually needs them.

## 3.3 Backend rules are authoritative

Important business rules must be enforced in the backend/model layer.

Frontend controls are for usability, not security.

A user should not be able to bypass a business rule by manually calling an API.

## 3.4 Preserve trustworthy business data

Real transactions should be reliable and auditable.

Do not silently rewrite completed transactions.

When a genuine completed transaction needs correction, use a controlled adjustment mechanism such as a future void/refund workflow.

## 3.5 Separate training from real operations

Employees need a safe place to learn the system.

Training should not contaminate real business data.

Training Mode is therefore an architectural concept, not merely a cosmetic UI feature.

---

# 4. Technology / Architecture

## Current stack

* Node.js
* Express
* SQLite
* better-sqlite3
* JavaScript
* HTML/CSS/JS frontend
* Socket.io server integration
* Git/GitHub
* Raspberry Pi deployment

Earlier EJS/frontend work may remain in project history, but the current frontend workflow is primarily HTML/CSS/vanilla JavaScript.

## Runtime

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

Frontend:

`public/index.html`

`public/js/app.js`

`public/css/styles.css`

---

# 5. Deployment / Technical Constraints

The production application runs on a Raspberry Pi.

Important compatibility requirements:

* Raspberry Pi deployment compatibility is critical.
* The Pi runs Debian 11 / Bullseye.
* The Pi uses an ARM64/aarch64 environment.
* The installed GLIBC version constrains native Node modules.
* `better-sqlite3` is used because of the project's Raspberry Pi compatibility requirements.
* Database migrations must preserve existing production data.
* The application should remain practical for LAN use.
* The bakery may shut down the Raspberry Pi when the bakery is closed.

Do not introduce dependencies that unnecessarily compromise Raspberry Pi compatibility.

---

# 6. Database Architecture

The application uses SQLite.

Foreign keys are explicitly enabled by the database connection:

`PRAGMA foreign_keys = ON`

Database schema changes are handled through numbered migrations in:

`data/migrations/`

Migrations should be incremental and preserve existing production data.

Do not solve schema problems by casually deleting and recreating the production database.

Before destructive schema work:

1. Back up the database.
2. Inspect the existing schema.
3. Inspect existing data.
4. Apply the migration.
5. Verify the resulting schema.
6. Verify important existing records.
7. Test the affected workflows.

---

# 7. Customers

Customers may contain:

* name
* phone
* contact method
* preferred language
* address
* notes
* active status

Customer information that is especially valuable to the bakery includes:

* allergies
* packaging preferences
* bread cooked preference
* last order
* contact origin such as WhatsApp, telephone, Facebook, etc.
* preferred language

A preorder requires a customer.

A counter sale may optionally have a customer.

A walk-in customer does not need to be identified.

---

# 8. Orders

The `orders` table represents the main transaction record.

Important fields include:

* `id`
* `order_number`
* `customer_id`
* `order_type`
* `status`
* `payment_status`
* `total_amount`
* `amount_paid`
* `pickup_date`
* `pickup_time`
* `delivery`
* `delivery_address`
* `notes`
* `created_by`
* timestamps

## Order types

Supported order types:

* `PREORDER`
* `COUNTER_SALE`

The order type is stored explicitly.

Preorders and counter sales share core order infrastructure but have different business workflows.

---

# 9. Preorders

Preorders represent customer orders created for a planned pickup or delivery.

They may be:

* unpaid
* partially paid
* fully paid

They participate in:

* normal order workflow
* production workflow
* pickup workflow
* payment workflow

Existing preorder behavior must be preserved when implementing counter-sale features.

Counter-sale development must not casually modify the existing preorder workflow.

---

# 10. Counter Sales

Counter sales represent direct same-day sales at the bakery counter.

They are still orders and use the same underlying order/item/payment architecture.

They are distinguished by:

`order_type = COUNTER_SALE`

## Counter-sale order numbers

Counter sales use:

`CS-YYMMDD-NNN`

Example:

`CS-260901-001`

The sequence identifies the counter sale for that date.

The backend generates the number.

The cashier does not type the order number.

## Counter-sale business rules

1. A counter sale is immediately considered paid when successfully completed.
2. A counter sale may optionally have a customer.
3. Catalog products use their current catalog price by default.
4. Only authorized admins may explicitly override a catalog price.
5. Counter sales may contain catalog products.
6. Counter sales may contain custom/non-catalog items.
7. A successfully completed counter sale automatically becomes `COMPLETED`.
8. Completed counter sales are not editable through normal order editing.
9. Counter sales remain part of the normal Orders architecture.
10. Counter sales are identified by `order_type`.
11. Payment methods include:

    * `CASH`
    * `CARD`
    * `BANK_TRANSFER`
    * `OTHER`
12. A counter sale uses one payment method per sale.
13. Cash sales require the amount of cash received.
14. Cash sales calculate and display change.
15. The backend remains responsible for final payment validation.
16. The cashier should not have to manually enter an order number.
17. The cashier should not see preorder-specific fields such as pickup date/time on the counter-sale screen.

---

# 11. Counter-Sale Transaction Architecture

The counter-sale UI should maintain an unfinished sale in browser/application state.

Do **not** create a real database order merely because the cashier opened the Counter Sale screen.

The intended flow is:

```text
Open Counter Sale
        ↓
Browser-only sale state
        ↓
Add products
        ↓
Change quantities
        ↓
Optional customer
        ↓
Choose payment method
        ↓
If CASH → enter cash received
        ↓
Show total / change
        ↓
Complete Sale
        ↓
Single atomic backend transaction
        ↓
Real order + items + payment + COMPLETED status
```

## Why this architecture matters

If an order were created immediately when the screen opened, an abandoned counter-sale screen could leave a `NEW` order in the real database.

That would contaminate:

* the Orders list
* reports
* order history
* sales counts

Therefore:

> **An unfinished counter sale is not a database transaction.**

Only the successful completion of a normal-mode sale creates the real transaction.

## Atomic completion

The eventual counter-sale API should create the required records as one transaction.

Conceptually:

```text
POST /api/counter-sales

        ↓

validate complete request

        ↓

create order

        ↓

create order items

        ↓

record payment

        ↓

mark paid / completed

        ↓

commit
```

If any required step fails, the transaction should roll back rather than leave a partial counter sale.

---

# 12. Training Mode / Playground

Training Mode is a core application concept.

It exists so employees can learn the system without creating real business records.

The goal is to allow employees to practice the actual application workflow rather than merely being shown screenshots or instructions.

## Training Mode rules

When Training Mode is active:

* Counter sales must not create real orders.
* Payments must not be recorded as real payments.
* Real sales totals must not change.
* Production actions must not change real production totals.
* Real pickup history must not be changed.
* Other operational/business records must not be contaminated by training activity.
* Employees may make mistakes freely.
* Employees may complete fake transactions repeatedly.
* Employees may start over without needing database cleanup.

The UI should clearly communicate:

> **TRAINING MODE — Nothing you do here affects real bakery data.**

## Training Mode should be safe by design

Training Mode should not simply create fake real records and mark them as "training."

Prefer a separate application state in which business writes are simulated or otherwise prevented.

The real database should remain trustworthy.

Conceptually:

```text
                     ┌── Training Mode ──→ Playground
Employee uses app ───┤
                     └── Normal Mode ────→ Real database
```

## Training Mode applies beyond Counter Sales

Training Mode should eventually support:

* Counter Sale practice
* Order-entry practice
* Kitchen/Production practice
* "Made" workflow practice
* navigation practice
* employee onboarding

Kitchen workers should be able to practice production workflows before being expected to use the live system.

This is especially important because the bakery has multiple employees with different levels of computer experience.

## Training Mode and real mistakes are different concepts

Training Mode handles:

> "I am learning or practicing."

A future Void/Refund system handles:

> "This was a genuine real transaction that needs to be reversed."

These should not be conflated.

---

# 13. Future Void / Refund Mechanism

A future controlled Void/Refund mechanism is desirable.

It is intentionally separate from Training Mode.

If a genuine completed sale is wrong after payment has been received:

* do not silently edit the completed sale
* do not silently delete the sale
* record that the original transaction was voided/refunded
* preserve an audit trail
* allow a replacement transaction when appropriate

The exact refund/void workflow has not yet been implemented.

The business details still need to be defined before implementation, including:

* who is authorized to void/refund
* whether a reason is required
* how cash refunds are recorded
* how card/bank refunds are represented
* how reports display voided transactions
* whether a replacement sale is linked to the original

Do not invent these rules prematurely.

---

# 14. Order Items

Order items belong to an order.

An item may reference:

* a catalog product
* an approved custom product
* a free-form custom/non-catalog item

Important item information includes:

* product
* custom product
* custom name
* quantity
* unit price
* notes
* production status

Catalog products normally use the current catalog price.

Explicit alternate catalog pricing requires admin authorization.

Custom/non-catalog items are supported independently of the normal catalog.

---

# 15. Pricing / Authorization

Pricing authorization is enforced at the backend/model layer.

## Normal catalog price

When a catalog product is added without an explicit alternate price:

* use the product's current catalog price.

## Explicit catalog price override

When an alternate price is supplied:

* validate the price
* require admin authorization
* store the authorized transaction price on the order item

A normal counter user must not be able to bypass this restriction by directly calling the API.

## Custom/non-catalog items

Free-form custom items require appropriate authorization according to the existing model rules.

Approved custom products are separate from free-form custom pricing.

## Promotions

Promotions are a separate future concept.

A negotiated/special price is transaction-specific.

A promotion is a reusable business rule.

Examples of future promotions:

* 6 for the price of 5
* baker's dozen
* scheduled discounts
* other reusable promotional pricing

Do not conflate special pricing with the future promotion engine.

---

# 16. Payments

Payment status values:

* `UNPAID`
* `PARTIAL`
* `PAID`

Payments are stored separately in the `payments` table.

Current payment methods:

* `CASH`
* `CARD`
* `BANK_TRANSFER`
* `OTHER`

Payment operations must protect the accounting relationship between:

`total_amount`

and

`amount_paid`

Important protections include:

* no invalid payment states
* no payment exceeding the remaining amount
* no reducing an order total below the amount already paid
* cash received must be sufficient for the sale
* cash change must be calculated correctly

Money calculations must be performed using safe cent/money handling.

Do not rely on raw floating-point equality.

---

# 17. Pickup Tracking

The system supports partial and multiple pickups.

Pickup history is recorded separately.

Protections include:

* preventing pickup quantities greater than ordered quantity
* preventing over-pickup
* preventing reduction of item quantity below quantity already picked up
* preventing deletion of an item after any quantity has been picked up

The order response exposes:

* quantity ordered
* quantity picked up
* quantity remaining

Counter sales normally do not participate in the preorder pickup workflow.

---

# 18. Production Architecture

Production is a shared bakery workflow.

There is no formal worker assignment/ownership model.

Multiple workers may view and contribute to production.

Workers may move between stages according to the real bakery workflow.

Do not introduce artificial task ownership unless the bakery actually needs it.

## Demand vs production

The system must distinguish:

**Demand**

from

**Production planning**

Demand may come from:

* preorders
* expected counter demand
* other known bakery requirements

Production planning represents what the bakery intends to make.

Production output represents what was actually made.

These are not the same thing.

## Production output is historical

Once something has actually been produced, that fact should not be casually rewritten just because the plan changes.

The system should preserve the relationship between:

* planned quantity
* produced quantity
* remaining requirement

The recent production UX work established that production planning should not be reduced below what has already been produced.

---

# 19. Production UX

The production interface should be optimized for bakery workers rather than office administration.

The worker should primarily see the information needed to perform the current task.

For example, a dough worker should not need:

* customer names
* payment information
* order numbers

when the task is simply determining how much dough/product needs to be made.

The broader production workflow may include:

```text
Demand
   ↓
Production Plan
   ↓
Dough / Preparation
   ↓
Shaping
   ↓
Frying / Baking
   ↓
Finishing / Decorating
   ↓
Finished / Available
```

The exact stages vary by product.

Donuts, for example, may follow:

```text
Dough
 → cutting
 → frying/baking
 → decorating
 → finished/available
```

The production system should support the real bakery workflow rather than requiring formal task assignment.

---

# 20. Donut / Bakery Production Knowledge

The bakery produces multiple product categories including:

* Donuts
* Cinnamon Rolls
* Bagels
* Bread
* English Muffins
* Cookies
* Desserts
* Pretzels
* Pastries
* Cakes & Pies
* Savory
* Specialty Breads
* Drinks

The production architecture should support common patterns without assuming every product has identical stages.

For donuts:

* dough
* cutting
* final rise
* frying/baking
* decorating
* finished/available

Three important donut shapes include:

* donut
* filled
* twist

The decorator may prioritize time-sensitive orders.

Typical final rise is approximately 17 minutes.

The system should support these workflows without turning bakery knowledge into unnecessarily rigid software rules.

---

# 21. Authentication / Authorization

Authentication exists.

Current roles include:

* `ADMIN`
* `COUNTER`

Admin:

* username/password

Counter:

* 4-digit PIN

Not every bakery worker needs an application login.

Authorization is enforced at the backend/model layer.

Important rule:

> Sensitive business rules must never depend only on UI visibility.

Current example:

* only admins may perform explicit catalog price overrides.

Future authorization rules should follow the same principle.

---

# 22. API Architecture

Primary API routes are located in:

`server/routes/index.js`

Current order-related API capabilities include:

* list orders
* retrieve an order
* create an order
* add order items
* update order items
* remove order items
* update production status
* update order status
* record payments
* retrieve payment history
* record pickups
* retrieve pickup history

Counter-sale API support is being developed separately from the existing generic order-entry workflow.

The planned counter-sale completion endpoint should encapsulate the real transaction rather than requiring the browser to orchestrate several independent real database writes.

Potential endpoint:

`POST /api/counter-sales`

The exact implementation should be determined after inspecting the current model transaction behavior.

---

# 23. Model Architecture

Primary order logic:

`server/models/order.js`

The model is responsible for important business rules including:

* order creation
* counter-sale number generation
* order item creation
* pricing
* admin authorization
* order total calculations
* payment validation
* payment status transitions
* pickup validation
* production status
* order status
* completed counter-sale immutability

Business-critical rules should remain enforced here even when UI validation exists.

Avoid duplicating business logic unnecessarily between routes and models.

---

# 24. Counter-Sale Transaction Integrity

The counter-sale completion operation should be atomic.

The system must avoid a situation where:

* order exists
* but an item failed
* or payment failed
* or completion failed

and the partial transaction remains as a real sale.

The desired property is:

> **Either the real counter sale completes successfully, or the database remains unchanged by that attempted completion.**

Training Mode must not use this real transaction path in a way that creates real business records.

---

# 25. Current Implementation Status

## Completed

* SQLite database integration
* better-sqlite3 deployment compatibility
* customer model/API foundation
* product model/API foundation
* authentication
* authorization foundation
* payment validation
* partial/multiple payments
* payment protection against reducing totals below paid amounts
* custom/non-catalog order items
* pickup tracking
* partial/multiple pickups
* production status tracking
* order status tracking
* admin-only custom catalog pricing
* `PREORDER` / `COUNTER_SALE` order type distinction
* optional counter-sale customer
* counter-sale order number generation
* completed counter-sale immutability protection
* counter-sale payment method support
* cash received/change backend support
* counter-sale navigation/UI foundation
* separate Counter Sale view
* New Order navigation preserved
* login/navigation fixes
* production planning / ready-to-sell boundary work
* production quantity UI improvements

## Recently completed / checkpointed

The counter-sale foundation and payment-method work has been committed.

The current branch has progressed beyond the old August 19 project-map checkpoint.

The exact Git SHA should be taken from the actual local repository rather than copied from this document.

## In progress

* Counter-sale backend completion workflow
* Counter-sale browser-side cart
* Counter-sale customer selection
* Counter-sale payment UI
* Counter-sale completion
* Training Mode architecture and implementation

## Planned

* Training Mode / employee playground
* Kitchen/Production training playground
* future Void/Refund mechanism
* promotion engine
* inventory system
* comprehensive reporting
* dashboard refinement
* Socket.io client notification workflow
* broader production planning refinement

---

# 26. Important Recent Architectural Decisions

## Counter sales remain orders

Counter sales are not a separate unrelated transaction system.

They share:

* order infrastructure
* order items
* pricing
* customers
* payments
* audit information
* reporting

This avoids duplicating core business systems.

## Customer is optional for counter sales

Many walk-in customers do not need identification.

Customers may still be attached when useful.

## Completed transactions are locked

Completed counter sales should not be casually edited.

Future corrections should use controlled void/refund mechanisms.

## Unfinished counter sales are browser state

Opening a Counter Sale screen must not create a real order.

This prevents abandoned counter-sale records.

## Complete Sale is the transaction boundary

In normal mode, pressing `Complete Sale` is the point at which the sale becomes real.

The operation should be atomic.

## Training Mode is not fake production data

Training Mode should provide a playground without contaminating real operational records.

It should be usable for both counter and kitchen workers.

## Special prices and promotions remain separate

Do not turn one into the other.

## Production is shared work

Do not introduce formal assignment/ownership unless the bakery requires it.

---

# 27. Known Technical Debt / Constraints

## Stale schema file

The live database has received migrations that may make portions of `data/schema.sql` differ from the current migrated production schema.

For example, counter-sale support changed the `orders.customer_id` requirement.

Before treating `schema.sql` as authoritative, compare it against:

* migration history
* current live schema
* model assumptions

Do not casually rewrite `schema.sql` during unrelated feature work.

A future schema-documentation cleanup may be appropriate.

## Test data

Development/test data may exist in the database.

Test data must not be confused with real production business data.

Training Mode should eventually make this distinction even clearer.

## Socket.io

Server-side integration exists, but the complete client notification workflow remains unfinished.

## Reporting

Reports must eventually distinguish:

* real completed sales
* cancelled/voided sales
* training activity

Training activity must not be included in real business reports.

---

# 28. Verification Philosophy

The project uses a dedicated verification workflow documented in:

`docs/bakery-verification-SKILL.md`

That document is intentionally complementary to the development process.

The most important verification principle is:

> **Do not assume pasted code, local code, and committed code are the same thing.**

When verification matters:

1. Inspect the actual file.
2. Verify the actual database schema.
3. Run the application.
4. Test through the real HTTP/API layer where appropriate.
5. Test failure cases, not only happy paths.
6. Check the resulting database state.
7. Reset test data afterward.
8. Verify the actual Git commit when repository state matters.

Verification should explicitly distinguish:

* verified
* assumed
* not tested

If browser behavior cannot be tested in the available environment, say so.

---

# 29. Verification Priorities

When testing business-critical changes, prioritize:

## Payments

Test:

* correct payment
* cash received
* exact cash
* excess cash/change
* insufficient cash
* invalid payment method
* overpayment
* partial payment
* completed counter sale
* failed transaction rollback

## Counter Sales

Test:

* no customer
* optional customer
* multiple products
* quantity changes
* zero/negative quantities
* catalog pricing
* unauthorized special pricing
* authorized special pricing
* custom items
* payment completion
* generated order number
* duplicate/sequence behavior
* failed completion leaves no partial real transaction
* completed counter sale cannot be edited

## Training Mode

When implemented, verify:

* training sale does not create an order
* training payment does not affect payments
* training sale does not affect revenue totals
* training production does not affect real production totals
* training pickup actions do not affect real pickup history
* switching back to normal mode restores real behavior
* Training Mode is clearly visible
* Training Mode cannot accidentally be mistaken for real operating mode

## Production

Test:

* planned quantities
* produced quantities
* production cannot violate established boundaries
* "Made" actions update the correct state
* production totals are not corrupted
* multiple workers can contribute
* training production is isolated from real production

---

# 30. Git / Checkpoint Strategy

Git commits represent meaningful project milestones.

Do not commit every command as a separate milestone.

A meaningful milestone should normally include:

* implementation
* verification
* clean working tree
* clear commit message

The project map should be updated when a major:

* architecture
* schema
* business rule
* security rule
* workflow
* milestone

changes.

Do not turn the project map into a development diary.

---

# 31. Guidance for AI Assistants

When working on this project:

1. Read this project map before proposing architectural changes.
2. Inspect the actual implementation before assuming something exists.
3. Preserve established architecture unless there is a clear reason to change it.
4. Treat the database as production-sensitive.
5. Never assume a migration is safe without checking existing schema/data.
6. Preserve existing preorder behavior when implementing counter-sale features.
7. Enforce business-critical rules at the backend/model layer.
8. Do not duplicate business logic unnecessarily.
9. Prefer incremental migrations.
10. Do not silently alter completed transactions.
11. Keep special pricing separate from promotions.
12. Treat Training Mode as isolated from real business data.
13. Do not implement Training Mode by polluting the real database with fake business records unless a future architecture explicitly requires it.
14. Prefer browser/application state for unfinished workflows when no real transaction exists yet.
15. Use atomic database transactions for operations that create a real financial transaction.
16. Test failure paths as seriously as happy paths.
17. Preserve the bakery's actual workflow over theoretical software elegance.
18. Keep worker-facing UX extremely simple.
19. Do not introduce worker assignment/ownership without a real bakery requirement.
20. Distinguish demand, production planning, and actual production.
21. Do not invent missing business rules.
22. If a business rule is unclear, ask before implementing it.
23. When reviewing another AI's code, verify the actual file and runtime behavior rather than merely agreeing with the proposed code.
24. Clearly distinguish verified facts from assumptions.
25. Update this document when a major architectural or business decision changes.
26. Do not turn this document into a command-by-command development diary.

---

# 32. Instructions for Claude / Verification Review

Claude is being used as a verification and independent review partner.

Claude should treat this document as the current architectural intent, but should **not blindly accept it as proof that the implementation matches the intent**.

When asked to review work:

### First verify reality

Check:

* actual files on disk
* actual database schema
* migrations
* routes
* models
* frontend code
* tests
* Git status
* Git commit when relevant

Do not say "correct" merely because a pasted snippet appears correct.

### Look specifically for contradictions

Claude should actively look for:

* project-map claims that do not match the code
* schema/migration mismatches
* route/model field-name mismatches
* transaction-boundary problems
* authorization bypasses
* stale UI assumptions
* incomplete rollback behavior
* frontend/backend validation differences
* real database writes occurring in Training Mode
* fake training records appearing in real reports
* counter-sale changes accidentally breaking preorder behavior
* money precision problems
* custom-product/custom-item joins dropping data
* enum/status values accepted by the backend without validation

### Do not redesign unnecessarily

Claude should distinguish between:

**"This is technically possible to improve"**

and

**"This violates an established bakery requirement."**

The bakery workflow is the primary authority.

A more elaborate architecture is not automatically a better architecture.

### For every review

Report:

1. What was actually verified.
2. What was only inferred.
3. Exact file/function/route where the issue exists.
4. Why the issue matters.
5. Whether it blocks moving forward.
6. The smallest appropriate correction.

If something cannot be tested, say so explicitly.

---

# 33. Current Development Direction

The immediate Counter Sale development sequence should be:

1. Finalize the browser-only counter-sale state model.
2. Implement the atomic real counter-sale completion path.
3. Verify the backend independently.
4. Build the simple Counter Sale UI around that backend.
5. Verify the complete Counter Sale workflow.
6. Add Training Mode architecture.
7. Verify that Training Mode cannot contaminate real business data.
8. Extend Training Mode to Production/Kitchen workflows.
9. Only later design the genuine Void/Refund system.

Do not jump ahead to promotions, inventory, or reporting while the fundamental transaction workflow is still being established.

---

# 34. Current Checkpoint

Date:

`2026-09-01`

Branch:

`main`

The project has progressed substantially beyond the original August 19 counter-sale checkpoint.

Current major state:

* authentication working
* preorder workflow established
* counter-sale foundation implemented
* counter-sale order type implemented
* optional counter-sale customer implemented
* counter-sale numbering implemented
* custom/non-catalog items implemented
* admin-only catalog price override implemented
* payment methods expanded
* cash/change support implemented
* completed counter-sale immutability protection implemented
* Counter Sale navigation/view foundation implemented
* production planning boundaries improved
* production quantity UX improved

Current strategic focus:

> **Build the Counter Sale as a clean, atomic real transaction with an unfinished browser-only cart, then add Training Mode as a safe playground for Counter and Kitchen employees.**

Future real-transaction correction:

> **Controlled Void/Refund, not silent deletion.**

The system should continue to favor:

> **simple workflows, trustworthy data, strong backend rules, and incremental development.**
