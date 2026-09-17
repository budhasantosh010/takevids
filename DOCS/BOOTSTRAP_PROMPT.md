# Bootstrap prompt for a project that does not have this system yet

Paste this into the project's first Codex chat:

```text
Before product implementation, install a project-local continuity, anti-drift, traceability, and
rollback system. Do not change global Codex settings.

Use this project root:
C:\Users\Lenovo\Music\Startups\Lovable for Video Editors\full code

Create:
- AGENTS.md with mandatory startup context reload and anti-drift rules;
- project-local .codex/config.toml and .codex/hooks.json;
- a UserPromptSubmit logger to DOCS/_raw/user_messages.txt;
- DOCS/INDEX.md, CURRENT_STATE.md, REQUIREMENTS.md, DECISIONS.md,
  FAILURE_REGISTRY.md, HANDOVER_RUNBOOK.md, BUILD_TRACKER.md, PROJECT_LOG.md,
  ANTI_DRIFT_PROTOCOL.md, CHANGE_POLICY.md, CHANGE_RECORD_TEMPLATE.md,
  GIT_RUNBOOK.md, plans/, changes/, runs/, and the raw transcript;
- a reviewed .gitignore and local Git baseline if no valid repository exists.

Required behavior:
- exact user messages remain word-for-word and append-only;
- important instructions move into project files, not only chat or model memory;
- each meaningful change links raw intent → Requirement ID → Decision/Failure ID →
  plan → tests/evidence → one coherent Git commit → change record → rollback;
- only one acceptance criterion is implemented at a time;
- context reload occurs before every task and after compaction/resume/corrections;
- evidence is required before continuation;
- three repeated identical failures stop blind retries;
- fallbacks and skipped verification are explicit;
- no feature is DONE merely because code exists;
- no paid, destructive, external, or scope-expanding action without approval.

Verify the system with automated checks and a synthetic prompt logged exactly once. Do not begin
product implementation until you report the files created, tests run, Git state, limitations,
and the exact startup prompt for future sessions.
```

