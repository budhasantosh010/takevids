import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { runCommand } from '../lib/process'

export interface SyntheticVideoOptions {
  width: number
  height: number
  fps?: number
  durationSeconds?: number
  withAudio?: boolean
}

export const createSyntheticVideo = async (
  outputPath: string,
  options: SyntheticVideoOptions,
) => {
  await mkdir(path.dirname(outputPath), { recursive: true })
  const fps = options.fps ?? 24
  const duration = options.durationSeconds ?? 0.6
  const args = [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-f', 'lavfi',
    '-i', `color=c=0x24324a:s=${options.width}x${options.height}:r=${fps}:d=${duration}`,
  ]

  if (options.withAudio !== false) {
    args.push(
      '-f', 'lavfi',
      '-i', `sine=frequency=880:sample_rate=16000:duration=${duration}`,
      '-shortest',
    )
  }

  args.push(
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-pix_fmt', 'yuv420p',
  )

  if (options.withAudio !== false) args.push('-c:a', 'aac', '-b:a', '64k')
  args.push(outputPath)

  await runCommand('ffmpeg', args, { timeoutMs: 60_000 })
  return outputPath
}
