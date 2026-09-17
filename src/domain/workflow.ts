export type WorkflowStage =
  | 'reference'
  | 'analyzing'
  | 'kitReady'
  | 'editing'
  | 'review'
  | 'exportReady'

export type MediaKind = 'video' | 'image' | 'audio'
export type MediaRole = 'reference' | 'primary' | 'broll' | 'image' | 'music' | 'sfx' | 'other'

export interface MediaAsset {
  id: string
  name: string
  url?: string
  durationLabel: string
  kind?: MediaKind
  role?: MediaRole
  mimeType?: string
  sizeLabel?: string
}

export interface KitElement {
  id: string
  label: string
  detail: string
  group: 'Story' | 'Visual' | 'Motion' | 'Audio'
}

export interface VideoKit {
  id: string
  name: string
  status: 'ready'
  sourceName: string
  elements: KitElement[]
}

export interface WorkflowState {
  stage: WorkflowStage
  reference?: MediaAsset
  footage?: MediaAsset
  reverseModelId: string
  executionModelId: string
  kit?: VideoKit
  revision: number
  refinements: string[]
  mediaAssets: MediaAsset[]
  placedAssetIds: string[]
}

export type WorkflowEvent =
  | { type: 'REFERENCE_SELECTED'; asset: MediaAsset }
  | { type: 'SET_REVERSE_MODEL'; modelId: string }
  | { type: 'START_ANALYSIS' }
  | { type: 'ANALYSIS_COMPLETED' }
  | { type: 'NEW_FOOTAGE_SELECTED'; asset: MediaAsset }
  | { type: 'SET_EXECUTION_MODEL'; modelId: string }
  | { type: 'START_EDIT' }
  | { type: 'EDIT_COMPLETED' }
  | { type: 'ADD_REFINEMENT'; instruction: string }
  | { type: 'ADD_MEDIA_ASSETS'; assets: MediaAsset[] }
  | { type: 'PLACE_MEDIA_ASSET'; assetId: string }
  | { type: 'REMOVE_MEDIA_ASSET'; assetId: string }
  | { type: 'MARK_EXPORT_READY' }
  | { type: 'RESET' }

export const inferMediaKind = (mimeType: string, fileName: string): MediaKind => {
  const normalizedMime = mimeType.toLowerCase()
  const extension = fileName.toLowerCase().split('.').pop() ?? ''

  if (normalizedMime.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif'].includes(extension)) {
    return 'image'
  }
  if (normalizedMime.startsWith('audio/') || ['mp3', 'wav', 'm4a', 'aac', 'flac', 'ogg'].includes(extension)) {
    return 'audio'
  }
  return 'video'
}

export const inferMediaRole = (kind: MediaKind, fileName: string): MediaRole => {
  const normalizedName = fileName.toLowerCase()
  if (kind === 'image') return 'image'
  if (kind === 'audio') {
    if (/sfx|effect|whoosh|impact|click|hit|riser/.test(normalizedName)) return 'sfx'
    return 'music'
  }
  if (/b-?roll|cutaway|screen|product|demo/.test(normalizedName)) return 'broll'
  return 'broll'
}

export const createInitialWorkflowState = (): WorkflowState => ({
  stage: 'reference',
  reverseModelId: 'opus-5-max',
  executionModelId: 'deepseek-v4.1-flash',
  revision: 0,
  refinements: [],
  mediaAssets: [],
  placedAssetIds: [],
})

