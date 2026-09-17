import type { ModelRunRequest, ModelRunResult, ModelWorker } from '../workers/contracts'

interface LiteLlmChoice {
  message?: {
    content?: string | null
    reasoning_content?: string | null
    reasoning?: string | null
    tool_calls?: unknown[]
  }
}

interface LiteLlmResponse {
  id?: string
  choices?: LiteLlmChoice[]
}

export interface LiteLlmClientOptions {
  baseUrl: string
  apiKey: string
  fetchImpl?: typeof fetch
}

export class LiteLlmHttpError extends Error {
  readonly status: number
  readonly responseBody: string

  constructor(status: number, responseBody: string) {
    super(`LiteLLM request failed with HTTP ${status}: ${responseBody.slice(0, 500)}`)
    this.name = 'LiteLlmHttpError'
    this.status = status
    this.responseBody = responseBody
  }
}

const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, '')

export class LiteLlmHttpModelWorker implements ModelWorker {
  readonly id = 'litellm-http'
  private readonly baseUrl: string
  private readonly apiKey: string
  private readonly fetchImpl: typeof fetch

  constructor(options: LiteLlmClientOptions) {
    if (!options.baseUrl.trim()) throw new Error('LiteLLM baseUrl is required.')
    if (!options.apiKey.trim()) throw new Error('LiteLLM apiKey is required.')
    this.baseUrl = normalizeBaseUrl(options.baseUrl)
    this.apiKey = options.apiKey
    this.fetchImpl = options.fetchImpl ?? fetch
  }

  async run(request: ModelRunRequest): Promise<ModelRunResult> {
    const content: Array<Record<string, unknown>> = [{ type: 'text', text: request.prompt }]
    for (const imagePath of request.imagePaths ?? []) {
      content.push({ type: 'image_url', image_url: { url: imagePath } })
    }

    const response = await this.fetchImpl(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${this.apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: request.approvedModelId,
        messages: [{ role: 'user', content }],
        temperature: 0,
        stream: false,
      }),
    })

    const bodyText = await response.text()
    if (!response.ok) throw new LiteLlmHttpError(response.status, bodyText)
    const body = JSON.parse(bodyText) as LiteLlmResponse
    const message = body.choices?.[0]?.message
    const text = message?.content ?? ''
    if (!text) throw new Error('LiteLLM returned no assistant text.')
    return { text, providerRequestId: body.id }
  }
}

export const createLiteLlmWorkerFromEnv = (env: NodeJS.ProcessEnv = process.env) => {
  const baseUrl = env.LITELLM_BASE_URL?.trim()
  const apiKey = env.LITELLM_API_KEY?.trim()
  if (!baseUrl || !apiKey) return undefined
  return new LiteLlmHttpModelWorker({ baseUrl, apiKey })
}
