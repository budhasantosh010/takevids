import { spawn } from 'node:child_process'

export interface CommandResult {
  stdout: string
  stderr: string
  exitCode: number
}

export class CommandError extends Error {
  readonly command: string
  readonly result: CommandResult

  constructor(command: string, result: CommandResult) {
    super(`Command failed (${result.exitCode}): ${command}\n${result.stderr}`)
    this.name = 'CommandError'
    this.command = command
    this.result = result
  }
}

export const runCommand = async (
  executable: string,
  args: string[],
  options: { cwd?: string; timeoutMs?: number } = {},
): Promise<CommandResult> => {
  const command = [executable, ...args].join(' ')

  return await new Promise<CommandResult>((resolve, reject) => {
    const child = spawn(executable, args, {
      cwd: options.cwd,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''
    let timer: NodeJS.Timeout | undefined

    child.stdout.setEncoding('utf8')
    child.stderr.setEncoding('utf8')
    child.stdout.on('data', (chunk: string) => { stdout += chunk })
    child.stderr.on('data', (chunk: string) => { stderr += chunk })

    child.on('error', reject)
    child.on('close', (exitCode) => {
      if (timer) clearTimeout(timer)
      const result = { stdout, stderr, exitCode: exitCode ?? -1 }
      if (result.exitCode === 0) resolve(result)
      else reject(new CommandError(command, result))
    })

    if (options.timeoutMs) {
      timer = setTimeout(() => {
        child.kill('SIGKILL')
        reject(new Error(`Command timed out after ${options.timeoutMs}ms: ${command}`))
      }, options.timeoutMs)
    }
  })
}
