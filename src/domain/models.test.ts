import { describe, expect, it } from 'vitest'
import { getModel, modelCatalog, modelsForRole } from './models'

describe('certified model registry', () => {
  it('exposes only approved, enabled, and certified models to the product UI', () => {
    const exposed = modelsForRole('reverse-engineer')

    expect(exposed).toHaveLength(0)
    expect(exposed.every((model) => model.approved && model.enabled && model.certified)).toBe(true)
  })

  it('keeps NVIDIA research candidates in the catalog without exposing them before certification', () => {
    const glm = modelCatalog.find((model) => model.id === 'nvidia-glm-5.3-flash')

    expect(glm).toMatchObject({
      approved: false,
      enabled: false,
      certified: false,
      route: { upstreamProvider: 'nvidia_nim', providerModelId: 'z-ai/glm-5-3-flash' },
    })
    expect(modelsForRole('reverse-engineer')).not.toContain(glm)
  })

  it('returns a neutral pending state instead of presenting an uncertified model as selected', () => {
    expect(getModel('nvidia-glm-5.3-flash')).toMatchObject({
      id: 'model-certification-pending',
      certified: false,
    })
  })
})
