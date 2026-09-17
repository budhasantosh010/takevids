import path from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { DockerAgentSandbox } from './dockerSandbox'

describe('DockerAgentSandbox', () => {
  it('constructs a locked-down container command with only the job workspace mounted', async () => {
    const runner = vi.fn(async (executable: string, args: string[], options?: { cwd?: string; timeoutMs?: number }) => {
      void executable
      void args
      void options
      return { stdout: 'ok', stderr: '', exitCode: 0 }
    })
    const workspace = path.resolve('.takevids-runtime', 'jobs', 'job-1')
    const sandbox = new DockerAgentSandbox({ image: 'takevids-agent:test', runner })

    await sandbox.run({ workspaceRoot: workspace, executable: 'ffprobe', args: ['-version'] })

    expect(runner).toHaveBeenCalledTimes(1)
    const [command, args, options] = runner.mock.calls[0]
    expect(command).toBe('docker')
    expect(args).toEqual(expect.arrayContaining([
      'run', '--rm', '--network', 'none', '--read-only', '--cap-drop', 'ALL',
      '--security-opt', 'no-new-privileges', '--workdir', '/workspace',
      'takevids-agent:test', 'ffprobe', '-version',
    ]))
    const mountIndex = args.indexOf('--mount')
    expect(mountIndex).toBeGreaterThan(-1)
    expect(args[mountIndex + 1]).toContain(`source=${workspace}`)
    expect(args[mountIndex + 1]).toContain('target=/workspace')
    expect(options).toBeDefined()
    expect(options?.timeoutMs).toBeGreaterThan(0)
  })

  it('rejects an empty image/executable and does not pass arbitrary host environment variables', async () => {
    const runner = vi.fn(async (executable: string, args: string[], options?: { cwd?: string; timeoutMs?: number }) => {
      void executable
      void args
      void options
      return { stdout: '', stderr: '', exitCode: 0 }
    })
    expect(() => new DockerAgentSandbox({ image: '', runner })).toThrow(/image/i)

    const sandbox = new DockerAgentSandbox({ image: 'takevids-agent:test', runner })
    await expect(sandbox.run({ workspaceRoot: '.', executable: '', args: [] })).rejects.toThrow(/executable/i)
  })
})
