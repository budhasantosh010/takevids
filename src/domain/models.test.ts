import { describe, expect, it } from 'vitest'
import { modelCatalog, modelsForRole } from './models'

describe('approved model registry', () => {
  it('exposes only approved and enabled models to the product UI', () => {
    const exposed = modelsForRole('reverse-engineer')

    expect(exposed.length).toBeGreaterThan(0)
    expect(exposed.every((model) => model.approved && model.enabled)).toBe(true)
    expect(exposed.some((model) => model.route.upstreamProvider === 'nvidia_nim')).toBe(true)
  })

  it('can retain future provider routes without exposing them to users', () => {
    const futureRoutes = modelCatalog.filter((model) => !model.enabled)

    expect(futureRoutes.some((model) => model.route.upstreamProvider === 'anthropic')).toBe(true)
    expect(modelsForRole('reverse-engineer').every((model) => model.enabled)).toBe(true)
  })
})
