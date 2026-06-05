/**
 * Mobile gesture simulation helpers for Playwright.
 * Provides touch drag and pinch gesture simulation.
 */

/**
 * Simulate a touch drag gesture.
 * @param {import('@playwright/test').Page} page
 * @param {{x: number, y: number}} start - Start point
 * @param {{x: number, y: number}} end - End point
 * @param {object} opts - Options
 * @param {number} opts.steps - Number of intermediate steps (default 10)
 * @param {number} opts.duration - Duration in ms (default 300)
 */
export async function touchDrag(page, start, end, {steps = 10, duration = 300} = {}) {
	await page.touchscreen.tap(start.x, start.y)
	await page.waitForTimeout(50)

	// Use CDP for more reliable touch simulation
	const client = await page.context().newCDPSession(page)
	const stepDelay = duration / steps

	await client.send('Input.dispatchTouchEvent', {
		type: 'touchStart',
		touchPoints: [{x: start.x, y: start.y}],
	})

	for (let i = 1; i <= steps; i++) {
		const progress = i / steps
		const x = start.x + (end.x - start.x) * progress
		const y = start.y + (end.y - start.y) * progress
		await client.send('Input.dispatchTouchEvent', {
			type: 'touchMove',
			touchPoints: [{x, y}],
		})
		await page.waitForTimeout(stepDelay)
	}

	await client.send('Input.dispatchTouchEvent', {
		type: 'touchEnd',
		touchPoints: [],
	})

	await client.detach()
}

/**
 * Simulate a pinch gesture using CDP.
 * @param {import('@playwright/test').Page} page
 * @param {{x: number, y: number}} centre - Centre point of the pinch
 * @param {number} startDistance - Starting distance between fingers
 * @param {number} endDistance - Ending distance between fingers
 * @param {object} opts
 * @param {number} opts.steps - Number of steps (default 10)
 * @param {number} opts.duration - Duration in ms (default 500)
 */
export async function pinchGesture(page, centre, startDistance, endDistance, {steps = 10, duration = 500} = {}) {
	const client = await page.context().newCDPSession(page)

	// Try CDP synthesizePinchGesture first
	try {
		const scaleFactor = endDistance / startDistance
		await client.send('Input.synthesizePinchGesture', {
			x: centre.x,
			y: centre.y,
			scaleFactor,
			relativeSpeed: 300,
		})
		await client.detach()
		return {method: 'cdp-synthesize'}
	} catch {
		// Fall back to manual two-finger simulation
	}

	// Manual two-finger touch simulation
	const stepDelay = duration / steps

	for (let i = 0; i <= steps; i++) {
		const progress = i / steps
		const distance = startDistance + (endDistance - startDistance) * progress
		const halfDist = distance / 2

		const touchPoints = [
			{x: centre.x - halfDist, y: centre.y, id: 0},
			{x: centre.x + halfDist, y: centre.y, id: 1},
		]

		if (i === 0) {
			await client.send('Input.dispatchTouchEvent', {
				type: 'touchStart',
				touchPoints,
			})
		} else {
			await client.send('Input.dispatchTouchEvent', {
				type: 'touchMove',
				touchPoints,
			})
		}

		if (i < steps) await page.waitForTimeout(stepDelay)
	}

	await client.send('Input.dispatchTouchEvent', {
		type: 'touchEnd',
		touchPoints: [],
	})

	await client.detach()
	return {method: 'cdp-manual'}
}

/**
 * Simulate pinch-out (zoom in) gesture.
 */
export async function pinchOut(page, centre, {distance = 100, steps = 10} = {}) {
	return pinchGesture(page, centre, 30, 30 + distance, {steps})
}

/**
 * Simulate pinch-in (zoom out) gesture.
 */
export async function pinchIn(page, centre, {distance = 100, steps = 10} = {}) {
	return pinchGesture(page, centre, 30 + distance, 30, {steps})
}

/**
 * Simulate a vertical touch drag (common scroll gesture).
 */
export async function touchScrollVertical(page, {x = 200, startY = 400, deltaY = -200, steps = 10} = {}) {
	return touchDrag(page, {x, y: startY}, {x, y: startY + deltaY}, {steps})
}

/**
 * Simulate a horizontal touch drag.
 */
export async function touchScrollHorizontal(page, {y = 400, startX = 200, deltaX = -200, steps = 10} = {}) {
	return touchDrag(page, {x: startX, y}, {x: startX + deltaX, y}, {steps})
}
