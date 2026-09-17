import { copyFile } from 'node:fs/promises'
import path from 'node:path'
import { LocalJobStore } from '../jobs/jobStore'
import { preprocessMedia } from '../media/preprocess'
import type { AnalysisBundle } from '../media/types'
import type { RenderResult, RenderWorker } from '../workers/contracts'

export class LocalVideoJobPipeline {
  constructor(
    private readonly store: LocalJobStore,
    private readonly renderer: RenderWorker,
  ) {}

  async stageAndPreprocess(jobId: string, sourcePath: string): Promise<AnalysisBundle> {
    const current = await this.store.load(jobId)
    const paths = this.store.paths(jobId)
    const extension = path.extname(sourcePath) || '.mp4'
    const stagedInput = path.join(paths.input, `source${extension.toLowerCase()}`)

    await this.store.setStage(jobId, 'preprocessing')
    await copyFile(path.resolve(sourcePath), stagedInput)

    try {
      const bundle = await preprocessMedia(stagedInput, { analysisDir: paths.analysis })
      await this.store.update(jobId, {
        status: 'running',
        stage: current.kind === 'reverse-engineer' ? 'transcribing' : 'rendering-preview',
        metadata: {
          ...(current.metadata ?? {}),
          stagedInput,
          analysis: {
            metadataPath: bundle.metadataPath,
            proxyPath: bundle.proxyPath,
            thumbnailPath: bundle.thumbnailPath,
            transcriptAudioPath: bundle.transcriptAudioPath,
          },
          media: bundle.metadata,
        },
      })
      return bundle
    } catch (error) {
      await this.fail(jobId, error)
      throw error
    }
  }

  async render(jobId: string, mode: 'preview' | 'final'): Promise<RenderResult> {
    const current = await this.store.load(jobId)
    const stagedInput = current.metadata?.stagedInput
    if (typeof stagedInput !== 'string') {
      throw new Error(`Job ${jobId} has no staged input. Run stageAndPreprocess first.`)
    }

    const paths = this.store.paths(jobId)
    const outputPath = path.join(paths.output, mode === 'preview' ? 'preview.mp4' : 'final.mp4')
    await this.store.setStage(jobId, mode === 'preview' ? 'rendering-preview' : 'rendering-final')

    try {
      const result = await this.renderer.render({
        inputPath: stagedInput,
        outputPath,
        mode,
        workspacePath: paths.root,
      })
      const latest = await this.store.load(jobId)
      await this.store.update(jobId, {
        status: mode === 'final' ? 'completed' : 'running',
        stage: mode === 'final' ? 'completed' : 'rendering-preview',
        metadata: {
          ...(latest.metadata ?? {}),
          [mode === 'preview' ? 'previewOutput' : 'finalOutput']: result.outputPath,
          renderWorkerId: result.workerId,
        },
      })
      return result
    } catch (error) {
      await this.fail(jobId, error)
      throw error
    }
  }

  private async fail(jobId: string, error: unknown) {
    await this.store.update(jobId, {
      status: 'failed',
      stage: 'failed',
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
