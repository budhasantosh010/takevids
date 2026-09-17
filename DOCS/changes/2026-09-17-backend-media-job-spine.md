# Change record — backend media/job/render spine

Date: 2026-09-17
Requirements: REQ-013, REQ-014
Decisions: DEC-013, DEC-014

## Intended outcome

Make TakeVids capable of processing real arbitrary-format video files locally with durable long-running job state, real preprocessing/render artifacts, cleanup policy, and replaceable compute-worker boundaries before external model/transcription/cloud credentials exist.

## Changed behavior

- Video geometry is discovered via ffprobe rather than selected as a named format.
- FFmpeg preprocessing creates metadata, proxy, thumbnail, and transcription WAV artifacts.
- Every backend job has an isolated durable runtime workspace and persisted state.
- Retention cleanup is executable and tested.
- Transcription, model inference, and rendering are server-side worker interfaces.
- Current CPU FFmpeg renderer creates real preview/final MP4 files.
- Unconfigured WhisperX/LiteLLM workers fail closed with explicit dependency errors.
- Technical output validation re-probes rendered video before acceptance.

## Must not change

- User-facing localhost remains port 2500.
- Simplified v0 UI remains reference-or-proven-kit with no timeline.
- No external credentials or secrets enter browser source.
- Provider/model allowlist policy remains TakeVids-owned.
- `Main Rough Thought.txt` remains untouched.

## Verification

Required final checks:

```text
npm test
npm run test:backend
npm run typecheck:server
npm run test:backend-smoke
npm run lint
npm run build
npm run test:visual
project setup/governance verifiers
```

## Rollback

Revert the coherent REQ-013/REQ-014 implementation commit. `.takevids-runtime/` is gitignored and may be deleted independently without affecting source history.