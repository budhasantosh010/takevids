# Change record — TakeVids frontend product surface

Date: 2026-09-17
Status: VERIFIED
Requirements: REQ-004, REQ-005, REQ-006, REQ-007, REQ-008, REQ-009, REQ-010
Decisions: DEC-001 through DEC-007

## Intended outcome

Create the frontend-first TakeVids product surface around the proven workflow:

`reference → reverse engineer → reusable Video Kit → new footage + media → execute → chat refine → export-ready`

Keep the user interaction simple enough that the core outcome does not require traditional editing knowledge.

## What must not change

- `Main Rough Thought.txt` remains preserved.
- Canonical project root remains unchanged.
- Local dev port remains 2500.
- Reverse-engineering model and execution model stay separate roles.
- No real provider credentials, paid inference or provider SDK coupling are introduced in this phase.
- Timeline stays optional/supporting rather than becoming the main product interaction.

## Main files

- `package.json`, TypeScript/Vite/ESLint config
- `src/app/App.tsx`
- `src/domain/models.ts`
- `src/domain/workflow.ts`
- `src/domain/media.ts`
- `src/domain/workflow.test.ts`
- `src/components/*`
- `src/features/workspace/ChatPanel.tsx`
- `src/features/workspace/PreviewWorkspace.tsx`
- `src/features/workspace/MediaPanel.tsx`
- `src/features/video-kit/VideoKitPanel.tsx`
- `src/styles/index.css`
- `scripts/visual-check.mjs`
- project governance/source-of-truth docs

## Behavior implemented

- Two-pane Chat ↔ Video workspace.
- Reference video file picker + drop target + demo path.
- Frontier reverse-engineering model represented as secondary typed control.
- Deterministic analysis progress and reusable Video Kit generation.
- New-footage file picker + drop target + demo path.
- Separate execution-model role represented as secondary typed control.
- Deterministic edit/review/refine/export-ready flow.
- Universal Media panel for video/B-roll/images/music/SFX.
- Supporting media file picker/drop, draggable cards, `Main`/`Add` actions, remove action and used-state.
- Dragging media onto preview/timeline places it into workflow state.
- Optional AI-generated timeline for inspection.
- Responsive two-pane/stacked browser layouts.
- Dead global navigation removed from active workspace.

## Verification

```text
npm test                          PASS — 4/4 tests
npm run lint                      PASS
npm run build                     PASS
node .\scripts\visual-check.mjs  PASS
```

Browser automation verifies:

- reference state;
- kit-ready state;
- media bin state;
- review state;
- chat refinement;
- export-ready state;
- zero console/page/network errors;
- no horizontal overflow at 1024px and 820px.

Visual evidence is generated locally under `artifacts/` and intentionally ignored by Git.

## Failures encountered and fixed

See `DOCS/FAILURE_REGISTRY.md`:

- FAIL-001 TypeScript/Vite CSS declaration issue.
- FAIL-002 missing favicon network 404.
- FAIL-003 React set-state-in-effect lint issue.
- FAIL-004 media automation action mismatch.
- FAIL-005 PowerShell Core unavailable; Windows PowerShell used.

## Limitations

This is a deterministic frontend prototype. It does not yet perform real AI video analysis, rendering, persistence, authentication, billing or final file export.

## Rollback

Before this UI/simplicity batch, Harness checkpoint `cp-20260917-182159-3237` exists. The earlier frontend scaffold checkpoint is `cp-20260917-180314-086e`. After commit, the coherent frontend commit can also be reverted with Git.
