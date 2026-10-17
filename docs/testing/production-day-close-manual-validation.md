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

### Updated overall assessment

The single-plan UI test passed for closure, fresh-stock write-off, and retry
safety. Separate isolated API evidence supports multi-plan closure and retry
idempotency. Multi-plan closure through the UI and frozen-stock preservation
after a successful UI closure remain unverified. Do not report the API result
as a successful multi-plan UI test.
