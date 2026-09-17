import { describe, expect, it } from 'vitest'
import { resolveApprovedRoute } from './providerGateway'

describe('provider gateway boundary', () => {
  it('resolves the approved NVIDIA test model through the LiteLLM boundary', () => {
    expect(resolveApprovedRoute('nvidia-glm-5.3-flash', 'reverse-engineer')).toEqual({
      gateway: 'litellm',
      upstreamProvider: 'nvidia_nim',
      providerModelId: 'glm-5.3-flash',
    })
  })

  it('rejects a known but disabled model instead of silently routing it', () => {
    expect(() => resolveApprovedRoute('opus-5-max', 'reverse-engineer')).toThrow(/not approved for active use/i)
  })
})
