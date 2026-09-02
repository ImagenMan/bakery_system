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

# Bakery System — Project Map

**Project:** Vicky’s Sourdough Donuts
**Repository:** `bakery_system`
**Primary runtime:** Raspberry Pi / Debian Bullseye
**Stack:** Node.js, Express, SQLite (`better-sqlite3`), vanilla JavaScript, HTML/CSS
**Current branch:** `main`

---

## 1. Purpose

This document is the high-level map of the Bakery System.

It describes:

* the current application architecture
* implemented business behavior
* important business rules
* security boundaries
* production workflow
* current implementation status
* intended future architecture
* immediate development priorities

This document distinguishes **implemented behavior** from **planned or intended architecture**. A feature described as planned is not assumed to exist in the current code.

The guiding principle is:

> **Keep the system simple, trustworthy, and aligned with the real bakery workflow.**

---

# 2. Core Architecture

```text
Browser
  ↓
Vanilla JavaScript UI
  ↓
Express API
  ↓
Authentication / Authorization
  ↓
Models
  ↓
SQLite
```

The application is designed for use on the bakery's local network.

The browser provides the user interface and temporary workflow state.

The server is authoritative for:

* authentication
* authorization
* business rules
* pricing
* order state
* payment state
* production state
* database transactions

The client must not be trusted to enforce business rules by itself.

---

# 3. Technology

## Backend

* Node.js
* Express
* `better-sqlite3`
* `bcryptjs`
* `express-session`
* Socket.io infrastructure

## Frontend

* HTML
* CSS
* Vanilla JavaScript
* ES6+

## Database

* SQLite
* Foreign keys enabled
* Migration-based schema evolution

Database:

```text
data/bakery.db
```

Schema:

```text
data/schema.sql
```

Migrations:

```text
migrations/
```

---

# 4. Application Areas

The application is organized around the bakery's actual workflow.

Current and planned areas include:

* Orders
* Counter Sale
* Production
* Customers
* Products
* Reports
* Users
* Settings

Not every area is equally complete.

The project prioritizes the operational workflows that staff use every day.

---

# 5. Authentication and Authorization

## Roles

### ADMIN

Authenticated with:

* username
* password

Administrative capabilities include:

* product management
* custom product management
* pricing overrides
* user/administrative operations where implemented

### COUNTER

Authenticated with:

* 4-digit PIN

Counter users can perform normal counter/order workflows but cannot perform administrative operations that require ADMIN authorization.

### Staff without login

Not every bakery employee is required to have an application login.

The system is intentionally not designed around assigning every physical task to a named worker.

---

# 6. Authorization Boundary

Authorization is enforced server-side.

The UI may hide unavailable actions, but hiding a button is not considered security.

Examples of server-enforced authorization include:

* product creation/update restrictions
* custom product administration
* catalog pricing overrides
* administrative operations

The server must remain the final authority.

---

# 7. Orders

The order system supports two major order types.

```text
PREORDER
COUNTER_SALE
```

## PREORDER

Preorders represent orders placed ahead of pickup.

They may include:

* customer
* contact information
* pickup date
* pickup time
* order items
* payment information
* production requirements
* pickup tracking

Existing preorder behavior must remain intact as Counter Sale is developed.

## COUNTER_SALE

Counter Sales represent completed purchases made directly at the bakery counter.

Current implemented behavior includes:

* `order_type = COUNTER_SALE`
* optional customer
* dedicated counter-sale order numbering
* catalog products
* custom/non-catalog products
* payment method
* cash received
* change calculation
* completed-sale protection

Counter Sales remain visible in the normal Orders area.

---

# 8. Counter Sale Architecture

## Implemented foundation

The database and model layer already support Counter Sales.

Counter-sale order numbers use:

```text
CS-YYMMDD-NNN
```

Example:

```text
CS-260901-001
```

Counter Sales may optionally have a customer.

A walk-in customer does not need to be identified by name.

Counter Sales may contain:

* normal catalog products
* custom/non-catalog products

