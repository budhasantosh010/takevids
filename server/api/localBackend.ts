import path from 'node:path'
import { LocalJobStore } from '../jobs/jobStore'
import { createLiteLlmWorkerFromEnv } from '../providers/liteLlmClient'
import { LiteLlmModelWorker, WhisperXTranscriptionWorker } from '../workers/externalWorkers'
import { LocalFfmpegRenderer } from '../workers/localFfmpegRenderer'
import { TakeVidsService } from './takevidsService'

export const createLocalBackend = (
  runtimeRoot = path.resolve('.takevids-runtime'),
  env: NodeJS.ProcessEnv = process.env,
) => {
  const jobStore = new LocalJobStore({ rootDir: runtimeRoot })
  const configuredModelWorker = createLiteLlmWorkerFromEnv(env)
  return new TakeVidsService({
    jobStore,
    renderer: new LocalFfmpegRenderer(),
    transcription: new WhisperXTranscriptionWorker(),
    models: configuredModelWorker ?? new LiteLlmModelWorker(),
    transcriptionReady: false,
    modelsReady: Boolean(configuredModelWorker),
  })
}
