# Requirements registry

Raw messages preserve exact wording when the Codex logging hook is active. This file turns durable intent into stable, testable IDs.

## REQ-001 — Preserve exact user intent
Status: ACTIVE

Acceptance criteria:
- Significant work references a Requirement ID.
- Disputed interpretations return to the strongest available source evidence.
- Never claim prompt-hook evidence that was not actually produced.

Required evidence level: E3

## REQ-002 — Prevent long-session quality decay
Status: ACTIVE

Acceptance criteria:
- Work uses short verified loops.
- Context reload checkpoints are followed.
- Evidence is required before continuation.
- Three repeated failures stop blind retries.

Required evidence level: E3

## REQ-003 — Safe reversible changes
Status: ACTIVE

Acceptance criteria:
- Git has a reviewed baseline.
- Coherent changes are committed separately.
- Meaningful changes record verification and rollback.

Required evidence level: E3

## REQ-004 — TakeVids core product surface
Status: ACTIVE
Source: `Main Rough Thought.txt` and 2026-09-17 project conversation
Intent: Make the product feel like Lovable for video editing: chat/control workspace on the left, visual video/editing result on the right.

Acceptance criteria:
- Primary desktop workspace is a two-pane chat + video experience.
- The user can understand what to do without documentation.
- The interface remains usable at narrower widths.

Required evidence level: E4
Related decisions: DEC-001, DEC-002

## REQ-005 — Reference video to reusable Video Kit flow
Status: ACTIVE
Intent: Encode the proven workflow where a reference video is reverse engineered once and converted into a reusable editing kit/workflow.

Acceptance criteria:
- Reference upload surface exists.
- Reverse-engineering action and frontier-model choice are visible.
- Reverse-engineering results expose reusable style/editing components.
- A Video Kit can be represented as saved/ready for reuse.

Required evidence level: E4
Related decisions: DEC-001, DEC-003

## REQ-006 — Reuse kit on new footage
Status: ACTIVE
Intent: Let users apply a previously reverse-engineered kit to new footage, optionally using a cheaper/faster execution model, then refine by chat.

Acceptance criteria:
- New-footage input is represented.
- Reverse-engineering and execution remain distinct model roles internally.
- **2026-09-17 v0 correction:** execution routing is automatic in the user experience; a second model picker is not required in v0. The user only sees TakeVids-approved choices where a choice materially helps them.
- Chat refinements update the visible project state.
- Export-ready completion state is represented.

Required evidence level: E4
Related decisions: DEC-001, DEC-003, DEC-010

## REQ-007 — Frontend-first provider abstraction
Status: ACTIVE
Intent: Lock the interface before selecting/implementing real model providers.

Acceptance criteria:
- No real provider credential or paid inference dependency is required.
- Model identities/capabilities are typed data rather than hardwired workflow logic.
- Mock/demo execution can later be replaced behind a stable adapter boundary.

Required evidence level: E3
Related decisions: DEC-002, DEC-004

## REQ-008 — Canonical local development
Status: ACTIVE
Intent: All project work lives in the canonical project folder and the app runs locally on port 2500.

Acceptance criteria:
- Project files remain under the canonical root.
- `npm run dev` binds to port 2500.
- Production build succeeds.

Required evidence level: E3

## REQ-009 — Outcome-first, low-cognitive-load interaction
Status: ACTIVE
Source: 2026-09-17 user direction: make it work first, then make it simple enough that a non-expert can reach the final outcome by clicking, dragging, and chatting.
Intent: Keep quality and capability inside the system while exposing the smallest possible set of user decisions.

Acceptance criteria:
- The primary product surface is exactly chat + visual video workspace; no traditional NLE is required to get an edit.
- Only one obvious primary action is presented for each workflow stage.
- Model routing exists but remains secondary/advanced rather than blocking the default path.
- Dead/future navigation is excluded from the active workspace.
- Motion is reserved for state/progress feedback rather than decorative distraction.

Required evidence level: E4
Related decisions: DEC-001, DEC-005, DEC-007

