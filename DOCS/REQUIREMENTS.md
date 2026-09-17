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
- Execution model choice is represented separately from reverse-engineering model choice.
- Chat refinements update the visible project state.
- Export-ready completion state is represented.

Required evidence level: E4
Related decisions: DEC-001, DEC-003

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
Status: ACTIVE
Source: 2026-09-17 request for a media asset area supporting images, videos, B-roll, audio, SFX and drag/drop.
Intent: Give TakeVids one simple place for all source media while allowing AI to decide how those assets are used in the kit-constrained edit.

Acceptance criteria:
- One media surface accepts video, image and audio files.
- Media can represent main footage, B-roll, stills, music and SFX.
- Assets can be added by button or drag/drop and placed into the edit without entering a traditional editor.
- The interface shows which supporting assets are already used.
- Main footage and supporting assets remain distinct in workflow state.

Required evidence level: E4
Related decisions: DEC-005, DEC-006
