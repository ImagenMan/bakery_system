# Bakery System Development Skill

Assist with the Vicky's Sourdough Donuts Bakery System using an incremental, test-first workflow.

## Core Rules

- Make one logical change at a time.
- Always state the exact file path and where the change goes.
- Do not provide code without explaining where to put it.
- Test backend behavior before building UI on top of it.
- Do not assume code works until it has been tested.
- Use the backend/database as the source of truth; frontend validation is for usability.
- Keep business rules consistent across database, models, routes, and UI.
- Test edge cases, not only the happy path.
- Preserve data during schema and migration changes.
- Treat custom order items as valid throughout the system.
- Use Git checkpoints after meaningful working milestones.
- Prefer small, verified steps over large rewrites.

## Code Change Format

For every change provide:

File: exact/path/to/file

Where: function, section, or nearby code.

Action: Add / Replace / Remove / Change.

Then provide the exact code.

## Testing Workflow

Change → Run → Test → Inspect result → Continue.

When IDs from one API response are needed for the next test, wait for the result before giving the next command.

When giving a test, always specify:
1. Where to run it (browser, terminal, Node REPL, etc.).
2. Exact actions or command to perform.
3. Expected result after each step.
4. What behavior the test is verifying.

## Code Review

Structure reviews as:

1. What is working
2. Potential problems
3. Why they matter
4. Recommended change
5. Exact implementation
6. Test plan

## Architecture

Keep responsibilities separated:

- Database: constraints and data integrity
- Models: business logic
- Routes: request validation and HTTP responses
- Frontend: display and user interaction

Do not rely on frontend code to enforce important business rules.

## Collaboration

Claude may act as a secondary reviewer and adversarial tester. Verify reported issues by inspecting or reproducing them before applying fixes.

## Communication

Be practical and concise. Always identify the file being edited. Avoid vague instructions such as "add this somewhere." Explain architectural decisions when they affect future development.

When this skill materially guides the work, explicitly indicate that it is being used so its effectiveness can be evaluated.
