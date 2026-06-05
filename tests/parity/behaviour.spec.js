import {test, expect} from '@playwright/test'
import {installHostMock, readHostMessages} from '../helpers/hostMock.js'
import {waitForCanvasReady, captureCanvas} from '../helpers/screenshots.js'
import {singleEvent, denseSameDayEvents, manyEvents, emptyState} from '../fixtures/markwhenStates.js'
import {defaultAppState, darkModeAppState, sourceColourMapAppState} from '../fixtures/appStates.js'

const REFERENCE_DATE = '2026-01-15'

test.describe('Behaviour parity – candidate interactions', () => {
	test.beforeEach(async ({page}) => {
		await page.clock.setFixedTime(new Date('2026-01-15T12:00:00.000Z'))
	})

	test('initial load completes without uncaught page errors', async ({page}) => {
		const errors = []
		page.on('pageerror', err => errors.push(err.message))

		await installHostMock(page, {appState: defaultAppState, text: singleEvent.text})
		await page.goto(`/?now=${REFERENCE_DATE}`)
		await waitForCanvasReady(page)

		expect(errors).toEqual([])
	})

	test('no unexpected console errors on load', async ({page}) => {
		const errors = []
		page.on('console', msg => {
			if (msg.type() === 'error' && !msg.text().includes('favicon') && !msg.text().includes('willReadFrequently')) {
				errors.push(msg.text())
			}
		})

		await installHostMock(page, {appState: defaultAppState, text: singleEvent.text})
		await page.goto(`/?now=${REFERENCE_DATE}`)
		await waitForCanvasReady(page)

		expect(errors).toEqual([])
	})

	test('wheel scrolling moves the timeline', async ({page}) => {
		await installHostMock(page, {appState: defaultAppState, text: manyEvents.text})
		await page.goto(`/?now=${REFERENCE_DATE}`)
		await waitForCanvasReady(page)

		const before = await captureCanvas(page)
		await page.mouse.wheel(0, 300)
		await page.waitForTimeout(100)
		const after = await captureCanvas(page)

		expect(Buffer.compare(before, after)).not.toBe(0)
	})

	test('touch dragging moves the timeline vertically', async ({page}) => {
		test.skip(!page.context()._options?.hasTouch, 'Touch not available on this project')

		await installHostMock(page, {appState: defaultAppState, text: manyEvents.text})
		await page.goto(`/?now=${REFERENCE_DATE}`)
		await waitForCanvasReady(page)

		const before = await captureCanvas(page)
		await page.touchscreen.tap(200, 400)
		// Simulate drag via touchstart/touchmove/touchend
		const client = await page.context().newCDPSession(page)
		await client.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: 200, y: 400}]})
		for (let i = 1; i <= 5; i++) {
			await client.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: 200, y: 400 - i * 40}]})
			await page.waitForTimeout(30)
		}
		await client.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []})
		await client.detach()
		await page.waitForTimeout(100)

		const after = await captureCanvas(page)
		expect(Buffer.compare(before, after)).not.toBe(0)
	})

	test('event hover dispatches setHoveringPath via host bridge', async ({page}) => {
		// Use date close to event: first = now - 3 days, event needs to be within visible range
		await installHostMock(page, {appState: sourceColourMapAppState, text: '2026-01-13: Hover target #work'})
		await page.goto(`/?now=${REFERENCE_DATE}`)
		await waitForCanvasReady(page)

		// Sweep vertically across the event column (x > 115) to find a hit
		let found = false
		for (let y = 20; y < 700; y += 15) {
			await page.mouse.move(250, y)
			await page.waitForTimeout(20)
			const messages = await readHostMessages(page)
			if (messages.some(m => m.type === 'setHoveringPath')) {
				found = true
				break
			}
		}
		expect(found).toBe(true)
	})

	test('event click dispatches setDetailPath via host bridge', async ({page}) => {
		await installHostMock(page, {appState: sourceColourMapAppState, text: '2026-01-13: Click target #work'})
		await page.goto(`/?now=${REFERENCE_DATE}`)
		await waitForCanvasReady(page)

		// Sweep to find an event and click it
		let clicked = false
		for (let y = 20; y < 700; y += 15) {
			await page.mouse.click(250, y)
			await page.waitForTimeout(20)
			const messages = await readHostMessages(page)
			if (messages.some(m => m.type === 'setDetailPath')) {
				clicked = true
				break
			}
		}
		expect(clicked).toBe(true)
	})

	test('dark mode update changes the canvas background', async ({page}) => {
		await installHostMock(page, {appState: darkModeAppState, text: singleEvent.text})
		await page.goto(`/?now=${REFERENCE_DATE}`)
		await waitForCanvasReady(page)

		const bg = await page.locator('canvas').evaluate((canvas) => {
			const data = canvas.getContext('2d').getImageData(5, 5, 1, 1).data
			return [data[0], data[1], data[2]]
		})

		// Dark theme should have a dark background
		expect(bg[0] + bg[1] + bg[2]).toBeLessThan(100)
	})

	test('colour map update applies colours to events', async ({page}) => {
		await installHostMock(page, {
			appState: sourceColourMapAppState,
			text: '2026-01-14: Work task #work',
		})
		await page.goto(`/?now=${REFERENCE_DATE}`)
		await waitForCanvasReady(page)

		// The work colour is #2563eb (blue) from the colour map
		// Sample multiple positions to find the event bar
		const found = await page.locator('canvas').evaluate((canvas) => {
			const ctx = canvas.getContext('2d')
			// Scan event area (x > 115, various y positions)
			for (let y = 30; y < canvas.height / 2; y += 10) {
				const d = ctx.getImageData(300, y, 1, 1).data
				// Check for blue-dominant pixel (#2563eb → R=37, G=99, B=235)
				if (d[2] > 150 && d[2] > d[0] * 2) return true
			}
			return false
		})
		expect(found).toBe(true)
	})

	test('large event set remains responsive after scroll', async ({page}) => {
		await installHostMock(page, {appState: defaultAppState, text: manyEvents.text})
		await page.goto(`/?now=${REFERENCE_DATE}`)
		await waitForCanvasReady(page)

		const start = Date.now()
		for (let i = 0; i < 5; i++) {
			await page.mouse.wheel(0, 200)
			await page.waitForTimeout(50)
		}
		const elapsed = Date.now() - start
		// Should complete within reasonable time (not hung)
		expect(elapsed).toBeLessThan(5000)

		// Canvas should have redrawn
		const after = await captureCanvas(page)
		expect(after.length).toBeGreaterThan(1000)
	})

	test('empty event set renders without crash', async ({page}) => {
		const errors = []
		page.on('pageerror', err => errors.push(err.message))

		await installHostMock(page, {appState: defaultAppState, text: emptyState.text})
		await page.goto(`/?now=${REFERENCE_DATE}`)
		await page.waitForTimeout(1000)

		await expect(page.locator('canvas')).toBeVisible()
		expect(errors).toEqual([])
	})

	test('repeated state updates do not duplicate events visually', async ({page}) => {
		await installHostMock(page, {appState: sourceColourMapAppState, text: singleEvent.text})
		await page.goto(`/?now=${REFERENCE_DATE}`)
		await waitForCanvasReady(page)

		const first = await captureCanvas(page)

		// Simulate re-sending the same state
		await page.evaluate(() => {
			const mock = window.__oneviewMock
			mock.requests.push({type: 'markwhenState'})
		})
		await page.waitForTimeout(200)

		const second = await captureCanvas(page)
		// Screenshots should be identical (no duplication)
		expect(Buffer.compare(first, second)).toBe(0)
	})

	test('resize triggers a redraw at new dimensions', async ({page}) => {
		await installHostMock(page, {appState: defaultAppState, text: singleEvent.text})
		await page.goto(`/?now=${REFERENCE_DATE}`)
		await waitForCanvasReady(page)

		const beforeBounds = await page.locator('canvas').evaluate(c => ({w: c.width, h: c.height}))
		// Use a significantly different size to ensure it triggers a change
		const viewport = page.viewportSize()
		const newWidth = viewport.width > 600 ? 400 : 900
		const newHeight = viewport.height > 600 ? 400 : 900
		await page.setViewportSize({width: newWidth, height: newHeight})
		await page.waitForTimeout(300)
		const afterBounds = await page.locator('canvas').evaluate(c => ({w: c.width, h: c.height}))

		expect(afterBounds.w !== beforeBounds.w || afterBounds.h !== beforeBounds.h).toBe(true)
	})
})
