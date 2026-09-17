import { describe, expect, it, vi } from 'vitest'
import { LiteLlmHttpModelWorker, createLiteLlmWorkerFromEnv } from './liteLlmClient'

describe('LiteLlmHttpModelWorker', () => {
  it('sends OpenAI-compatible chat payloads to the proxy without provider credentials', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({
      id: 'req-1',
      choices: [{ message: { content: 'ok' } }],
    }), { status: 200 })) as unknown as typeof fetch

    const worker = new LiteLlmHttpModelWorker({
      baseUrl: 'http://127.0.0.1:4000/v1/',
      apiKey: 'proxy-only-key',
      fetchImpl,
    })
    const result = await worker.run({
      approvedModelId: 'takevids-glm-5-3-flash',
      role: 'reverse-engineer',
      prompt: 'Analyze this frame',
      imagePaths: ['https://example.com/frame.jpg'],
      workspacePath: '/unused',
    })

    expect(result).toEqual({ text: 'ok', providerRequestId: 'req-1' })
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    const [url, init] = (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toBe('http://127.0.0.1:4000/v1/chat/completions')
    expect(JSON.parse(String(init.body))).toMatchObject({
      model: 'takevids-glm-5-3-flash',
      messages: [{ role: 'user' }],
    })
    expect(String(init.headers.authorization)).toContain('proxy-only-key')
    expect(JSON.stringify(init)).not.toContain('NVIDIA')
  })

  it('stays unavailable until both proxy base URL and proxy key exist', () => {
    expect(createLiteLlmWorkerFromEnv({})).toBeUndefined()
    expect(createLiteLlmWorkerFromEnv({ LITELLM_BASE_URL: 'http://127.0.0.1:4000/v1' })).toBeUndefined()
    expect(createLiteLlmWorkerFromEnv({
      LITELLM_BASE_URL: 'http://127.0.0.1:4000/v1',
      LITELLM_API_KEY: 'x',
    })).toBeInstanceOf(LiteLlmHttpModelWorker)
  })
})
