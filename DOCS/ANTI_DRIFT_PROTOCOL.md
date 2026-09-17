# Anti-drift execution protocol

No agent can honestly guarantee zero mistakes. This system makes mistakes small, visible,
reversible, and unable to compound.

## User-intent checksum

Before each task:

```text
Requirement:
Exact intended outcome:
What must not change:
Acceptance test:
Evidence level:
Rollback:
```

## Maximum active implementation scope

Only one coherent acceptance criterion is active at a time. Split work that combines unrelated
behavior, architecture, cleanup, or more than one independently verifiable outcome.

## Short verified loop

```text
Reload intent → failing test/reproduction → smallest change → focused test →
inspect diff → regression gate → commit/document → reload for next task
```

## Evidence before continuation

Do not begin the next task until the current task has explicit evidence, an inspected diff,
updated status, and a coherent commit or clearly reported blocker.

## Context reload checkpoint

Reload requirements, current state, active plan, and relevant decisions:

- before each new task;
- after compaction/resume/new thread;
- after user correction;
- after three commits;
- after integration failure;
- before paid/destructive/external/final work;
- whenever intent is uncertain.

## Three-strike stop rule

After the same failure occurs three consecutive times: stop, preserve errors, review requirements
and known failures, diagnose root cause, or report the blocker. No fourth blind attempt.

## No silent fallback

Report what failed, fallback used, quality lost, acceptability, and final degraded status.

## Speed without skipping gates

Move quickly through parallel inspection, small tests, caching, resumability, and reusable
components. Never skip context, tests, diff review, or documentation for speed.

## Stop-the-line conditions

Stop when work contradicts a requirement, verification is skipped, the diff contains unrelated
files, output silently degrades, cost/time changes materially, or a fixed defect returns.

