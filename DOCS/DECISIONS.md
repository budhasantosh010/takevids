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
