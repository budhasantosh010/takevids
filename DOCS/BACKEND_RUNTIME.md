# TakeVids backend runtime spine

Last verified: 2026-09-17
Related requirements: REQ-013, REQ-014
Related decisions: DEC-013, DEC-014

## What is real now

TakeVids now has a local backend media/job spine that processes real video files without any cloud/model credentials.

```text
input video
   ↓
ffprobe
   ↓
format-agnostic metadata
   ↓
.takevids-runtime/jobs/<job-id>/
   ├─ input/
   ├─ analysis/
   │   ├─ metadata.json
   │   ├─ proxy.mp4
   │   ├─ thumbnail.jpg
   │   └─ transcript.wav (when audio exists)
   ├─ kit/
   ├─ output/
   │   ├─ preview.mp4
   │   └─ final.mp4
   ├─ temp/
   └─ job.json
```

The runtime directory is gitignored.

## Format handling

The media pipeline does not branch on named formats such as 9:16 or 16:9.

For every file it records:

- coded width/height;
- display width/height after rotation;
- orientation (`landscape`, `portrait`, `square`);
- display aspect ratio;
- FPS;
- duration;
- video/audio codecs;
- audio presence/sample rate/channels;
- file/container metadata.

Previews preserve the input aspect ratio while limiting maximum preview dimensions for speed. Final local renders preserve the input display geometry.

Automated real-FFmpeg tests currently cover horizontal, vertical, square, and silent inputs.

## Local machine capabilities observed

| Capability | State | Evidence |
|---|---|---|
| FFmpeg | READY | `ffmpeg` available; build `N-122089-g37858dc6bd-20251211` |
| ffprobe | READY | same FFmpeg toolchain |
| Docker | READY | Docker `28.3.2` available |
| Local NVIDIA runtime | NOT AVAILABLE | `nvidia-smi` is not on PATH / no NVIDIA runtime detected in this environment |
| Local CPU render | READY | `LocalFfmpegRenderer` produces real preview/final MP4 files |
| WhisperX | NOT CONFIGURED | worker contract exists but intentionally fails closed |
| LiteLLM/NVIDIA model execution | NOT CONFIGURED | worker contract exists but intentionally fails closed |

## Job durability

`LocalJobStore` persists each job to `job.json` and recreates the same job state after process restart.

Current retention defaults:

```text
temp        24 hours
analysis     7 days
input       30 days
output      30 days
kit         no automatic expiry unless explicitly configured
```

`npm run jobs:cleanup` enforces expiry. Expired directories are cleared and recreated so the workspace remains structurally valid.

## Worker boundary

The backend separates product workflow from compute implementation:

```text
TranscriptionWorker
    └─ later: WhisperX local/cloud GPU

ModelWorker
    └─ later: LiteLLM → NVIDIA / Anthropic / other approved routes

RenderWorker
    ├─ now: LocalFfmpegRenderer (CPU)
    └─ later: GPU/NVENC/cloud renderer
```

The browser never receives provider credentials.

## What the smoke test proves

Run:

```text
npm run test:backend-smoke
```

The smoke test:

1. creates a real synthetic vertical MP4;
2. creates a durable TakeVids job;
3. stages the input;
4. probes and preprocesses it;
5. creates proxy/audio/thumbnail/metadata artifacts;
6. renders a preview MP4;
7. renders a final MP4;
8. probes the final output again;
9. re-probes and validates the final output (non-empty, decodable, expected geometry, duration, and required audio);
10. verifies the persisted completed state.

This proves the local media/job/render plumbing and technical output validation. It does **not** claim the video has been intelligently edited yet.

## What still needs Santosh / external access

### 1. Proprietary reverse-engineering prompts and skills

Needed to reproduce the Claude Code + Opus workflow that already worked in manual testing.

Expected input later:

```text
prompts/
skills/
reverse-engineering instructions
kit-building instructions
quality-check/refinement instructions
```

These are the highest-value missing product logic after the plumbing.

### 2. LiteLLM/NVIDIA credentials

Needed for the first real approved model call.

The boundary is already built; credentials remain server-only.

### 3. WhisperX runtime/model

Needed for real transcription and word-level timing. A GPU is recommended for production speed, but the architecture does not assume a local GPU.

### 4. R2/Supabase credentials later

Not needed for the current single-machine proof. They become useful when real external test users need Internet uploads, persistence, and shared job state.

## Highest-impact next milestone

```text
reference.mp4
   ↓
current local media/job pipeline
   ↓
real WhisperX transcript
   ↓
LiteLLM → approved NVIDIA test model
   ↓
Santosh reverse-engineering prompt/skills
   ↓
real Video Kit files
   ↓
new footage
   ↓
kit execution
   ↓
real edited final.mp4
```

Do not add more UI/provider breadth before this real intelligence loop is proven.