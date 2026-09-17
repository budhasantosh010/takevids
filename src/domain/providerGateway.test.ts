import { describe, expect, it } from 'vitest'
import { resolveApprovedRoute } from './providerGateway'

describe('provider gateway certification boundary', () => {
  it('rejects the researched NVIDIA candidate until a live TakeVids certification enables it', () => {
    expect(() => resolveApprovedRoute('nvidia-glm-5.3-flash', 'reverse-engineer'))
      .toThrow(/not certified and approved for active use/i)
  })

  it('rejects other known-but-uncertified routes instead of silently routing them', () => {
    expect(() => resolveApprovedRoute('opus-5-max', 'reverse-engineer'))
      .toThrow(/not certified and approved for active use/i)
  })
})
