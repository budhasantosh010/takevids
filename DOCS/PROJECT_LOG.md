# Project log

Append-only chronological history. Newest entries go at the bottom.

## 2026-09-17 17:52 — TakeVids project bootstrap started

User asked:
Resume harness task `T-253eb5ca4ac90068e07b43c4` and continue building the TakeVids product in the canonical local folder, based on the reverse-engineer → reusable-kit workflow.

I did:
- Confirmed the saved task had the accidental goal `a` and corrected it from current project context.
- Opened the canonical workspace and found only `Main Rough Thought.txt`.
- Copied every file from the repository's `codex-project-template` into the project root.
- Loaded the template's required governance documents.
- Began instantiating TakeVids requirements, decisions, state, and active plan.

Why:
Create a durable source of truth before application code so later work can resume without context loss.

Outcome:
Governance is being converted from placeholders into project-specific documentation. The original rough-thought file remains preserved.

Verification/evidence:
Workspace listing and source-file reads through ChatGPT Harness.

Files changed:
`AGENTS.md`, `README.md`, `DOCS/*` governance files and active plan.

Status: DOING
Evidence level: E1

## 2026-09-17 18:35 — Frontend product surface completed

User asked:
- Lock the frontend before model selection/integration.
- Keep chat on the left and video preview/process on the right.
- Add a simple media-assets area for video, B-roll, images, audio and SFX with drag/drop.
- Follow the product philosophy: make the system work internally first, then remove cognitive load until a non-expert can reach the final result by clicking, dragging and chatting.
- Use design references for visual quality, run on localhost:2500, focus on highest-impact work, and document failures/solutions for later AIs.

I did:
- Inspected the supplied UI/design/motion reference sites and used their common principles: strong hierarchy, restrained state motion, compact agent controls and one obvious next action.
- Implemented the full deterministic frontend flow: reference → reverse engineer → Video Kit → new footage → execution → review → chat refinement → export-ready.
- Added a universal Media panel for video/B-roll/images/music/SFX with file picker, file drop, draggable cards, explicit `Main`/`Add` actions and used-media state.
- Added typed media roles/kinds and reducer events for adding/placing/removing assets.
- Kept frontier reverse-engineering and cheaper execution models separate in domain state while making model selectors secondary details rather than the primary user path.
- Removed the nonfunctional global rail so the active product is a focused two-pane Chat ↔ Video workspace.
- Added full browser-flow automation and compact/staked layout checks.
- Updated requirements, decisions, failures, active plan, current state and handoff documentation.

Why:
The product's differentiator is not a traditional editor. It is the ability to capture a working editing system once and let AI reuse it while users interact through the smallest understandable surface.

Outcome:
The frontend/product surface is complete for the current phase. Real provider calls and real render/export remain intentionally deferred behind the typed workflow boundaries.

Verification/evidence:
- `npm test`: 4/4 PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS.
- `node .\scripts\visual-check.mjs`: PASS with zero console/page/network errors.
- Browser screenshots cover initial, kit, media, review, refinement, export-ready, 1024px compact desktop and 820px stacked browser states.
- No horizontal overflow detected at 1024px or 820px.

Primary files changed:
`src/app/App.tsx`, `src/domain/workflow.ts`, `src/domain/media.ts`, `src/features/workspace/ChatPanel.tsx`, `src/features/workspace/PreviewWorkspace.tsx`, `src/features/workspace/MediaPanel.tsx`, `src/styles/index.css`, `scripts/visual-check.mjs`, plus project documentation.

Status: DONE
Evidence level: E4

## 2026-09-17 19:14 — Verification layer hardened

User asked:
Keep finishing without waiting for approval, keep progress visible, and close the work completely.

I did:
- Added `src/project-foundation.test.ts` so the Codex/TakeVids scaffold, original `Main Rough Thought.txt`, and absence of unresolved project placeholders are standard Vitest regression checks.
- Added `npm run test:visual` as the canonical command for the existing real-Chromium workflow verification.
- Excluded `*.test.ts(x)` files from the browser production TypeScript build rather than polluting browser types with Node-only test dependencies.
- Re-ran unit tests, ESLint, the production build, and the full visual browser flow.

