---
name: bakery-system-verification
description: Use when working on the bakery_system project (ImagenMan/bakery_system) — reviewing code the person or ChatGPT wrote, fixing bugs, or checking readiness to move to the next stage (routes, UI, etc). Complements docs/BAKERY_SYSTEM_DEVELOPMENT_SKILL.md (ChatGPT's process rules); this skill covers verification, since Claude has code execution and ChatGPT in this workflow does not.
---

# Bakery System — Verification Workflow

## The one rule that matters most
**Never say "that's correct" based on reading a pasted snippet alone.** In this project, pasted-code-looks-right ≠ file-on-disk-is-right ≠ pushed-to-GitHub-is-right. All three failed independently in past sessions (edits reviewed but never written to the real file; local fixes never committed; commits made from a stale local copy). Always verify the layer that actually matters for the current question:
- "Does this look right?" → check the snippet's logic, but say plainly if it hasn't been applied/tested yet.
- "Is my file correct?" → read the actual file (`view`), not the pasted clip.
- "Are we ready to move on?" → `git clone` the repo fresh and check that commit.

## Verify by running, not by reading
Use the bash tool to actually reproduce the scenario:
1. Clone/pull the real repo (don't assume local edits = pushed edits).
2. `npm install`, fresh `npm run init-db` + `npm run migrate`.
3. Test through the real HTTP layer (`curl` against a running `node server/app.js`), not just by calling model functions in a `node -e` script — the route layer has its own bugs (e.g. field-name mismatches like `paymentMethod` vs `payment_method`) that model-level tests won't catch.
4. Test the specific failure case, not just the happy path (e.g. a float-trap price like `0.10 * 3`, an over-pick, an invalid enum value).
5. Reset the DB to a clean seeded state afterward — don't leave test data behind for the person to find.

## Project-specific rules learned the hard way
- **Money**: always round to cents (`ROUND(x, 2)` in SQL, or a `roundMoney()` helper in JS) before storing or comparing. Raw float math (`SUM(qty * price)` vs JS-accumulated totals) silently drifts and can permanently stick an order on `PARTIAL`.
- **Custom (non-catalog) items** (`product_id IS NULL`, `custom_name` set) must survive every join and every migration rebuild. `INNER JOIN products` silently drops them; migrations that rebuild a table via `CREATE TABLE new` + `INSERT...SELECT` must explicitly list every column, including ones added by later migrations.
- **Enums**: any status field (`order.status`, `production_status`, `payment_status`) needs backend validation against a fixed list — don't trust the frontend's dropdown options to be the source of truth.

## Review format
State clearly: (1) what's verified vs. assumed, (2) exact file + line/function, (3) why it matters, not just that it's wrong. If something can't be tested in this environment (e.g. real browser DOM), say so explicitly rather than implying it was fully checked.
