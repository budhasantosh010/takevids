# TakeVids

TakeVids is a browser-based AI video editor built around one simple promise: start from an editing format that already works, add your footage, and get the finished video without learning an NLE.

```text
HOME
├─ Reverse engineer a video
│      ↓
│  add a reference
│      ↓
│  TakeVids builds a reusable Video Kit
│
└─ Use a proven kit
       ↓
   choose a TakeVids-tested format

              ↓
       add your footage
              ↓
       automatic editing
              ↓
       review / chat changes
              ↓
       finished video
```

The current v0 intentionally has **no visible timeline** and no supporting-media bin. Those implementation details can exist internally later, but the user path stays simple.

## Provider architecture

TakeVids owns which models users are allowed to select.

```text
TakeVids UI
   ↓
approved model registry
   ↓
server-side adapter
   ↓
LiteLLM
   ├─ NVIDIA NIM        ← first inexpensive test upstream
   ├─ Anthropic direct  ← frontier later
   ├─ OpenAI direct
   ├─ Google direct
   └─ OpenRouter
```

The current source includes the typed policy/routing boundary plus a real local media/job/render backend spine. It contains no provider credentials and makes no real external inference request yet. See `DOCS/PROVIDER_LAYER.md` and `DOCS/BACKEND_RUNTIME.md`.

## Current phase

The simplified v0 frontend is locked. The backend can now probe arbitrary-format videos, persist isolated jobs, preprocess real media, enforce retention, and render real preview/final MP4 files locally with CPU FFmpeg. The remaining intelligence milestone is: real WhisperX transcript → LiteLLM/NVIDIA model run → Santosh's proven reverse-engineering prompts/skills → real Video Kit files → kit-constrained edit.

## Local development

```powershell
npm install
npm run dev
```

The development server must run on **`http://localhost:2500`**.

## Verification

```powershell
npm test
npm run test:backend
npm run typecheck:server
npm run test:backend-smoke
npm run lint
npm run build
npm run test:visual
```

The backend smoke test creates real media/job/render artifacts locally. The browser check verifies both the reference path and the proven-kit path, asserts that no timeline appears in v0, checks responsive overflow, and fails on browser/page/HTTP errors.

## Main source areas

```text
src/domain/workflow.ts            reference/proven-kit workflow state
src/domain/models.ts              approved model registry + route metadata
src/domain/providerGateway.ts     LiteLLM-ready server boundary contract
src/app/                          application composition
src/features/home/                simple two-path home dashboard
src/features/workspace/           chat + video result workspace
src/features/video-kit/           reusable kit inspector
scripts/visual-check.mjs          real Chromium workflow verification
server/media/                      ffprobe + FFmpeg preprocessing
server/jobs/                       durable local jobs + retention
server/workers/                    transcription/model/render interfaces + local renderer
server/pipeline/                   media/job/render orchestration
server/api/                        server application boundary
server/smoke/fullPipeline.ts       real local backend integration proof
DOCS/PROVIDER_LAYER.md             provider/storage architecture
DOCS/BACKEND_RUNTIME.md             local backend/runtime architecture
```

## Project governance

This repository includes the Codex project template under `AGENTS.md`, `.codex/`, `DOCS/`, and `hooks/`. Read `AGENTS.md` before making changes. The authoritative current state is `DOCS/CURRENT_STATE.md`; requirements, decisions, failures, provider architecture and the active plan live under `DOCS/`.
