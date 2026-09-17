import { createHash } from 'node:crypto'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { loadInstructionBundle } from './loader'

const roots: string[] = []
const makeRoot = async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'takevids-instructions-'))
  roots.push(root)
  await mkdir(path.join(root, 'prompts'), { recursive: true })
  await mkdir(path.join(root, 'skills'), { recursive: true })
  return root
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

describe('loadInstructionBundle', () => {
  it('preserves explicit order, exact content, and SHA-256 hashes', async () => {
    const root = await makeRoot()
    const prompt = 'FIRST\nkeep this exact\n'
    const skill = '# Skill\nSecond instruction.\n'
    await writeFile(path.join(root, 'prompts', 'reverse.md'), prompt, 'utf8')
    await writeFile(path.join(root, 'skills', 'video.md'), skill, 'utf8')

    const bundle = await loadInstructionBundle(root, [
      { kind: 'skill', path: 'skills/video.md' },
      { kind: 'prompt', path: 'prompts/reverse.md' },
    ])

    expect(bundle.files.map((file) => file.kind)).toEqual(['skill', 'prompt'])
    expect(bundle.files.map((file) => file.content)).toEqual([skill, prompt])
    expect(bundle.files[0].sha256).toBe(createHash('sha256').update(skill).digest('hex'))
    expect(bundle.files[1].sha256).toBe(createHash('sha256').update(prompt).digest('hex'))
  })

  it.each([
    '../outside.md',
    '..\\outside.md',
    path.resolve(os.tmpdir(), 'outside.md'),
  ])('rejects instruction path escape %s', async (candidate) => {
    const root = await makeRoot()
    await expect(loadInstructionBundle(root, [{ kind: 'prompt', path: candidate }])).rejects.toThrow(/outside|absolute/i)
  })

  it('fails closed when an explicitly requested instruction file is missing', async () => {
    const root = await makeRoot()
    await expect(loadInstructionBundle(root, [{ kind: 'skill', path: 'skills/missing.md' }])).rejects.toThrow(/missing|ENOENT/i)
  })
})
