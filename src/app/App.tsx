import { useEffect, useReducer, useState } from 'react'
import { workflowReducer, createInitialWorkflowState, type MediaAsset } from '../domain/workflow'
import { HomeDashboard } from '../features/home/HomeDashboard'
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

type AppView = 'home' | 'workspace'

export default function App() {
  const [state, dispatch] = useReducer(workflowReducer, undefined, createInitialWorkflowState)
  const [view, setView] = useState<AppView>('home')

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

  const startReferenceFlow = () => {
    dispatch({ type: 'RESET' })
    setView('workspace')
  }

  const startProvenKitFlow = (kitId: string) => {
    dispatch({ type: 'SELECT_PROVEN_KIT', kitId })
    setView('workspace')
  }

  const goHome = () => {
    dispatch({ type: 'RESET' })
    setView('home')
  }

  if (view === 'home') {
    return <HomeDashboard onReverseEngineer={startReferenceFlow} onUseKit={startProvenKitFlow} />
  }

  return (
    <div className="app-shell">
      <ChatPanel
        state={state}
        onGoHome={goHome}
        onReference={(asset) => dispatch({ type: 'REFERENCE_SELECTED', asset })}
        onDemoReference={() => dispatch({ type: 'REFERENCE_SELECTED', asset: demoReference })}
        onReverseModel={(modelId) => dispatch({ type: 'SET_REVERSE_MODEL', modelId })}
        onAnalyze={() => dispatch({ type: 'START_ANALYSIS' })}
        onFootage={(asset) => dispatch({ type: 'NEW_FOOTAGE_SELECTED', asset })}
        onDemoFootage={() => dispatch({ type: 'NEW_FOOTAGE_SELECTED', asset: demoFootage })}
        onStartEdit={() => dispatch({ type: 'START_EDIT' })}
        onRefinement={(instruction) => dispatch({ type: 'ADD_REFINEMENT', instruction })}
        onReset={() => dispatch({ type: 'RESET' })}
      />
      <PreviewWorkspace
        state={state}
        onExportReady={() => dispatch({ type: 'MARK_EXPORT_READY' })}
      />
    </div>
  )
}
