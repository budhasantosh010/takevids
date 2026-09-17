# Handover runbook

## Objective

Build TakeVids as the simplest possible reference-driven AI video editor. Users either reverse engineer a strong reference into a reusable Video Kit or choose a TakeVids-proven kit, then upload new footage and receive the finished edit.

## Product rule that must not drift

```text
Make it work internally → absorb the complexity → make the visible path obvious.

If an 80-year-old or a 9-year-old needs to understand an NLE concept,
TakeVids is exposing too much implementation detail.
```

Current v0 deliberately has **no timeline** and **no visible supporting-media bin**. The active concepts are only:

```text
Home choice → input video → reusable kit → new footage → preview/result → chat change → finished video
```

Reverse engineering is the core differentiator. Proven kits exist because many users will not arrive with a good reference.

## Required environment

- Project root: `C:\Users\Lenovo\Music\Startups\Lovable for Video Editors\full code`
- Canonical GitHub remote: `https://github.com/budhasantosh010/takevids`
- Git policy: after a coherent change passes its required verification and is committed locally, push `main` to `origin` unless the user explicitly says not to.
- Platform/runtime: Windows, Node.js/npm, modern Chromium browser
- Frontend: React 19 + TypeScript + Vite
- Backend spine: Node/TypeScript + local filesystem jobs + FFmpeg/ffprobe
- FFmpeg/ffprobe: installed and verified on this machine
- Docker: `28.3.2` available
- Local NVIDIA runtime: not detected (`nvidia-smi` unavailable); do not assume local GPU
- Dev port: **2500 only** for the user-facing site
- Browser visual check: `playwright-core` using installed Chrome

## Safe startup

1. Read the files required by `AGENTS.md`.
2. Read `DOCS/CURRENT_STATE.md`, `REQUIREMENTS.md`, `DECISIONS.md`, `FAILURE_REGISTRY.md`, `PROVIDER_LAYER.md`, and the active plan.
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
| Unit tests | `npm test` | Frontend/domain + backend tests PASS |
| Backend-only tests | `npm run test:backend` | Real FFmpeg media tests + job persistence/cleanup + worker-boundary tests PASS |
| Backend typecheck | `npm run typecheck:server` | PASS |
| Real backend smoke | `npm run test:backend-smoke` | Creates durable job + analysis artifacts + preview/final MP4 and verifies output geometry |
| Retention cleanup | `npm run jobs:cleanup` | Clears expired runtime directories according to job retention |
| Check provider env without printing secrets | `npm run provider:env` | Boolean presence only |
| Start/stop LiteLLM | `npm run litellm:up` / `npm run litellm:down` | Local proxy on port 4000 when Docker/credentials are available |
| NVIDIA certification | `npm run verify:nvidia` | PASS/FAIL/UNSUPPORTED/CREDENTIAL_REQUIRED/PROXY_UNAVAILABLE report under `.takevids-runtime/` |
| Lint | `npm run lint` | PASS |
| Production build | `npm run build` | PASS |
| Full UI flow | `npm run test:visual` | Both reference and proven-kit paths PASS; no timeline; no browser/network errors; responsive overflow checks PASS |

## Important code boundaries

```text
src/domain/workflow.ts            workflow state + reference/proven kits
src/domain/models.ts              approved model registry + route metadata
src/domain/providerGateway.ts     certified-model routing gate; no uncertified provider route
src/domain/media.ts               browser File → MediaAsset conversion
src/app/App.tsx                   home/workspace composition + deterministic demo adapter
src/features/home/                Lovable-simple two-path entry surface
src/features/workspace/           simple chat + preview/result surface
src/features/video-kit/           reusable kit inspector
scripts/visual-check.mjs          real Chromium v0 workflow verification
server/media/                      ffprobe metadata + FFmpeg preprocessing
server/jobs/                       durable per-job workspace + retention cleanup
server/workers/                    transcription/model/render worker contracts + local renderer
server/pipeline/jobPipeline.ts     staged media → analysis → preview/final render orchestration
server/api/                        server application boundary/factory; no browser credentials
server/smoke/fullPipeline.ts       real local media/job/render integration proof
server/validation/                 technical output validation (decodable/geometry/audio/duration)
server/agent/                      scoped host workspace + Docker isolation adapter
server/kits/                       Video Kit manifest/validation/execution adapter routing
server/instructions/               exact ordered prompt/skill loading + hashes
server/providers/                  NVIDIA research catalog + real LiteLLM HTTP client + certification harness
litellm/config.yaml                 private TakeVids aliases → NVIDIA hosted NIM
docker/litellm.compose.yml          local LiteLLM proxy definition
docker/agent/Dockerfile             isolated agent image definition
DOCS/PROVIDER_LAYER.md             provider/storage architecture and rollout
DOCS/NVIDIA_MODEL_CERTIFICATION.md current NVIDIA shortlist + machine certification state
DOCS/BACKEND_RUNTIME.md            current backend/runtime capabilities and dependencies
DOCS/AGENT_KIT_SUBSTRATE.md        agent/kit/instruction boundaries and proof status
```

