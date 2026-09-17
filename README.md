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

The source now includes a real server-side LiteLLM HTTP worker, a private LiteLLM → NVIDIA NIM proxy configuration, and an NVIDIA certification harness. No provider secrets are committed or sent to the browser. The current machine has no NVIDIA/LiteLLM credentials, so no live NVIDIA inference has been certified yet and no provider model is user-visible. See `DOCS/PROVIDER_LAYER.md`, `DOCS/NVIDIA_MODEL_CERTIFICATION.md`, and `DOCS/BACKEND_RUNTIME.md`.

## Current phase

The simplified v0 frontend is locked. The backend now probes arbitrary-format videos, persists isolated jobs, preprocesses real media, enforces retention, renders real preview/final MP4 files locally with CPU FFmpeg, validates a versioned Video Kit envelope, confines agent file access to one job workspace, and can load Santosh's future prompt/skill files exactly in caller-defined order with hashes. A Docker isolation adapter/image is defined, but actual local container execution is not yet claimed as verified. The remaining intelligence milestone is: real WhisperX transcript → LiteLLM/NVIDIA model run → Santosh's proven reverse-engineering prompts/skills → real model-generated Video Kit → real kit execution adapter.

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
npm run test:kit-smoke
npm run provider:env
npm run verify:nvidia
npm run lint
npm run build
npm run test:visual
```

The backend smoke test creates real media/job/render artifacts locally. The browser check verifies both the reference path and the proven-kit path, asserts that no timeline appears in v0, checks responsive overflow, and fails on browser/page/HTTP errors.

## Main source areas

```text
src/domain/workflow.ts            reference/proven-kit workflow state
src/domain/models.ts              approved model registry + route metadata
src/domain/providerGateway.ts     certification-gated provider boundary
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
server/agent/                       scoped workspace + Docker sandbox adapter
server/kits/                        Video Kit envelope + execution routing
server/instructions/                exact prompt/skill loader
server/providers/                   NVIDIA catalog + LiteLLM client + certification runner
litellm/config.yaml                 TakeVids aliases → NVIDIA hosted NIM
docker/litellm.compose.yml          local LiteLLM proxy definition
docker/agent/Dockerfile             isolated agent image definition
DOCS/PROVIDER_LAYER.md              provider/storage architecture
DOCS/NVIDIA_MODEL_CERTIFICATION.md  current NVIDIA shortlist/certification state
DOCS/BACKEND_RUNTIME.md             local backend/runtime architecture
DOCS/AGENT_KIT_SUBSTRATE.md         agent/kit substrate architecture
```

## Project governance

This repository includes the Codex project template under `AGENTS.md`, `.codex/`, `DOCS/`, and `hooks/`. Read `AGENTS.md` before making changes. The authoritative current state is `DOCS/CURRENT_STATE.md`; requirements, decisions, failures, provider architecture and the active plan live under `DOCS/`.
