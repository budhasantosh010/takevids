import { cp, mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { LocalJobStore } from '../jobs/jobStore'
import { FixtureIdentityExecutionAdapter, KitExecutor } from '../kits/execution'
import { createDeterministicFixtureKit } from '../kits/fixtureKit'
import { LocalVideoJobPipeline } from '../pipeline/jobPipeline'
import { createSyntheticVideo } from '../test/mediaFixtures'
import { validateRenderedOutput } from '../validation/outputValidator'
import { LocalFfmpegRenderer } from '../workers/localFfmpegRenderer'

const runtimeRoot = path.resolve('.takevids-runtime', 'kit-substrate-smoke')
const fixturesRoot = path.join(runtimeRoot, 'fixtures')
await rm(runtimeRoot, { recursive: true, force: true })
await mkdir(fixturesRoot, { recursive: true })

const referencePath = await createSyntheticVideo(path.join(fixturesRoot, 'reference.mp4'), {
  width: 320,
  height: 180,
  withAudio: true,
})
const newFootagePath = await createSyntheticVideo(path.join(fixturesRoot, 'new-footage.mp4'), {
  width: 180,
  height: 320,
  withAudio: true,
})

const store = new LocalJobStore({ rootDir: runtimeRoot })
const renderer = new LocalFfmpegRenderer()
const pipeline = new LocalVideoJobPipeline(store, renderer)

const reverseJob = await store.create('reverse-engineer', { smoke: 'kit-substrate', intelligence: 'fixture-only' })
const referenceBundle = await pipeline.stageAndPreprocess(reverseJob.id, referencePath)
const reversePaths = store.paths(reverseJob.id)
const createdKit = await createDeterministicFixtureKit(reversePaths.kit, {
  id: 'smoke-fixture-kit',
  referenceAsset: 'reference.mp4',
})

const editJob = await store.create('apply-kit', { smoke: 'kit-substrate', intelligence: 'fixture-only' })
const newBundle = await pipeline.stageAndPreprocess(editJob.id, newFootagePath)
const editPaths = store.paths(editJob.id)
await rm(editPaths.kit, { recursive: true, force: true })
await cp(reversePaths.kit, editPaths.kit, { recursive: true })

const executor = new KitExecutor([new FixtureIdentityExecutionAdapter()])
const preview = await executor.execute(editPaths.kit, editJob.id, pipeline, 'preview')
const final = await executor.execute(editPaths.kit, editJob.id, pipeline, 'final')
const validation = await validateRenderedOutput(final.outputPath, {
  displayWidth: newBundle.metadata.video.displayWidth,
  displayHeight: newBundle.metadata.video.displayHeight,
  requireAudio: Boolean(newBundle.metadata.audio),
  minimumDurationSeconds: 0.2,
})

if (!validation.ok) throw new Error(`Fixture kit smoke output failed validation: ${validation.errors.join('; ')}`)

console.log(JSON.stringify({
  ok: true,
  intelligence: 'fixture-only-not-ai',
  reference: `${referenceBundle.metadata.video.displayWidth}x${referenceBundle.metadata.video.displayHeight}`,
  newFootage: `${newBundle.metadata.video.displayWidth}x${newBundle.metadata.video.displayHeight}`,
  kitId: createdKit.manifest.id,
  adapter: createdKit.manifest.execution.adapter,
  preview: preview.outputPath,
  final: final.outputPath,
  validation: validation.ok,
}, null, 2))
