import { ScopedWorkspace } from '../agent/scopedWorkspace'
import { loadAndValidateKit, type LoadedVideoKit, type VideoKitManifestV1 } from './manifest'

export const FIXTURE_IDENTITY_ADAPTER = 'takevids.fixture.identity.v1'

export interface FixtureKitOptions {
  id?: string
  name?: string
  referenceAsset?: string
}

export const createDeterministicFixtureKit = async (
  kitRoot: string,
  options: FixtureKitOptions = {},
): Promise<LoadedVideoKit> => {
  const workspace = new ScopedWorkspace(kitRoot)
  const execute = {
    adapter: FIXTURE_IDENTITY_ADAPTER,
    behavior: 'identity-render',
    fixtureOnly: true,
    note: 'This proves kit transport/validation/execution plumbing only. It is not AI reverse engineering.',
  }

  await workspace.writeJson('execute.json', execute)
  await workspace.writeText(
    'components/README.md',
    'Fixture-only component placeholder. Replace with real reverse-engineered files when model intelligence is connected.\n',
  )

  const manifest: VideoKitManifestV1 = {
    schemaVersion: 1,
    id: options.id ?? 'fixture-identity-kit',
    name: options.name ?? 'Fixture Identity Kit',
    createdAt: new Date(0).toISOString(),
    source: {
      kind: 'fixture',
      referenceAsset: options.referenceAsset ?? 'reference.mp4',
      metadata: { fixtureOnly: true, aiGenerated: false },
    },
    execution: {
      adapter: FIXTURE_IDENTITY_ADAPTER,
      entrypoint: 'execute.json',
      metadata: { fixtureOnly: true },
    },
    files: [
      { path: 'execute.json', role: 'entrypoint', required: true },
      { path: 'components/README.md', role: 'component', required: true },
    ],
    metadata: {
      fixtureOnly: true,
      claim: 'plumbing-proof-only',
    },
  }

  await workspace.writeJson('kit.json', manifest)
  return await loadAndValidateKit(kitRoot)
}
