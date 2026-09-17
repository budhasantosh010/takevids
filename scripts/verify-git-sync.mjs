import { execFileSync } from 'node:child_process'

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim()

const status = git('status', '--porcelain')
if (status) {
  throw new Error(`Working tree is not clean:\n${status}`)
}

const head = git('rev-parse', 'HEAD')
const upstream = git('rev-parse', '@{upstream}')
if (head !== upstream) {
  throw new Error(`Local HEAD ${head} does not match upstream ${upstream}`)
}

const origin = git('remote', 'get-url', 'origin').replace(/\.git$/, '')
const expectedOrigin = 'https://github.com/budhasantosh010/takevids'
if (origin !== expectedOrigin) {
  throw new Error(`Unexpected origin: ${origin}`)
}

console.log(JSON.stringify({ ok: true, head: head.slice(0, 7), origin: expectedOrigin }, null, 2))
