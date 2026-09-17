import { stat } from 'node:fs/promises'
import { probeMedia } from '../media/probe'
import type { VideoOrientation } from '../media/types'

export interface OutputExpectations {
  displayWidth?: number
  displayHeight?: number
  orientation?: VideoOrientation
  requireAudio?: boolean
  minimumDurationSeconds?: number
}

export interface OutputValidationResult {
  ok: boolean
  errors: string[]
  sizeBytes: number
  durationSeconds: number
}

export const validateRenderedOutput = async (
  outputPath: string,
  expectations: OutputExpectations = {},
): Promise<OutputValidationResult> => {
  const errors: string[] = []
  const file = await stat(outputPath)
  if (file.size <= 0) errors.push('Output file is empty.')

  const metadata = await probeMedia(outputPath)
  if (metadata.durationSeconds <= 0) errors.push('Output has no positive duration.')
  if (expectations.minimumDurationSeconds !== undefined && metadata.durationSeconds < expectations.minimumDurationSeconds) {
    errors.push(`Output duration ${metadata.durationSeconds}s is below required ${expectations.minimumDurationSeconds}s.`)
  }
  if (expectations.displayWidth !== undefined && metadata.video.displayWidth !== expectations.displayWidth) {
    errors.push(`Output width ${metadata.video.displayWidth} does not match expected ${expectations.displayWidth}.`)
  }
  if (expectations.displayHeight !== undefined && metadata.video.displayHeight !== expectations.displayHeight) {
    errors.push(`Output height ${metadata.video.displayHeight} does not match expected ${expectations.displayHeight}.`)
  }
  if (expectations.orientation && metadata.video.orientation !== expectations.orientation) {
    errors.push(`Output orientation ${metadata.video.orientation} does not match expected ${expectations.orientation}.`)
  }
  if (expectations.requireAudio && !metadata.audio) errors.push('Output is missing required audio.')

  return {
    ok: errors.length === 0,
    errors,
    sizeBytes: file.size,
    durationSeconds: metadata.durationSeconds,
  }
}
