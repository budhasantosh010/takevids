import {
  ArrowLeft,
  ArrowUp,
  Check,
  ChevronRight,
  FileVideo2,
  Paperclip,
  RotateCcw,
  Sparkles,
  WandSparkles,
  Zap,
} from 'lucide-react'
import { useMemo, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { ModelPicker } from '../../components/ModelPicker'
import { fileToMediaAsset } from '../../domain/media'
import { getModel } from '../../domain/models'
import type { MediaAsset, WorkflowState } from '../../domain/workflow'

interface ChatPanelProps {
  state: WorkflowState
  onGoHome: () => void
  onReference: (asset: MediaAsset) => void
  onDemoReference: () => void
  onReverseModel: (modelId: string) => void
  onAnalyze: () => void
  onFootage: (asset: MediaAsset) => void
  onDemoFootage: () => void
  onStartEdit: () => void
  onRefinement: (instruction: string) => void
  onReset: () => void
}

export function ChatPanel({
  state,
  onGoHome,
  onReference,
  onDemoReference,
  onReverseModel,
  onAnalyze,
  onFootage,
  onDemoFootage,
  onStartEdit,
  onRefinement,
  onReset,
}: ChatPanelProps) {
  const [input, setInput] = useState('')
  const referenceInput = useRef<HTMLInputElement>(null)
  const footageInput = useRef<HTMLInputElement>(null)
  const reverseModel = getModel(state.reverseModelId)
  const isProvenKit = state.kit?.origin === 'proven' && !state.reference

  const handleFile = (
    event: ChangeEvent<HTMLInputElement>,
    callback: (asset: MediaAsset) => void,
    role: 'reference' | 'primary',
  ) => {
    const file = event.target.files?.[0]
    if (file) callback(fileToMediaAsset(file, role))
    event.target.value = ''
  }

  const handleDrop = (
    event: DragEvent<HTMLButtonElement>,
    callback: (asset: MediaAsset) => void,
    role: 'reference' | 'primary',
  ) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (file?.type.startsWith('video/')) callback(fileToMediaAsset(file, role))
  }

  const canChat = state.stage === 'review' || state.stage === 'exportReady'
  const helper = useMemo(() => {
    if (state.stage === 'reference') return 'Choose the AI, then add one reference video.'
    if (state.stage === 'analyzing') return 'TakeVids is turning the reference into reusable editing rules.'
    if (state.stage === 'kitReady' && !state.footage) return 'The editing system is ready. Add the video you want edited.'
    if (state.stage === 'kitReady') return 'Everything is ready. Let TakeVids make the edit.'
    if (state.stage === 'editing') return 'Applying the kit automatically…'
    return 'Ask for a change in plain English.'
  }, [state.stage, state.footage])

  const submit = () => {
    const value = input.trim()
    if (!value || !canChat) return
    onRefinement(value)
    setInput('')
  }

  return (
    <aside className="chat-panel">
      <header className="chat-panel__header chat-panel__header--simple">
        <button type="button" className="icon-button" aria-label="Back to home" title="Back to home" onClick={onGoHome}><ArrowLeft size={16} /></button>
        <div className="simple-project-title">
          <span className="eyebrow">TakeVids</span>
          <strong>{isProvenKit ? state.kit?.name : 'Reverse engineer a video'}</strong>
        </div>
        <button type="button" className="icon-button" aria-label="Reset project" title="Reset project" onClick={onReset}><RotateCcw size={15} /></button>
      </header>

      <div className="chat-scroll chat-scroll--simple">
        <div className="assistant-message">
          <div className="assistant-avatar"><Sparkles size={14} /></div>
          <div className="assistant-bubble">
            <strong>{isProvenKit ? `${state.kit?.name} is ready.` : 'Give me a video whose editing style already works.'}</strong>
            <p>{isProvenKit ? 'You do not need a reference. Add your footage and I’ll apply this proven workflow automatically.' : 'I’ll reverse engineer the cuts, captions, motion, pacing and sound into a reusable Video Kit.'}</p>
          </div>
        </div>

        {!state.kit && !state.reference && (
          <div className="assistant-message">
            <div className="assistant-avatar"><WandSparkles size={14} /></div>
            <div className="assistant-bubble assistant-bubble--control">
              <span className="step-label">1 · Choose AI</span>
              <strong>Use a TakeVids-tested model</strong>
              <p>Only models we have approved for this workflow appear here.</p>
              <ModelPicker role="reverse-engineer" value={state.reverseModelId} onChange={onReverseModel} />
            </div>
          </div>
        )}

        {!state.kit && !state.reference && (
          <div className="reference-card reference-card--prominent">
            <span className="step-label">2 · Add reference</span>
            <button
              type="button"
              className="dropzone dropzone--large"
              onClick={() => referenceInput.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleDrop(event, onReference, 'reference')}
            >
              <span className="dropzone__icon"><FileVideo2 size={19} /></span>
              <span className="dropzone__copy">
                <strong>Drop your reference video</strong>
                <span>MP4, MOV or WEBM</span>
              </span>
              <span className="dropzone__action">Browse</span>
            </button>
            <input ref={referenceInput} hidden type="file" accept="video/*" onChange={(event) => handleFile(event, onReference, 'reference')} />
            <button type="button" className="text-action" onClick={onDemoReference}>Use demo reference instead <ChevronRight size={13} /></button>
          </div>
        )}

        {state.reference && (
          <div className="user-message">
            <div className="file-chip">
              <span className="file-chip__icon"><FileVideo2 size={15} /></span>
              <span><strong>{state.reference.name}</strong><small>{state.reference.durationLabel} · Reference</small></span>
            </div>
          </div>
        )}

        {state.reference && !state.kit && (
          <div className="assistant-message">
            <div className="assistant-avatar"><WandSparkles size={14} /></div>
            <div className="assistant-bubble assistant-bubble--control">
              <strong>{state.stage === 'analyzing' ? 'Building your Video Kit' : 'Ready to learn this format'}</strong>
              <p>{state.stage === 'analyzing' ? `${reverseModel.name} is mapping the repeatable editing system.` : `I’ll use ${reverseModel.name} and save the result as a reusable workflow.`}</p>
              {state.stage === 'reference' && (
                <button type="button" className="primary-action" onClick={onAnalyze}><Sparkles size={15} /> Reverse engineer this video</button>
              )}
              {state.stage === 'analyzing' && <div className="analysis-progress"><span /><span /><span /><span /></div>}
            </div>
          </div>
        )}

        {state.kit && (
          <div className="assistant-message">
            <div className="assistant-avatar assistant-avatar--success"><Check size={14} /></div>
            <div className="assistant-bubble">
              <div className="bubble-title-row"><strong>{isProvenKit ? 'Proven kit selected' : 'Video Kit built'}</strong><span className="success-pill">Ready</span></div>
              <p><strong className="inline-kit-name">{state.kit.name}</strong> · {state.kit.summary}</p>
            </div>
          </div>
        )}

        {state.kit && !state.footage && (
          <div className="reference-card reference-card--footage reference-card--prominent">
            <span className="step-label">Next · Add your video</span>
            <button
              type="button"
              className="dropzone dropzone--large"
              onClick={() => footageInput.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleDrop(event, onFootage, 'primary')}
            >
              <span className="dropzone__icon dropzone__icon--green"><Zap size={19} /></span>
              <span className="dropzone__copy">
                <strong>Drop the video you want edited</strong>
                <span>TakeVids applies the kit automatically</span>
              </span>
              <span className="dropzone__action">Browse</span>
            </button>
            <input ref={footageInput} hidden type="file" accept="video/*" onChange={(event) => handleFile(event, onFootage, 'primary')} />
            <button type="button" className="text-action" onClick={onDemoFootage}>Use demo footage instead <ChevronRight size={13} /></button>
          </div>
        )}

        {state.footage && (
          <div className="user-message">
            <div className="file-chip file-chip--footage">
              <span className="file-chip__icon"><FileVideo2 size={15} /></span>
              <span><strong>{state.footage.name}</strong><small>{state.footage.durationLabel} · Your video</small></span>
            </div>
          </div>
        )}

        {state.kit && state.footage && (state.stage === 'kitReady' || state.stage === 'editing') && (
          <div className="assistant-message">
            <div className="assistant-avatar"><Zap size={14} /></div>
            <div className="assistant-bubble assistant-bubble--control">
              <strong>{state.stage === 'editing' ? 'Editing automatically' : 'Ready to make your video'}</strong>
              <p>{state.stage === 'editing' ? 'Applying the kit’s cuts, visuals, motion and sound rules.' : 'No timeline. No manual setup. The kit already knows how this format should be edited.'}</p>
              {state.stage === 'kitReady' && (
                <button type="button" className="primary-action primary-action--green" onClick={onStartEdit}><Zap size={15} /> Edit my video</button>
              )}
              {state.stage === 'editing' && <div className="edit-progress"><span /></div>}
            </div>
          </div>
        )}

        {(state.stage === 'review' || state.stage === 'exportReady') && (
          <div className="assistant-message">
            <div className="assistant-avatar assistant-avatar--success"><Check size={14} /></div>
            <div className="assistant-bubble">
              <div className="bubble-title-row"><strong>{state.stage === 'exportReady' ? 'Final video is ready' : `Your edit is ready · v${state.revision}`}</strong><span className="success-pill">Finished</span></div>
              <p>{state.stage === 'exportReady' ? 'You can download the finished result from the preview.' : 'Watch it on the right. If you want a change, describe it here like you would to an editor.'}</p>
            </div>
          </div>
        )}

        {state.refinements.map((instruction, index) => (
          <div className="refinement-pair" key={`${instruction}-${index}`}>
            <div className="plain-user-message">{instruction}</div>
            <div className="assistant-message assistant-message--compact">
              <div className="assistant-avatar assistant-avatar--success"><Check size={13} /></div>
              <div className="assistant-bubble"><strong>Applied to revision {index + 2}</strong><p>The kit stays intact while this change is applied.</p></div>
            </div>
          </div>
        ))}
      </div>

      <div className="composer-wrap">
        <div className="composer-helper"><span className={`status-dot ${canChat ? 'is-live' : ''}`} />{helper}</div>
        <div className="composer">
          <button type="button" className="composer__attach" aria-label="Attach media" disabled={!canChat}><Paperclip size={15} /></button>
          <textarea
            value={input}
            disabled={!canChat}
            rows={1}
            placeholder={canChat ? 'Make the first 3 seconds punchier…' : 'Chat unlocks when your first edit is ready'}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                submit()
              }
            }}
          />
          <button type="button" className="composer__send" aria-label="Send change" disabled={!canChat || !input.trim()} onClick={submit}><ArrowUp size={15} /></button>
        </div>
        <div className="composer-note">TakeVids keeps the editing system consistent for you.</div>
      </div>
    </aside>
  )
}
