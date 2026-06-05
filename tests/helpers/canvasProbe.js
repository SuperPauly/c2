/**
 * Canvas probing helpers for non-visual assertions on canvas-heavy apps.
 */

/**
 * Get the canvas bounding box dimensions.
 */
export async function getCanvasBounds(page) {
	return page.locator('canvas').evaluate(canvas => ({
		width: canvas.width,
		height: canvas.height,
		styleWidth: parseInt(canvas.style.width),
		styleHeight: parseInt(canvas.style.height),
		clientWidth: canvas.clientWidth,
		clientHeight: canvas.clientHeight,
	}))
}

/**
 * Get device pixel ratio applied to canvas.
 */
export async function getCanvasDPR(page) {
	return page.evaluate(() => {
		const canvas = document.querySelector('canvas')
		if (!canvas) return null
		return {
			dpr: window.devicePixelRatio,
			canvasWidth: canvas.width,
			styleWidth: parseInt(canvas.style.width) || canvas.clientWidth,
			ratio: canvas.width / (parseInt(canvas.style.width) || canvas.clientWidth),
		}
	})
}

/**
 * Get a sample of pixel colours from specific canvas regions.
 * Useful for verifying theme changes, event rendering, etc.
 */
export async function sampleCanvasRegions(page, regions) {
	return page.locator('canvas').evaluate((canvas, regions) => {
		const ctx = canvas.getContext('2d')
		return regions.map(({x, y, label}) => {
			const data = ctx.getImageData(x, y, 1, 1).data
			return {
				label,
				x, y,
				rgb: [data[0], data[1], data[2]],
				alpha: data[3],
			}
		})
	}, regions)
}

/**
 * Check if the canvas has any non-white/non-black content in a given rectangular area.
 */
export async function regionHasContent(page, {x, y, w, h}) {
	return page.locator('canvas').evaluate((canvas, rect) => {
		const ctx = canvas.getContext('2d')
		const data = ctx.getImageData(rect.x, rect.y, rect.w, rect.h).data
		let unique = new Set()
		for (let i = 0; i < data.length; i += 4) {
			unique.add(`${data[i]},${data[i + 1]},${data[i + 2]}`)
			if (unique.size > 2) return true
		}
		return unique.size > 1
	}, {x, y, w, h})
}
