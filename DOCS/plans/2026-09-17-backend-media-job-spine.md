# TakeVids backend media/job spine plan

Date: 2026-09-17
Requirements: REQ-013, REQ-014
Decisions: DEC-013, DEC-014

## Goal

Build the highest-impact backend pieces that do not require external credentials so TakeVids can process real arbitrary-format videos locally and later swap in cloud GPU/model/storage adapters without rewriting product semantics.

## Scope

```text
input video
   ↓
ffprobe metadata
   ↓
job workspace
   ↓
FFmpeg preprocessing
   ├─ proxy.mp4
   ├─ transcript.wav (if audio)
   ├─ thumbnail.jpg
   └─ metadata.json
   ↓
worker boundaries
   ├─ transcription
   ├─ model gateway
   └─ rendering
   ↓
local render smoke test
   ↓
output/final.mp4
```

## Runtime layout

```text
.takevids-runtime/jobs/<job-id>/
├─ input/
├─ analysis/
├─ kit/
├─ output/
├─ temp/
└─ job.json
```

`.takevids-runtime/` is local-only and gitignored.

## Acceptance

- Horizontal, vertical, and square synthetic videos are probed correctly.
- Preprocessing preserves aspect ratio and creates the expected analysis artifacts.
- Job state persists to disk and survives store re-instantiation.
- Cleanup can remove temp/intermediate files without deleting durable inputs/outputs unless retention policy explicitly says so.
- Transcription/model/render workers are server-side interfaces; no credentials live in browser code.
- A real smoke test produces `final.mp4` locally through the job/media pipeline.
- Existing frontend tests/lint/build/browser flow remain green.

## External dependencies intentionally not required for this change

- NVIDIA/LiteLLM credentials.
- Anthropic/frontier-provider credentials.
- WhisperX model weights/GPU runtime.
- Santosh's proprietary Claude Code reverse-engineering prompts/skills.
- R2/Supabase credentials.

## Rollback

Revert the coherent implementation commit for REQ-013/REQ-014. Runtime data is under `.takevids-runtime/` and is not part of Git history.