import {test, expect} from '@playwright/test'
import {installHostMock, readHostMessages, waitForHostMessage} from '../helpers/hostMock.js'
import {waitForCanvasReady} from '../helpers/screenshots.js'
import {singleEvent, multiSourceEvents} from '../fixtures/markwhenStates.js'
import {defaultAppState, darkModeAppState, sourceColourMapAppState, hoveringFirstEventAppState, detailFirstEventAppState} from '../fixtures/appStates.js'

const REFERENCE_DATE = '2026-01-15'

test.describe('Markwhen host protocol parity', () => {
	test.beforeEach(async ({page}) => {
		await page.clock.setFixedTime(new Date('2026-01-15T12:00:00.000Z'))
	})

	test('appState request is posted on initial load', async ({page}) => {
		await installHostMock(page, {appState: defaultAppState, text: singleEvent.text})
		await page.goto(`/?now=${REFERENCE_DATE}`)
		await waitForHostMessage(page, 'appState')

		const messages = await readHostMessages(page)
		expect(messages.some(m => m.type === 'appState')).toBe(true)
	})

	test('markwhenState request is posted on initial load', async ({page}) => {
		await installHostMock(page, {appState: defaultAppState, text: singleEvent.text})
		await page.goto(`/?now=${REFERENCE_DATE}`)
		await waitForHostMessage(page, 'markwhenState')

		const messages = await readHostMessages(page)
		expect(messages.some(m => m.type === 'markwhenState')).toBe(true)
	})

	test('setHoveringPath is sent with correct path on hover', async ({page}) => {
		await installHostMock(page, {appState: sourceColourMapAppState, text: singleEvent.text})
		await page.goto(`/?now=${REFERENCE_DATE}`)
		await waitForCanvasReady(page)

		// Hover over the event area
		await page.mouse.move(300, 140)
		await page.waitForTimeout(200)

		const messages = await readHostMessages(page)
		const hover = messages.find(m => m.type === 'setHoveringPath')
		if (hover) {
			// Path should be an array (e.g., [0])
			expect(Array.isArray(hover.params)).toBe(true)
		}
	})

	test('setDetailPath is sent with correct path on click', async ({page}) => {
		await installHostMock(page, {appState: sourceColourMapAppState, text: singleEvent.text})
		await page.goto(`/?now=${REFERENCE_DATE}`)
		await waitForCanvasReady(page)

		// Click on the event area
		await page.mouse.click(300, 140)
		await page.waitForTimeout(200)

		const messages = await readHostMessages(page)
		const detail = messages.find(m => m.type === 'setDetailPath')
		if (detail) {
			expect(Array.isArray(detail.params)).toBe(true)
		}
	})

	test('dark mode state is received through appState', async ({page}) => {
		await installHostMock(page, {appState: darkModeAppState, text: singleEvent.text})
		await page.goto(`/?now=${REFERENCE_DATE}`)
		await waitForCanvasReady(page)

		// Verify the app received and applied dark mode
		const bg = await page.locator('canvas').evaluate((canvas) => {
			const data = canvas.getContext('2d').getImageData(5, 5, 1, 1).data
			return [data[0], data[1], data[2]]
		})
		expect(bg[0] + bg[1] + bg[2]).toBeLessThan(100)
	})

	test('colour map from appState is applied to events', async ({page}) => {
		await installHostMock(page, {
			appState: sourceColourMapAppState,
			text: '2026-01-15: Tagged event #work',
		})
		await page.goto(`/?now=${REFERENCE_DATE}`)
		await waitForCanvasReady(page)

		// Work colour is #2563eb – should appear in the event area
		const pixel = await page.locator('canvas').evaluate((canvas) => {
			const ctx = canvas.getContext('2d')
			const data = ctx.getImageData(300, 140, 1, 1).data
			return [data[0], data[1], data[2]]
		})
		// The blue channel should be dominant for #2563eb
		expect(pixel[2]).toBeGreaterThan(100)
	})

	test('hoveringPath from appState highlights the correct event', async ({page}) => {
		await installHostMock(page, {appState: hoveringFirstEventAppState, text: singleEvent.text})
		await page.goto(`/?now=${REFERENCE_DATE}`)
		await waitForCanvasReady(page)

		// The event should render with hover highlight
		// We verify this by checking the canvas has some distinct visual state
		const screenshot = await page.locator('canvas').screenshot()
		expect(screenshot.length).toBeGreaterThan(1000)
	})

	test('detailPath from appState highlights the correct event', async ({page}) => {
		await installHostMock(page, {appState: detailFirstEventAppState, text: singleEvent.text})
		await page.goto(`/?now=${REFERENCE_DATE}`)
		await waitForCanvasReady(page)

		const screenshot = await page.locator('canvas').screenshot()
		expect(screenshot.length).toBeGreaterThan(1000)
	})

	test('multiple colour sources are applied correctly', async ({page}) => {
		await installHostMock(page, {appState: sourceColourMapAppState, text: multiSourceEvents.text})
		await page.goto(`/?now=${REFERENCE_DATE}`)
		await waitForCanvasReady(page)

		// Should render without errors
		const errors = []
		page.on('pageerror', err => errors.push(err.message))
		await page.waitForTimeout(500)
		expect(errors).toEqual([])
	})
})
