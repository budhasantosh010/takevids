# Current verified state

Last verified: `2026-09-17`

## Project

- Name: `TakeVids`
- Root: `C:\Users\Lenovo\Music\Startups\Lovable for Video Editors\full code`
- Canonical GitHub remote: `https://github.com/budhasantosh010/takevids`
- Owner: `Santosh`
- Primary objective: Make professional reference-driven video editing feel as simple as Lovable: choose a proven workflow or reverse engineer a reference, add footage, and receive the finished edit without learning an NLE.

## Verified working

| Capability | Evidence | Evidence level | Verified date |
|---|---|---:|---|
| Codex template installed and instantiated | governance verifiers + project-foundation tests | E3 | 2026-09-17 |
| Original product thought preserved | `Main Rough Thought.txt` | E1 | 2026-09-17 |
| React + TypeScript + Vite browser frontend | `npm run build` | E3 | 2026-09-17 |
| Local development fixed to port 2500 | Vite config + browser automation | E3 | 2026-09-17 |
| Lovable-like v0 home with two entry paths | `artifacts/01-home.png` + browser flow | E4 | 2026-09-17 |
| Reference → reverse engineer → reusable Video Kit | workflow tests + `artifacts/03-kit-ready.png` | E4 | 2026-09-17 |
| Proven kit → new footage without reference | workflow test + `artifacts/07-proven-kit-start.png` | E4 | 2026-09-17 |
| New footage → automatic edit → refinement → finished state | browser flow + screenshots | E4 | 2026-09-17 |
| No active v0 timeline | browser assertion across reference/proven-kit paths | E4 | 2026-09-17 |
| Certification-gated model filtering | `src/domain/models.test.ts` + gateway tests | E3 | 2026-09-17 |
| LiteLLM/NVIDIA provider boundary + real HTTP client/config | `litellm/config.yaml`, `LiteLlmHttpModelWorker`, config/client tests | E3 | 2026-09-17 |
| NVIDIA September 2026 certification harness | `npm run verify:nvidia` | E3 | 2026-09-17 |
| Responsive desktop/stacked layouts | 1024/820 screenshots + overflow assertion | E4 | 2026-09-17 |
| Frontend quality gates | 11 Vitest tests PASS; ESLint PASS; production build PASS; browser flow has zero console/page/network errors | E4 | 2026-09-17 |
| Format-agnostic real media probing/preprocessing | 4 real-FFmpeg tests: horizontal, vertical, square, silent | E4 | 2026-09-17 |
| Durable local video-job workspace + retention cleanup | `LocalJobStore` tests persist/reload state and enforce staged retention | E3 | 2026-09-17 |
| Replaceable server worker boundary | Transcription/model/render contracts + fail-closed external adapters | E3 | 2026-09-17 |
| Real local preview/final render plumbing | `npm run test:backend-smoke` creates real artifacts and verifies final MP4 geometry | E4 | 2026-09-17 |
| Backend technical output validation | Re-probes output and verifies non-empty/decodable/geometry/audio/duration expectations | E3 | 2026-09-17 |
| Backend quality gates | 10 backend tests + server typecheck + real local smoke path | E4 | 2026-09-17 |

## Current v0 product surface

```text
HOME
├─ Reverse engineer a video
│      ↓
│  choose TakeVids-approved AI
│      ↓
│  add reference video
│      ↓
│  Video Kit built
│
└─ Use a proven kit
       ↓
   choose ready-made kit

              ↓
       add your footage
              ↓
       automatic editing
              ↓
       review / chat change
              ↓
       finished video
```

There is **no timeline** in the active v0. The supporting-media bin is also deferred from the visible v0 until the real reference → kit → new footage → finished video loop works end to end with live models.

## Provider architecture

```text
TakeVids UI
   ↓
TakeVids approved-model registry
   ↓
server-side provider adapter
   ↓
LiteLLM
   ├─ NVIDIA NIM        ← first test upstream
   ├─ Anthropic direct  ← frontier later
   ├─ OpenAI direct     ← later
   ├─ Google direct     ← later
   └─ OpenRouter        ← long tail later
```

- A real server-side LiteLLM HTTP worker and NVIDIA proxy configuration now exist; no provider secrets are committed or sent to the browser.
- Current machine credential probe found **no NVIDIA API key and no LiteLLM proxy/master key or URL**, so no live NVIDIA provider request has been made or claimed.
- NVIDIA candidates live in a separate certification catalog. Product routing requires `approved && enabled && certified`.
- **No model is currently TakeVids-certified or user-visible.** The UI falls back to a neutral `Model certification pending` state.
- Current hosted certification shortlist and machine results: `DOCS/NVIDIA_MODEL_CERTIFICATION.md`.
- Full provider/storage architecture: `DOCS/PROVIDER_LAYER.md`.

