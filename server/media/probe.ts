import path from 'node:path'
import { runCommand } from '../lib/process'
import type { MediaMetadata, VideoOrientation } from './types'

interface ProbeStream {
  codec_type?: string
  codec_name?: string
  pix_fmt?: string
  width?: number
  height?: number
  r_frame_rate?: string
  avg_frame_rate?: string
  sample_rate?: string
  channels?: number
  duration?: string
  tags?: { rotate?: string }
  side_data_list?: Array<{ rotation?: number }>
}

interface ProbeResponse {
  streams?: ProbeStream[]
  format?: {
    format_name?: string
    duration?: string
    size?: string
  }
}

const parseRate = (rate?: string) => {
  if (!rate || rate === '0/0') return 0
  const [numeratorRaw, denominatorRaw = '1'] = rate.split('/')
  const numerator = Number(numeratorRaw)
  const denominator = Number(denominatorRaw)
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) return 0
  return numerator / denominator
}

const normalizeRotation = (rotation: number) => {
  const normalized = ((Math.round(rotation) % 360) + 360) % 360
  return normalized === 360 ? 0 : normalized
}

const getRotation = (stream: ProbeStream) => {
  const sideDataRotation = stream.side_data_list?.find((entry) => Number.isFinite(entry.rotation))?.rotation
  if (Number.isFinite(sideDataRotation)) return normalizeRotation(sideDataRotation ?? 0)

  const taggedRotation = Number(stream.tags?.rotate)
  return Number.isFinite(taggedRotation) ? normalizeRotation(taggedRotation) : 0
}

const orientationFor = (width: number, height: number): VideoOrientation => {
  if (width === height) return 'square'
  return width > height ? 'landscape' : 'portrait'
}

export const probeMedia = async (sourcePath: string): Promise<MediaMetadata> => {
  const absoluteSource = path.resolve(sourcePath)
  const { stdout } = await runCommand('ffprobe', [
    '-v', 'error',
    '-show_streams',
    '-show_format',
    '-of', 'json',
    absoluteSource,
  ], { timeoutMs: 30_000 })

  const response = JSON.parse(stdout) as ProbeResponse
  const videoStream = response.streams?.find((stream) => stream.codec_type === 'video')
  if (!videoStream?.width || !videoStream.height) {
    throw new Error(`No video stream found in ${absoluteSource}`)
  }

  const rotation = getRotation(videoStream)
  const swapsAxes = rotation === 90 || rotation === 270
  const displayWidth = swapsAxes ? videoStream.height : videoStream.width
  const displayHeight = swapsAxes ? videoStream.width : videoStream.height
  const audioStream = response.streams?.find((stream) => stream.codec_type === 'audio')
  const durationSeconds = Number(response.format?.duration ?? videoStream.duration ?? 0)
  const sizeBytes = Number(response.format?.size)

  return {
    sourcePath: absoluteSource,
    container: response.format?.format_name,
    durationSeconds: Number.isFinite(durationSeconds) ? durationSeconds : 0,
    sizeBytes: Number.isFinite(sizeBytes) ? sizeBytes : undefined,
    video: {
      codedWidth: videoStream.width,
      codedHeight: videoStream.height,
      displayWidth,
      displayHeight,
      rotation,
      orientation: orientationFor(displayWidth, displayHeight),
      displayAspectRatio: displayWidth / displayHeight,
      fps: parseRate(videoStream.avg_frame_rate || videoStream.r_frame_rate),
      codec: videoStream.codec_name ?? 'unknown',
      pixelFormat: videoStream.pix_fmt,
    },
    audio: audioStream ? {
      codec: audioStream.codec_name ?? 'unknown',
      sampleRate: audioStream.sample_rate ? Number(audioStream.sample_rate) : undefined,
      channels: audioStream.channels,
    } : undefined,
  }
}
