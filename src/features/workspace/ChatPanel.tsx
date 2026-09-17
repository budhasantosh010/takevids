import {
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
  onReference: (asset: MediaAsset) => void
  onDemoReference: () => void
  onReverseModel: (modelId: string) => void
  onAnalyze: () => void
  onFootage: (asset: MediaAsset) => void
  onDemoFootage: () => void
  onExecutionModel: (modelId: string) => void
  onStartEdit: () => void
  onRefinement: (instruction: string) => void
  onReset: () => void
}

export function ChatPanel({
  state,
  onReference,
  onDemoReference,
  onReverseModel,
  onAnalyze,
  onFootage,
  onDemoFootage,
  onExecutionModel,
  onStartEdit,
  onRefinement,
  onReset,
}: ChatPanelProps) {
  const [input, setInput] = useState('')
  const referenceInput = useRef<HTMLInputElement>(null)
  const footageInput = useRef<HTMLInputElement>(null)
  const reverseModel = getModel(state.reverseModelId)
  const executionModel = getModel(state.executionModelId)

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
    if (state.stage === 'reference') return 'Upload a reference or use the demo to start.'
    if (state.stage === 'analyzing') return 'Mapping the repeatable editing system…'
    if (state.stage === 'kitReady' && !state.footage) return 'Your kit is ready. Add the footage you want edited.'
    if (state.stage === 'kitReady') return 'New footage is ready. Run the reusable kit.'
    if (state.stage === 'editing') return 'Applying kit rules to the new footage…'
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
      <header className="chat-panel__header">
        <div>
          <span className="eyebrow">TakeVids project</span>
          <div className="project-title-row">
            <h1>Launch format study</h1>
            <span className="project-saved"><Check size={11} /> Saved</span>
          </div>
        </div>
        <button type="button" className="icon-button" title="Reset demo" onClick={onReset}><RotateCcw size={15} /></button>
      </header>

      <div className="chat-scroll">
        <div className="assistant-message">
          <div className="assistant-avatar"><Sparkles size={14} /></div>
          <div className="assistant-bubble">
            <strong>What should we reverse engineer?</strong>
            <p>Give me a video whose format already works. I’ll turn its edit decisions into a reusable system, not just copy the pixels.</p>
          </div>
        </div>

        {!state.reference ? (
          <div className="reference-card">
            <button
              type="button"
              className="dropzone"
              onClick={() => referenceInput.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleDrop(event, onReference, 'reference')}
            >
              <span className="dropzone__icon"><FileVideo2 size={19} /></span>
              <span className="dropzone__copy">
                <strong>Drop reference video</strong>
                <span>MP4, MOV or WEBM · local preview only</span>
              </span>
              <span className="dropzone__action">Browse</span>
            </button>
            <input ref={referenceInput} hidden type="file" accept="video/*" onChange={(event) => handleFile(event, onReference, 'reference')} />
            <button type="button" className="text-action" onClick={onDemoReference}>Use demo reference instead <ChevronRight size={13} /></button>
          </div>
        ) : (
          <div className="user-message">
            <div className="file-chip">
              <span className="file-chip__icon"><FileVideo2 size={15} /></span>
              <span><strong>{state.reference.name}</strong><small>{state.reference.durationLabel} · Reference</small></span>
            </div>
          </div>
        )}

        {state.reference && (
          <div className="assistant-message">
            <div className="assistant-avatar"><WandSparkles size={14} /></div>
            <div className="assistant-bubble assistant-bubble--control">
              <strong>{state.stage === 'analyzing' ? 'Reverse engineering the format' : 'Build the editing system once'}</strong>
              <p>{state.stage === 'analyzing' ? `Using ${reverseModel.name} to map structure, typography, motion, sound and timing.` : 'The expensive thinking happens once. The reusable kit becomes the constraint for every repeat edit.'}</p>
              <details className="model-settings">
                <summary><span>Quality model</span><strong>{reverseModel.name}</strong></summary>
                <ModelPicker role="reverse-engineer" value={state.reverseModelId} onChange={onReverseModel} />
              </details>
              {state.stage === 'reference' && (
                <button type="button" className="primary-action" onClick={onAnalyze}><Sparkles size={15} /> Reverse engineer this video</button>
              )}
              {state.stage === 'analyzing' && (
                <div className="analysis-progress"><span /><span /><span /><span /></div>
              )}
            </div>
          </div>
        )}

        {state.kit && (
          <div className="assistant-message">
            <div className="assistant-avatar assistant-avatar--success"><Check size={14} /></div>
            <div className="assistant-bubble">
              <div className="bubble-title-row"><strong>Video Kit built</strong><span className="success-pill">8 rules captured</span></div>
              <p>The reference is now a reusable workflow. Add the footage you want edited; the kit keeps the style consistent.</p>
            </div>
          </div>
        )}

        {state.kit && !state.footage && (
          <div className="reference-card reference-card--footage">
            <button
              type="button"
              className="dropzone"
              onClick={() => footageInput.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleDrop(event, onFootage, 'primary')}
            >
              <span className="dropzone__icon dropzone__icon--green"><Zap size={19} /></span>
              <span className="dropzone__copy">
                <strong>Add your new footage</strong>
                <span>The kit will enforce the reference format</span>
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
              <span><strong>{state.footage.name}</strong><small>{state.footage.durationLabel} · New footage</small></span>
            </div>
          </div>
        )}

        {state.kit && state.footage && (
          <div className="assistant-message">
            <div className="assistant-avatar"><Zap size={14} /></div>
            <div className="assistant-bubble assistant-bubble--control">
              <strong>{state.stage === 'editing' ? 'Applying the kit' : 'Ready to make the edit'}</strong>
              <p>{state.stage === 'editing' ? `${executionModel.name} is following the kit's locked edit grammar.` : 'TakeVids already knows the editing system. Run it on the new footage, then refine anything by chat.'}</p>
              <details className="model-settings">
                <summary><span>Execution model</span><strong>{executionModel.name}</strong></summary>
                <ModelPicker role="execute" value={state.executionModelId} onChange={onExecutionModel} />
              </details>
              {state.stage === 'kitReady' && (
                <button type="button" className="primary-action primary-action--green" onClick={onStartEdit}><Zap size={15} /> Edit this video</button>
              )}
              {state.stage === 'editing' && <div className="edit-progress"><span /></div>}
            </div>
          </div>
        )}

        {(state.stage === 'review' || state.stage === 'exportReady') && (
          <div className="assistant-message">
            <div className="assistant-avatar assistant-avatar--success"><Check size={14} /></div>
            <div className="assistant-bubble">
              <div className="bubble-title-row"><strong>{state.stage === 'exportReady' ? 'Final edit is ready' : `Edit ready · v${state.revision}`}</strong><span className="success-pill">Kit enforced</span></div>
              <p>{state.stage === 'exportReady' ? 'The project is export-ready. Keep chatting if you want another revision.' : 'Review the video on the right. If anything feels wrong, just tell me what to change.'}</p>
            </div>
          </div>
        )}

        {state.refinements.map((instruction, index) => (
          <div className="refinement-pair" key={`${instruction}-${index}`}>
            <div className="plain-user-message">{instruction}</div>
            <div className="assistant-message assistant-message--compact">
              <div className="assistant-avatar assistant-avatar--success"><Check size={13} /></div>
              <div className="assistant-bubble"><strong>Applied to revision {index + 2}</strong><p>Updated while preserving the kit’s style rules.</p></div>
            </div>
          </div>
        ))}
      </div>

      <div className="composer-wrap">
        <div className="composer-helper"><span className={canChat ? 'status-dot is-live' : 'status-dot'} />{helper}</div>
        <div className="composer">
          <button type="button" className="composer__attach" title="Attach media"><Paperclip size={17} /></button>
          <textarea
            value={input}
            disabled={!canChat}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                submit()
              }
            }}
            placeholder={canChat ? 'Make the first 3 seconds punchier…' : 'Finish the current step to chat-refine the edit'}
            rows={1}
          />
          <button type="button" className="composer__send" disabled={!canChat || !input.trim()} onClick={submit}><ArrowUp size={17} /></button>
        </div>
        <div className="composer-note">Enter to send · Shift+Enter for a new line</div>
      </div>
    </aside>
  )
}
