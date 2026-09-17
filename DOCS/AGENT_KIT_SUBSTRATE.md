# TakeVids agent + Video Kit substrate

Last verified: 2026-09-17
Related: REQ-015, DEC-015, DEC-016, DEC-017

## Purpose

This layer prepares the exact filesystem/instruction/kit handoff that the future reverse-engineering model will use. It deliberately does **not** claim that AI reverse engineering is connected yet.

## 1. Scoped host workspace

`server/agent/scopedWorkspace.ts` provides text/JSON read, write, resolve and listing APIs rooted to one workspace.

It rejects:

- absolute paths;
- `..` traversal using either slash style;
- paths that resolve outside the configured root;
- existing symlink components, including a symlinked root.

This is a safe **host file API**. It is not an operating-system sandbox. Arbitrary model-generated Node/Python must not be run directly on the host merely because its `cwd` is the job directory.

## 2. Docker executable isolation

`server/agent/dockerSandbox.ts` constructs a container with these defaults:

```text
network            none
root filesystem    read-only
capabilities       ALL dropped
no-new-privileges  enabled
pids limit         128
memory              2g
cpus                2
/tmp                 private tmpfs
mount                only the selected job workspace → /workspace
```

The repository also contains `docker/agent/Dockerfile` with Node 22, Python 3, Git and FFmpeg.

Build command when Docker daemon access is available:

```text
npm run sandbox:build
```

Important: command construction/policy is unit-tested. Actual Docker daemon/container execution is **not yet claimed as verified** because the Harness daemon probe was approval-gated in this session.

## 3. Video Kit envelope

TakeVids standardizes only the stable envelope for now:

```json
{
  "schemaVersion": 1,
  "id": "kit-id",
  "name": "Kit name",
  "createdAt": "ISO date",
  "source": {
    "kind": "reference",
    "referenceAsset": "logical provenance id"
  },
  "execution": {
    "adapter": "takevids.some-adapter.v1",
    "entrypoint": "execute.json"
  },
  "files": [
    {
      "path": "execute.json",
      "role": "entrypoint",
      "required": true,
      "sha256": "optional"
    }
  ],
  "metadata": {}
}
```

The validator rejects unsafe file paths, duplicate declarations, unsupported manifest versions, missing/optional entrypoints, missing required files and SHA-256 mismatches.

There is intentionally no fixed DSL for every caption, cut, camera move, B-roll rule or motion component yet. The real Claude Code reverse-engineering output should show which internal concepts deserve standardization.

## 4. Prompt / skill loading

`server/instructions/loader.ts` loads an explicit ordered list of files from one configured root.

Recommended private root:

```text
.takevids-private/instructions/
```

This directory is gitignored.

For every loaded file TakeVids returns:

```text
kind
relative path
absolute path
exact UTF-8 content
SHA-256(content)
```

No implicit globbing/reordering occurs. This is intentional so Santosh's proven prompt/skill ordering is preserved exactly.

## 5. Execution adapter boundary

A kit declares an `execution.adapter`. `KitExecutor` resolves that string to a registered server adapter.

The only current proof adapter is:

```text
takevids.fixture.identity.v1
```

It is explicitly fixture-only and refuses kits that are not marked `fixtureOnly`.

## 6. Credential-free smoke proof

Run:

```text
npm run test:kit-smoke
```

It proves:

```text
320×180 reference
    ↓
real reverse-engineer job workspace
    ↓
fixture-only valid Video Kit
    ↓
kit copied/reused in a second edit job
    ↓
180×320 new footage
    ↓
kit execution adapter
    ↓
real preview + final MP4
    ↓
technical output validation
```

The smoke result prints `fixture-only-not-ai`. It proves transport/orchestration/reuse/render plumbing only, not style similarity or model quality.

## What still requires Santosh / external access

1. Exact Claude Code reverse-engineering prompts/skills.
2. LiteLLM/NVIDIA credentials for the first real model run.
3. WhisperX runtime/model for real word-level transcription (GPU preferred for production speed).
4. Docker daemon approval if we want to verify the actual container locally in this Harness session.
5. R2/Supabase credentials only when real external users need Internet storage/persistence.

## Next real product proof

```text
reference video
  ↓
real transcription
  ↓
real approved model inside isolated workspace
  ↓
Santosh prompts/skills
  ↓
real Video Kit
  ↓
new footage
  ↓
real kit adapter
  ↓
finished style-reproducing MP4
```
