# Plan — agent workspace + Video Kit substrate

Date: 2026-09-17
Related: REQ-015, DEC-015, DEC-016, DEC-017

## Goal

Build the remaining credential-free substrate needed before real WhisperX/model intelligence is connected, without expanding the user-facing product or pretending deterministic plumbing is AI reverse engineering.

## Ordered work

1. Implement a path-confined host workspace API for reading/writing/listing job files.
2. Prove confinement with traversal/absolute-path tests.
3. Implement the versioned Video Kit envelope + on-disk validator.
4. Implement exact ordered prompt/skill loading with SHA-256 content hashes.
5. Add a Docker sandbox adapter that mounts only one job workspace and disables network/capabilities by default; do not claim Docker execution is verified until the daemon actually runs.
6. Add a deterministic fixture kit builder/executor and integration smoke proving reference media → kit files → new footage → render through the existing backend spine.
7. Run full regression/governance/security checks, document exact verified state, commit, push, and verify Git sync.

## Must not change

- No new frontend concepts or timeline.
- No provider breadth.
- No fake transcript/model output.
- No external credentials in the repository.
- No rigid per-effect/caption/cut DSL until real reverse-engineered kits justify it.
- `localhost:2500` remains the user-facing site port.

## Evidence

- Unit tests for workspace confinement, kit validation, instruction loading, and Docker command construction.
- Credential-free kit smoke producing real files/video.
- Full `npm test`, backend typecheck, lint/build, browser regression.
- Governance + Git sync verification.
