import { modelCatalog, type ModelRole, type ModelRoute } from './models'

export interface GatewayRequest {
  modelId: string
  role: ModelRole
  prompt: string
  imageUrls?: string[]
}

export interface GatewayResponse {
  text: string
  providerRequestId?: string
}

export interface ModelGateway {
  run(request: GatewayRequest): Promise<GatewayResponse>
}

export const providerLayerConfig = {
  gateway: 'litellm' as const,
  firstTestingUpstream: 'nvidia_nim' as const,
  credentialLocation: 'server-only' as const,
}

export const resolveApprovedRoute = (modelId: string, role: ModelRole): ModelRoute => {
  const model = modelCatalog.find((candidate) => candidate.id === modelId)

  if (!model || !model.approved || !model.enabled || !model.certified || !model.roles.includes(role)) {
    throw new Error(`Model ${modelId} is not certified and approved for active use as ${role}.`)
  }

  return model.route
}
