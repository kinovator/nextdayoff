## Reduce token usage

use caveman skill and use rtk (rust token killer) for commands 

## Anti-Overengineering

Before creating any new file, dependency, test, script, configuration,
or development harness, first determine whether the requested task can
be completed by modifying existing code.

For small changes, the default is:

- Modify existing files.
- Reuse existing components and utilities.
- Reuse existing tests and testing infrastructure.
- Do not create Playwright/Cypress tests just to verify a minor UI change.
- Do not create screenshot/visual-regression infrastructure.
- Do not create mock servers or fixtures.
- Do not create temporary verification scripts.
- Do not add dependencies.
- Do not refactor unrelated code.

A small UI/CSS change should normally result in a small diff.

Prefer lightweight verification for small changes.

## Testing and Verification

Use existing verification tools when available

Only add infrastructure when:
1. the user explicitly requests it;
2. it is required for correctness;
3. the project already uses that pattern and the change naturally
   belongs in it; or
4. the change is substantial enough that regression coverage is
   genuinely warranted.

When uncertain, choose the simpler implementation and keep the diff
small.

## Git Management

Do not commit on every change. User can request for the changes to be committed.
Keep commit messages brief with only highlights in point form. User can look into the diff when neessary.

## Mobile App Development

No need to rebuild the app on every change. If there is a big change, suggest and request users for the build. 
Otherwise allow user to build themselves or request the build to be created. 

## Effort Level

If the change requires high level of effort, lots of research and development, consult user before acting.
If effort is small then just act first. 