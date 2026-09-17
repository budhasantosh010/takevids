# Change policy

## Traceability

```text
Raw message → Requirement ID → Decision/Failure ID → plan task →
test/evidence → one coherent change → Git commit → change record
```

## Before changing code

1. Identify Requirement ID and raw source.
2. State acceptance criteria and non-goals.
3. Identify Decision ID and Failure ID.
4. List expected files.
5. Define evidence and rollback.
6. Confirm clean Git state or create a branch.

## During the change

- Make one coherent change.
- Add a failing test or characterization check first.
- Preserve behavior during refactoring.
- Avoid unrelated cleanup.

## After changing code

1. Run focused and regression checks.
2. Inspect the diff.
3. Confirm changed files match the requirement.
4. Update authoritative documentation.
5. Commit with Requirement ID.
6. Record hash, limitations, and rollback.

## Commit format

`type(REQ-XXX): concise outcome`

