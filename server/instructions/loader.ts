import { createHash } from 'node:crypto'
import path from 'node:path'
import { ScopedWorkspace } from '../agent/scopedWorkspace'

export type InstructionKind = 'prompt' | 'skill'

export interface InstructionRequest {
  kind: InstructionKind
  path: string
  label?: string
}

export interface LoadedInstructionFile extends InstructionRequest {
  absolutePath: string
  content: string
  sha256: string
}

export interface InstructionBundle {
  root: string
  files: LoadedInstructionFile[]
}

export const loadInstructionBundle = async (
  root: string,
  requestedFiles: InstructionRequest[],
): Promise<InstructionBundle> => {
  if (!Array.isArray(requestedFiles) || requestedFiles.length === 0) {
    throw new Error('Instruction bundle must request at least one prompt or skill file.')
  }

  const workspace = new ScopedWorkspace(root)
  const files: LoadedInstructionFile[] = []

  for (const request of requestedFiles) {
    if (request.kind !== 'prompt' && request.kind !== 'skill') {
      throw new Error(`Unsupported instruction kind: ${String(request.kind)}`)
    }

    const content = await workspace.readText(request.path)
    files.push({
      ...request,
      absolutePath: await workspace.resolve(request.path),
      content,
      sha256: createHash('sha256').update(content, 'utf8').digest('hex'),
    })
  }

  return { root: path.resolve(root), files }
}
