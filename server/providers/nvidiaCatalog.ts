export type CertificationState = 'untested' | 'pass' | 'fail' | 'unsupported'
export type HostedAvailability = 'free' | 'partner' | 'deprecated' | 'self-host-only'
export type NvidiaInputModality = 'text' | 'image' | 'audio' | 'video'

export interface NvidiaCertificationModel {
  id: string
  takeVidsModelId: string
  displayName: string
  hostedAvailability: HostedAvailability
  contextTokens?: number
  inputModalities: NvidiaInputModality[]
  reasoning: boolean
  tools: boolean
  priority: number
  notes: string
  certification: {
    text: CertificationState
    image: CertificationState
    video: CertificationState
    tools: CertificationState
  }
}

export const NVIDIA_HOSTED_BASE_URL = 'https://integrate.api.nvidia.com/v1'

export const nvidiaCertificationCatalog: NvidiaCertificationModel[] = [
  {
    id: 'z-ai/glm-5-3-flash',
    takeVidsModelId: 'nvidia-glm-5.3-flash',
    displayName: 'GLM-5.3-Flash',
    hostedAvailability: 'free',
    contextTokens: 1_048_576,
    inputModalities: ['text', 'image'],
    reasoning: true,
    tools: true,
    priority: 1,
    notes: 'Newest hosted multimodal candidate. NVIDIA self-host NIM docs also describe video inference, but hosted build API advertises text+image only; certify hosted video separately before use.',
    certification: { text: 'untested', image: 'untested', video: 'untested', tools: 'untested' },
  },
  {
    id: 'moonshotai/kimi-k3',
    takeVidsModelId: 'nvidia-kimi-k3',
    displayName: 'Kimi-K3',
    hostedAvailability: 'free',
    contextTokens: 1_048_576,
    inputModalities: ['text', 'image'],
    reasoning: true,
    tools: true,
    priority: 2,
    notes: 'Native multimodal agentic model with 1M context. Hosted NVIDIA API advertises text+image.',
    certification: { text: 'untested', image: 'untested', video: 'unsupported', tools: 'untested' },
  },
  {
    id: 'z-ai/glm-5-3',
    takeVidsModelId: 'nvidia-glm-5.3',
    displayName: 'GLM-5.3',
    hostedAvailability: 'free',
    contextTokens: 1_048_576,
    inputModalities: ['text'],
    reasoning: true,
    tools: true,
    priority: 3,
    notes: 'Fresh Sep 2026 text frontier/agentic route; useful for code/kit generation after visual evidence has been normalized.',
    certification: { text: 'untested', image: 'unsupported', video: 'unsupported', tools: 'untested' },
  },
  {
    id: 'deepseek-ai/deepseek-v4-flash-0731',
    takeVidsModelId: 'nvidia-deepseek-v4-flash-0731',
    displayName: 'DeepSeek-V4-Flash-0731',
    hostedAvailability: 'free',
    contextTokens: 1_000_000,
    inputModalities: ['text'],
    reasoning: true,
    tools: true,
    priority: 4,
    notes: 'Fast long-context coding/agentic control. NVIDIA catalog currently signals imminent free-endpoint deprecation, so do not make it a durable dependency.',
    certification: { text: 'untested', image: 'unsupported', video: 'unsupported', tools: 'untested' },
  },
  {
    id: 'nvidia/nemotron-3-ultra-550b-a55b',
    takeVidsModelId: 'nvidia-nemotron-3-ultra',
    displayName: 'Nemotron-3-Ultra-550B-A55B',
    hostedAvailability: 'free',
    contextTokens: 1_000_000,
    inputModalities: ['text'],
    reasoning: true,
    tools: true,
    priority: 5,
    notes: 'NVIDIA frontier text model for long-horizon agentic reasoning; strong control for kit-generation logic.',
    certification: { text: 'untested', image: 'unsupported', video: 'unsupported', tools: 'untested' },
  },
  {
    id: 'meta/muse-glimmer-30b',
    takeVidsModelId: 'nvidia-muse-glimmer-30b',
    displayName: 'Muse-Glimmer-30B',
    hostedAvailability: 'free',
    contextTokens: 131_072,
    inputModalities: ['text', 'image'],
    reasoning: true,
    tools: true,
    priority: 6,
    notes: 'Smaller multimodal reasoning control model. Useful to measure how far cheap image-based execution can go.',
    certification: { text: 'untested', image: 'untested', video: 'unsupported', tools: 'untested' },
  },
  {
    id: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning',
    takeVidsModelId: 'nvidia-nemotron-omni-30b',
    displayName: 'Nemotron-3-Nano-Omni-30B-A3B-Reasoning',
    hostedAvailability: 'free',
    contextTokens: 262_144,
    inputModalities: ['text', 'image', 'audio', 'video'],
    reasoning: true,
    tools: false,
    priority: 7,
    notes: 'Native hosted video/audio/image/text control. Not the newest frontier-quality model, but highly relevant for proving direct video transport through LiteLLM/NVIDIA.',
    certification: { text: 'untested', image: 'untested', video: 'untested', tools: 'unsupported' },
  },
]

export const nvidiaSelfHostedResearchOnly = [
  {
    id: 'qwen/qwen3.8-flash-next',
    nimModelId: 'nvidia/vllm-model-free-nim',
    note: 'Supported by NVIDIA VLM NIM for self-hosting; not listed as a normal NVIDIA hosted free endpoint in the current build catalog.',
  },
  {
    id: 'qwen/qwen3.8-27b',
    nimModelId: 'qwen/qwen3.8-27b',
    note: 'Supported by NVIDIA VLM NIM for self-hosting; not part of the hosted certification pass.',
  },
] as const
