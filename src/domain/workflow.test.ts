import { describe, expect, it } from 'vitest'
import { createInitialWorkflowState, inferMediaKind, workflowReducer } from './workflow'

const reference = {
  id: 'ref-1',
  name: 'launch-reference.mp4',
  url: 'blob:reference',
  durationLabel: '00:37',
  kind: 'video' as const,
  role: 'reference' as const,
}

const footage = {
  id: 'footage-1',
  name: 'new-footage.mp4',
  url: 'blob:footage',
  durationLabel: '00:42',
  kind: 'video' as const,
  role: 'primary' as const,
}

describe('TakeVids workflow', () => {
  it('keeps reverse engineering and execution as separate model roles', () => {
    let state = createInitialWorkflowState()
    state = workflowReducer(state, { type: 'REFERENCE_SELECTED', asset: reference })
    state = workflowReducer(state, { type: 'SET_REVERSE_MODEL', modelId: 'opus-5-max' })
    state = workflowReducer(state, { type: 'START_ANALYSIS' })
    state = workflowReducer(state, { type: 'ANALYSIS_COMPLETED' })
    state = workflowReducer(state, { type: 'NEW_FOOTAGE_SELECTED', asset: footage })
    state = workflowReducer(state, { type: 'SET_EXECUTION_MODEL', modelId: 'deepseek-v4.1-flash' })
    state = workflowReducer(state, { type: 'START_EDIT' })

    expect(state.stage).toBe('editing')
    expect(state.reverseModelId).toBe('opus-5-max')
    expect(state.executionModelId).toBe('deepseek-v4.1-flash')
    expect(state.kit?.status).toBe('ready')
  })

  it('can move from reference to an export-ready edited video', () => {
    let state = createInitialWorkflowState()
    state = workflowReducer(state, { type: 'REFERENCE_SELECTED', asset: reference })
    state = workflowReducer(state, { type: 'START_ANALYSIS' })
    state = workflowReducer(state, { type: 'ANALYSIS_COMPLETED' })
    state = workflowReducer(state, { type: 'NEW_FOOTAGE_SELECTED', asset: footage })
    state = workflowReducer(state, { type: 'START_EDIT' })
    state = workflowReducer(state, { type: 'EDIT_COMPLETED' })
    state = workflowReducer(state, { type: 'ADD_REFINEMENT', instruction: 'Make the hook punchier.' })
    state = workflowReducer(state, { type: 'MARK_EXPORT_READY' })

    expect(state.stage).toBe('exportReady')
    expect(state.revision).toBe(2)
    expect(state.refinements).toEqual(['Make the hook punchier.'])
  })

  it('accepts a mixed media bin and places an asset into the edit', () => {
    const broll = {
      id: 'broll-1',
      name: 'office-broll.mp4',
      durationLabel: '00:08',
      kind: 'video' as const,
      role: 'broll' as const,
    }
    const logo = {
      id: 'image-1',
      name: 'product-screen.png',
      durationLabel: 'Image',
      kind: 'image' as const,
      role: 'image' as const,
    }
    const music = {
      id: 'audio-1',
      name: 'bed-music.mp3',
      durationLabel: 'Audio',
      kind: 'audio' as const,
      role: 'music' as const,
    }

    let state = createInitialWorkflowState()
    state = workflowReducer(state, { type: 'ADD_MEDIA_ASSETS', assets: [broll, logo, music] })
    state = workflowReducer(state, { type: 'PLACE_MEDIA_ASSET', assetId: 'broll-1' })

    expect(state.mediaAssets).toHaveLength(3)
    expect(state.placedAssetIds).toEqual(['broll-1'])
  })

  it('infers media kinds from mime type or extension', () => {
    expect(inferMediaKind('video/mp4', 'take.mp4')).toBe('video')
    expect(inferMediaKind('image/png', 'still.png')).toBe('image')
    expect(inferMediaKind('audio/mpeg', 'music.mp3')).toBe('audio')
    expect(inferMediaKind('', 'voice.wav')).toBe('audio')
  })
})
