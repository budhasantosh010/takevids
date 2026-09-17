export interface TranscriptWord {
  text: string
  startSeconds: number
  endSeconds: number
  speaker?: string
}

export interface TranscriptResult {
  language?: string
  text: string
  words: TranscriptWord[]
  artifactPath: string
}

export interface TranscriptionRequest {
  audioPath: string
  outputDir: string
}

export interface TranscriptionWorker {
  readonly id: string
  transcribe(request: TranscriptionRequest): Promise<TranscriptResult>
}

export interface ModelRunRequest {
  approvedModelId: string
  role: 'reverse-engineer' | 'execute'
  prompt: string
  imagePaths?: string[]
  workspacePath: string
}

export interface ModelRunResult {
  text: string
  providerRequestId?: string
}

export interface ModelWorker {
  readonly id: string
  run(request: ModelRunRequest): Promise<ModelRunResult>
}

export type RenderMode = 'preview' | 'final'

export interface RenderRequest {
  inputPath: string
  outputPath: string
  mode: RenderMode
  workspacePath: string
}

export interface RenderResult {
  outputPath: string
  durationSeconds: number
  workerId: string
}

export interface RenderWorker {
  readonly id: string
  render(request: RenderRequest): Promise<RenderResult>
}
