/**
 * Screenshot and visual comparison helpers.
 */

/**
 * Capture a screenshot of the canvas element.
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<Buffer>}
 */
export async function captureCanvas(page) {
	const canvas = page.locator('canvas')
	await canvas.waitFor({state: 'visible', timeout: 10000})
	return canvas.screenshot()
}

/**
 * Wait for the canvas to have non-blank content (at least some drawn pixels).
 */
export async function waitForCanvasReady(page) {
	await page.waitForFunction(() => {
		const canvas = document.querySelector('canvas')
		if (!canvas || canvas.width === 0 || canvas.height === 0) return false
		const ctx = canvas.getContext('2d')
		// Sample pixels from spread-out positions across the canvas
		const w = canvas.width
		const h = canvas.height
		const positions = [
			[5, 5], [w / 4, h / 4], [w / 2, h / 2],
			[w / 2, h / 4], [w / 4, h / 2], [100, 130],
			[w - 50, h / 3], [60, h / 2],
		]
		const colours = new Set()
		for (const [x, y] of positions) {
			const px = Math.min(Math.floor(x), w - 1)
			const py = Math.min(Math.floor(y), h - 1)
			const d = ctx.getImageData(px, py, 1, 1).data
			colours.add(`${d[0]},${d[1]},${d[2]}`)
			if (colours.size > 2) return true
		}
		return colours.size > 1
	}, {timeout: 10000})
}

/**
 * Get RGB values at a specific canvas pixel.
 */
export async function rgbAt(page, x, y) {
	return page.locator('canvas').evaluate((canvas, point) => {
		const data = canvas.getContext('2d').getImageData(point.x, point.y, 1, 1).data
		return Array.from(data.slice(0, 3))
	}, {x, y})
}

/**
 * Check if an RGB value is close to a hex colour.
 */
export function closeTo(rgb, hex, distance = 15) {
	const target = hex.replace('#', '').match(/.{2}/g).map(v => parseInt(v, 16))
	return rgb.every((value, i) => Math.abs(value - target[i]) <= distance)
}

/**
 * Compare two screenshot buffers and return the percentage of differing pixels.
 * Simple comparison - for detailed diff use Playwright's built-in toHaveScreenshot.
 */
export function screenshotsDiffer(bufA, bufB) {
	if (bufA.length !== bufB.length) return true
	let diffPixels = 0
	const totalPixels = bufA.length / 4
	for (let i = 0; i < bufA.length; i += 4) {
		const dr = Math.abs(bufA[i] - bufB[i])
		const dg = Math.abs(bufA[i + 1] - bufB[i + 1])
		const db = Math.abs(bufA[i + 2] - bufB[i + 2])
		if (dr + dg + db > 30) diffPixels++
	}
	return diffPixels / totalPixels > 0.001
}
