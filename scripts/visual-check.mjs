import { chromium } from 'playwright-core'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const outputDir = path.resolve('artifacts')
await mkdir(outputDir, { recursive: true })

const browser = await chromium.launch({ executablePath: chromePath, headless: true })
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 })
const browserErrors = []
page.on('console', (message) => {
  if (message.type() === 'error') browserErrors.push(`console: ${message.text()}`)
})
page.on('pageerror', (error) => browserErrors.push(`page: ${error.message}`))
page.on('response', (response) => {
  if (response.status() >= 400) browserErrors.push(`http ${response.status()}: ${response.url()}`)
})

try {
  await page.goto('http://127.0.0.1:2500', { waitUntil: 'networkidle' })
  await page.screenshot({ path: path.join(outputDir, '01-reference.png') })

  await page.getByRole('button', { name: /use demo reference/i }).click()
  await page.getByRole('button', { name: /reverse engineer this video/i }).click()
  await page.waitForTimeout(1800)
  await page.screenshot({ path: path.join(outputDir, '02-kit-ready.png') })

  await page.getByRole('tab', { name: /media/i }).click()
  await page.getByRole('button', { name: /load demo media/i }).click()
  const imageCard = page.locator('.asset-card').filter({ hasText: 'customer-proof.png' })
  await imageCard.getByRole('button', { name: /add/i }).click()
  await page.screenshot({ path: path.join(outputDir, '03-media-bin.png') })

  await page.getByRole('button', { name: /use demo footage/i }).click()
  await page.getByRole('button', { name: /edit this video/i }).click()
  await page.waitForTimeout(1900)
  await page.screenshot({ path: path.join(outputDir, '04-review.png') })

  const composer = page.getByPlaceholder(/make the first 3 seconds punchier/i)
  await composer.fill('Make the first 3 seconds punchier and keep the captions below the face.')
  await composer.press('Enter')
  await page.waitForTimeout(150)
  await page.screenshot({ path: path.join(outputDir, '05-refined.png') })

  await page.getByRole('button', { name: /export video/i }).click()
  await page.waitForTimeout(100)
  await page.screenshot({ path: path.join(outputDir, '06-export-ready.png') })

  for (const viewport of [
    { width: 1024, height: 800, name: '07-compact-desktop.png' },
    { width: 820, height: 900, name: '08-stacked-browser.png' },
  ]) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.waitForTimeout(120)
    const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
    if (hasHorizontalOverflow) browserErrors.push(`layout overflow at ${viewport.width}px`)
    await page.screenshot({ path: path.join(outputDir, viewport.name) })
  }

  if (browserErrors.length) {
    console.error('Browser errors:')
    for (const error of browserErrors) console.error(`- ${error}`)
    process.exitCode = 1
  } else {
    console.log('Visual flow completed with no browser console/page/network errors.')
  }
} finally {
  await browser.close()
}
