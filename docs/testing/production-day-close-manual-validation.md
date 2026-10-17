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
