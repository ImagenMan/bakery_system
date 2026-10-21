# Production Day Close — Manual Validation

## Scope

Manual UI validation of production-day closure using an isolated test copy.
This record documents only the results observed in this test.

- Test environment: isolated copy at `/tmp/bakery-close-ui.fpIezd`
- App port: `3100`
- Mode: Training
- Production date tested: `2026-10-06`
- Production plan: `#9`
- Product: Sencilla
- Inventory lot: `#6`

The live application on port `3000` and the live Normal and Training
databases were not used for these test actions.

## Results

### PASS — Close production date

The Production UI displayed the expected remaining quantities before closure.
After confirming End Production Day, the UI reported:

> Production date closed. 1 fresh inventory waste transaction recorded across its plans.

The UI then displayed no available lots for the tested product.

### PASS — Fresh inventory written off

Read-only database verification found the following ledger entries for lot `#6`:

- `RECEIPT`: `+1`
- `WASTE`: `-1`

The resulting inventory-ledger balance was `0`. Exactly one waste transaction
was recorded for this lot during the test.

### PASS — Retry does not duplicate closure or waste

The UI was used to attempt closure again. It reported:

> This production date was already closed. No additional waste was recorded.

Read-only database verification confirmed:

- Exactly one `PRODUCTION_DAY_CLOSED` event for the tested daily record.
- Exactly one `WASTE` transaction for lot `#6`.
- Inventory-ledger balance remained `0`.

### NOT VERIFIED BY THIS UI TEST — Multiple plans on one date

The tested date had only one production plan. This UI test therefore does not
establish that every plan for a date is closed by a single action. Multi-plan
behavior requires separate evidence.

### NOT VERIFIED BY THIS UI TEST — Frozen inventory preservation

This test did not establish that frozen inventory remains available after
closure. Do not treat frozen-stock preservation as passed based on these
results.

## Test-environment state at end

The current business day was left open in the isolated Training database.
No action was taken to close it as part of this validation.

## Overall result

The isolated UI test passed for single-plan date closure, fresh-stock
write-off, and retry safety. Multi-plan closure and frozen-stock preservation
remain separate validation items and must not be marked passed based solely
on this test.

## Supplemental results — Multi-plan API and UI follow-up

### Isolated API test

A separate isolated API test exercised production closure for `2026-09-22`,
which had production plans `#6` and `#8`. The recorded result showed a
`PRODUCTION_DAY_CLOSED` event. A retry reported the date was already closed
without adding a duplicate close event or additional waste.

Frozen inventory lot `#5` had ledger entries of `RECEIPT +5`,
`CONSUMPTION -1`, and a previously recorded `WASTE -1`, leaving a ledger
balance of `3` units. Because no fresh inventory remained eligible for
additional write-off in this test, it did not independently verify fresh-stock
write-off across multiple plans.

### Multi-plan UI test — Not verified

A separate disposable Training copy at `/tmp/bakery-close-multiplan.2QdvsR`,
port `3101`, was used to attempt closure for `2026-09-22`, with plans `#6` and
`#8`. The request was rejected with:

`Cannot close production for a daily record that has not been opened.`

The test-only daily record lacked an opening lifecycle event. No close event
was created, and read-only verification showed lot `#5` still had a ledger
balance of `3`. Since the UI closure did not succeed, this is not evidence
that frozen inventory remains available after a successful UI closure.

The UI test was stopped without adding a synthetic opening event. The live
Normal and Training databases were not used for these actions.

### Successful multi-plan UI validation — 2026-10-17

A later test passed in disposable Training copy
`/tmp/bakery-close-multiplan.2QdvsR`, port `3101`, using valid daily record
`#11` and its matching `BUSINESS_DAY_OPENED` event.

The Production overview date-wide **Close Production Day** action closed
production for plans `#14` (Sencilla) and `#15` (Sticky). The UI changed to
**Production Day Closed** while the business day remained open.

Read-only verification confirmed:

- Sencilla fresh lot `#11`: receipt `+2`, one waste `-2`, balance `0`.
- Sticky fresh lot `#12`: receipt `+3`, one waste `-3`, balance `0`.
- Existing frozen source lot `#5` remained at ledger balance `3`.
- Frozen-inventory records for source lots `#5` and `#10` remained present.
- Exactly one `PRODUCTION_DAY_CLOSED` event (`#22`) existed for daily record
  `#11`.
- Retrying the close returned HTTP `200`, `already_closed: true`,
  `waste_count: 0`, and no additional waste transactions.
- Plans `#14` and `#15` remained present.

The live database hashes matched their recorded baselines:

- `data/bakery.db`: `ea7f320c4cb7b6f5e0ec452da4716a19c77cf3acf81531d85ee272ff8af9d3a0`
- `data/training.db`: `38157b3ce54e4d7626672e898ebfb3ae15f2f2b0feb04207b4f359b500fdf397`

All multi-plan test actions were performed in the disposable copy. The live
application on port `3000` and live databases were not used. The business day
was left open.

### Final assessment

The isolated evidence now covers single-plan and date-wide multi-plan UI
closure, fresh-inventory write-off, retry idempotency, and preservation of
existing frozen inventory. The earlier failed attempt for `2026-09-22` remains
documented above as a failed test setup, not a successful closure.

### Atomic rollback test — passed

A separate isolated test used:
- Disposable database: `/tmp/bakery-rollback-test.sJeLGV/training-test.db`
- Synthetic production date: `2099-01-01`
- Two production plans with fresh stock and 3 frozen units.

