import { lstat, mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

export class WorkspacePathError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'WorkspacePathError'
  }
}

export class ScopedWorkspace {
  readonly root: string

  constructor(root: string) {
    this.root = path.resolve(root)
  }

  async readText(relativePath: string): Promise<string> {
    const target = await this.safePath(relativePath)
    return await readFile(target, 'utf8')
  }

  async readJson<T>(relativePath: string): Promise<T> {
    return JSON.parse(await this.readText(relativePath)) as T
  }

  async writeText(relativePath: string, content: string): Promise<string> {
    const target = await this.safePath(relativePath)
    await mkdir(path.dirname(target), { recursive: true })
    await this.assertNoSymlinkComponents(target)
    await writeFile(target, content, 'utf8')
    return target
  }

  async writeJson(relativePath: string, value: unknown): Promise<string> {
    return await this.writeText(relativePath, `${JSON.stringify(value, null, 2)}\n`)
  }

  async list(relativePath = '.'): Promise<string[]> {
    const target = await this.safePath(relativePath, true)
    const entries = await readdir(target)
    return entries.sort((a, b) => a.localeCompare(b))
  }

  async resolve(relativePath: string): Promise<string> {
    return await this.safePath(relativePath)
  }

  private async safePath(candidate: string, allowRoot = false): Promise<string> {
    if (typeof candidate !== 'string' || candidate.includes('\0')) {
      throw new WorkspacePathError('Workspace path must be a valid string.')
    }

    if (path.isAbsolute(candidate)) {
      throw new WorkspacePathError(`Absolute path is not allowed in workspace: ${candidate}`)
    }

    await mkdir(this.root, { recursive: true })
    const rootStat = await lstat(this.root)
    if (rootStat.isSymbolicLink()) {
      throw new WorkspacePathError(`Workspace root may not be a symbolic link: ${this.root}`)
    }
    const target = path.resolve(this.root, candidate)
    const relative = path.relative(this.root, target)

    if ((!allowRoot && relative === '') || relative.startsWith('..') || path.isAbsolute(relative)) {
      throw new WorkspacePathError(`Path resolves outside workspace: ${candidate}`)
    }

    await this.assertNoSymlinkComponents(target)
    return target
  }

  private async assertNoSymlinkComponents(target: string) {
    const relative = path.relative(this.root, target)
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      throw new WorkspacePathError(`Path resolves outside workspace: ${target}`)
    }

    let current = this.root
    for (const component of relative.split(path.sep).filter(Boolean)) {
      current = path.join(current, component)
      try {
        const stat = await lstat(current)
        if (stat.isSymbolicLink()) {
          throw new WorkspacePathError(`Symbolic links are not allowed in scoped workspace paths: ${current}`)
        }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') break
        throw error
      }
    }
  }
}
