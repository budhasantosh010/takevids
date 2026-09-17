import { Box, Check, Download, Film, Pause, Play, Scissors, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { getModel } from '../../domain/models'
import { stageLabel, type WorkflowState } from '../../domain/workflow'
import { VideoKitPanel } from '../video-kit/VideoKitPanel'

interface PreviewWorkspaceProps {
  state: WorkflowState
  onExportReady: () => void
}

export function PreviewWorkspace({ state, onExportReady }: PreviewWorkspaceProps) {
  const [playing, setPlaying] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState('Story')
  const videoRef = useRef<HTMLVideoElement>(null)
  const executionModel = getModel(state.executionModelId)
  const activeAsset = state.stage === 'reference' || state.stage === 'analyzing' || !state.footage
    ? state.reference
    : state.footage
  const showEdited = state.stage === 'editing' || state.stage === 'review' || state.stage === 'exportReady'

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (playing) void video.play().catch(() => setPlaying(false))
    else video.pause()
  }, [playing, activeAsset?.url])

  return (
    <main className="preview-workspace">
      <header className="workspace-header workspace-header--simple">
        <div className="workspace-header__left">
          <span className="workspace-badge"><span className="workspace-badge__dot" /> {stageLabel[state.stage]}</span>
          <span className="workspace-simple-status">TakeVids handles the edit automatically</span>
        </div>
        <div className="workspace-header__actions">
          {state.stage === 'review' ? (
            <button type="button" className="export-button" onClick={onExportReady}><Download size={14} /> Finish & download</button>
          ) : state.stage === 'exportReady' ? (
            <button type="button" className="export-button is-ready"><Check size={14} /> Video ready</button>
          ) : (
            <button type="button" className="ghost-button" disabled><Download size={14} /> Download</button>
          )}
        </div>
      </header>

      <div className={clsx('workspace-body workspace-body--simple', !state.kit && 'no-kit')}>
        <section className="stage-area stage-area--simple">
          <div className="stage-toolbar">
            <div className="stage-label"><Film size={13} /><span>Video preview</span></div>
            <span className="canvas-format">9:16 · 1080 × 1920</span>
          </div>

          <div className="canvas-wrap canvas-wrap--simple">
            <div className={clsx('video-canvas', showEdited && 'video-canvas--edited')}>
              {activeAsset?.url ? (
                <video ref={videoRef} src={activeAsset.url} className="video-native" muted loop playsInline controls={false} />
              ) : (
                <div className="demo-frame">
                  <div className="demo-frame__ambient demo-frame__ambient--one" />
                  <div className="demo-frame__ambient demo-frame__ambient--two" />
                  <div className="demo-person">
                    <div className="demo-person__head" />
                    <div className="demo-person__body" />
                  </div>
                  <div className="demo-copy">
                    <span>{showEdited ? 'THE OLD WAY' : 'YOUR VIDEO'}</span>
                    <strong>{showEdited ? 'takes 4 tools.' : 'appears here.'}</strong>
                  </div>
                  <div className="demo-caption"><span>{showEdited ? 'One workflow.' : 'TakeVids learns the format'}</span><strong>{showEdited ? 'One reusable kit.' : 'and handles the edit.'}</strong></div>
                  <div className="tracked-callout">{showEdited ? 'KIT APPLIED' : 'AUTOMATIC'}</div>
                </div>
              )}

              {!activeAsset && (
                <div className="empty-canvas empty-canvas--simple">
                  <span className="empty-canvas__icon"><Sparkles size={22} /></span>
                  <strong>Your video will appear here</strong>
                  <p>Use the simple steps on the left. TakeVids handles everything else.</p>
                </div>
              )}

              {state.stage === 'analyzing' && (
                <div className="analysis-overlay">
                  <div className="scan-line" />
                  <span className="analysis-overlay__badge"><Sparkles size={14} /> Learning the editing system</span>
                  <div className="analysis-tag analysis-tag--one">Cuts</div>
                  <div className="analysis-tag analysis-tag--two">Captions</div>
                  <div className="analysis-tag analysis-tag--three">Pacing</div>
                </div>
              )}

              {state.stage === 'editing' && (
                <div className="editing-overlay">
                  <span className="editing-overlay__ring"><Scissors size={18} /></span>
                  <strong>Making your video</strong>
                  <p>{executionModel.name} · following {state.kit?.name}</p>
                </div>
              )}

              {state.stage === 'exportReady' && (
                <div className="ready-overlay"><Check size={18} /><span>Finished video ready</span></div>
              )}
            </div>
          </div>

          <div className="player-bar player-bar--simple">
            <div className="player-controls">
              <button type="button" className="play-button" aria-label={playing ? 'Pause video' : 'Play video'} onClick={() => setPlaying((current) => !current)}>{playing ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}</button>
              <span className="timecode">00:12 <em>/</em> {activeAsset?.durationLabel?.startsWith('00:') ? activeAsset.durationLabel : '00:37'}</span>
            </div>
            <span className="player-context">Automatic edit · just review the result</span>
          </div>
        </section>

        {state.kit && (
          <aside className="inspector inspector--simple">
            <div className="inspector-simple-head"><Box size={13} /><span>Video Kit</span></div>
            <div className="inspector-content">
              <VideoKitPanel kit={state.kit} selectedGroup={selectedGroup} onSelectGroup={setSelectedGroup} />
            </div>
          </aside>
        )}
      </div>
    </main>
  )
}
