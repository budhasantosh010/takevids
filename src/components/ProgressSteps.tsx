import { Check } from 'lucide-react'
import clsx from 'clsx'
import type { WorkflowStage } from '../domain/workflow'

const steps = [
  { id: 'reference', label: 'Reference' },
  { id: 'kit', label: 'Reverse engineer' },
  { id: 'edit', label: 'Apply kit' },
  { id: 'review', label: 'Refine' },
  { id: 'export', label: 'Export' },
] as const

const stageIndex: Record<WorkflowStage, number> = {
  reference: 0,
  analyzing: 1,
  kitReady: 2,
  editing: 2,
  review: 3,
  exportReady: 4,
}

export function ProgressSteps({ stage }: { stage: WorkflowStage }) {
  const activeIndex = stageIndex[stage]

  return (
    <div className="progress-steps" aria-label="Project workflow">
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={clsx(
            'progress-step',
            index === activeIndex && 'is-active',
            index < activeIndex && 'is-complete',
          )}
        >
          <span className="progress-step__dot">{index < activeIndex ? <Check size={10} /> : index + 1}</span>
          <span>{step.label}</span>
        </div>
      ))}
    </div>
  )
}