Catalog pricing overrides require ADMIN authorization.

## Completed-sale protection

Once a Counter Sale is completed, normal order mutation is rejected.

This protects completed business transactions from accidental editing.

The model contains explicit protection for completed counter sales.

---

# 9. Counter Sale Payment Model

Counter Sales are designed around a single payment method per sale.

Supported payment methods are:

```text
CASH
CARD
BANK_TRANSFER
OTHER
```

Counter Sales are immediately considered paid when successfully completed.

For cash payments:

```text
cash received
      -
sale total
      =
change
```

The server validates that cash received is sufficient before accepting the payment.

The system calculates the change amount.

Payment behavior is enforced server-side.

---

# 10. Counter Sale Transaction Boundary

The Counter Sale foundation exists, but the final dedicated transaction workflow is still a development step.

The intended architecture is:

```text
Counter Sale browser state
        ↓
POST /api/counter-sales
        ↓
server validation
        ↓
atomic database transaction
        ↓
real completed sale
```

The unfinished sale should remain in browser state while the employee builds it.

Adding or changing items should not create a real order.

The real business transaction should occur only when the employee presses **Complete Sale**.

The server should then atomically:

1. validate the request
2. validate products/custom products
3. enforce pricing authorization
4. calculate/verify the sale total
5. create the order
6. create order items
7. record the payment
8. complete the order
9. commit the transaction

If any step fails, the transaction must roll back.

The browser may calculate totals for user feedback, but the server must independently validate the transaction before committing it.

### Current status

Implemented:

* Counter Sale database support
* order type
* order numbering
* optional customer
* custom products
* pricing authorization
* payment methods
* cash/change handling
* completed-sale protection
* Counter Sale UI foundation

Remaining:

* dedicated Counter Sale browser-state workflow
* dedicated `POST /api/counter-sales` endpoint
* atomic creation/payment/completion transaction
* end-to-end Counter Sale testing

---

# 11. Custom Products

Custom products allow a Counter Sale to contain an item that is not part of the normal product catalog.

The database supports:

```text
custom_products
```

Order items can reference either:

```text
products
```

or:

```text
custom_products
```

Custom product administration is restricted to ADMIN users.

Counter users can use active custom products according to the implemented workflow.

---

# 12. Order Mutation Rules

The system protects completed business records.

Important rules include:

* completed Counter Sales cannot be normally edited
* an order item cannot be reduced below the quantity already picked up
* an order item cannot be deleted after relevant pickup has occurred
* pickup quantity cannot exceed ordered quantity
* payment cannot reduce an order total below the amount already paid

These rules are enforced at the model/server layer rather than relying only on the UI.

---

# 13. Pickup Tracking

Pickup tracking is part of the order workflow.

The system records pickup quantities and prevents impossible states.

Examples:

```text
picked up > ordered quantity
```

is rejected.

Likewise:

```text
new ordered quantity < already picked-up quantity
```

is rejected.

Deleting an item that has already been picked up is prevented.

The goal is to ensure the database reflects what physically happened at the bakery.

---

# 14. Production

Production is treated as a shared bakery workflow rather than a worker-assignment system.

The system distinguishes:

```text
DEMAND
```

from:

```text
PRODUCTION
```

Demand comes from sources such as:

* preorders
* expected counter demand

Production planning determines what needs to be made.

Workers can move between production stages and contribute where needed.

There is intentionally no formal task-ownership architecture.

---

# 15. Production Workflow

The general production flow is:

```text
Demand
  ↓
Production planning
  ↓
Dough / preparation
  ↓
Shaping / cutting
  ↓
Frying / baking
  ↓
Finishing / decorating
  ↓
Ready / available
```

Different products may skip or modify individual stages.

The workflow is designed to support the majority of bakery products without requiring a separate complicated system for every product.

---

# 16. Production UX

The production interface should remain extremely simple.

The worker should see the information needed to perform the current production task.

The system should not require workers to re-enter information the system already knows.

Examples:

### Dough / preparation view

Shows:

