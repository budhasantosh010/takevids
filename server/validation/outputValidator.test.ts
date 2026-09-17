import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { createSyntheticVideo } from '../test/mediaFixtures'
import { validateRenderedOutput } from './outputValidator'

const roots: string[] = []

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

describe('validateRenderedOutput', () => {
  it('accepts a decodable output with the expected geometry/audio', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'takevids-validate-'))
    roots.push(root)
    const output = path.join(root, 'final.mp4')
    await createSyntheticVideo(output, { width: 360, height: 640, durationSeconds: 0.7 })

    const result = await validateRenderedOutput(output, {
      displayWidth: 360,
      displayHeight: 640,
      orientation: 'portrait',
      requireAudio: true,
      minimumDurationSeconds: 0.5,
    })

    expect(result.ok).toBe(true)
    expect(result.errors).toEqual([])
    expect(result.sizeBytes).toBeGreaterThan(0)
  })

  it('reports expectation mismatches instead of treating a decodable file as valid', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'takevids-validate-'))
    roots.push(root)
    const output = path.join(root, 'final.mp4')
    await createSyntheticVideo(output, { width: 320, height: 180, withAudio: false })

    const result = await validateRenderedOutput(output, {
      displayWidth: 1080,
      displayHeight: 1920,
      orientation: 'portrait',
      requireAudio: true,
    })

    expect(result.ok).toBe(false)
    expect(result.errors.length).toBeGreaterThanOrEqual(4)
  })
})
