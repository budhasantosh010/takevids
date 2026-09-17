import {
  Box,
  Check,
  Download,
  Film,
  FolderOpen,
  Layers3,
  Pause,
  Play,
  Scissors,
  Sparkles,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type DragEvent } from 'react'
import clsx from 'clsx'
import { ProgressSteps } from '../../components/ProgressSteps'
import { getModel } from '../../domain/models'
import { stageLabel, type MediaAsset, type WorkflowState } from '../../domain/workflow'
import { VideoKitPanel } from '../video-kit/VideoKitPanel'
import { MediaPanel } from './MediaPanel'

interface PreviewWorkspaceProps {
  state: WorkflowState
  onExportReady: () => void
  onAddMediaAssets: (assets: MediaAsset[]) => void
  onPlaceMediaAsset: (assetId: string) => void
  onUseMediaAsFootage: (asset: MediaAsset) => void
  onRemoveMediaAsset: (assetId: string) => void
  onLoadDemoMedia: () => void
}

type InspectorTab = 'kit' | 'media'

export function PreviewWorkspace({
  state,
  onExportReady,
  onAddMediaAssets,
  onPlaceMediaAsset,
  onUseMediaAsFootage,
  onRemoveMediaAsset,
  onLoadDemoMedia,
}: PreviewWorkspaceProps) {
  const [playing, setPlaying] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState('Story')
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('kit')
  const [dropActive, setDropActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const reverseModel = getModel(state.reverseModelId)
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

  const usedAssets = useMemo(
    () => state.mediaAssets.filter((asset) => state.placedAssetIds.includes(asset.id)),
    [state.mediaAssets, state.placedAssetIds],
  )

  const placeDroppedAsset = (event: DragEvent<HTMLElement>) => {
    event.preventDefault()
    setDropActive(false)
    const assetId = event.dataTransfer.getData('application/x-takevids-asset') || event.dataTransfer.getData('text/plain')
    if (!assetId) return
    const asset = state.mediaAssets.find((item) => item.id === assetId)
    if (!asset) return

    if (state.kit && !state.footage && asset.kind === 'video') {
      onUseMediaAsFootage(asset)
      return
    }
    onPlaceMediaAsset(assetId)
  }

  return (
    <main className="preview-workspace">
      <header className="workspace-header">
        <div className="workspace-header__left">
          <span className="workspace-badge"><span className="workspace-badge__dot" /> {stageLabel[state.stage]}</span>
          <ProgressSteps stage={state.stage} />
        </div>
        <div className="workspace-header__actions">
          {state.stage === 'review' ? (
            <button type="button" className="export-button" onClick={onExportReady}><Download size={14} /> Export video</button>
          ) : state.stage === 'exportReady' ? (
            <button type="button" className="export-button is-ready"><Check size={14} /> Export ready</button>
          ) : (
            <button type="button" className="ghost-button" disabled><Download size={14} /> Export</button>
          )}
        </div>
      </header>

      <div className="workspace-body">
        <section className="stage-area">
          <div className="stage-toolbar">
            <div className="stage-label"><Film size={13} /><span>Preview</span></div>
            <div className="stage-toolbar__right">
              <button type="button" className="media-shortcut" onClick={() => setInspectorTab('media')}>
                <FolderOpen size={12} /> Media {state.mediaAssets.length ? <span>{state.mediaAssets.length}</span> : null}
              </button>
              <span className="canvas-format">9:16 · 1080 × 1920</span>
            </div>
          </div>

          <div
            className={clsx('canvas-wrap', dropActive && 'is-drop-active')}
            onDragOver={(event) => {
              event.preventDefault()
              setDropActive(true)
            }}
            onDragLeave={() => setDropActive(false)}
            onDrop={placeDroppedAsset}
          >
            {dropActive && (
              <div className="canvas-drop-hint">
                <FolderOpen size={19} />
                <strong>{state.kit && !state.footage ? 'Use as main footage' : 'Add media to this edit'}</strong>
              </div>
            )}

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
                    <span>{showEdited ? 'THE OLD WAY' : 'WATCH THIS'}</span>
                    <strong>{showEdited ? 'takes 4 tools.' : 'before you edit.'}</strong>
                  </div>
                  <div className="demo-caption"><span>{showEdited ? 'One workflow.' : 'This format works because'}</span><strong>{showEdited ? 'One reusable kit.' : 'every cut has a job.'}</strong></div>
                  <div className="tracked-callout">{showEdited ? 'KIT RULE 04' : 'MOTION TRACK'}</div>
                </div>
              )}

              {!activeAsset && (
                <div className="empty-canvas">
                  <span className="empty-canvas__icon"><Sparkles size={22} /></span>
                  <strong>Your edit appears here</strong>
                  <p>Start by dropping a reference video into the chat.</p>
                </div>
              )}

              {state.stage === 'analyzing' && (
                <div className="analysis-overlay">
                  <div className="scan-line" />
                  <span className="analysis-overlay__badge"><Sparkles size={14} /> Reverse engineering</span>
                  <div className="analysis-tag analysis-tag--one">Caption hierarchy</div>
                  <div className="analysis-tag analysis-tag--two">Camera motion</div>
                  <div className="analysis-tag analysis-tag--three">Hook pacing</div>
                </div>
              )}

              {state.stage === 'editing' && (
                <div className="editing-overlay">
                  <span className="editing-overlay__ring"><Scissors size={18} /></span>
                  <strong>Applying {state.kit?.name}</strong>
                  <p>{executionModel.name} · kit-constrained execution</p>
                </div>
              )}

              {usedAssets.length > 0 && showEdited && (
                <div className="used-media-badge"><Layers3 size={11} /> {usedAssets.length} supporting asset{usedAssets.length === 1 ? '' : 's'} used</div>
              )}

              {state.stage === 'exportReady' && (
                <div className="ready-overlay"><Check size={18} /><span>Final edit ready</span></div>
              )}
            </div>
          </div>

          <div className="player-bar">
            <div className="player-controls">
              <button type="button" className="play-button" aria-label={playing ? 'Pause video' : 'Play video'} onClick={() => setPlaying((current) => !current)}>{playing ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}</button>
              <span className="timecode">00:12 <em>/</em> {activeAsset?.durationLabel?.startsWith('00:') ? activeAsset.durationLabel : '00:37'}</span>
            </div>
            <span className="player-context">AI edit · timeline is optional</span>
          </div>

          <div
            className={clsx('timeline', dropActive && 'is-drop-active')}
            onDragOver={(event) => {
              event.preventDefault()
              setDropActive(true)
            }}
            onDragLeave={() => setDropActive(false)}
            onDrop={placeDroppedAsset}
          >
            <div className="timeline__ruler"><span>00:00</span><span>00:10</span><span>00:20</span><span>00:30</span><span>00:37</span></div>
            <div className="timeline__playhead"><span /></div>
            <div className="track track--video"><span className="track-label">V1</span><div className="clip clip--hook">Hook</div><div className="clip clip--body">Context</div><div className="clip clip--proof">Proof</div><div className="clip clip--cta">CTA</div></div>
            <div className="track"><span className="track-label">TXT</span><div className="clip clip--text">Captions · phrase emphasis · safe-zone</div></div>
            <div className="track"><span className="track-label">MG</span><div className="clip clip--motion">Tracked callouts</div><div className="clip clip--motion clip--motion-two">Punch zoom + mask</div></div>
            <div className="track"><span className="track-label">A1</span><div className="clip clip--audio">Voice + music ducking</div></div>
          </div>
        </section>

        <aside className="inspector">
          <div className="inspector-tabs" role="tablist" aria-label="Project inspector">
            <button type="button" role="tab" aria-selected={inspectorTab === 'kit'} className={inspectorTab === 'kit' ? 'is-active' : ''} onClick={() => setInspectorTab('kit')}><Box size={13} /> Kit</button>
            <button type="button" role="tab" aria-selected={inspectorTab === 'media'} className={inspectorTab === 'media' ? 'is-active' : ''} onClick={() => setInspectorTab('media')}><FolderOpen size={13} /> Media {state.mediaAssets.length ? <span>{state.mediaAssets.length}</span> : null}</button>
          </div>

          <div className="inspector-content">
            {inspectorTab === 'kit' ? (
              <>
                {state.kit ? (
                  <VideoKitPanel kit={state.kit} selectedGroup={selectedGroup} onSelectGroup={setSelectedGroup} />
                ) : (
                  <div className="inspector-empty">
                    <span className="inspector-empty__icon"><Layers3 size={18} /></span>
                    <strong>No kit yet</strong>
                    <p>Reverse engineer one reference. The reusable rules appear here automatically.</p>
                  </div>
                )}

                <details className="model-routing-card">
                  <summary><span className="eyebrow">Engine</span><strong>Automatic model routing</strong></summary>
                  <div className="route-row"><span className="route-dot route-dot--frontier" /><div><strong>{reverseModel.name}</strong><span>Reverse engineering</span></div></div>
                  <div className="route-line" />
                  <div className="route-row"><span className="route-dot route-dot--fast" /><div><strong>{executionModel.name}</strong><span>Repeat execution</span></div></div>
                </details>
              </>
            ) : (
              <MediaPanel
                state={state}
                onAddAssets={onAddMediaAssets}
                onPlaceAsset={onPlaceMediaAsset}
                onUseAsFootage={onUseMediaAsFootage}
                onRemoveAsset={onRemoveMediaAsset}
                onLoadDemoMedia={onLoadDemoMedia}
              />
            )}
          </div>
        </aside>
      </div>
    </main>
  )
}