* what needs to be produced
* quantities
* relevant product information

It should not require:

* customer names
* payment information
* order numbers

unless those details are genuinely necessary for the task.

### Finishing

The worker should see the products requiring finishing/decorating and the quantities needed.

Time-sensitive preorder requirements should be visible where they affect production priorities.

### Ready / available

Finished products can be reflected as available for the counter/preorder workflow.

---

# 17. Production Quantity Protection

Production records represent physical work that has actually occurred.

The system therefore prevents production quantities from being reduced below quantities already produced.

In general:

```text
planned
  ≥
made
```

must remain true.

A correction cannot erase production that has already physically occurred.

---

# 18. Donut Production

Donut production currently follows the general production architecture.

Typical flow:

```text
Dough
  ↓
Cutting / shaping
  ↓
Final rise
  ↓
Frying
  ↓
Decorating
  ↓
Finished / available
```

Donut forms include:

* standard donut
* filled donut
* twist

Final-rise timing is relevant to production prioritization.

Decorators may prioritize products according to time-sensitive preorder requirements.

The production UI should support this workflow without introducing unnecessary task-assignment complexity.

---

# 19. Product Catalog

Products are organized into categories including:

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

Product pricing is stored in the product catalog.

Catalog pricing changes are controlled by the appropriate authorization rules.

Counter users may sell catalog products at their configured catalog price.

Administrative pricing overrides require ADMIN authorization.

---

# 20. Customers

Customer information is useful primarily for repeat/preorder relationships.

Relevant customer information includes:

* contact information
* allergies
* packaging preferences
* bread-cooking preference
* last-order information
* contact origin
* preferred language

Not every sale requires a customer.

A walk-in Counter Sale can remain anonymous.

---

# 21. Localization

The application supports localization through:

```text
locales/en.json
locales/es.json
```

Spanish is important to the bakery's operational workflow.

The system should avoid unnecessary hard-coded user-facing English text as localization is expanded.

---

# 22. Socket / Real-Time Architecture

Socket.io is part of the intended application architecture for communicating operational changes between connected bakery devices.

Potential uses include:

* new orders
* order updates
* production updates
* ready notifications

Real-time behavior should be added where it materially improves workflow.

It should not be introduced merely because the technology is available.

---

# 23. Training Mode

Training Mode is an application-wide architectural requirement.

It is intended to allow employees to practice real workflows without affecting real business data.

Training Mode must not create or modify:

* real orders
* real payments
* real production totals
* real pickup records
* other operational records

The employee should be able to practice workflows such as:

```text
Counter Sale
Production
```

without creating real business consequences.

---

# 24. Training Mode Architecture

Training Mode should be designed around the same workflow boundaries as Normal Mode.

The intended conceptual model is:

```text
                    ┌── Normal Mode ──→ real transaction
Employee workflow ──┤
                    └── Training Mode → no real operational persistence
```

The goal is not to build an entirely separate application.

Training Mode should reuse as much of the normal workflow behavior and validation as practical while guaranteeing that no real operational records are created or modified.

The normal Counter Sale transaction boundary should therefore be established before Training Mode is implemented.

This avoids retrofitting Training Mode into an already-fragmented transaction architecture.

---

# 25. Data Integrity Principles

The system should favor business rules that make invalid states difficult or impossible to create.

Important principles:

### Server authority

The server validates business-critical operations.

### Atomic business transactions

Operations that represent one real-world event should be committed atomically.

### Preserve physical reality

Records of completed work, payments, and pickups should not be casually overwritten.

### Avoid duplicate data entry

Workers should enter information at the point where they naturally know it.

### Keep workflow state separate from committed business data

Temporary employee activity should not become a real business record until the appropriate completion action occurs.

---

# 26. UI / UX Principles

The application is for bakery employees working in a real production environment.

Therefore:

> **Simple is King.**

The UI should prioritize:

* large clear actions
* minimal data entry
* obvious current state
* fast workflows
* low cognitive load
* minimal navigation
* useful information at the point of work

