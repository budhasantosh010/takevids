import type { LocalVideoJobPipeline } from '../pipeline/jobPipeline'
import type { RenderMode, RenderResult } from '../workers/contracts'
import { loadAndValidateKit, type LoadedVideoKit } from './manifest'
import { FIXTURE_IDENTITY_ADAPTER } from './fixtureKit'

export interface KitExecutionContext {
  kit: LoadedVideoKit
  jobId: string
  mode: RenderMode
  pipeline: LocalVideoJobPipeline
}

export interface KitExecutionAdapter {
  readonly id: string
  execute(context: KitExecutionContext): Promise<RenderResult>
}

export class KitExecutor {
  private readonly adapters: Map<string, KitExecutionAdapter>

  constructor(adapters: KitExecutionAdapter[]) {
    this.adapters = new Map(adapters.map((adapter) => [adapter.id, adapter]))
  }

  async execute(
    kitRoot: string,
    jobId: string,
    pipeline: LocalVideoJobPipeline,
    mode: RenderMode,
  ): Promise<RenderResult> {
    const kit = await loadAndValidateKit(kitRoot)
    const adapter = this.adapters.get(kit.manifest.execution.adapter)
    if (!adapter) throw new Error(`No Video Kit execution adapter is registered for ${kit.manifest.execution.adapter}.`)
    return await adapter.execute({ kit, jobId, mode, pipeline })
  }
}

export class FixtureIdentityExecutionAdapter implements KitExecutionAdapter {
  readonly id = FIXTURE_IDENTITY_ADAPTER

  async execute(context: KitExecutionContext): Promise<RenderResult> {
    if (context.kit.manifest.metadata?.fixtureOnly !== true) {
      throw new Error('Fixture identity adapter refuses a kit that is not explicitly marked fixtureOnly.')
    }
    return await context.pipeline.render(context.jobId, context.mode)
  }
}
