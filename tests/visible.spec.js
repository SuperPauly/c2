import {test, expect} from '@playwright/test'

const views = [
	['desktop', 1440, 900],
	['laptop', 1366, 768],
	['mobile', 390, 844],
]

test.describe('visible OneView baseline', () => {
	for (const [name, width, height] of views) {
		test(name, async ({page}) => {
			const problems = []
			page.on('console', msg => {
				if (['error', 'warning'].includes(msg.type()) && !msg.text().includes('favicon') && !msg.text().includes('willReadFrequently')) problems.push(msg.text())
			})
			page.on('pageerror', err => problems.push(err.message))
			await page.setViewportSize({width, height})
			await page.goto('/?now=2026-05-31')
			await expect(page).toHaveTitle('Calendar')
			const pixels = await page.locator('canvas').evaluate(canvas => {
				const ctx = canvas.getContext('2d')
				return [ctx.getImageData(120, 130, 1, 1).data.slice(0, 3).join(','), ctx.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data.slice(0, 3).join(',')]
			})
			expect(new Set(pixels).size).toBeGreaterThan(1)
			await expect(page).toHaveScreenshot(`baseline-${name}.png`, {maxDiffPixelRatio: 0.28})
			const before = await page.locator('canvas').screenshot()
			await page.mouse.wheel(0, 280)
			await page.waitForTimeout(50)
			const after = await page.locator('canvas').screenshot()
			expect(Buffer.compare(before, after)).not.toBe(0)
			expect(problems).toEqual([])
		})
	}
})
