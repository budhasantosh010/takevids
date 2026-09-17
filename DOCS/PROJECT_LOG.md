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
