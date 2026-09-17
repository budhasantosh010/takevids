import path from 'node:path'
import { LocalJobStore } from '../jobs/jobStore'
import { LiteLlmModelWorker, WhisperXTranscriptionWorker } from '../workers/externalWorkers'
import { LocalFfmpegRenderer } from '../workers/localFfmpegRenderer'
import { TakeVidsService } from './takevidsService'

export const createLocalBackend = (runtimeRoot = path.resolve('.takevids-runtime')) => {
  const jobStore = new LocalJobStore({ rootDir: runtimeRoot })
  return new TakeVidsService({
    jobStore,
    renderer: new LocalFfmpegRenderer(),
    transcription: new WhisperXTranscriptionWorker(),
    models: new LiteLlmModelWorker(),
    transcriptionReady: false,
    modelsReady: false,
  })
}
