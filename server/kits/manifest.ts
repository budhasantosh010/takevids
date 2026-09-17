import { createHash } from 'node:crypto'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { ScopedWorkspace } from '../agent/scopedWorkspace'

export const VIDEO_KIT_SCHEMA_VERSION = 1 as const

export interface VideoKitFileDeclaration {
  path: string
  role?: string
  required: boolean
  sha256?: string
}

export interface VideoKitManifestV1 {
  schemaVersion: typeof VIDEO_KIT_SCHEMA_VERSION
  id: string
  name: string
  createdAt: string
  source: {
    kind: string
    referenceAsset?: string
    metadata?: Record<string, unknown>
  }
  execution: {
    adapter: string
    entrypoint: string
    metadata?: Record<string, unknown>
  }
  files: VideoKitFileDeclaration[]
  metadata?: Record<string, unknown>
}

export interface LoadedVideoKit {
  root: string
  manifest: VideoKitManifestV1
}

export class KitValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'KitValidationError'
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const requireString = (value: unknown, field: string) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new KitValidationError(`${field} must be a non-empty string.`)
  }
  return value
}

export const assertSafeKitRelativePath = (value: string, field = 'path') => {
  const normalized = value.replace(/\\/g, '/')
  if (
    !normalized ||
    normalized.startsWith('/') ||
    /^[a-zA-Z]:\//.test(normalized) ||
    normalized.split('/').some((segment) => segment === '..')
  ) {
    throw new KitValidationError(`${field} must stay inside the Video Kit: ${value}`)
  }
  return normalized
}

export const validateKitManifest = (value: unknown): VideoKitManifestV1 => {
  if (!isRecord(value)) throw new KitValidationError('Video Kit manifest must be an object.')
  if (value.schemaVersion !== VIDEO_KIT_SCHEMA_VERSION) {
    throw new KitValidationError(`Unsupported Video Kit schemaVersion: ${String(value.schemaVersion)}`)
  }

  const id = requireString(value.id, 'id')
  const name = requireString(value.name, 'name')
  const createdAt = requireString(value.createdAt, 'createdAt')
  if (Number.isNaN(Date.parse(createdAt))) throw new KitValidationError('createdAt must be a valid date.')

  if (!isRecord(value.source)) throw new KitValidationError('source must be an object.')
  const sourceKind = requireString(value.source.kind, 'source.kind')
  const referenceAsset = value.source.referenceAsset === undefined
    ? undefined
    : requireString(value.source.referenceAsset, 'source.referenceAsset')
  const sourceMetadata = value.source.metadata === undefined
    ? undefined
    : isRecord(value.source.metadata) ? value.source.metadata : (() => { throw new KitValidationError('source.metadata must be an object.') })()

  if (!isRecord(value.execution)) throw new KitValidationError('execution must be an object.')
  const adapter = requireString(value.execution.adapter, 'execution.adapter')
  const entrypoint = assertSafeKitRelativePath(requireString(value.execution.entrypoint, 'execution.entrypoint'), 'execution.entrypoint')
  const executionMetadata = value.execution.metadata === undefined
    ? undefined
    : isRecord(value.execution.metadata) ? value.execution.metadata : (() => { throw new KitValidationError('execution.metadata must be an object.') })()

  if (!Array.isArray(value.files) || value.files.length === 0) {
    throw new KitValidationError('files must contain at least the execution entrypoint.')
  }

  const seen = new Set<string>()
  const files = value.files.map((raw, index): VideoKitFileDeclaration => {
    if (!isRecord(raw)) throw new KitValidationError(`files[${index}] must be an object.`)
    const filePath = assertSafeKitRelativePath(requireString(raw.path, `files[${index}].path`), `files[${index}].path`)
    if (seen.has(filePath)) throw new KitValidationError(`Duplicate Video Kit file declaration: ${filePath}`)
    seen.add(filePath)

    const required = raw.required === undefined ? true : raw.required
    if (typeof required !== 'boolean') throw new KitValidationError(`files[${index}].required must be boolean.`)
    const role = raw.role === undefined ? undefined : requireString(raw.role, `files[${index}].role`)
    const sha256 = raw.sha256 === undefined ? undefined : requireString(raw.sha256, `files[${index}].sha256`).toLowerCase()
    if (sha256 && !/^[a-f0-9]{64}$/.test(sha256)) throw new KitValidationError(`files[${index}].sha256 must be a SHA-256 hex digest.`)
    return { path: filePath, role, required, sha256 }
  })

  const entrypointDeclaration = files.find((file) => file.path === entrypoint)
  if (!entrypointDeclaration || !entrypointDeclaration.required) {
    throw new KitValidationError('execution.entrypoint must be declared as a required file.')
  }

  const metadata = value.metadata === undefined
    ? undefined
    : isRecord(value.metadata) ? value.metadata : (() => { throw new KitValidationError('metadata must be an object.') })()

  return {
    schemaVersion: VIDEO_KIT_SCHEMA_VERSION,
    id,
    name,
    createdAt,
    source: { kind: sourceKind, referenceAsset, metadata: sourceMetadata },
    execution: { adapter, entrypoint, metadata: executionMetadata },
    files,
    metadata,
  }
}

export const loadAndValidateKit = async (kitRoot: string): Promise<LoadedVideoKit> => {
  const root = path.resolve(kitRoot)
  const workspace = new ScopedWorkspace(root)
  const manifest = validateKitManifest(await workspace.readJson<unknown>('kit.json'))

  for (const file of manifest.files) {
    const absolutePath = await workspace.resolve(file.path)
    try {
      const fileStat = await stat(absolutePath)
      if (!fileStat.isFile()) throw new KitValidationError(`Required kit path is not a file: ${file.path}`)
      if (file.sha256) {
        const digest = createHash('sha256').update(await readFile(absolutePath)).digest('hex')
        if (digest !== file.sha256) throw new KitValidationError(`SHA-256 mismatch for kit file: ${file.path}`)
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT' && !file.required) continue
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new KitValidationError(`Required kit file is missing: ${file.path}`)
      }
      throw error
    }
  }

  return { root, manifest }
}