Avoid:

* unnecessary forms
* duplicate data entry
* formal task assignment
* complex dashboards that do not help the worker
* workflows designed around theoretical use cases rather than actual bakery practice

---

# 27. Error Handling Philosophy

Errors should protect the database rather than merely inform the UI.

When an operation would violate a business rule:

```text
reject operation
      ↓
preserve existing valid state
      ↓
return clear error
```

The UI should then explain the problem in a way appropriate to the employee.

The system should never silently create a partially completed business transaction.

---

# 28. Current Implementation Status

## Implemented

### Authentication

* session authentication
* ADMIN username/password
* COUNTER PIN authentication
* server-side authorization
* admin-only operations

### Orders

* preorder support
* Counter Sale order type
* Counter Sale numbering
* optional Counter Sale customer
* order item management
* payment support
* pickup tracking
* completed Counter Sale mutation protection

### Payments

* CASH
* CARD
* BANK_TRANSFER
* OTHER
* cash received
* cash change calculation
* payment validation

### Products

* catalog products
* custom products
* admin-only custom catalog pricing overrides
* custom product order items

### Production

* production overview
* production planning
* production made tracking
* ready/available workflow
* production quantity protection

### UI

* Orders workflow
* Production workflow
* Counter Sale navigation/UI foundation
* cash payment/change UI foundation

---

# 29. Partially Implemented / In Progress

## Counter Sale

The Counter Sale foundation exists, but the complete transaction boundary remains to be implemented.

Remaining work:

```text
browser sale state
      ↓
Complete Sale
      ↓
POST /api/counter-sales
      ↓
atomic transaction
      ↓
completed real sale
```

This is the next major application workflow.

---

# 30. Planned / Future

The following are architectural directions or future features rather than assumptions about current implementation:

* complete Counter Sale transaction workflow
* Training Mode
* expanded real-time Socket.io behavior
* reports
* additional customer workflows
* broader settings functionality
* refund workflow
* post-completion financial corrections
* additional operational refinements

Future work should be implemented only when it solves a real bakery need.

---

# 31. Current Development Priority

The immediate sequence is:

```text
1. Correct project documentation
        ↓
2. Fix .gitignore backup gap
        ↓
3. Commit documentation/hygiene checkpoint
        ↓
4. Review revised project map for implementation accuracy
        ↓
5. Build Counter Sale transaction boundary
        ↓
6. Test completed Counter Sale behavior
        ↓
7. Design and implement Training Mode
```

The current priority is **not** to expand the application's architecture.

The priority is to make the existing architecture trustworthy and accurately documented.

---

# 32. Architectural Checkpoint

The current project has deliberately established several important boundaries:

```text
Authorization
    ↓
server enforced

Completed Counter Sale
    ↓
protected from ordinary mutation

Pickup quantities
    ↓
cannot exceed reality

Production quantities
    ↓
cannot be reduced below work already performed

Preorder
    ↓
remains distinct from Counter Sale

Counter Sale
    ↓
being moved toward one atomic transaction

Training Mode
    ↓
will be built around that transaction boundary
```

These boundaries are more important than adding complexity.

The system should continue to favor:

> **Trustworthy behavior over feature count.**

---

# 33. Development Rule

When implementing a new workflow:

1. Define the real-world business event.
2. Define when that event becomes a committed business record.
3. Keep temporary workflow state separate from committed data.
4. Enforce critical rules on the server.
5. Make multi-step business events atomic.
6. Test invalid boundaries deliberately.
7. Keep the employee-facing workflow as simple as possible.

The goal is a bakery system that employees can trust during a busy working day.

---

# 34. Current Checkpoint

**Git HEAD:**

```text
2f734ad Update project map and training mode architecture
```

The working tree is expected to be clean at this checkpoint.

The next architectural implementation target is:

```text
Counter Sale browser state
        ↓
POST /api/counter-sales
        ↓
atomic transaction
        ↓
real completed Counter Sale
```

Training Mode follows after this boundary has been implemented and tested.