Results:
- Forcing the final `PRODUCTION_DAY_CLOSED` event insert to fail rolled back all changes.
- A subsequent successful close wrote off fresh stock across both plans.
- All 3 frozen units remained intact.
- Exactly one close event was recorded.
- Repeating the close created no duplicate waste or close event.

All assertions passed. This test used only the disposable database; the live Normal and Training database hashes remained unchanged.

### Mixed and all-frozen inventory regression test — passed (2026-10-18)

A disposable copy of `data/training.db` was used to test the real production
close, inventory, and frozen-inventory model methods. The test did not load
`server/models/context.js` and did not write to either live database.

Two synthetic production plans were created for `2099-01-01`:

- Mixed lot: 5 physical units, with 3 frozen and 2 fresh.
- All-frozen lot: 4 physical units, all frozen.

Results:

- Before closure, the mixed lot reported 2 fresh and 3 frozen units.
- Closure wrote off exactly 2 fresh units from the mixed lot.
- All 3 frozen units in the mixed lot remained available.
- The all-frozen lot retained all 4 frozen units; no fresh-stock write-off
  was recorded for that lot.
- Retrying closure returned `already_closed: true` and no waste transactions.
- The retry created neither additional waste nor a duplicate closure event.
- Both live database file hashes remained unchanged.

All regression assertions passed. The disposable test directory was removed
when the test finished.

This supplements the earlier multi-plan UI and atomic-rollback validations.
It specifically verifies that closure distinguishes fresh from frozen stock
for both mixed and all-frozen lots.

### Multi-lot inventory consumption rollback test — passed (2026-10-18)

A standalone regression test used a temporary copy of the disposable
`data/production-inventory-e2e-test.db`. It created two synthetic FIFO lots
and installed a temporary SQLite trigger that forced the second lot's
`CONSUMPTION` insert to fail. The allocator was called inside an outer
database transaction, matching the transaction boundary used by counter
sales and preorder pickups.

Results:

- The forced failure occurred on the second lot.
- The first lot's attempted consumption was rolled back.
- Both lots returned to their original balances.
- The inventory transaction count was unchanged after rollback.
- Both live database hashes matched their pre-test values.
- The temporary test database and trigger were removed with the temporary
  test directory.

All assertions passed. No application code was changed. The live Normal and
Training databases were not modified.

This verifies atomic rollback for a multi-lot consumption failure when the
allocator is called within its caller's transaction. It complements the
FIFO, frozen-stock protection, and insufficient-inventory regression checks.

## 2026-10-20 — Isolated real-route API close test

**Result: PASS**

Tested the production-day close endpoint through the real production routes using an isolated Express harness and a disposable copy of the Training database. The harness listened only on `127.0.0.1:3137`. The Normal database was not used for this test.

- Production date: `2026-09-23`
- Production plans: `#11` and `#12`
- Inventory lots: `#8` and `#9`
- Before close: lot `#8` had 8 fresh units and 2 frozen units; lot `#9` had 4 fresh units and 2 frozen units.
- First close request: HTTP 200. Created exactly two `WASTE` transactions: 8 units from lot `#8` and 4 units from lot `#9`, for 12 fresh units written off.
- After close: both lots retained their 2 frozen units, with zero fresh units remaining. Both production plans remained present.
- Retry request: HTTP 200 with `already_closed: true`, the same close event ID (`19`), and zero additional waste transactions.
- Final counts: 2 waste transactions totaling 12 units, and exactly 1 `PRODUCTION_DAY_CLOSED` event for the daily record.
- The Normal database integrity check returned `ok`.

This test confirms successful close behavior, fresh-versus-frozen inventory handling, and retry idempotency through the real route in an isolated environment. It does not, by itself, establish that every authorization and business-day guard was revalidated in this run.

## 2026-10-21 — Production-close HTTP guard tests

**Result: PASS**

Tested the real production-close route in an isolated copy of the application
using a disposable copy of the Normal database. The isolated server listened
on port `3138`. The live Normal and Training databases were not used for test
writes.

### Unopened current business day

- Authenticated as a temporary ADMIN account created only in the disposable
  database.
- Requested closure for production date `2026-10-20` while the current
  business date (`2026-10-21`) had not been opened.
- Result: HTTP `409`.
- Response stated that business day `2026-10-21` must be open before
  operational actions can be changed.
- The request was rejected by the business-day guard.

### Future production date

- Opened business date `2026-10-21` only in the disposable database using
  the application's daily-record and operational-event models.
- Requested closure for future production date `2026-10-22`.
- Result: HTTP `400`.
- Response: `Cannot close a future production date.`
- The request was rejected by the future-date guard.

### Cleanup and isolation

- Stopped the isolated test server after testing.
- The live Normal database SHA-256 remained
  `ea7f320c4cb7b6f5e0ec452da4716a19c77cf3acf81531d85ee272ff8af9d3a0`.
- The live Training database SHA-256 remained
  `38157b3ce54e4d7626672e898ebfb3ae15f2f2b0feb04207b4f359b500fdf397`.
- Local `HEAD` and `origin/main` both remained at
  `97a5e8e2952ef244c0d4ef1ca94fc978d04682ca`.

Both guard assertions passed. These results supplement the previously
documented authorization, successful-close, retry-idempotency, inventory,
and rollback tests; they do not replace the scope limitations recorded for
the earlier individual tests.
