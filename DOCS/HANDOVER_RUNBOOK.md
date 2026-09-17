# Handover runbook

## Objective

Build TakeVids as a browser-based conversational AI video editor: reverse engineer a reference video into a reusable Video Kit, apply the kit to new footage, chat-refine the edit, and export the result.

## Required environment

- Project root: `C:\Users\Lenovo\Music\Startups\Lovable for Video Editors\full code`
- Platform/runtime: Windows, Node.js/npm, modern Chromium browser
- Required dependencies: Defined in `package.json` once frontend scaffolding is installed

## Safe startup

1. Read the files required by `AGENTS.md`.
2. Run `hooks/verify_project_setup.ps1`.
3. Review `DOCS/CURRENT_STATE.md`.
4. Open `DOCS/plans/2026-09-17-takevids-frontend-foundation.md`.
5. Run the project's non-destructive preflight/build checks.

## Canonical commands

| Purpose | Command | Expected result |
|---|---|---|
| Verify documentation setup | `powershell -NoProfile -ExecutionPolicy Bypass -File .\hooks\verify_project_setup.ps1` | Required files PASS |
| Verify governance | `powershell -NoProfile -ExecutionPolicy Bypass -File .\hooks\verify_governance.ps1` | Governance checks PASS |
| Development | `npm run dev` | App available on `http://localhost:2500` |
| Production build | `npm run build` | Successful typecheck/build |

## Recovery

When a run fails, preserve the exact error, check `DOCS/FAILURE_REGISTRY.md`, reproduce minimally, then add regression protection before claiming a fix.

## Prohibited assumptions

- Historical “DONE” labels are not current proof.
- Harness/model memory is not authoritative project documentation.
- A successful compile is not proof that the visual workflow works.
- Mock model execution is not real provider integration.