## REQ-010 — Universal media workspace
Status: DEFERRED FOR V0
Source: 2026-09-17 request for a media asset area supporting images, videos, B-roll, audio, SFX and drag/drop.
Intent: Give TakeVids one simple place for all source media while allowing AI to decide how those assets are used in the kit-constrained edit.

**2026-09-17 v0 scope note:** supporting-media infrastructure remains a later capability, but the active v0 UI intentionally hides the media bin until the core reference → kit → new video → finished video loop works with real models. This preserves the requirement without adding current cognitive load.

Acceptance criteria:
- One media surface accepts video, image and audio files.
- Media can represent main footage, B-roll, stills, music and SFX.
- Assets can be added by button or drag/drop and placed into the edit without entering a traditional editor.
- The interface shows which supporting assets are already used.
- Main footage and supporting assets remain distinct in workflow state.

Required evidence level: E4
Related decisions: DEC-005, DEC-006

## REQ-011 — TakeVids v0 is reference-or-proven-kit → finished video
Status: ACTIVE
Source: 2026-09-17 user direction comparing TakeVids with Lovable's dashboard and project flow.
Intent: Reduce the initial product to the smallest understandable loop: either reverse engineer a reference video into a kit, or choose one of Santosh's already-tested generalized kits, then upload new footage and receive the finished edit.

Acceptance criteria:
- The active v0 UI has no timeline.
- The first decision is visually limited to `Reverse engineer a video` or `Use a proven kit`.
- Choosing a proven kit skips reference analysis and moves directly to new-footage input.
- Reverse engineering remains the primary differentiated path.
- The user can reach the finished/edit-ready state without understanding NLE concepts.

Required evidence level: E4
Related decisions: DEC-008, DEC-009

## REQ-012 — Approved-model gateway boundary
Status: ACTIVE
Source: 2026-09-17 user direction to support many providers internally while exposing only TakeVids-tested models.
Intent: Keep provider flexibility behind one internal layer while users see only models explicitly approved by TakeVids.

Acceptance criteria:
- Model definitions distinguish the public model choice from its provider/gateway routing metadata.
- Only approved/enabled models are exposed to product selectors.
- The abstraction can route through LiteLLM-compatible provider/model identifiers without placing credentials in frontend code.
- NVIDIA NIM can be represented as the first low-cost testing upstream.
- Direct Anthropic/OpenAI/Google/OpenRouter routes can be added later without changing the user workflow.

Required evidence level: E3
Related decisions: DEC-010

## REQ-013 — Format-agnostic media processing
Status: ACTIVE
Source: 2026-09-17 user direction that TakeVids must accept vertical, horizontal, square, and other video formats without special-case UX.
Intent: Treat video geometry as discovered metadata, not a product mode. The backend must inspect each file and preserve its native display orientation/aspect unless a later explicit output format is requested.

Acceptance criteria:
- ffprobe-derived metadata records coded/display dimensions, rotation, aspect ratio, fps, duration, codecs, and audio presence.
- Preprocessing works for horizontal, vertical, square, and arbitrary dimensions without hard-coded 9:16/16:9 branches.
- A normalized analysis bundle can produce a proxy, extracted transcription WAV when audio exists, thumbnail, and metadata JSON while preserving aspect ratio.
- The future Video Kit uses normalized/relative layout rules rather than assuming one canvas size.

Required evidence level: E4
Related decisions: DEC-013

## REQ-014 — Durable local video-job workspace
Status: ACTIVE
Source: 2026-09-17 user direction to build everything possible now before external credentials/prompts are supplied.
Intent: Create the real backend spine for long-running video work locally so cloud storage, GPU renderers, WhisperX, and LiteLLM can be swapped in later without changing the product workflow.

Acceptance criteria:
- Each job owns isolated input, analysis, kit, output, and temp directories plus durable job metadata/state.
- Long-running stages are represented explicitly rather than relying on one browser HTTP request staying open.
- Temporary/intermediate files have an enforceable cleanup policy while source/output retention remains configurable.
- Transcription, model execution, and rendering are defined behind server-side worker interfaces with no browser credentials.
- A local smoke test produces real media artifacts through the same job/media pipeline.

Required evidence level: E4
Related decisions: DEC-013, DEC-014