Why:
Turn the final acceptance checks into repeatable project-native verification that future AIs can run without knowing Harness-specific commands.

Outcome:
Verification is now simpler and stronger without changing product behavior.

Verification/evidence:
- `npm test`: 6/6 PASS across 2 test files.
- `npm run lint`: PASS.
- `npm run build`: PASS.
- `npm run test:visual`: PASS with zero console/page/network errors.

Status: DONE
Evidence level: E4

## 2026-09-17 20:15 — v0 simplified to reference-or-proven-kit + approved provider boundary

User asked:
- Make TakeVids feel as simple as Lovable.
- Remove the timeline from the current product.
- Keep reverse engineering as the main selling point, but let users without a reference choose generalized proven kits Santosh builds beforehand.
- Use one simple provider layer that can later reach Anthropic/OpenAI/Google/OpenRouter/NVIDIA while users see only TakeVids-tested models.
- Start cheap with NVIDIA-hosted models until the real workflow works end to end.
- Keep early video storage/infrastructure within roughly $10–20/month where practical.

I did:
- Added a Lovable-style home with exactly two starts: `Reverse engineer a video` and `Use a proven kit`.
- Added three deterministic proven-kit examples and a reducer event that can start from a kit without a reference.
- Removed the visible timeline and supporting-media panel from v0.
- Simplified the workspace to chat/instructions + live video result + Video Kit only when a kit actually exists.
- Added an approved/enabled model registry. Only `GLM 5.3 Flash` via the NVIDIA NIM test route is currently visible; future Anthropic/DeepSeek routes remain disabled and hidden.
- Added `providerGateway.ts` as the server-side LiteLLM-ready policy contract. It refuses disabled/unapproved routes and contains no credentials or external calls.
- Rewrote browser automation to verify both reference and proven-kit paths and assert no `.timeline` exists.
- Documented the recommended test architecture: LiteLLM provider gateway, NVIDIA first test upstream, local/Docker isolated workspace next, R2 for future video objects and optional Supabase for metadata/auth.

Why:
The highest-risk question is whether TakeVids can reproduce the proven reference → kit → new footage → finished video workflow with a real model. More UI, media controls, providers or infrastructure before that works would add complexity without reducing that risk.

Outcome:
The deterministic v0 now matches the intended simple mental model and has a provider boundary ready for the first live vertical slice.

Verification/evidence:
- `npm test`: 11/11 PASS across 4 test files.
- `npm run lint`: PASS.
- `npm run build`: PASS.
- `npm run test:visual`: PASS for reference + proven-kit paths, no timeline, zero console/page/network errors, responsive overflow checks PASS.
- Visual screenshots inspected: home, reference workspace, kit-ready, proven-kit start, compact desktop.

Status: DONE
Evidence level: E4

## 2026-09-17 20:26 — Canonical GitHub remote + post-proof operating loop

User direction:
- Use `https://github.com/budhasantosh010/takevids` as the GitHub repository and keep pushing project work there.
- Once the real editing loop is proven and usable, focus product development on user feedback/customer experience and marketing rather than speculative feature accumulation.

Actions:
- Added the new repository as Git remote `origin`.
- Preserved the repository's initial one-line README commit by merging its unrelated history instead of force-pushing over it.
- Kept the full TakeVids README as the resolved canonical README.
- Recorded the GitHub push policy and feedback-driven post-proof operating principle in project documentation.

Status: DONE
Evidence level: E3

## 2026-09-17 21:20 — Real local backend media/job/render spine

User direction:
- Videos may be vertical, horizontal, square, or other formats; TakeVids must not assume one aspect ratio.
- Build everything possible now without waiting for provider/cloud credentials.
- Keep the user informed about what is complete versus what still requires Santosh/external access.

