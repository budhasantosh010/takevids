import {
  AudioLines,
  Check,
  GripVertical,
  Image as ImageIcon,
  Music2,
  Plus,
  Trash2,
  UploadCloud,
  Video,
} from 'lucide-react'
import { useMemo, useRef, useState, type DragEvent } from 'react'
import { filesToMediaAssets } from '../../domain/media'
import type { MediaAsset, MediaRole, WorkflowState } from '../../domain/workflow'

interface MediaPanelProps {
  state: WorkflowState
  onAddAssets: (assets: MediaAsset[]) => void
  onPlaceAsset: (assetId: string) => void
  onUseAsFootage: (asset: MediaAsset) => void
  onRemoveAsset: (assetId: string) => void
  onLoadDemoMedia: () => void
}

const roleLabel: Record<MediaRole, string> = {
  reference: 'Reference',
  primary: 'Main footage',
  broll: 'B-roll',
  image: 'Image',
  music: 'Music',
  sfx: 'SFX',
  other: 'Media',
}

const AssetIcon = ({ asset }: { asset: MediaAsset }) => {
  if (asset.kind === 'image') return <ImageIcon size={14} />
  if (asset.kind === 'audio') return asset.role === 'sfx' ? <AudioLines size={14} /> : <Music2 size={14} />
  return <Video size={14} />
}

export function MediaPanel({
  state,
  onAddAssets,
  onPlaceAsset,
  onUseAsFootage,
  onRemoveAsset,
  onLoadDemoMedia,
}: MediaPanelProps) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [draggingOver, setDraggingOver] = useState(false)

  const assets = useMemo(() => {
    const primary = state.footage ? [{ ...state.footage, role: 'primary' as const }] : []
    return [...primary, ...state.mediaAssets]
  }, [state.footage, state.mediaAssets])

  const addFiles = (files: FileList | File[]) => {
    if (!files.length) return
    onAddAssets(filesToMediaAssets(files))
  }

  const dropFiles = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setDraggingOver(false)
    if (event.dataTransfer.files.length) addFiles(event.dataTransfer.files)
  }

  return (
    <div className="media-panel">
      <div className="media-panel__intro">
        <span className="eyebrow">Everything the edit can use</span>
        <strong>Media</strong>
        <p>Drop footage, B-roll, images, music or SFX once. TakeVids decides where they belong.</p>
      </div>

      <button
        type="button"
        className={`media-dropzone${draggingOver ? ' is-dragging' : ''}`}
        onClick={() => fileInput.current?.click()}
        onDragOver={(event) => {
          event.preventDefault()
          setDraggingOver(true)
        }}
        onDragLeave={() => setDraggingOver(false)}
        onDrop={dropFiles}
      >
        <UploadCloud size={17} />
        <span><strong>Drop anything here</strong><small>Video · image · audio</small></span>
        <Plus size={14} />
      </button>
      <input
        ref={fileInput}
        hidden
        multiple
        type="file"
        accept="video/*,image/*,audio/*"
        onChange={(event) => {
          if (event.target.files) addFiles(event.target.files)
          event.target.value = ''
        }}
      />

      {assets.length === 0 ? (
        <div className="media-empty">
          <span>No media yet.</span>
          <button type="button" onClick={onLoadDemoMedia}>Load demo media</button>
        </div>
      ) : (
        <div className="asset-list" aria-label="Project media">
          {assets.map((asset) => {
            const isPrimary = asset.role === 'primary'
            const isPlaced = isPrimary || state.placedAssetIds.includes(asset.id)
            const canBecomePrimary = !state.footage && state.kit && asset.kind === 'video'
            return (
              <div
                className={`asset-card${isPlaced ? ' is-used' : ''}`}
                key={asset.id}
                draggable={!isPrimary}
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = 'copy'
                  event.dataTransfer.setData('application/x-takevids-asset', asset.id)
                  event.dataTransfer.setData('text/plain', asset.id)
                }}
              >
                <span className="asset-card__drag" aria-hidden="true"><GripVertical size={12} /></span>
                <span className={`asset-card__thumb is-${asset.kind ?? 'video'}`}><AssetIcon asset={asset} /></span>
                <span className="asset-card__copy">
                  <strong title={asset.name}>{asset.name}</strong>
                  <small>{roleLabel[asset.role ?? 'other']} {asset.sizeLabel ? `· ${asset.sizeLabel}` : ''}</small>
                </span>
                <span className="asset-card__actions">
                  {isPlaced ? (
                    <span className="asset-used" title="Used in edit"><Check size={12} /></span>
                  ) : canBecomePrimary ? (
                    <button type="button" className="asset-action" title="Use as main footage" onClick={() => onUseAsFootage(asset)}>Main</button>
                  ) : (
                    <button type="button" className="asset-action" onClick={() => onPlaceAsset(asset.id)}>Add</button>
                  )}
                  {!isPrimary && (
                    <button type="button" className="asset-remove" title="Remove media" onClick={() => onRemoveAsset(asset.id)}><Trash2 size={11} /></button>
                  )}
                </span>
              </div>
            )
          })}
        </div>
      )}

      <div className="media-tip">
        <span>Drag a card onto the preview or timeline.</span>
        <span>Or press <strong>Add</strong>.</span>
      </div>
    </div>
  )
}
