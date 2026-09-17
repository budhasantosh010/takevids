import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { LocalJobStore } from '../jobs/jobStore'
import { ExternalDependencyRequiredError, LiteLlmModelWorker, WhisperXTranscriptionWorker } from '../workers/externalWorkers'
import { LocalFfmpegRenderer } from '../workers/localFfmpegRenderer'
import { createLocalBackend } from './localBackend'
import { TakeVidsService } from './takevidsService'

const roots: string[] = []

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

describe('TakeVidsService worker boundary', () => {
  it('reports local media/jobs/rendering ready while external model/transcription remain explicit dependencies', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'takevids-service-'))
    roots.push(root)
    const service = new TakeVidsService({
      jobStore: new LocalJobStore({ rootDir: root }),
      renderer: new LocalFfmpegRenderer(),
      transcription: new WhisperXTranscriptionWorker(),
      models: new LiteLlmModelWorker(),
    })

    expect(service.capabilities()).toMatchObject({
      media: 'ready',
      jobs: 'ready',
      renderer: { id: 'local-ffmpeg-cpu', ready: true },
      transcription: { id: 'whisperx-gpu', ready: false },
      models: { id: 'litellm-approved-models', ready: false },
    })

    const job = await service.createJob('reverse-engineer')
    expect(job.status).toBe('queued')
  })

  it('fails closed instead of faking transcription or model output when external workers are not configured', async () => {
    const transcription = new WhisperXTranscriptionWorker()
    const models = new LiteLlmModelWorker()

    await expect(transcription.transcribe({ audioPath: 'audio.wav', outputDir: 'out' }))
      .rejects.toBeInstanceOf(ExternalDependencyRequiredError)
    await expect(models.run({
      approvedModelId: 'nvidia-glm-5.3-flash',
      role: 'reverse-engineer',
      prompt: 'analyze',
      workspacePath: 'workspace',
    })).rejects.toBeInstanceOf(ExternalDependencyRequiredError)
  })

  it('switches to the real LiteLLM worker only when proxy URL and proxy key are configured', () => {
    const unavailable = createLocalBackend(path.join(os.tmpdir(), 'takevids-no-litellm'), {})
    expect(unavailable.capabilities().models).toMatchObject({ id: 'litellm-approved-models', ready: false })

    const configured = createLocalBackend(path.join(os.tmpdir(), 'takevids-with-litellm'), {
      LITELLM_BASE_URL: 'http://127.0.0.1:4000/v1',
      LITELLM_API_KEY: 'proxy-key',
    })
    expect(configured.capabilities().models).toMatchObject({ id: 'litellm-http', ready: true })
  })
})
