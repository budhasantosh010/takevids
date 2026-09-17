import { mkdtemp, readFile, rm, stat } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createSyntheticVideo } from '../test/mediaFixtures'
import { preprocessMedia } from './preprocess'
import { probeMedia } from './probe'

const cases = [
  { name: 'horizontal', width: 320, height: 180, orientation: 'landscape' as const },
  { name: 'vertical', width: 180, height: 320, orientation: 'portrait' as const },
  { name: 'square', width: 240, height: 240, orientation: 'square' as const },
]

describe('format-agnostic media pipeline', () => {
  let root = ''

  beforeAll(async () => {
    root = await mkdtemp(path.join(os.tmpdir(), 'takevids-media-'))
  })

  afterAll(async () => {
    await rm(root, { recursive: true, force: true })
  })

  for (const fixture of cases) {
    it(`probes and preprocesses ${fixture.name} video without format-specific branches`, async () => {
      const source = path.join(root, `${fixture.name}.mp4`)
      const analysisDir = path.join(root, `${fixture.name}-analysis`)
      await createSyntheticVideo(source, {
        width: fixture.width,
        height: fixture.height,
        fps: 24,
      })

      const metadata = await probeMedia(source)
      expect(metadata.video.displayWidth).toBe(fixture.width)
      expect(metadata.video.displayHeight).toBe(fixture.height)
      expect(metadata.video.orientation).toBe(fixture.orientation)
      expect(metadata.video.fps).toBeCloseTo(24, 1)
      expect(metadata.durationSeconds).toBeGreaterThan(0)
      expect(metadata.audio?.sampleRate).toBe(16000)

      const bundle = await preprocessMedia(source, { analysisDir, maxProxyDimension: 1280 })
      const proxyMetadata = await probeMedia(bundle.proxyPath)

      expect(proxyMetadata.video.displayWidth).toBe(fixture.width)
      expect(proxyMetadata.video.displayHeight).toBe(fixture.height)
      expect(proxyMetadata.video.orientation).toBe(fixture.orientation)
      expect(bundle.transcriptAudioPath).toBeTruthy()

      await expect(stat(bundle.metadataPath)).resolves.toBeTruthy()
      await expect(stat(bundle.proxyPath)).resolves.toBeTruthy()
      await expect(stat(bundle.thumbnailPath)).resolves.toBeTruthy()
      await expect(stat(bundle.transcriptAudioPath!)).resolves.toBeTruthy()

      const persisted = JSON.parse(await readFile(bundle.metadataPath, 'utf8'))
      expect(persisted.video.orientation).toBe(fixture.orientation)
    })
  }

  it('handles a silent source without inventing an audio artifact', async () => {
    const source = path.join(root, 'silent.mp4')
    await createSyntheticVideo(source, { width: 300, height: 200, withAudio: false })

    const bundle = await preprocessMedia(source, { analysisDir: path.join(root, 'silent-analysis') })
    expect(bundle.metadata.audio).toBeUndefined()
    expect(bundle.transcriptAudioPath).toBeUndefined()
  })
})
