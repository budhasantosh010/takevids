# TakeVids frontend foundation plan — 2026-09-17

## Objective

Create the first production-structured TakeVids product surface around the proven flow:

`reference video → reverse engineer → reusable Video Kit → new footage → execute kit → chat refine → export`

## Non-goals

- Real model-provider/API integration
- Billing/authentication
- Real video rendering/export pipeline
- Marketplace/library backend
- Full traditional NLE timeline functionality

## Ordered work

1. Instantiate governance files and establish Git baseline.
2. Scaffold React + TypeScript + Vite app with port 2500 and test/build tooling.
3. Implement application shell and two-pane chat/video workspace.
4. Implement typed project/workflow state and model-role abstractions.
5. Implement reference upload, reverse-engineering, analysis/kit results, and saved Video Kit state.
6. Implement new footage reuse flow, execution-model choice, chat refinement, and export-ready state.
7. Add responsive behavior, keyboard/accessibility basics, empty/loading/progress states, and UI polish.
8. Run diagnostics, tests, production build, local dev server, and browser visual inspection; repair regressions.
9. Update project docs/change records and commit coherent verified slices.

## Expected application files

- `package.json`, Vite/TypeScript config
- `src/app/` app shell/state
- `src/features/workspace/`
- `src/features/video-kit/`
- `src/features/chat/`
- `src/components/`
- `src/domain/`
- `src/styles/`
- tests colocated or under `src/**/*.test.ts(x)`

## Acceptance criteria

- Core workflow is understandable in the UI without external explanation.
- Reverse-engineering and execution model roles are visually distinct.
- Video Kit contents are inspectable and visibly reusable.
- Chat and visual editor coexist in the main workspace.
- Production build succeeds and dev server runs on `localhost:2500`.
- Desktop visual inspection is completed and obvious issues are repaired.

## Rollback

Each coherent requirement slice is committed separately. Revert the relevant requirement commit if a slice regresses.