const createKit = (sourceName: string): VideoKit => ({
  id: 'kit-launch-format',
  name: 'Launch Story Kit',
  status: 'ready',
  sourceName,
  elements: [
    { id: 'hook', label: 'Hook rhythm', detail: 'Cold open → payoff tease in first beat', group: 'Story' },
    { id: 'pacing', label: 'Cut pacing', detail: 'Fast opening cadence, breathing room after proof', group: 'Story' },
    { id: 'captions', label: 'Caption system', detail: '2-line max, phrase-led emphasis, safe-zone locked', group: 'Visual' },
    { id: 'type', label: 'Typography', detail: 'Heavy grotesk hierarchy with restrained accent text', group: 'Visual' },
    { id: 'motion', label: 'Motion language', detail: 'Push-ins, tracked callouts, masked transitions', group: 'Motion' },
    { id: 'camera', label: 'Camera treatment', detail: 'Subject-first crop with selective punch zooms', group: 'Motion' },
    { id: 'sound', label: 'Sound grammar', detail: 'Beat-aware cuts, light risers, impact accents', group: 'Audio' },
    { id: 'mix', label: 'Voice + music mix', detail: 'Voice dominant; music ducks beneath key phrases', group: 'Audio' },
  ],
})

const mergeAssets = (current: MediaAsset[], incoming: MediaAsset[]) => {
  const byId = new Map(current.map((asset) => [asset.id, asset]))
  for (const asset of incoming) byId.set(asset.id, asset)
  return [...byId.values()]
}

export const workflowReducer = (
  state: WorkflowState,
  event: WorkflowEvent,
): WorkflowState => {
  switch (event.type) {
    case 'REFERENCE_SELECTED':
      return {
        ...createInitialWorkflowState(),
        reverseModelId: state.reverseModelId,
        executionModelId: state.executionModelId,
        reference: { ...event.asset, kind: event.asset.kind ?? 'video', role: 'reference' },
      }
    case 'SET_REVERSE_MODEL':
      return { ...state, reverseModelId: event.modelId }
    case 'START_ANALYSIS':
      return state.reference ? { ...state, stage: 'analyzing' } : state
    case 'ANALYSIS_COMPLETED':
      return state.reference
        ? { ...state, stage: 'kitReady', kit: createKit(state.reference.name) }
        : state
    case 'NEW_FOOTAGE_SELECTED':
      return state.kit
        ? {
            ...state,
            footage: { ...event.asset, kind: event.asset.kind ?? 'video', role: 'primary' },
            stage: 'kitReady',
          }
        : state
    case 'SET_EXECUTION_MODEL':
      return { ...state, executionModelId: event.modelId }
    case 'START_EDIT':
      return state.kit && state.footage ? { ...state, stage: 'editing' } : state
    case 'EDIT_COMPLETED':
      return state.stage === 'editing' ? { ...state, stage: 'review', revision: 1 } : state
    case 'ADD_REFINEMENT': {
      const instruction = event.instruction.trim()
      if (!instruction || !state.kit) return state
      return {
        ...state,
        stage: state.stage === 'exportReady' ? 'review' : state.stage,
        revision: Math.max(1, state.revision) + 1,
        refinements: [...state.refinements, instruction],
      }
    }
    case 'ADD_MEDIA_ASSETS':
      return { ...state, mediaAssets: mergeAssets(state.mediaAssets, event.assets) }
    case 'PLACE_MEDIA_ASSET':
      return state.mediaAssets.some((asset) => asset.id === event.assetId) && !state.placedAssetIds.includes(event.assetId)
        ? { ...state, placedAssetIds: [...state.placedAssetIds, event.assetId] }
        : state
    case 'REMOVE_MEDIA_ASSET':
      return {
        ...state,
        mediaAssets: state.mediaAssets.filter((asset) => asset.id !== event.assetId),
        placedAssetIds: state.placedAssetIds.filter((assetId) => assetId !== event.assetId),
      }
    case 'MARK_EXPORT_READY':
      return state.stage === 'review' ? { ...state, stage: 'exportReady' } : state
    case 'RESET':
      return createInitialWorkflowState()
    default:
      return state
  }
}

export const stageLabel: Record<WorkflowStage, string> = {
  reference: 'Reference',
  analyzing: 'Reverse engineering',
  kitReady: 'Video Kit',
  editing: 'Editing',
  review: 'Review',
  exportReady: 'Ready to export',
}
