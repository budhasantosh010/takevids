# TakeVids

TakeVids is a browser-based AI video-editing workspace built around a proven workflow:

```text
Reference video
    ↓
Reverse engineer structure/style with a frontier model
    ↓
Build a reusable Video Kit + editing workflow
    ↓
Add new footage
    ↓
Execute the kit with a cheaper/faster model when appropriate
    ↓
Chat-refine the edit
    ↓
Export final video
```

The current phase is frontend/product-surface first. Model-provider integrations are deliberately abstracted until the interaction model is locked.

## Local development

```powershell
npm install
npm run dev
```

The development server must run on `http://localhost:2500`.

## Project governance

This repository includes the Codex project template under `AGENTS.md`, `.codex/`, `DOCS/`, and `hooks/`. Read `AGENTS.md` before making changes. `DOCS/CURRENT_STATE.md`, `DOCS/REQUIREMENTS.md`, and the active plan under `DOCS/plans/` are the project source of truth.
