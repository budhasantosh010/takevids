# Documentation index

| Document | Authority |
|---|---|
| `AGENTS.md` | Mandatory Codex operating rules |
| `DOCS/STARTUP_MESSAGE.md` | First message after the system is installed |
| `DOCS/BOOTSTRAP_PROMPT.md` | Prompt for asking a new project to install this system |
| `DOCS/CURRENT_STATE.md` | Current verified facts |
| `DOCS/REQUIREMENTS.md` | Stable testable user outcomes |
| `DOCS/DECISIONS.md` | Architectural choices and reasons |
| `DOCS/FAILURE_REGISTRY.md` | Failures and regression protection |
| `DOCS/ANTI_DRIFT_PROTOCOL.md` | Short-loop safeguards against long-task quality decay |
| `DOCS/CHANGE_POLICY.md` | Requirement-to-evidence change workflow |
| `DOCS/changes/` | One record per meaningful change |
| `DOCS/GIT_RUNBOOK.md` | Local commit, branch, and rollback instructions |
| `DOCS/HANDOVER_RUNBOOK.md` | Verified operating instructions |
| `DOCS/BUILD_TRACKER.md` | Concise current status |
| `DOCS/PROJECT_LOG.md` | Append-only chronological history |
| `DOCS/STATECHART.md` | Optional high-level visual |
| `DOCS/plans/` | Ordered implementation plans |
| `DOCS/runs/` | Evidence from actual executions |
| `DOCS/_raw/user_messages.txt` | Exact user wording |

## Conflict order

1. Raw transcript establishes what the user said.
2. Requirements express testable intent.
3. Decisions establish deliberate architecture.
4. Current code/tests establish actual behavior.
5. `CURRENT_STATE.md` must match verified reality.
6. Historical records are corrected by appending, never silently deleting.

