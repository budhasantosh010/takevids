import { useEffect, useReducer } from 'react'
import { workflowReducer, createInitialWorkflowState, type MediaAsset } from '../domain/workflow'
import { ChatPanel } from '../features/workspace/ChatPanel'
import { PreviewWorkspace } from '../features/workspace/PreviewWorkspace'

const demoReference: MediaAsset = {
  id: 'demo-reference',
  name: 'reference-launch-video.mp4',
  durationLabel: '00:37',
  kind: 'video',
  role: 'reference',
}

const demoFootage: MediaAsset = {
  id: 'demo-footage',
  name: 'founder-take-03.mp4',
  durationLabel: '00:42',
  kind: 'video',
  role: 'primary',
}

const demoMedia: MediaAsset[] = [
  {
    id: 'demo-broll-dashboard',
    name: 'product-dashboard-broll.mp4',
    durationLabel: '00:08',
    kind: 'video',
    role: 'broll',
    sizeLabel: '18 MB',
  },
  {
    id: 'demo-image-proof',
    name: 'customer-proof.png',
    durationLabel: 'Image',
    kind: 'image',
    role: 'image',
    sizeLabel: '1.4 MB',
  },
  {
    id: 'demo-music-bed',
    name: 'minimal-tech-bed.mp3',
    durationLabel: 'Audio',
    kind: 'audio',
    role: 'music',
    sizeLabel: '4.8 MB',
  },
  {
    id: 'demo-sfx-impact',
    name: 'soft-impact-sfx.wav',
    durationLabel: 'Audio',
    kind: 'audio',
    role: 'sfx',
    sizeLabel: '380 KB',
  },
]

export default function App() {
  const [state, dispatch] = useReducer(workflowReducer, undefined, createInitialWorkflowState)

  useEffect(() => {
    if (state.stage === 'analyzing') {
      const timeout = window.setTimeout(() => dispatch({ type: 'ANALYSIS_COMPLETED' }), 1450)
      return () => window.clearTimeout(timeout)
    }
    if (state.stage === 'editing') {
      const timeout = window.setTimeout(() => dispatch({ type: 'EDIT_COMPLETED' }), 1550)
      return () => window.clearTimeout(timeout)
    }
  }, [state.stage])

  return (
    <div className="app-shell">
      <ChatPanel
        state={state}
        onReference={(asset) => dispatch({ type: 'REFERENCE_SELECTED', asset })}
        onDemoReference={() => dispatch({ type: 'REFERENCE_SELECTED', asset: demoReference })}
        onReverseModel={(modelId) => dispatch({ type: 'SET_REVERSE_MODEL', modelId })}
        onAnalyze={() => dispatch({ type: 'START_ANALYSIS' })}
        onFootage={(asset) => dispatch({ type: 'NEW_FOOTAGE_SELECTED', asset })}
        onDemoFootage={() => dispatch({ type: 'NEW_FOOTAGE_SELECTED', asset: demoFootage })}
        onExecutionModel={(modelId) => dispatch({ type: 'SET_EXECUTION_MODEL', modelId })}
        onStartEdit={() => dispatch({ type: 'START_EDIT' })}
        onRefinement={(instruction) => dispatch({ type: 'ADD_REFINEMENT', instruction })}
        onReset={() => dispatch({ type: 'RESET' })}
      />
      <PreviewWorkspace
        state={state}
        onExportReady={() => dispatch({ type: 'MARK_EXPORT_READY' })}
        onAddMediaAssets={(assets) => dispatch({ type: 'ADD_MEDIA_ASSETS', assets })}
        onPlaceMediaAsset={(assetId) => dispatch({ type: 'PLACE_MEDIA_ASSET', assetId })}
        onUseMediaAsFootage={(asset) => dispatch({ type: 'NEW_FOOTAGE_SELECTED', asset })}
        onRemoveMediaAsset={(assetId) => dispatch({ type: 'REMOVE_MEDIA_ASSET', assetId })}
        onLoadDemoMedia={() => dispatch({ type: 'ADD_MEDIA_ASSETS', assets: demoMedia })}
      />
    </div>
  )
}
