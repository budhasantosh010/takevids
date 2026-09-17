import { mkdtemp, readFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { ScopedWorkspace } from './scopedWorkspace'

const roots: string[] = []

const makeWorkspace = async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'takevids-workspace-'))
  roots.push(root)
  return new ScopedWorkspace(root)
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

describe('ScopedWorkspace', () => {
  it('reads, writes and lists files inside its root', async () => {
    const workspace = await makeWorkspace()

    await workspace.writeText('kit/notes.txt', 'exact content')
    await workspace.writeJson('kit/data.json', { ok: true })

    expect(await workspace.readText('kit/notes.txt')).toBe('exact content')
    expect(await workspace.readJson<{ ok: boolean }>('kit/data.json')).toEqual({ ok: true })
    expect(await workspace.list('kit')).toEqual(['data.json', 'notes.txt'])
    expect(await readFile(path.join(workspace.root, 'kit', 'notes.txt'), 'utf8')).toBe('exact content')
  })

  it.each([
    '../outside.txt',
    '..\\outside.txt',
    path.resolve(os.tmpdir(), 'outside.txt'),
  ])('rejects path escape attempt %s', async (candidate) => {
    const workspace = await makeWorkspace()

    await expect(workspace.writeText(candidate, 'nope')).rejects.toThrow(/outside workspace|absolute path/i)
    await expect(workspace.readText(candidate)).rejects.toThrow(/outside workspace|absolute path/i)
  })
})
