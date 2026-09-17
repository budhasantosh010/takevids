import { LocalJobStore } from '../jobs/jobStore'
import type { JobKind, JobRecord } from '../jobs/types'
import { LocalVideoJobPipeline } from '../pipeline/jobPipeline'
import type { ModelWorker, RenderWorker, TranscriptionWorker } from '../workers/contracts'

export interface BackendCapabilities {
  media: 'ready'
  jobs: 'ready'
  renderer: { id: string; ready: boolean }
  transcription: { id: string; ready: boolean; requires?: string }
  models: { id: string; ready: boolean; requires?: string }
}

export interface TakeVidsBackendDependencies {
  jobStore: LocalJobStore
  renderer: RenderWorker
  transcription: TranscriptionWorker
  models: ModelWorker
  transcriptionReady?: boolean
  modelsReady?: boolean
}

/**
 * Application-layer boundary for TakeVids backend actions.
 * HTTP/WebSocket adapters can call this service later; UI code should never
 * receive provider credentials or directly execute worker implementations.
 */
export class TakeVidsService {
  readonly pipeline: LocalVideoJobPipeline

  constructor(private readonly dependencies: TakeVidsBackendDependencies) {
    this.pipeline = new LocalVideoJobPipeline(dependencies.jobStore, dependencies.renderer)
  }

  async createJob(kind: JobKind, metadata?: Record<string, unknown>) {
    return await this.dependencies.jobStore.create(kind, metadata)
  }

  async getJob(jobId: string): Promise<JobRecord> {
    return await this.dependencies.jobStore.load(jobId)
  }

  async prepareInput(jobId: string, sourcePath: string) {
    return await this.pipeline.stageAndPreprocess(jobId, sourcePath)
  }

  async renderPreview(jobId: string) {
    return await this.pipeline.render(jobId, 'preview')
  }

  async renderFinal(jobId: string) {
    return await this.pipeline.render(jobId, 'final')
  }

  capabilities(): BackendCapabilities {
    return {
      media: 'ready',
      jobs: 'ready',
      renderer: { id: this.dependencies.renderer.id, ready: true },
      transcription: {
        id: this.dependencies.transcription.id,
        ready: this.dependencies.transcriptionReady ?? false,
        requires: (this.dependencies.transcriptionReady ?? false) ? undefined : 'WhisperX runtime/model; GPU optional but recommended',
      },
      models: {
        id: this.dependencies.models.id,
        ready: this.dependencies.modelsReady ?? false,
        requires: (this.dependencies.modelsReady ?? false) ? undefined : 'LiteLLM endpoint plus approved NVIDIA/provider credentials',
      },
    }
  }
}
