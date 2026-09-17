import path from 'node:path'
import { runCommand, type CommandResult } from '../lib/process'

export type SandboxProcessRunner = (
  executable: string,
  args: string[],
  options?: { cwd?: string; timeoutMs?: number },
) => Promise<CommandResult>

export interface DockerAgentSandboxOptions {
  image: string
  runner?: SandboxProcessRunner
  timeoutMs?: number
  memory?: string
  cpus?: number
  pidsLimit?: number
}

export interface SandboxRunRequest {
  workspaceRoot: string
  executable: string
  args?: string[]
}

export class DockerAgentSandbox {
  private readonly image: string
  private readonly runner: SandboxProcessRunner
  private readonly timeoutMs: number
  private readonly memory: string
  private readonly cpus: number
  private readonly pidsLimit: number

  constructor(options: DockerAgentSandboxOptions) {
    if (!options.image?.trim()) throw new Error('Docker agent image is required.')
    this.image = options.image.trim()
    this.runner = options.runner ?? runCommand
    this.timeoutMs = options.timeoutMs ?? 300_000
    this.memory = options.memory ?? '2g'
    this.cpus = options.cpus ?? 2
    this.pidsLimit = options.pidsLimit ?? 128
  }

  async run(request: SandboxRunRequest): Promise<CommandResult> {
    if (!request.executable?.trim()) throw new Error('Container executable is required.')
    const workspaceRoot = path.resolve(request.workspaceRoot)
    const mount = `type=bind,source=${workspaceRoot},target=/workspace`

    return await this.runner('docker', [
      'run',
      '--rm',
      '--network', 'none',
      '--read-only',
      '--cap-drop', 'ALL',
      '--security-opt', 'no-new-privileges',
      '--pids-limit', String(this.pidsLimit),
      '--memory', this.memory,
      '--cpus', String(this.cpus),
      '--tmpfs', '/tmp:rw,noexec,nosuid,size=256m',
      '--mount', mount,
      '--workdir', '/workspace',
      this.image,
      request.executable,
      ...(request.args ?? []),
    ], { timeoutMs: this.timeoutMs })
  }
}
