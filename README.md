# TakeVids

TakeVids is a browser-based AI video-editing workspace built around a proven workflow:

```text
Reference video
    ↓
Reverse engineer structure/style with a frontier model
    ↓
Build a reusable Video Kit + editing workflow
    ↓
Add new footage + optional B-roll/images/music/SFX
    ↓
Execute the kit with a cheaper/faster model when appropriate
    ↓
Chat-refine the edit
    ↓
Export final video
```

The product is intentionally **not** a traditional timeline-first editor. Its current interaction model is:

```text
Chat  ↔  Preview + Media + Video Kit  →  Export
```

The timeline is visible as an optional explanation/inspection surface, but users should be able to reach the outcome by uploading, dragging and chatting.

## Current phase

The frontend/product surface is locked for the deterministic prototype. Real model-provider calls and real video rendering/export are deliberately deferred until the interface is accepted. Model roles and workflow state are typed so provider adapters can be added without rewriting the UI.

## Local development

```powershell
npm install
npm run dev
```

The development server must run on **`http://localhost:2500`**.

## Verification

```powershell
npm test
npm run lint
npm run build
node .\scripts\visual-check.mjs
```

The visual check drives the browser through reference → kit → media → edit → refinement → export-ready and writes screenshots under `artifacts/`.

## Main source areas

```text
src/domain/                 workflow, model and media types/state
src/app/                    application composition
src/features/workspace/     chat, preview and media surfaces
src/features/video-kit/     reusable kit inspector
src/components/             shared controls
scripts/visual-check.mjs    browser-level UI verification
```

## Project governance

This repository includes the Codex project template under `AGENTS.md`, `.codex/`, `DOCS/`, and `hooks/`. Read `AGENTS.md` before making changes. `DOCS/CURRENT_STATE.md`, `DOCS/REQUIREMENTS.md`, `DOCS/DECISIONS.md`, `DOCS/FAILURE_REGISTRY.md`, and the active plan under `DOCS/plans/` are the project source of truth.
