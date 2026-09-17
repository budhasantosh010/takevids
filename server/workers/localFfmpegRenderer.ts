import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { runCommand } from '../lib/process'
import { probeMedia } from '../media/probe'
import type { RenderRequest, RenderResult, RenderWorker } from './contracts'

export class LocalFfmpegRenderer implements RenderWorker {
  readonly id = 'local-ffmpeg-cpu'

  async render(request: RenderRequest): Promise<RenderResult> {
    const inputPath = path.resolve(request.inputPath)
    const outputPath = path.resolve(request.outputPath)
    await mkdir(path.dirname(outputPath), { recursive: true })

    const args = [
      '-hide_banner', '-loglevel', 'error', '-y',
      '-i', inputPath,
      '-map', '0:v:0',
      '-map', '0:a:0?',
    ]

    if (request.mode === 'preview') {
      args.push(
        '-vf', "scale=w='min(1280,iw)':h='min(1280,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2",
      )
    }

    args.push(
      '-c:v', 'libx264',
      '-preset', request.mode === 'preview' ? 'veryfast' : 'medium',
      '-crf', request.mode === 'preview' ? '26' : '18',
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      '-b:a', request.mode === 'preview' ? '128k' : '192k',
      '-movflags', '+faststart',
      outputPath,
    )

    await runCommand('ffmpeg', args, { timeoutMs: 10 * 60_000 })
    const metadata = await probeMedia(outputPath)

    return {
      outputPath,
      durationSeconds: metadata.durationSeconds,
      workerId: this.id,
    }
  }
}
