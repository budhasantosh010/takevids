import assert from 'node:assert/strict'
import { mkdir, rm, stat } from 'node:fs/promises'
import path from 'node:path'
import { createLocalBackend } from '../api/localBackend'
import { probeMedia } from '../media/probe'
import { createSyntheticVideo } from '../test/mediaFixtures'
import { validateRenderedOutput } from '../validation/outputValidator'

const runtimeRoot = path.resolve('.takevids-runtime', 'smoke')
const fixtureDir = path.join(runtimeRoot, 'fixtures')

await rm(runtimeRoot, { recursive: true, force: true })
await mkdir(fixtureDir, { recursive: true })

const sourcePath = path.join(fixtureDir, 'input-vertical.mp4')
await createSyntheticVideo(sourcePath, {
  width: 360,
  height: 640,
  fps: 30,
  durationSeconds: 1,
})

const service = createLocalBackend(runtimeRoot)
const job = await service.createJob('apply-kit', { smokeTest: true })
const analysis = await service.prepareInput(job.id, sourcePath)
const preview = await service.renderPreview(job.id)
const final = await service.renderFinal(job.id)
const completed = await service.getJob(job.id)
const finalMetadata = await probeMedia(final.outputPath)
const validation = await validateRenderedOutput(final.outputPath, {
  displayWidth: 360,
  displayHeight: 640,
  orientation: 'portrait',
  requireAudio: true,
  minimumDurationSeconds: 0.5,
})

assert.equal(validation.ok, true, validation.errors.join('; '))
assert.equal(analysis.metadata.video.orientation, 'portrait')
assert.equal(analysis.metadata.video.displayWidth, 360)
assert.equal(analysis.metadata.video.displayHeight, 640)
assert.equal(finalMetadata.video.displayWidth, 360)
assert.equal(finalMetadata.video.displayHeight, 640)
assert.equal(completed.status, 'completed')
assert.equal(completed.stage, 'completed')
assert.equal(completed.metadata?.finalOutput, final.outputPath)

for (const artifact of [
  analysis.metadataPath,
  analysis.proxyPath,
  analysis.thumbnailPath,
  analysis.transcriptAudioPath!,
  preview.outputPath,
  final.outputPath,
]) {
  const info = await stat(artifact)
  assert.ok(info.size > 0, `Expected non-empty artifact: ${artifact}`)
}

console.log(JSON.stringify({
  ok: true,
  jobId: job.id,
  input: `${analysis.metadata.video.displayWidth}x${analysis.metadata.video.displayHeight}`,
  orientation: analysis.metadata.video.orientation,
  renderer: final.workerId,
  artifacts: {
    metadata: analysis.metadataPath,
    proxy: analysis.proxyPath,
    transcriptAudio: analysis.transcriptAudioPath,
    preview: preview.outputPath,
    final: final.outputPath,
  },
}, null, 2))
