# Local Git rollback runbook

## Initialize only after reviewing `.gitignore`

```powershell
git init -b main
git add -A
git status
git commit -m "chore: establish local project baseline"
```

## Per-task workflow

```powershell
git status --short
git switch -c work/REQ-XXX-short-name
# implement and verify
git diff
git add <relevant-files>
git commit -m "type(REQ-XXX): concise outcome"
```

## Rollback

```powershell
git restore -- path\to\unwanted-uncommitted-file
git revert <committed-change>
git show <commit>:path/to/file
```

Avoid `git reset --hard` for normal rollback.

