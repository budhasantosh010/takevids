import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { LocalJobStore } from './jobStore'

const roots: string[] = []

const makeRoot = async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'takevids-jobs-'))
  roots.push(root)
  return root
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

describe('LocalJobStore', () => {
  it('creates an isolated durable workspace and reloads state from disk', async () => {
    const root = await makeRoot()
    const store = new LocalJobStore({ rootDir: root })
    const created = await store.create('reverse-engineer', { source: 'reference.mp4' })
    const paths = store.paths(created.id)

    for (const directory of [paths.input, paths.analysis, paths.kit, paths.output, paths.temp]) {
      await expect(stat(directory)).resolves.toBeTruthy()
    }

    const reloadedStore = new LocalJobStore({ rootDir: root })
    const reloaded = await reloadedStore.load(created.id)
    expect(reloaded).toEqual(created)

    const updated = await reloadedStore.setStage(created.id, 'preprocessing')
    expect(updated.status).toBe('running')
    expect(updated.stage).toBe('preprocessing')

    const raw = JSON.parse(await readFile(paths.record, 'utf8'))
    expect(raw.stage).toBe('preprocessing')
  })

  it('cleans expired temporary/analysis data without deleting durable input/output early', async () => {
    const root = await makeRoot()
    let clock = new Date('2026-09-17T00:00:00.000Z')
    const store = new LocalJobStore({
      rootDir: root,
      now: () => clock,
      tempHours: 1,
      analysisDays: 1,
      inputDays: 30,
      outputDays: 30,
    })
    const job = await store.create('apply-kit')
    const paths = store.paths(job.id)

    await writeFile(path.join(paths.temp, 'scratch.tmp'), 'temp')
    await writeFile(path.join(paths.analysis, 'metadata.json'), '{}')
    await writeFile(path.join(paths.input, 'source.mp4'), 'source')
    await writeFile(path.join(paths.output, 'final.mp4'), 'output')

    clock = new Date('2026-09-19T00:00:00.000Z')
    const actions = await store.cleanupExpired()

    expect(actions).toEqual([{ jobId: job.id, removed: ['temp', 'analysis'] }])
    await expect(stat(path.join(paths.temp, 'scratch.tmp'))).rejects.toThrow()
    await expect(stat(path.join(paths.analysis, 'metadata.json'))).rejects.toThrow()
    await expect(stat(path.join(paths.input, 'source.mp4'))).resolves.toBeTruthy()
    await expect(stat(path.join(paths.output, 'final.mp4'))).resolves.toBeTruthy()

    clock = new Date('2026-10-20T00:00:00.000Z')
    const laterActions = await store.cleanupExpired()
    expect(laterActions[0]?.removed).toEqual(expect.arrayContaining(['input', 'output']))
  })
})