Implemented:
- Added ffprobe-based format metadata with rotation-aware display geometry, FPS, duration, codec, and audio information.
- Added real FFmpeg preprocessing that creates metadata JSON, aspect-preserving proxy MP4, thumbnail, and 16 kHz mono transcription WAV when audio exists.
- Added real-FFmpeg tests covering horizontal, vertical, square, and silent videos.
- Added durable `.takevids-runtime/jobs/<job-id>/` workspaces with input/analysis/kit/output/temp directories and persisted `job.json` state.
- Added staged retention/cleanup: temp 24h, analysis 7d, input/output 30d by default; kit does not auto-expire by default.
- Added server-side transcription/model/render worker contracts. WhisperX and LiteLLM adapters fail closed rather than fabricating output when not configured.
- Added `LocalFfmpegRenderer` for real CPU preview/final MP4 rendering now, with a replaceable render interface for future GPU/NVENC workers.
- Added `TakeVidsService` application boundary and local backend factory.
- Added a real integration smoke test that creates a 360x640 video, persists a job, preprocesses media, renders preview/final output, reprobes the final MP4, and verifies completed state.
- Added backend typechecking and operational cleanup commands.

Machine capability check:
- FFmpeg/ffprobe: available.
- Docker 28.3.2: available.
- Local NVIDIA runtime: not detected (`nvidia-smi` unavailable).

Still requires Santosh/external configuration:
- Santosh's exact Claude Code reverse-engineering prompts/skills.
- LiteLLM/NVIDIA credentials for the first real model run.
- WhisperX runtime/model (GPU recommended for production speed).
- R2/Supabase credentials only later when Internet/multi-user storage becomes necessary.

Status: DONE
Evidence level: E4

## 2026-09-17 22:28 — Credential-free agent + Video Kit substrate

User direction:
- Keep building everything possible without waiting for external credentials.
- Preserve arbitrary video formats and the simple v0 user experience.
- Separate the pieces that can be finished now from the pieces that require Santosh/external access.

Implemented:
- Added a path-confined `ScopedWorkspace` host file API that rejects absolute paths, slash/backslash traversal, NUL paths, and symlink escapes.
- Explicitly documented that host path/cwd scoping is **not** executable isolation.
- Added a Docker sandbox adapter whose default policy disables network, uses a read-only root filesystem, drops all capabilities, enables no-new-privileges, limits PIDs/memory/CPU, and mounts only the selected job workspace.
- Added `docker/agent/Dockerfile` with Node, Python, Git and FFmpeg. Actual daemon/container execution remains unverified because the Harness Docker probe was approval-gated.
- Added a versioned extensible Video Kit envelope/validator with execution adapter routing, required-file validation, optional SHA-256 verification, and no fixed aspect-ratio/style DSL.
- Added exact ordered prompt/skill loading from a private gitignored root, preserving UTF-8 content and recording SHA-256 hashes.
- Added the explicitly non-AI `takevids.fixture.identity.v1` adapter and deterministic kit builder for plumbing tests only.
- Added `npm run test:kit-smoke`, which proves a 320x180 reference job can produce/reuse a valid fixture kit on 180x320 new footage and create a technically valid real MP4.

Verification so far:
- Scoped workspace tests: 4/4 PASS.
- Video Kit tests: 7/7 PASS.
- Instruction loader tests: 5/5 PASS.
- Docker policy tests: 2/2 PASS.
- Full project suite: 39/39 PASS.
- Server TypeScript: PASS.
- Fixture kit smoke: PASS and explicitly reports `fixture-only-not-ai`.
- Original backend smoke: PASS.
- ESLint: PASS.
- Production build: PASS.
- Real Chromium v0 flow: PASS with no browser/network errors.

Important boundary:
This phase proves the safe handoff substrate, not reverse-engineering quality. Real intelligence still requires Santosh's exact Claude Code prompts/skills, real transcription, and a credentialed approved model route.

Status: DONE
Evidence level: E4 plumbing
