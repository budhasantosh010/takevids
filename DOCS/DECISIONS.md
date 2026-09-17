# Architectural decisions

Append-only. Use stable decision IDs.

## DEC-001 — Product mental model is Lovable for edited video
Date: 2026-09-17
Status: accepted

Context: The proven user workflow starts from a reference video, reverse engineers it, captures its editing system as a reusable kit, then applies that kit to new footage and refines through chat.

Decision: The primary UI is a conversational editor workspace rather than a traditional timeline-first NLE. Chat/control lives beside a live visual project/video surface.

Alternatives considered: Conventional timeline editor clone; prompt-only generation page; multi-page wizard.

Consequences: The timeline may exist as supporting detail, but the main interaction stays conversation + visual result.

## DEC-002 — Frontend/product surface before provider integration
Date: 2026-09-17
Status: accepted

Decision: Lock information architecture, states, and interaction flow before choosing or integrating frontier/execution model providers.

Consequences: This phase uses typed model metadata and deterministic mock state transitions only.

## DEC-003 — Separate reverse-engineering model from execution model
Date: 2026-09-17
Status: accepted

Context: Reverse engineering may justify expensive frontier reasoning, while repeated edits should be able to use cheaper/faster models because the Video Kit constrains the workflow.

Decision: Represent these as two distinct model roles in product state and UI.

Consequences: Users can reason about quality/cost tradeoffs without conflating the two jobs.

## DEC-004 — React + TypeScript frontend with explicit domain state
Date: 2026-09-17
Status: accepted

Decision: Build the initial web product with React + TypeScript + Vite and domain modules for projects, models, kits, workflow state, and UI components. Avoid backend coupling in components.

Alternatives considered: Next.js full-stack immediately; static HTML prototype.

Consequences: Fast local iteration on port 2500, strong typing, clean future adapter boundary for backend/model integrations.

## DEC-005 — Five-surface product IA
Date: 2026-09-17
Status: accepted

Context: The user wants the product to feel as simple as Lovable while preserving maximum editing quality internally.

Decision: The working product surface is limited to five concepts: Chat, Preview, Media, Video Kit, and Export. The timeline is inspection/proof of what AI did, not the main editing mechanism.

Alternatives considered: Premiere-style multi-panel NLE; separate upload/media pages; timeline-first editor.

Consequences: Users can complete the core job without learning video-editing software. Advanced controls can be layered in later without changing the mental model.

## DEC-006 — One universal media bin
Date: 2026-09-17
Status: accepted

Context: New edits may need main footage, B-roll, images, music and SFX.

Decision: Put all supporting source media in one Media panel that accepts video/image/audio and supports button or drag/drop placement. Keep main footage distinct in domain state so AI and future rendering logic know its role.

Alternatives considered: Separate tabs for footage/B-roll/images/audio; separate upload wizard for each asset type.

Consequences: Fewer decisions and less UI clutter while preserving role information for the execution pipeline.

## DEC-007 — No dead global navigation in the editor
Date: 2026-09-17
Status: accepted

Context: The first prototype included a far-left rail for Projects, Kits, Library and Search, but those destinations are not implemented in the current frontend-first phase.

Decision: Remove the rail from the active workspace. Global navigation returns only when those destinations are real.

Consequences: The current product is a focused two-pane Chat ↔ Video workspace with no false affordances. Future app-level navigation can be added outside this editor shell.
