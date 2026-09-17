import path from 'node:path'
import { LocalJobStore } from './jobStore'

const runtimeRoot = path.resolve(process.env.TAKEVIDS_RUNTIME_ROOT ?? '.takevids-runtime')
const store = new LocalJobStore({ rootDir: runtimeRoot })
const actions = await store.cleanupExpired()

console.log(JSON.stringify({
  runtimeRoot,
  cleanedJobs: actions.length,
  actions,
}, null, 2))
