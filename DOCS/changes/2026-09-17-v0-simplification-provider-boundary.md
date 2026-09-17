# Change record — TakeVids v0 simplification + provider boundary

Date: 2026-09-17
Requirements: REQ-011, REQ-012; v0 corrections to REQ-006/REQ-010
Decisions: DEC-008, DEC-009, DEC-010

## Intended outcome

Reduce TakeVids to the smallest product that can prove its central value:

```text
reference or proven kit → new footage → automatic edit → finished video
```

At the same time, create a safe model-routing boundary that can later use LiteLLM and many upstream providers without exposing arbitrary models or credentials to users.

## Must not change

- Project root and localhost:2500.
- Reverse engineering as the core differentiated workflow.
- Reusable Video Kit concept.
- Separate reverse-engineering/execution roles internally.
- No real provider credentials in frontend source.
- `Main Rough Thought.txt`.

## Changes

- Added `HomeDashboard` with two entry paths.
- Added deterministic proven kits and `SELECT_PROVEN_KIT` workflow event.
- Removed timeline and active supporting-media UI from v0.
- Hid the kit inspector until a kit exists.
- Added approved/enabled model metadata and LiteLLM route metadata.
- Added `providerGateway.ts` policy contract and tests.
- Made NVIDIA NIM / GLM 5.3 Flash the only currently enabled prototype route.
- Updated real-browser automation to cover both paths and assert no timeline.
- Added `DOCS/PROVIDER_LAYER.md` with provider/storage architecture.

## Verification

```text
npm test             PASS — 11/11
npm run lint         PASS
npm run build        PASS
npm run test:visual  PASS
```

Browser verification covers:
- home
- reference start
- kit creation
- new-footage edit
- chat refinement
- finished state
- proven-kit start without reference
- proven-kit edit
- 1024px and 820px overflow checks
- no `.timeline` element
- no console/page/HTTP errors

## Rollback

Revert the coherent implementation commit for this change. The previous verified frontend is available at commit `b52a204`.
