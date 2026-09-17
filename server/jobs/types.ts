export type JobKind = 'reverse-engineer' | 'apply-kit'
export type JobStatus = 'queued' | 'running' | 'waiting-external' | 'completed' | 'failed'
export type JobStage =
  | 'created'
  | 'preprocessing'
  | 'transcribing'
  | 'analyzing'
  | 'building-kit'
  | 'rendering-preview'
  | 'rendering-final'
  | 'completed'
  | 'failed'

export interface JobRetention {
  tempUntil: string
  analysisUntil: string
  inputUntil: string
  outputUntil: string
  kitUntil?: string
}

export interface JobRecord {
  id: string
  kind: JobKind
  status: JobStatus
  stage: JobStage
  createdAt: string
  updatedAt: string
  retention: JobRetention
  error?: string
  metadata?: Record<string, unknown>
}

export interface JobWorkspacePaths {
  root: string
  input: string
  analysis: string
  kit: string
  output: string
  temp: string
  record: string
}
