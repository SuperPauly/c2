import {test, expect} from '@playwright/test'
import {installHostMock} from '../helpers/hostMock.js'
import {waitForCanvasReady, captureCanvas} from '../helpers/screenshots.js'
import {singleEvent, denseSameDayEvents, overlappingEvents, manyEvents, emptyState} from '../fixtures/markwhenStates.js'
import {defaultAppState, darkModeAppState, sourceColourMapAppState, detailFirstEventAppState} from '../fixtures/appStates.js'

const REFERENCE_DATE = '2026-01-15'

test.describe('Visual parity – candidate rendering', () => {
	test.beforeEach(async ({page}) => {
		await page.clock.setFixedTime(new Date('2026-01-15T12:00:00.000Z'))
	})

	test('initial timeline renders with content at the current viewport', async ({page}) => {
		await installHostMock(page, {appState: sourceColourMapAppState, text: singleEvent.text})
		await page.goto(`/?now=${REFERENCE_DATE}`)
		await waitForCanvasReady(page)

		// Canvas should have meaningful content
		const screenshot = await captureCanvas(page)
		expect(screenshot.length).toBeGreaterThan(1000)

		// Snapshot comparison for regression detection
		await expect(page).toHaveScreenshot(`timeline-initial.png`, {
			maxDiffPixelRatio: 0.05,
		})
	})

	test('dark mode renders with the correct background palette', async ({page}) => {
		await installHostMock(page, {appState: darkModeAppState, text: singleEvent.text})
		await page.goto(`/?now=${REFERENCE_DATE}`)
		await waitForCanvasReady(page)

		// Dark background should be close to #101418
		const topLeft = await page.locator('canvas').evaluate((canvas) => {
			const data = canvas.getContext('2d').getImageData(5, 5, 1, 1).data
			return [data[0], data[1], data[2]]
		})
		// Dark theme background is rgb(16, 20, 24)
		expect(topLeft[0]).toBeLessThan(30)
		expect(topLeft[1]).toBeLessThan(30)
		expect(topLeft[2]).toBeLessThan(40)

		await expect(page).toHaveScreenshot(`timeline-dark-mode.png`, {
			maxDiffPixelRatio: 0.05,
		})
	})

	test('dense overlapping events render without visual corruption', async ({page}) => {
		await installHostMock(page, {appState: sourceColourMapAppState, text: denseSameDayEvents.text})
		await page.goto(`/?now=${REFERENCE_DATE}`)
		await waitForCanvasReady(page)

		await expect(page).toHaveScreenshot(`timeline-dense-events.png`, {
			maxDiffPixelRatio: 0.05,
		})
	})

	test('empty state renders gracefully without errors', async ({page}) => {
		const errors = []
		page.on('pageerror', err => errors.push(err.message))

		await installHostMock(page, {appState: defaultAppState, text: emptyState.text})
		await page.goto(`/?now=${REFERENCE_DATE}`)
		// Allow time for potential render
		await page.waitForTimeout(1000)

		// Should still have a canvas
		await expect(page.locator('canvas')).toBeVisible()
		expect(errors).toEqual([])

		await expect(page).toHaveScreenshot(`timeline-empty-state.png`, {
			maxDiffPixelRatio: 0.05,
		})
	})

	test('many events render for scrolling and performance validation', async ({page}) => {
		await installHostMock(page, {appState: sourceColourMapAppState, text: manyEvents.text})
		await page.goto(`/?now=${REFERENCE_DATE}`)
		await waitForCanvasReady(page)

		await expect(page).toHaveScreenshot(`timeline-many-events.png`, {
			maxDiffPixelRatio: 0.05,
		})
	})

	test('event selection/detail state renders with highlight', async ({page}) => {
		await installHostMock(page, {appState: detailFirstEventAppState, text: singleEvent.text})
		await page.goto(`/?now=${REFERENCE_DATE}`)
		await waitForCanvasReady(page)

		await expect(page).toHaveScreenshot(`timeline-detail-state.png`, {
			maxDiffPixelRatio: 0.05,
		})
	})

	test('colour-mapped events render with assigned colours', async ({page}) => {
		await installHostMock(page, {
			appState: sourceColourMapAppState,
			text: '2026-01-15: Blue work event #work\n2026-01-16: Green health event #health',
		})
		await page.goto(`/?now=${REFERENCE_DATE}`)
		await waitForCanvasReady(page)

		await expect(page).toHaveScreenshot(`timeline-colour-map.png`, {
			maxDiffPixelRatio: 0.05,
		})
	})
})
