# TakeVids frontend foundation plan — 2026-09-17

Status: **COMPLETE — frontend/product surface locked for this phase**

## Objective

Create the first production-structured TakeVids product surface around the proven flow:

`reference video → reverse engineer → reusable Video Kit → new footage + media → execute kit → chat refine → export`

The product philosophy is outcome-first:

```text
1. Make the underlying workflow work.
2. Keep quality/capability inside the system.
3. Hide unnecessary technical decisions.
4. Give the user one obvious next action.
5. Make the final outcome reachable by clicking, dragging, and chatting.
```

## Locked interface model

```text
CHAT                                   VIDEO WORKSPACE
│                                      │
├─ reference upload/drop               ├─ Preview/player
├─ one obvious workflow action         ├─ Video Kit
├─ progress + results                  ├─ Media bin
├─ main-footage upload/drop            ├─ optional AI-generated timeline
└─ plain-English refinements           └─ Export
```

Only five user-facing concepts are core: **Chat, Preview, Media, Video Kit, Export**.

The timeline is an explanation/inspection surface, not the required editing mechanism. Model routing is secondary/advanced. Global project/library/search navigation is deliberately absent until those destinations work.

## Media model

One universal Media panel accepts:

- video / B-roll;
- still images and screenshots;
- music/audio beds;
- SFX/impacts/whooshes;
- future media types through the same typed asset boundary.

Users can add assets with a file picker, drop files into the media area, click `Add`, or drag an asset onto the preview/timeline. Main footage remains a distinct role in workflow state.

## Non-goals for this phase

- Real model-provider/API integration
- Real video reverse-engineering backend
- Real video rendering/export pipeline
- Billing/authentication/persistence
- Kit marketplace/library backend
- Full traditional NLE functionality
- Dead/future navigation as decoration

## Completed work

1. ✅ Instantiated the Codex governance template and established baseline commit `a108970`.
2. ✅ Scaffolded React + TypeScript + Vite with port 2500 and test/build tooling.
3. ✅ Implemented the two-pane Chat ↔ Video workspace.
4. ✅ Implemented explicit typed workflow/model state with separate reverse-engineering and execution roles.
5. ✅ Implemented reference upload/drop, deterministic reverse-engineering progress, and reusable Video Kit result.
6. ✅ Implemented new-footage reuse flow, execution, chat refinements, and export-ready state.
7. ✅ Implemented a universal mixed-media bin for B-roll/images/music/SFX with add/drag-drop placement.
8. ✅ Simplified model controls into secondary details and removed dead global navigation.
9. ✅ Added loading/progress/empty/success states and restrained state-driven motion.
10. ✅ Added unit tests, linting, production build, full browser flow automation, and 1600/1024/820 visual/overflow verification.
11. ✅ Documented failures, fixes, current state, decisions and handoff.

## Verification evidence

- `npm test` → 6/6 PASS, including workflow and project-foundation regression coverage
- `npm run lint` → PASS
- `npm run build` → PASS
- `npm run test:visual` → complete flow PASS, zero browser console/page/network errors
- `artifacts/01-reference.png`
- `artifacts/02-kit-ready.png`
- `artifacts/03-media-bin.png`
- `artifacts/04-review.png`
- `artifacts/05-refined.png`
- `artifacts/06-export-ready.png`
- `artifacts/07-compact-desktop.png`
- `artifacts/08-stacked-browser.png`

## Exit gate

This frontend phase is complete when:

- the user can understand the workflow without documentation;
- reverse-engineering and execution model roles remain distinct but do not block the simple path;
- all project media lives in one understandable place;
- the product does not require timeline editing to reach an outcome;
- desktop/compact-browser rendering is visually verified;
- tests/lint/build/browser automation pass;
- the next AI can resume from authoritative project docs.

All conditions above are currently satisfied for the deterministic frontend prototype.

## Next phase — intentionally not started

Provider and backend selection/integration:

```text
UI event / typed workflow state
              ↓
provider adapter
              ↓
frontier reverse-engineering job
              ↓
persisted Video Kit
              ↓
execution/render job
              ↓
real preview/export artifact
```

Do not rewrite the frontend around a provider SDK. Providers must fit behind the existing product flow.

## Rollback

Use Git commits for coherent slices or Harness checkpoints for uncommitted UI batches. Relevant initial checkpoints: `cp-20260917-180314-086e` and `cp-20260917-182159-3237`.
