import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { NVIDIA_HOSTED_BASE_URL, nvidiaCertificationCatalog } from './nvidiaCatalog'

describe('LiteLLM NVIDIA proxy configuration', () => {
  it('contains every current hosted certification candidate behind its stable TakeVids model id', async () => {
    const config = await readFile(path.resolve('litellm/config.yaml'), 'utf8')

    for (const model of nvidiaCertificationCatalog) {
      expect(config).toContain(`model_name: ${model.takeVidsModelId}`)
      expect(config).toContain(`model: nvidia_nim/${model.id}`)
    }
    expect(NVIDIA_HOSTED_BASE_URL).toBe('https://integrate.api.nvidia.com/v1')
  })

  it('references environment variables instead of committing provider secrets', async () => {
    const config = await readFile(path.resolve('litellm/config.yaml'), 'utf8')

    expect(config).toContain('os.environ/NVIDIA_NIM_API_KEY')
    expect(config).toContain('os.environ/NVIDIA_NIM_API_BASE')
    expect(config).toContain('os.environ/LITELLM_MASTER_KEY')
    expect(config).not.toMatch(/nvapi-[A-Za-z0-9_-]{10,}/)
  })
})
