# Current verified state

Last verified: `2026-09-17`

## Project

- Name: `TakeVids`
- Root: `C:\Users\Lenovo\Music\Startups\Lovable for Video Editors\full code`
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
| Approved/enabled model filtering | `src/domain/models.test.ts` | E3 | 2026-09-17 |
| LiteLLM-ready provider boundary with NVIDIA NIM first | `providerGateway.ts` + tests | E3 | 2026-09-17 |
| Responsive desktop/stacked layouts | 1024/820 screenshots + overflow assertion | E4 | 2026-09-17 |
| Frontend quality gates | 11 Vitest tests PASS; ESLint PASS; production build PASS; browser flow has zero console/page/network errors | E4 | 2026-09-17 |

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

- Current frontend/provider code makes **no real external model request** and contains no provider secrets.
- `nvidia-glm-5.3-flash` is the only approved+enabled prototype model in the visible registry.
- Disabled future routes can exist internally without appearing to users.
- Full research/rationale: `DOCS/PROVIDER_LAYER.md`.

## Test-phase storage direction

- Local filesystem remains acceptable while proving the first real workflow.
- When Internet video storage is needed, use **Cloudflare R2 for video objects** and optionally **Supabase for auth/Postgres/project/job/kit metadata**.
- Do not require Supabase Pro merely to host test videos; current Pro base pricing is above the user's stated $10–20/month infrastructure target.

## Known blocked or intentionally unverified

| Item | Why | Required next action |
|---|---|---|
| Exact Codex prompt logging | ChatGPT Harness does not execute the project-local Codex `UserPromptSubmit` hook | Verify when opened/trusted in Codex; do not fabricate transcript entries |
| Real LiteLLM/NVIDIA request | Intentionally deferred; current change establishes the safe abstraction first | Add one server endpoint + server-only credentials, then certify one NVIDIA model end to end |
| Real frontier-provider reverse engineering | Do not spend on frontier inference until cheap test loop works | Add/pin Anthropic or other frontier route after end-to-end pipeline is reliable |
| Real isolated agent/video build environment | Current UI still uses deterministic transitions | Start local/Docker workspace with FFmpeg/filesystem/tool execution, then move cloud later if needed |
| Real render/export | No production render pipeline yet | Connect kit execution to video tooling and verify actual output |
| Auth/persistent projects | Not needed to prove editing outcome | Add Supabase only when multi-user testing starts |
| Supporting-media bin | Deferred from active v0 to reduce cognitive load | Re-enable after core live workflow works |

## Canonical commands

| Purpose | Command/file |
|---|---|
| Development | `npm run dev` → `http://localhost:2500` |
| Unit tests | `npm test` |
| Lint | `npm run lint` |
| Production build | `npm run build` |
| Full browser workflow | `npm run test:visual` |
| Provider/storage architecture | `DOCS/PROVIDER_LAYER.md` |
| Active implementation plan | `DOCS/plans/2026-09-17-takevids-v0-simplification-provider-layer.md` |
| Product source thought | `Main Rough Thought.txt` |

## Evidence-level legend

`E0 described · E1 implemented · E2 isolated test · E3 integrated test · E4 complete real UI/output flow · E5 repeated representative scenario`
