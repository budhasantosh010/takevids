import { Check, ChevronDown, Sparkles, Zap } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'
import { getModel, modelsForRole, type ModelRole } from '../domain/models'

interface ModelPickerProps {
  role: ModelRole
  value: string
  onChange: (modelId: string) => void
  compact?: boolean
}

export function ModelPicker({ role, value, onChange, compact = false }: ModelPickerProps) {
  const [open, setOpen] = useState(false)
  const selected = getModel(value)
  const models = modelsForRole(role)
  const isReverse = role === 'reverse-engineer'

  return (
    <div className={clsx('model-picker', compact && 'model-picker--compact')}>
      <button
        type="button"
        className="model-picker__trigger"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        <span className={clsx('model-picker__icon', isReverse ? 'is-frontier' : 'is-fast')}>
          {isReverse ? <Sparkles size={14} /> : <Zap size={14} />}
        </span>
        <span className="model-picker__copy">
          {!compact && <span className="model-picker__eyebrow">{isReverse ? 'Reverse engineer with' : 'Execute kit with'}</span>}
          <span className="model-picker__name">{selected.name}</span>
        </span>
        <ChevronDown size={15} className={clsx('model-picker__chevron', open && 'is-open')} />
      </button>

      {open && (
        <div className="model-picker__menu" role="listbox">
          <div className="model-picker__menu-head">
            <span>{isReverse ? 'Frontier analysis models' : 'Execution models'}</span>
            <span className="model-picker__role">{isReverse ? 'Build once' : 'Reuse often'}</span>
          </div>
          {models.map((model) => (
            <button
              type="button"
              role="option"
              aria-selected={model.id === value}
              className={clsx('model-option', model.id === value && 'is-selected')}
              key={model.id}
              onClick={() => {
                onChange(model.id)
                setOpen(false)
              }}
            >
              <span className="model-option__main">
                <span className="model-option__title-row">
                  <strong>{model.name}</strong>
                  <span>{model.tier}</span>
                  {model.badge && <em>{model.badge}</em>}
                </span>
                <span className="model-option__summary">{model.summary}</span>
              </span>
              {model.id === value && <Check size={16} />}
            </button>
          ))}
          <div className="model-picker__foot">Model list is interface data in this phase. No provider call is made.</div>
        </div>
      )}
    </div>
  )
}
