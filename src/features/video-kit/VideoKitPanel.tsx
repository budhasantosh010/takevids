import { Box, CheckCircle2, ChevronRight, Layers3, Save } from 'lucide-react'
import clsx from 'clsx'
import type { VideoKit } from '../../domain/workflow'

interface VideoKitPanelProps {
  kit: VideoKit
  selectedGroup: string
  onSelectGroup: (group: string) => void
}

const groups = ['Story', 'Visual', 'Motion', 'Audio'] as const

export function VideoKitPanel({ kit, selectedGroup, onSelectGroup }: VideoKitPanelProps) {
  return (
    <section className="kit-panel">
      <div className="kit-panel__head">
        <div className="kit-panel__identity">
          <span className="kit-panel__icon"><Box size={17} /></span>
          <div>
            <span className="eyebrow">Reusable Video Kit</span>
            <strong>{kit.name}</strong>
          </div>
        </div>
        <div className="kit-ready"><CheckCircle2 size={14} /> Ready</div>
      </div>

      <div className="kit-source">Built from <strong>{kit.sourceName}</strong></div>

      <div className="kit-tabs">
        {groups.map((group) => (
          <button
            type="button"
            key={group}
            className={clsx(selectedGroup === group && 'is-active')}
            onClick={() => onSelectGroup(group)}
          >
            {group}
          </button>
        ))}
      </div>

      <div className="kit-elements">
        {kit.elements
          .filter((element) => element.group === selectedGroup)
          .map((element) => (
            <button type="button" className="kit-element" key={element.id}>
              <span className="kit-element__glyph"><Layers3 size={14} /></span>
              <span className="kit-element__copy">
                <strong>{element.label}</strong>
                <span>{element.detail}</span>
              </span>
              <ChevronRight size={14} />
            </button>
          ))}
      </div>

      <button type="button" className="kit-save"><Save size={14} /> Saved to My Kits</button>
    </section>
  )
}
