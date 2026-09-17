export type ModelRole = 'reverse-engineer' | 'execute'

export type ModelTier = 'Frontier' | 'Fast' | 'Balanced'

export interface VideoModel {
  id: string
  name: string
  provider: string
  roles: ModelRole[]
  tier: ModelTier
  summary: string
  badge?: string
}

export const modelCatalog: VideoModel[] = [
  {
    id: 'opus-5-max',
    name: 'Opus 5 Max',
    provider: 'Anthropic',
    roles: ['reverse-engineer', 'execute'],
    tier: 'Frontier',
    summary: 'Deep structural and visual analysis for building the strongest kit.',
    badge: 'Best analysis',
  },
  {
    id: 'fable-5.1',
    name: 'Fable 5.1',
    provider: 'Fable',
    roles: ['reverse-engineer'],
    tier: 'Frontier',
    summary: 'Frontier option for reverse-engineering reference formats.',
  },
  {
    id: 'astra-max',
    name: 'Astra Max',
    provider: 'Astra',
    roles: ['reverse-engineer'],
    tier: 'Frontier',
    summary: 'Frontier option for detailed edit-system reconstruction.',
  },
  {
    id: 'deepseek-v4.1-flash',
    name: 'DeepSeek V4.1 Flash',
    provider: 'DeepSeek',
    roles: ['execute'],
    tier: 'Fast',
    summary: 'Fast execution path once the Video Kit has already constrained the edit.',
    badge: 'Fast repeat edits',
  },
  {
    id: 'qwen-3.8-flash-next',
    name: 'Qwen 3.8 Flash Next',
    provider: 'Qwen',
    roles: ['execute'],
    tier: 'Balanced',
    summary: 'Balanced execution option for kit-guided edits and refinements.',
  },
]

export const modelsForRole = (role: ModelRole) =>
  modelCatalog.filter((model) => model.roles.includes(role))

export const getModel = (id: string) =>
  modelCatalog.find((model) => model.id === id) ?? modelCatalog[0]
