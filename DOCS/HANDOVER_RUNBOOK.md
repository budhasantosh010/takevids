# Handover runbook

## Objective

Build TakeVids as a browser-based conversational AI video editor: reverse engineer a reference video into a reusable Video Kit, apply that kit to new footage, optionally add supporting media, chat-refine the edit, and export the result.

## Product rule that must not drift

```text
Make it work internally → hide complexity → make the user path obvious.

The user should not need to learn editing software.
One reference + one reusable kit + media + chat should be enough to reach the result.
```

Current information architecture is deliberately limited to **Chat, Preview, Media, Video Kit, Export**. The timeline is supporting inspection, not the primary editing interface. Do not reintroduce timeline-first/NLE complexity without a new explicit decision.

## Required environment

- Project root: `C:\Users\Lenovo\Music\Startups\Lovable for Video Editors\full code`
- Platform/runtime: Windows, Node.js/npm, modern Chromium browser
- Frontend: React 19 + TypeScript + Vite
- Dev port: **2500 only**
- Browser visual check: `playwright-core` using installed Chrome

## Safe startup

1. Read the files required by `AGENTS.md`.
2. Read `DOCS/CURRENT_STATE.md`, `REQUIREMENTS.md`, `DECISIONS.md`, `FAILURE_REGISTRY.md` and the active plan.
3. Run setup/governance verifiers.
4. Run `npm test`, `npm run lint`, `npm run build`.
5. Start/confirm `npm run dev` on `http://localhost:2500`.
6. For UI changes, run `npm run test:visual` and inspect the generated `artifacts/*.png` rather than trusting compilation alone.

## Canonical commands

| Purpose | Command | Expected result |
|---|---|---|
| Verify documentation setup | `powershell -NoProfile -ExecutionPolicy Bypass -File .\hooks\verify_project_setup.ps1` | Required files PASS; no project placeholders remain |
| Verify governance | `powershell -NoProfile -ExecutionPolicy Bypass -File .\hooks\verify_governance.ps1` | Governance checks PASS |
| Development | `npm run dev` | App available on `http://localhost:2500` |
| Unit tests | `npm test` | 6 tests PASS as of 2026-09-17: workflow + project-foundation regression coverage |
| Lint | `npm run lint` | PASS |
| Production build | `npm run build` | PASS |
| Full UI flow | `npm run test:visual` | Reference → kit → media → edit → refine → export ready; no browser/network errors; responsive overflow checks PASS |

## Important code boundaries

```text
src/domain/workflow.ts        workflow state machine + media roles + kit state
src/domain/models.ts          model metadata / role separation
src/domain/media.ts           browser File → typed MediaAsset conversion
src/app/App.tsx               composition + deterministic demo adapter
src/features/workspace/       chat, preview, media surfaces
src/features/video-kit/       reusable kit inspector
scripts/visual-check.mjs      end-to-end browser UI verification
```

Model-provider logic must be added behind adapters/state events rather than inside UI components. Reverse-engineering and execution model roles must remain distinct.

## Current frontend flow

```text
Drop reference video
        ↓
Reverse engineer
        ↓
Video Kit appears
        ↓
Add main footage
        ↓
Optional Media: B-roll / images / music / SFX
        ↓
Edit this video
        ↓
Review preview + optional timeline
        ↓
Chat changes in plain English
        ↓
Export ready
```

## Known intentional gaps

- No real frontier-model API calls yet.
- No real video analysis/render/export pipeline yet.
- No auth, persistence, billing or shared projects yet.
- No kit marketplace/library backend yet.
- `DOCS/_raw/user_messages.txt` cannot be claimed as live evidence from ChatGPT Harness; the Codex hook must be verified inside Codex.

## Recovery

When a run fails:

1. Preserve the exact error.
2. Check `DOCS/FAILURE_REGISTRY.md`.
3. Reproduce with the smallest non-destructive test.
4. Add regression protection before claiming a fix.
5. Restore the most recent Harness checkpoint if a UI batch becomes worse rather than layering fixes blindly.

Useful checkpoints from the initial frontend build include `cp-20260917-180314-086e` and `cp-20260917-182159-3237`.

## Prohibited assumptions

- Historical “DONE” labels are not current proof.
- Harness/model memory is not authoritative project documentation.
- A successful compile is not proof that the visual workflow works.
- Mock model execution is not real provider integration.
- An attractive timeline is not permission to turn TakeVids into a traditional NLE.
- Future navigation should not appear as clickable UI until its destination actually works.
