export type VideoOrientation = 'landscape' | 'portrait' | 'square'

export interface VideoStreamMetadata {
  codedWidth: number
  codedHeight: number
  displayWidth: number
  displayHeight: number
  rotation: number
  orientation: VideoOrientation
  displayAspectRatio: number
  fps: number
  codec: string
  pixelFormat?: string
}

export interface AudioStreamMetadata {
  codec: string
  sampleRate?: number
  channels?: number
}

export interface MediaMetadata {
  sourcePath: string
  container?: string
  durationSeconds: number
  sizeBytes?: number
  video: VideoStreamMetadata
  audio?: AudioStreamMetadata
}

export interface AnalysisBundle {
  metadata: MediaMetadata
  metadataPath: string
  proxyPath: string
  thumbnailPath: string
  transcriptAudioPath?: string
}