## Local backend/runtime now

```text
.takevids-runtime/jobs/<job-id>/
├─ input/
├─ analysis/    metadata.json + proxy.mp4 + thumbnail.jpg + transcript.wav when audio exists
├─ kit/
├─ output/      preview.mp4 + final.mp4
├─ temp/
└─ job.json
```

- FFmpeg/ffprobe are installed and verified locally.
- Docker `28.3.2` is available.
- No local NVIDIA runtime was detected (`nvidia-smi` unavailable), so current real rendering uses CPU FFmpeg.
- Default retention: temp 24h, analysis 7d, input 30d, output 30d; kits do not auto-expire unless configured.
- `npm run jobs:cleanup` enforces retention.
- Full runtime contract: `DOCS/BACKEND_RUNTIME.md`.

## Test-phase storage direction

- Local filesystem is now implemented for the single-machine proof.
- When Internet video storage is needed, use **Cloudflare R2 for video objects** and optionally **Supabase for auth/Postgres/project/job/kit metadata**.
- Do not require Supabase Pro merely to host test videos; current Pro base pricing is above the user's stated $10–20/month infrastructure target.

## Known blocked or intentionally unverified

| Item | Why | Required next action |
|---|---|---|
| Exact Codex prompt logging | ChatGPT Harness does not execute the project-local Codex `UserPromptSubmit` hook | Verify when opened/trusted in Codex; do not fabricate transcript entries |
| Real LiteLLM/NVIDIA request | Proxy config, real HTTP worker and certification harness exist, but `npm run provider:env` verified no NVIDIA/LiteLLM credentials are configured | Add server-only NVIDIA + LiteLLM keys, start proxy, then run `npm run verify:nvidia`; enable only actual PASS models |
| Real frontier-provider reverse engineering | Do not spend on frontier inference until cheap test loop works | Add/pin Anthropic or other frontier route after NVIDIA/local vertical slice is reliable |
| Reverse-engineering agent intelligence | Durable local job workspace/media tooling now exists, but it does not yet contain Santosh's proven Claude Code prompt/skills or tool-driving agent loop | Import the exact prompts/skills and connect them to the model worker + isolated workspace |
| Real transcription | 16 kHz transcription WAV extraction exists; WhisperX worker is fail-closed until configured | Add WhisperX runtime/model; use GPU worker later for production speed |
| Intelligent kit-based render/export | Real preview/final MP4 rendering is proven, but current local renderer is a plumbing render, not a style-reproducing kit execution engine | Build/execute real Video Kit instructions after reverse-engineering logic is connected |
| Auth/persistent Internet projects | Not needed to prove editing outcome | Add R2/Supabase only when multi-user testing starts |
| Supporting-media bin | Deferred from active v0 to reduce cognitive load | Re-enable after core live workflow works |

## Canonical commands

| Purpose | Command/file |
|---|---|
| Development | `npm run dev` → `http://localhost:2500` |
| Unit tests | `npm test` |
| Backend tests | `npm run test:backend` |
| Backend typecheck | `npm run typecheck:server` |
| Real local backend smoke test | `npm run test:backend-smoke` |
| Enforce local retention | `npm run jobs:cleanup` |
| Lint | `npm run lint` |
| Production build | `npm run build` |
| Full browser workflow | `npm run test:visual` |
| Provider/storage architecture | `DOCS/PROVIDER_LAYER.md` |
| NVIDIA certification research/state | `DOCS/NVIDIA_MODEL_CERTIFICATION.md` |
| Check provider env safely | `npm run provider:env` |
| Run NVIDIA certification | `npm run certify:nvidia` |
| Start/stop LiteLLM proxy | `npm run litellm:up` / `npm run litellm:down` |
| Backend runtime architecture | `DOCS/BACKEND_RUNTIME.md` |
| Agent/Kit substrate | `DOCS/AGENT_KIT_SUBSTRATE.md` |
| Active implementation plan | `DOCS/plans/2026-09-17-nvidia-litellm-certification.md` |
| Product source thought | `Main Rough Thought.txt` |

## Evidence-level legend

`E0 described · E1 implemented · E2 isolated test · E3 integrated test · E4 complete real UI/output flow · E5 repeated representative scenario`
