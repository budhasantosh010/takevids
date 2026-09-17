import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { nvidiaCertificationCatalog } from './nvidiaCatalog'

type TestState = 'PASS' | 'FAIL' | 'UNSUPPORTED' | 'CREDENTIAL_REQUIRED' | 'PROXY_UNAVAILABLE'
interface TestResult { state: TestState; detail?: string; ms?: number }

const baseUrl = process.env.LITELLM_BASE_URL?.replace(/\/+$/, '')
const apiKey = process.env.LITELLM_API_KEY
const runtimeRoot = path.resolve(process.env.TAKEVIDS_RUNTIME_ROOT ?? '.takevids-runtime')
const outputPath = path.join(runtimeRoot, 'nvidia-certification.json')

const publicImage = 'https://assets.ngc.nvidia.com/products/api-catalog/phi-3-5-vision/example1b.jpg'
const publicVideo = 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'

const callProxy = async (model: string, body: Record<string, unknown>): Promise<TestResult> => {
  if (!baseUrl || !apiKey) {
    return { state: 'CREDENTIAL_REQUIRED', detail: 'LITELLM_BASE_URL/LITELLM_API_KEY not configured.' }
  }

  const started = Date.now()
  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model, stream: false, max_tokens: 64, ...body }),
      signal: AbortSignal.timeout(90_000),
    })
    const text = await response.text()
    if (!response.ok) {
      return { state: 'FAIL', detail: `HTTP ${response.status}: ${text.slice(0, 300)}`, ms: Date.now() - started }
    }

    const parsed = JSON.parse(text) as {
      choices?: Array<{ message?: { content?: string | null; tool_calls?: unknown[] } }>
    }
    const message = parsed.choices?.[0]?.message
    if (!message?.content && !message?.tool_calls?.length) {
      return { state: 'FAIL', detail: 'No assistant content/tool call returned.', ms: Date.now() - started }
    }
    return { state: 'PASS', ms: Date.now() - started }
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    if (/fetch failed|ECONNREFUSED|connect/i.test(detail)) return { state: 'PROXY_UNAVAILABLE', detail }
    return { state: 'FAIL', detail }
  }
}

const main = async () => {
  const results = []

  for (const model of [...nvidiaCertificationCatalog].sort((a, b) => a.priority - b.priority)) {
    const alias = model.takeVidsModelId
    const text = await callProxy(alias, {
      messages: [{ role: 'user', content: 'Reply with exactly TAKEVIDS_OK.' }],
      temperature: 0,
    })

    const image = model.inputModalities.includes('image')
      ? await callProxy(alias, {
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: 'Describe this image in five words or fewer.' },
              { type: 'image_url', image_url: { url: publicImage } },
            ],
          }],
          temperature: 0,
        })
      : { state: 'UNSUPPORTED' as const, detail: 'NVIDIA catalog does not advertise image input.' }

    // GLM-5.3-Flash hosted video is deliberately probed even though the hosted
    // catalog advertises text+image: NVIDIA self-hosted NIM docs separately
    // document video inference, so TakeVids verifies instead of assuming parity.
    const video = model.inputModalities.includes('video') || model.id === 'z-ai/glm-5-3-flash'
      ? await callProxy(alias, {
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: 'Describe the main action in this video briefly.' },
              { type: 'video_url', video_url: { url: publicVideo } },
            ],
          }],
          temperature: 0,
        })
      : { state: 'UNSUPPORTED' as const, detail: 'NVIDIA hosted catalog does not advertise video input.' }

    const tools = model.tools
      ? await callProxy(alias, {
          messages: [{ role: 'user', content: 'Use the get_test_value tool. Do not answer directly.' }],
          tools: [{
            type: 'function',
            function: {
              name: 'get_test_value',
              description: 'Returns a test value',
              parameters: { type: 'object', properties: {}, additionalProperties: false },
            },
          }],
          tool_choice: 'auto',
          temperature: 0,
        })
      : { state: 'UNSUPPORTED' as const, detail: 'Tool support not advertised for this certification candidate.' }

    results.push({ id: model.id, alias, text, image, video, tools })
  }

  const report = {
    generatedAt: new Date().toISOString(),
    proxyConfigured: Boolean(baseUrl && apiKey),
    baseUrl: baseUrl ?? null,
    results,
  }
  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  console.log(JSON.stringify(report, null, 2))
}

await main()
