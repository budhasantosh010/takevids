import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { loadAndValidateKit, validateKitManifest } from './manifest'

const roots: string[] = []
const makeRoot = async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'takevids-kit-'))
  roots.push(root)
  return root
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

const manifest = () => ({
  schemaVersion: 1,
  id: 'kit-example',
  name: 'Example Kit',
  createdAt: '2026-09-17T00:00:00.000Z',
  source: { kind: 'reference', referenceAsset: 'reference.mp4' },
  execution: { adapter: 'takevids.fixture.identity.v1', entrypoint: 'execute.json' },
  files: [
    { path: 'execute.json', role: 'entrypoint', required: true },
    { path: 'components/notes.txt', role: 'component', required: true },
  ],
  metadata: { arbitraryFutureField: { allowed: true } },
})

describe('Video Kit manifest', () => {
  it('accepts a small extensible envelope without aspect-ratio assumptions', () => {
    const parsed = validateKitManifest(manifest())
    expect(parsed.schemaVersion).toBe(1)
    expect(parsed.execution.adapter).toBe('takevids.fixture.identity.v1')
    expect(parsed.metadata).toEqual({ arbitraryFutureField: { allowed: true } })
  })

  it.each([
    () => ({ ...manifest(), files: [{ path: '../escape.txt', required: true }] }),
    () => ({ ...manifest(), files: [{ path: 'C:\\outside.txt', required: true }] }),
    () => ({ ...manifest(), files: [{ path: 'execute.json', required: true }, { path: 'execute.json', required: true }] }),
    () => ({ ...manifest(), execution: { adapter: 'x', entrypoint: 'missing.json' } }),
  ])('rejects unsafe or internally inconsistent declarations', (makeInvalid) => {
    expect(() => validateKitManifest(makeInvalid())).toThrow()
  })

  it('validates required files on disk', async () => {
    const root = await makeRoot()
    await mkdir(path.join(root, 'components'), { recursive: true })
    await writeFile(path.join(root, 'kit.json'), `${JSON.stringify(manifest(), null, 2)}\n`)
    await writeFile(path.join(root, 'execute.json'), '{"mode":"identity"}\n')
    await writeFile(path.join(root, 'components', 'notes.txt'), 'fixture only')

    const loaded = await loadAndValidateKit(root)
    expect(loaded.manifest.id).toBe('kit-example')
    expect(loaded.root).toBe(path.resolve(root))
  })

  it('fails when a required declared file is missing', async () => {
    const root = await makeRoot()
    await writeFile(path.join(root, 'kit.json'), `${JSON.stringify(manifest(), null, 2)}\n`)
    await writeFile(path.join(root, 'execute.json'), '{"mode":"identity"}\n')

    await expect(loadAndValidateKit(root)).rejects.toThrow(/required kit file/i)
  })
})