## Current frontend flow

```text
HOME
├─ Reverse engineer a video
│      ↓
│  choose approved model
│      ↓
│  add reference
│      ↓
│  build Video Kit
│
└─ Use a proven kit
       ↓
   select format

              ↓
       add new footage
              ↓
        Edit my video
              ↓
       review finished edit
              ↓
       optional chat change
              ↓
       Finish & download
```

## Provider architecture

```text
TakeVids UI
   ↓
approved model registry
   ↓
server-side adapter
   ↓
LiteLLM
   ├─ NVIDIA NIM        ← first end-to-end test route
   ├─ Anthropic direct  ← later frontier route
   ├─ OpenAI direct
   ├─ Google direct
   └─ OpenRouter
```

Rules:

- Never expose LiteLLM's raw catalog to users.
- Never place provider secrets in the browser.
- A model must be `approved && enabled && certified` and support the requested role before routing.
- NVIDIA catalog presence or LiteLLM provider support is not certification. Only actual TakeVids certification PASS results may enable a model.
- Do not silently swap the kit-building model family on failure; fallback must be separately certified.
- Keep reverse-engineering and execution roles separate internally even when the same test model fills both roles.

## Storage direction for early multi-user testing

- Keep local files while proving the first live workflow.
- When Internet object storage is needed, use Cloudflare R2 for video objects.
- Supabase is optional for auth, Postgres, project/job state, kit metadata, and approved-model records.
- Full cost/rationale is in `DOCS/PROVIDER_LAYER.md`.

## Next highest-impact implementation

The credential-free plumbing and handoff substrate are now real. Do **not** add more UI or provider breadth first.

Connect only the missing intelligence inside those proven boundaries:

```text
reference.mp4
   ↓
CURRENT: durable job + FFmpeg analysis bundle
   ↓
NEXT: real WhisperX transcript + word timing
   ↓
CURRENT: scoped workspace + Docker isolation adapter
   ↓
CURRENT: LiteLLM NVIDIA config/client/certification harness
   ↓
NEXT: add server-only credentials and obtain a real certification PASS
   ↓
NEXT: Santosh's exact ordered Claude Code prompts/skills
   ↓
CURRENT: validated/versioned Video Kit envelope
   ↓
real model-generated Video Kit files
   ↓
new footage
   ↓
NEXT: real kit execution adapter based on the first real kit
   ↓
CURRENT renderer boundary → preview/final MP4
```

Once the NVIDIA test route proves the complete intelligence loop, compare/enable the frontier model that already proved the quality bar.

## Known intentional gaps

- No real LiteLLM/NVIDIA provider call yet. The real HTTP client, proxy config and certification runner exist, but `npm run provider:env` verified that NVIDIA/LiteLLM credentials are absent on this machine. The backend therefore remains fail-closed and no model is currently user-visible.
- No real WhisperX transcription yet; the pipeline already creates the required 16 kHz mono WAV and `WhisperXTranscriptionWorker` fails closed until configured.
- Santosh's proven Claude Code prompts/skills are not imported yet; the exact ordered/hash-preserving loader is ready under the private instruction root.
- Docker sandbox policy and image definition exist, but actual local container execution is not yet claimed because the daemon probe was approval-gated in this Harness session.
- Video Kit manifest validation and adapter routing are real; the only current execution adapter is explicitly fixture-only/non-AI. The real adapter should be designed from the first real model-generated kit, not guessed beforehand.
- No auth/persistent Internet projects yet; R2/Supabase remain intentionally deferred until external test users need them.
- Supporting-media UI is deferred from v0.
- `DOCS/_raw/user_messages.txt` cannot be claimed as live evidence from ChatGPT Harness; verify the Codex hook inside Codex.

## Recovery

When a run fails:

1. Preserve the exact error.
2. Check `DOCS/FAILURE_REGISTRY.md`.
3. Reproduce with the smallest non-destructive test.
4. Add regression protection before claiming a fix.
5. Restore the latest Harness checkpoint if a UI batch becomes worse rather than layering fixes blindly.

## Prohibited assumptions

- Historical “DONE” labels are not current proof.
- Harness/model memory is not authoritative project documentation.
- A successful compile is not proof that the visual workflow works.
- Typed LiteLLM routing metadata is not a live provider integration.
- A hidden internal timeline/render graph does not justify showing timeline complexity to v0 users.
- More models/providers are not progress until one real end-to-end video pipeline works.
