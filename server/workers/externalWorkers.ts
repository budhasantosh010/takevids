import type {
  ModelRunRequest,
  ModelRunResult,
  ModelWorker,
  TranscriptResult,
  TranscriptionRequest,
  TranscriptionWorker,
} from './contracts'

export class ExternalDependencyRequiredError extends Error {
  readonly dependency: string

  constructor(dependency: string, message: string) {
    super(message)
    this.name = 'ExternalDependencyRequiredError'
    this.dependency = dependency
  }
}

export class WhisperXTranscriptionWorker implements TranscriptionWorker {
  readonly id = 'whisperx-gpu'

  async transcribe(request: TranscriptionRequest): Promise<TranscriptResult> {
    void request
    throw new ExternalDependencyRequiredError(
      'whisperx-runtime',
      'WhisperX is not configured on this machine yet. Add a WhisperX runtime/model and optional GPU worker before enabling transcription.',
    )
  }
}

export class LiteLlmModelWorker implements ModelWorker {
  readonly id = 'litellm-approved-models'

  async run(request: ModelRunRequest): Promise<ModelRunResult> {
    void request
    throw new ExternalDependencyRequiredError(
      'litellm-credentials',
      'LiteLLM/NVIDIA credentials are not configured yet. The server-side boundary is ready, but real model execution remains disabled.',
    )
  }
}
