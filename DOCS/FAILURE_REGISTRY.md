# Failure registry

Each recurring failure must have a stable ID and regression protection.

## FAIL-001 — TypeScript could not resolve CSS side-effect import

Status: FIXED
First observed: 2026-09-17
Last reproduced: 2026-09-17

Symptom:
`npm run build` failed with `TS2882: Cannot find module or type declarations for side-effect import of './styles/index.css'`.

Scope:
Frontend build configuration.

Root cause:
`tsconfig.app.json` explicitly constrained `types` and omitted Vite's client declarations.

Fix:
Include `vite/client` in the app TypeScript types.

Regression test:
`npm run build` must pass.

Evidence:
Production build passes after the configuration change.

## FAIL-002 — Browser visual check reported an HTTP 404

Status: FIXED
First observed: 2026-09-17
Last reproduced: 2026-09-17

Symptom:
The first Playwright flow completed but collected `Failed to load resource: the server responded with a status of 404`.

Scope:
Browser shell/static assets.

Root cause:
The page had no favicon declaration and Chromium requested the default favicon path.

Fix:
Add a self-contained data-URI SVG favicon in `index.html`, avoiding another static-file dependency.

Regression test:
`scripts/visual-check.mjs` treats any HTTP >=400 response as an error.

Evidence:
Full browser flow now completes with zero console/page/network errors.

## FAIL-003 — React lint rejected synchronous state change in an effect

Status: FIXED
First observed: 2026-09-17
Last reproduced: 2026-09-17

Symptom:
`react-hooks/set-state-in-effect` failed on automatically switching the inspector from Kit to Media after kit creation.

Scope:
Workspace inspector behavior.

Root cause:
UI state was being changed synchronously as a derived reaction to workflow state.

Fix:
Remove the hidden auto-switch. Inspector changes now happen through explicit user actions, which is also less surprising and better aligned with the product's simplicity rule.

Regression test:
`npm run lint` must pass.

Evidence:
ESLint now passes with no errors.

## FAIL-004 — Visual automation assumed a video asset always exposes “Add”

Status: FIXED
First observed: 2026-09-17
Last reproduced: 2026-09-17

Symptom:
Playwright timed out waiting for an `Add` button on demo B-roll while no main footage existed.

Scope:
Media-panel test semantics.

Root cause:
A video can be promoted to main footage at that stage, so the card exposed the primary-footage action rather than only a supporting-media action.

Fix:
Clarified the action label to `Main` and changed the supporting-media automation step to place the image asset, whose role is unambiguous.

Regression test:
`node .\scripts\visual-check.mjs` executes the full media + edit workflow.

Evidence:
Full browser flow passes.

## FAIL-005 — PowerShell Core executable unavailable

Status: MONITORING
First observed: 2026-09-17
Last reproduced: 2026-09-17

Symptom:
`pwsh` was not recognized on the Windows machine.

Scope:
Project governance helper commands.

Root cause:
PowerShell Core is not installed/on PATH; Windows PowerShell is available.

Fix:
Use `powershell -NoProfile -ExecutionPolicy Bypass -File ...` for the governance scripts in this environment.

Regression test:
Run both governance verifiers using `powershell`.

Evidence:
Setup and governance verifier scripts pass under Windows PowerShell.
