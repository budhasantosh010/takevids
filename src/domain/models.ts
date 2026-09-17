export type ModelRole = 'reverse-engineer' | 'execute'
export type ModelTier = 'Frontier' | 'Fast' | 'Balanced'
export type InputModality = 'text' | 'image' | 'audio' | 'video'
export type UpstreamProvider = 'nvidia_nim' | 'anthropic' | 'openai' | 'google' | 'openrouter' | 'deepseek'

export interface ModelRoute {
  gateway: 'litellm'
  upstreamProvider: UpstreamProvider
  providerModelId: string
}

export interface VideoModel {
  id: string
  name: string
  provider: string
  roles: ModelRole[]
  tier: ModelTier
  summary: string
  badge?: string
  approved: boolean
  enabled: boolean
  inputModalities: InputModality[]
  route: ModelRoute
}

export const modelCatalog: VideoModel[] = [
  {
    id: 'nvidia-glm-5.3-flash',
    name: 'GLM 5.3 Flash',
    provider: 'NVIDIA NIM',
    roles: ['reverse-engineer', 'execute'],
    tier: 'Balanced',
    summary: 'Low-cost test route for proving the full TakeVids workflow before expensive frontier inference is connected.',
    badge: 'Testing now',
    approved: true,
    enabled: true,
    inputModalities: ['text', 'image'],
    route: {
      gateway: 'litellm',
      upstreamProvider: 'nvidia_nim',
      providerModelId: 'glm-5.3-flash',
    },
  },
  {
    id: 'opus-5-max',
    name: 'Opus 5 Max',
    provider: 'Anthropic',
    roles: ['reverse-engineer', 'execute'],
    tier: 'Frontier',
    summary: 'Frontier-quality reverse engineering route to enable after the end-to-end system is certified.',
    badge: 'Frontier later',
    approved: true,
    enabled: false,
    inputModalities: ['text', 'image'],
    route: {
      gateway: 'litellm',
      upstreamProvider: 'anthropic',
      providerModelId: 'claude-opus-5',
    },
  },
  {
    id: 'deepseek-v4.1-flash',
    name: 'DeepSeek V4.1 Flash',
    provider: 'DeepSeek',
    roles: ['execute'],
    tier: 'Fast',
    summary: 'Candidate fast execution route once the reusable Video Kit has constrained the edit.',
    badge: 'Execution candidate',
    approved: true,
    enabled: false,
    inputModalities: ['text', 'image'],
    route: {
      gateway: 'litellm',
      upstreamProvider: 'deepseek',
      providerModelId: 'deepseek-v4.1-flash',
    },
  },
]

export const modelsForRole = (role: ModelRole) =>
  modelCatalog.filter((model) => model.approved && model.enabled && model.roles.includes(role))

export const getModel = (id: string) =>
  modelCatalog.find((model) => model.id === id) ?? modelsForRole('reverse-engineer')[0] ?? modelCatalog[0]
