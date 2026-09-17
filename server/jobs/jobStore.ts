import { mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import type { JobKind, JobRecord, JobStage, JobStatus, JobWorkspacePaths } from './types'

export interface JobStoreOptions {
  rootDir: string
  now?: () => Date
  tempHours?: number
  analysisDays?: number
  inputDays?: number
  outputDays?: number
}

const addHours = (date: Date, hours: number) => new Date(date.getTime() + hours * 60 * 60 * 1000).toISOString()
const addDays = (date: Date, days: number) => addHours(date, days * 24)

export class LocalJobStore {
  readonly rootDir: string
  private readonly now: () => Date
  private readonly tempHours: number
  private readonly analysisDays: number
  private readonly inputDays: number
  private readonly outputDays: number

  constructor(options: JobStoreOptions) {
    this.rootDir = path.resolve(options.rootDir)
    this.now = options.now ?? (() => new Date())
    this.tempHours = options.tempHours ?? 24
    this.analysisDays = options.analysisDays ?? 7
    this.inputDays = options.inputDays ?? 30
    this.outputDays = options.outputDays ?? 30
  }

  paths(jobId: string): JobWorkspacePaths {
    const root = path.join(this.rootDir, 'jobs', jobId)
    return {
      root,
      input: path.join(root, 'input'),
      analysis: path.join(root, 'analysis'),
      kit: path.join(root, 'kit'),
      output: path.join(root, 'output'),
      temp: path.join(root, 'temp'),
      record: path.join(root, 'job.json'),
    }
  }

  async create(kind: JobKind, metadata?: Record<string, unknown>): Promise<JobRecord> {
    const id = randomUUID()
    const createdAt = this.now()
    const paths = this.paths(id)

    await Promise.all([
      paths.input,
      paths.analysis,
      paths.kit,
      paths.output,
      paths.temp,
    ].map((directory) => mkdir(directory, { recursive: true })))

    const record: JobRecord = {
      id,
      kind,
      status: 'queued',
      stage: 'created',
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
      retention: {
        tempUntil: addHours(createdAt, this.tempHours),
        analysisUntil: addDays(createdAt, this.analysisDays),
        inputUntil: addDays(createdAt, this.inputDays),
        outputUntil: addDays(createdAt, this.outputDays),
      },
      metadata,
    }

    await this.writeRecord(record)
    return record
  }

  async load(jobId: string): Promise<JobRecord> {
    const raw = await readFile(this.paths(jobId).record, 'utf8')
    return JSON.parse(raw) as JobRecord
  }

  async update(
    jobId: string,
    changes: Partial<Pick<JobRecord, 'status' | 'stage' | 'error' | 'metadata'>>,
  ): Promise<JobRecord> {
    const current = await this.load(jobId)
    const updated: JobRecord = {
      ...current,
      ...changes,
      updatedAt: this.now().toISOString(),
    }
    await this.writeRecord(updated)
    return updated
  }

  async setStage(jobId: string, stage: JobStage, status: JobStatus = 'running') {
    return await this.update(jobId, { stage, status, error: undefined })
  }

  async list(): Promise<JobRecord[]> {
    const jobsRoot = path.join(this.rootDir, 'jobs')
    await mkdir(jobsRoot, { recursive: true })
    const entries = await readdir(jobsRoot, { withFileTypes: true })
    const records: JobRecord[] = []

    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      try {
        records.push(await this.load(entry.name))
      } catch {
        // A partially-created/corrupt job is intentionally skipped here;
        // the caller can inspect the workspace directly for recovery.
      }
    }

    return records.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  }

  async cleanupExpired(at = this.now()): Promise<{ jobId: string; removed: string[] }[]> {
    const jobs = await this.list()
    const actions: { jobId: string; removed: string[] }[] = []

    for (const job of jobs) {
      const paths = this.paths(job.id)
      const removed: string[] = []
      const maybeClear = async (directory: string, expiresAt?: string, label?: string) => {
        if (!expiresAt || Date.parse(expiresAt) > at.getTime()) return
        await rm(directory, { recursive: true, force: true })
        await mkdir(directory, { recursive: true })
        if (label) removed.push(label)
      }

      await maybeClear(paths.temp, job.retention.tempUntil, 'temp')
      await maybeClear(paths.analysis, job.retention.analysisUntil, 'analysis')
      await maybeClear(paths.input, job.retention.inputUntil, 'input')
      await maybeClear(paths.output, job.retention.outputUntil, 'output')
      if (job.retention.kitUntil) await maybeClear(paths.kit, job.retention.kitUntil, 'kit')

      if (removed.length) actions.push({ jobId: job.id, removed })
    }

    return actions
  }

  private async writeRecord(record: JobRecord) {
    const paths = this.paths(record.id)
    await mkdir(paths.root, { recursive: true })
    const tempPath = `${paths.record}.tmp`
    await writeFile(tempPath, `${JSON.stringify(record, null, 2)}\n`, 'utf8')
    await rename(tempPath, paths.record)
  }
}
