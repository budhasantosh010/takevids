# TakeVids v0 simplification + provider layer plan

Date: 2026-09-17
Status: IMPLEMENTED + VERIFIED
Requirements: REQ-011, REQ-012
Decisions: DEC-008, DEC-009, DEC-010

## Outcome

Make the current product simpler than the previous prototype while preserving the proven workflow.

```text
HOME
├─ Reverse engineer a video
│      ↓
│  choose approved model
│      ↓
│  drop reference
│      ↓
│  build reusable Video Kit
│      ↓
│  upload new footage
│      ↓
│  finished edit
│
└─ Use a proven kit
       ↓
   choose one of Santosh's kits
       ↓
   upload new footage
       ↓
   finished edit
```

No timeline is visible in v0.

## Provider boundary

```text
TakeVids UI
   ↓
TakeVids approved model registry
   ↓
future server-side gateway adapter
   ↓
LiteLLM
   ├─ NVIDIA NIM (first testing upstream)
   ├─ Anthropic direct
   ├─ OpenAI direct
   ├─ Google direct
   └─ OpenRouter / other providers
```

Frontend model metadata may include routing identifiers for deterministic prototype display, but no API keys, real inference calls, or paid provider dependencies are added in this change.

## Acceptance

- Home/dashboard feels visually simple and immediately explains the two entry paths.
- A proven kit can be selected without first uploading a reference.
- Reverse-engineer path still works end-to-end in deterministic demo mode.
- No timeline appears anywhere in the active v0 workspace.
- Only approved/enabled models can appear in model selectors.
- NVIDIA NIM is represented as the first test route without credentials.
- Tests, lint, build and real Chromium flow pass on localhost:2500.

## Must not change

- Canonical project root or port 2500.
- Existing reusable-kit concept.
- Separate reverse-engineer and execution roles internally.
- No real provider credentials in frontend source.
- Original `Main Rough Thought.txt`.

## Verification

- `npm test` → 11/11 PASS across workflow, provider registry, gateway policy and project-foundation tests.
- `npm run lint` → PASS.
- `npm run build` → PASS.
- `npm run test:visual` → reference path + proven-kit path PASS, zero browser/page/network errors, no timeline assertion PASS, 1024/820 overflow checks PASS.
- Visual inspection completed for the home, reference workspace, kit-ready state, proven-kit start and compact desktop state.

## Rollback

Revert the coherent implementation commit for REQ-011/REQ-012; prior frontend remains available at commit `b52a204`.
