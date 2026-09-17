import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { runCommand } from '../lib/process'
import { probeMedia } from './probe'
import type { AnalysisBundle } from './types'

export interface PreprocessOptions {
  maxProxyDimension?: number
  analysisDir: string
}

const ffmpegBase = ['-hide_banner', '-loglevel', 'error', '-y']

export const preprocessMedia = async (
  sourcePath: string,
  options: PreprocessOptions,
): Promise<AnalysisBundle> => {
  const analysisDir = path.resolve(options.analysisDir)
  const maxProxyDimension = Math.max(320, Math.round(options.maxProxyDimension ?? 1280))
  await mkdir(analysisDir, { recursive: true })

  const metadata = await probeMedia(sourcePath)
  const metadataPath = path.join(analysisDir, 'metadata.json')
  const proxyPath = path.join(analysisDir, 'proxy.mp4')
  const thumbnailPath = path.join(analysisDir, 'thumbnail.jpg')
  const transcriptAudioPath = metadata.audio ? path.join(analysisDir, 'transcript.wav') : undefined

  await writeFile(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`, 'utf8')

  const scaleFilter = `scale=w='min(${maxProxyDimension},iw)':h='min(${maxProxyDimension},ih)':force_original_aspect_ratio=decrease:force_divisible_by=2`
  await runCommand('ffmpeg', [
    ...ffmpegBase,
    '-i', path.resolve(sourcePath),
    '-map', '0:v:0',
    '-map', '0:a:0?',
    '-vf', scaleFilter,
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-crf', '24',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-movflags', '+faststart',
    proxyPath,
  ], { timeoutMs: 120_000 })

  await runCommand('ffmpeg', [
    ...ffmpegBase,
    '-i', path.resolve(sourcePath),
    '-map', '0:v:0',
    '-frames:v', '1',
    '-vf', scaleFilter,
    '-q:v', '3',
    thumbnailPath,
  ], { timeoutMs: 60_000 })

  if (transcriptAudioPath) {
    await runCommand('ffmpeg', [
      ...ffmpegBase,
      '-i', path.resolve(sourcePath),
      '-map', '0:a:0',
      '-vn',
      '-ac', '1',
      '-ar', '16000',
      '-c:a', 'pcm_s16le',
      transcriptAudioPath,
    ], { timeoutMs: 60_000 })
  }

  return {
    metadata,
    metadataPath,
    proxyPath,
    thumbnailPath,
    transcriptAudioPath,
  }
}
