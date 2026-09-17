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
  certified: boolean
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
    summary: 'Current NVIDIA multimodal certification candidate. It remains hidden until TakeVids verifies the live LiteLLM route.',
    badge: 'Certification pending',
    approved: false,
    enabled: false,
    certified: false,
    inputModalities: ['text', 'image'],
    route: {
      gateway: 'litellm',
      upstreamProvider: 'nvidia_nim',
      providerModelId: 'z-ai/glm-5-3-flash',
    },
  },
  {
    id: 'opus-5-max',
    name: 'Opus 5 Max',
    provider: 'Anthropic',
    roles: ['reverse-engineer', 'execute'],
    tier: 'Frontier',
    summary: 'Frontier-quality reverse engineering candidate to certify after the inexpensive NVIDIA route proves the full loop.',
    badge: 'Frontier later',
    approved: false,
    enabled: false,
    certified: false,
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
    summary: 'Candidate fast execution route once a reusable Video Kit constrains the edit. Hidden until independently certified.',
    badge: 'Execution candidate',
    approved: false,
    enabled: false,
    certified: false,
    inputModalities: ['text', 'image'],
    route: {
      gateway: 'litellm',
      upstreamProvider: 'deepseek',
      providerModelId: 'deepseek-v4.1-flash',
    },
  },
]

export const modelsForRole = (role: ModelRole) =>
  modelCatalog.filter((model) => model.approved && model.enabled && model.certified && model.roles.includes(role))

const certificationPendingModel: VideoModel = {
  id: 'model-certification-pending',
  name: 'Model certification pending',
  provider: 'TakeVids',
  roles: ['reverse-engineer', 'execute'],
  tier: 'Balanced',
  summary: 'TakeVids is certifying provider routes. Untested models are not available to users.',
  badge: 'Not live yet',
  approved: false,
  enabled: false,
  certified: false,
  inputModalities: ['text'],
  route: {
    gateway: 'litellm',
    upstreamProvider: 'nvidia_nim',
    providerModelId: 'not-routable',
  },
}

export const getModel = (id: string) => {
  const model = modelCatalog.find((candidate) => candidate.id === id)
  if (model?.approved && model.enabled && model.certified) return model
  return modelsForRole('reverse-engineer')[0] ?? certificationPendingModel
}
