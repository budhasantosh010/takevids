import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const requiredFoundationFiles = [
  'AGENTS.md',
  '.codex/config.toml',
  '.codex/hooks.json',
  'Main Rough Thought.txt',
  'DOCS/CURRENT_STATE.md',
  'DOCS/REQUIREMENTS.md',
  'DOCS/DECISIONS.md',
  'DOCS/HANDOVER_RUNBOOK.md',
  'DOCS/BUILD_TRACKER.md',
]

const collectTextFiles = (directory: string): string[] =>
  readdirSync(directory).flatMap((name) => {
    const path = join(directory, name)
    if (statSync(path).isDirectory()) return collectTextFiles(path)
    return /\.(md|json|toml|ps1)$/i.test(name) ? [path] : []
  })

describe('TakeVids project foundation', () => {
  it('preserves the Codex governance scaffold and original product thought', () => {
    for (const relativePath of requiredFoundationFiles) {
      expect(existsSync(join(root, relativePath)), `${relativePath} should exist`).toBe(true)
    }
  })

  it('has no unresolved standard project placeholders in authoritative DOCS', () => {
    const unresolved = collectTextFiles(join(root, 'DOCS')).filter((path) => {
      const content = readFileSync(path, 'utf8')
      return /<PROJECT_NAME>|<PROJECT_ROOT>|<DATE>|<OWNER>/.test(content)
    })

    expect(unresolved).toEqual([])
  })
})
