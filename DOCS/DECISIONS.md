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
Status: historical; superseded for v0 by DEC-008 and DEC-009

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

## DEC-008 — Remove timeline entirely from TakeVids v0
Date: 2026-09-17
Status: accepted

Context: The current proof does not need users to inspect or manipulate an editing timeline. The system's job is to hide editing complexity and deliver the finished result.

Decision: Remove the timeline from the active v0 interface rather than presenting it as optional inspection.

Consequences: The visible product becomes closer to Lovable: user intent/input on one side, evolving/final output on the other. Timeline concepts stay internal to the future render pipeline.

## DEC-009 — Two v0 entry paths: reference or proven kit
Date: 2026-09-17
Status: accepted

Context: Reverse engineering is the main differentiator, but many users will not arrive with a strong reference video. Santosh can build generalized kits from proven examples beforehand.

Decision: The home surface exposes exactly two meaningful starts: `Reverse engineer a video` and `Use a proven kit`. A proven kit skips reverse engineering and goes directly to new footage.

Consequences: New users can get value immediately while repeat/power users can create highly specific reusable workflows from references.

## DEC-010 — LiteLLM-ready approved-model registry; NVIDIA NIM first for testing
Date: 2026-09-17
Status: accepted

Context: TakeVids needs access to many AI providers over time but must expose only models that have been tested for the workflow. Early end-to-end testing should be inexpensive.

Decision: Keep a TakeVids-owned approved model registry above a provider gateway. Design routing metadata for LiteLLM-compatible model identifiers, start with NVIDIA NIM routes for inexpensive testing, and keep real credentials/provider calls out of the frontend.

Alternatives considered: Integrate every provider SDK directly into UI/backend; expose the full gateway catalog to users; make OpenRouter the permanent application boundary.

Consequences: Provider/model changes remain internal. Users see only certified models. Anthropic/OpenAI/Google/OpenRouter/direct endpoints can be added later without rewriting the product workflow.

## DEC-011 — GitHub is the canonical remote mirror
Date: 2026-09-17
Status: accepted

Context: The user created `budhasantosh010/takevids` and wants ongoing project work pushed there in addition to remaining in the canonical local workspace.

Decision: Use `https://github.com/budhasantosh010/takevids` as the canonical GitHub remote (`origin`). After a coherent change is verified and committed locally, push it to `origin/main` unless the user explicitly says not to.

Consequences: Local work remains the working source of truth during implementation, while GitHub stays continuously usable as the durable remote copy and collaboration surface.

## DEC-012 — After the live loop works, development becomes customer-feedback-driven
Date: 2026-09-17
Status: accepted

Context: The remaining existential risk is whether the real reference → kit → new footage → finished-video loop delivers a result users value quickly enough. Once that is proven, speculative feature breadth has lower priority than customer experience, observed user friction, result quality, speed, reliability, and distribution.

Decision: After the real end-to-end loop is usable, prioritize actual user feedback and marketing/distribution. New product work should primarily fix observed problems, improve outcome quality/speed/reliability, or materially improve acquisition/retention rather than expand the interface by default.

Consequences: The roadmap stays narrow and evidence-driven. More features are not automatically progress.

## DEC-013 — Media pipeline is format-agnostic and metadata-driven
Date: 2026-09-17
Status: accepted

Context: TakeVids may receive vertical, horizontal, square, rotated phone footage, or other dimensions. A separate workflow per aspect ratio would create product and rendering drift.

Decision: Probe every input with ffprobe, derive display geometry from stream dimensions + rotation, and pass normalized metadata to downstream analysis/rendering. Previews may be resized for speed but must preserve aspect ratio. No active backend branch is keyed to a named format such as 9:16 or 16:9.

Consequences: The same job/kit/render pipeline can handle arbitrary formats. Video Kits should express layout in relative/canvas-aware terms rather than absolute coordinates tied to one resolution.

## DEC-014 — Local durable job workspace first; workers are replaceable
Date: 2026-09-17
Status: accepted

Context: The real workflow requires long-running preprocessing, transcription, model analysis, kit creation, and rendering. External credentials and cloud infrastructure are not yet required to prove the orchestration contract.

Decision: Build a durable local filesystem job store under a gitignored runtime root with isolated input/analysis/kit/output/temp directories. Define transcription, model, and rendering behind server-side interfaces. Use local FFmpeg/CPU implementations for proof; replace adapters with WhisperX/GPU/LiteLLM/cloud storage later without changing job semantics.

Consequences: The project can prove real media processing now, avoids premature cloud complexity, and keeps provider/GPU/storage choices swappable. Temporary files are disposable; durable inputs/outputs follow explicit retention rules.

## DEC-015 — Scoped host workspace is not called a security sandbox
Date: 2026-09-17
Status: accepted

Context: The reverse-engineering agent needs filesystem/tool access, but setting a host process working directory does not prevent arbitrary code from reading the rest of the machine.

Decision: Build a path-confined host workspace API for safe file operations, and keep executable isolation as a separate Docker/container boundary. Do not claim host-process `cwd` scoping is equivalent to isolation.

Consequences: TakeVids can safely prepare/read/write job files now, while future arbitrary model-generated code runs only inside an actual container or equivalent sandbox.

## DEC-016 — Video Kit uses a small extensible envelope, not a premature editing DSL
Date: 2026-09-17
Status: accepted

Context: Santosh's proven Claude Code reverse-engineering process has not yet been imported, so prescribing a huge fixed JSON schema for cuts, captions, motion, sound and components could encode the wrong abstractions.

Decision: Version only the stable envelope: kit identity/provenance, execution adapter + entrypoint, declared files, and extensible metadata. The detailed editing logic remains ordinary files/code inside the kit until real reverse-engineered kits show which structure deserves standardization.

Consequences: Cheaper execution models can receive a deterministic kit folder while TakeVids avoids freezing speculative internal concepts too early.

## DEC-017 — Proprietary prompts/skills are loaded explicitly and byte-for-byte
Date: 2026-09-17
Status: accepted

Context: The exact Claude Code prompts/skills are high-value product logic and ordering/content drift would cause Chinese-whisper degradation.

Decision: Load an explicitly ordered list of prompt/skill files from a configured private root, preserve UTF-8 content without rewriting, and record a SHA-256 hash for each loaded file. Do not auto-discover/reorder instructions implicitly.

Consequences: Santosh can drop the proven files into the private instruction root later without backend code changes, and TakeVids can audit exactly which instruction bytes were used in a run.
