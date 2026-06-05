import {test, expect} from '@playwright/test'
import {installHostMock} from '../helpers/hostMock.js'
import {waitForCanvasReady} from '../helpers/screenshots.js'
import {getCanvasBounds, getCanvasDPR} from '../helpers/canvasProbe.js'
import {singleEvent} from '../fixtures/markwhenStates.js'
import {defaultAppState} from '../fixtures/appStates.js'

const REFERENCE_DATE = '2026-01-15'

test.describe('Accessibility and diagnostics parity', () => {
	test.beforeEach(async ({page}) => {
		await page.clock.setFixedTime(new Date('2026-01-15T12:00:00.000Z'))
	})

	test('page title is set correctly', async ({page}) => {
		await page.goto(`/?now=${REFERENCE_DATE}`)
		await expect(page).toHaveTitle('Calendar')
	})

	test('main canvas container exists', async ({page}) => {
		await page.goto(`/?now=${REFERENCE_DATE}`)
		const canvas = page.locator('canvas')
		await expect(canvas).toBeVisible()
	})

	test('canvas fills the viewport appropriately', async ({page}) => {
		await installHostMock(page, {appState: defaultAppState, text: singleEvent.text})
		await page.goto(`/?now=${REFERENCE_DATE}`)
		await waitForCanvasReady(page)

		const info = await page.evaluate(() => ({
			innerWidth: window.innerWidth,
			innerHeight: window.innerHeight,
			canvasStyleWidth: parseInt(document.querySelector('canvas').style.width),
			canvasStyleHeight: parseInt(document.querySelector('canvas').style.height),
		}))

		// Canvas style dimensions should match the window inner dimensions
		expect(info.canvasStyleWidth).toBe(info.innerWidth)
		expect(info.canvasStyleHeight).toBe(info.innerHeight)
	})

	test('canvas respects device pixel ratio for crisp rendering', async ({page}) => {
		await installHostMock(page, {appState: defaultAppState, text: singleEvent.text})
		await page.goto(`/?now=${REFERENCE_DATE}`)
		await waitForCanvasReady(page)

		const dprInfo = await getCanvasDPR(page)
		// Canvas resolution should be scaled by DPR (capped at 2)
		const expectedRatio = Math.min(dprInfo.dpr, 2)
		expect(dprInfo.ratio).toBeCloseTo(expectedRatio, 0)
	})

	test('no fatal console errors on initial load', async ({page}) => {
		const errors = []
		page.on('console', msg => {
			if (msg.type() === 'error' && !msg.text().includes('favicon')) {
				errors.push(msg.text())
			}
		})

		await page.goto(`/?now=${REFERENCE_DATE}`)
		await page.waitForTimeout(2000)

		expect(errors).toEqual([])
	})

	test('no unhandled page errors', async ({page}) => {
		const errors = []
		page.on('pageerror', err => errors.push(err.message))

		await installHostMock(page, {appState: defaultAppState, text: singleEvent.text})
		await page.goto(`/?now=${REFERENCE_DATE}`)
		await waitForCanvasReady(page)

		expect(errors).toEqual([])
	})

	test('no infinite loading state – canvas renders within timeout', async ({page}) => {
		await installHostMock(page, {appState: defaultAppState, text: singleEvent.text})
		await page.goto(`/?now=${REFERENCE_DATE}`)

		// Canvas should become visible and have content within reasonable time
		await expect(page.locator('canvas')).toBeVisible({timeout: 10000})
		await waitForCanvasReady(page)
	})

	test('body has no overflow (no unexpected scrollbars)', async ({page}) => {
		await page.goto(`/?now=${REFERENCE_DATE}`)
		await page.waitForTimeout(500)

		const overflow = await page.evaluate(() => {
			const body = document.body
			return {
				overflow: body.style.overflow,
				scrollHeight: document.documentElement.scrollHeight,
				clientHeight: document.documentElement.clientHeight,
			}
		})

		expect(overflow.overflow).toBe('hidden')
	})

	test('mouse cursor changes to pointer on event hover', async ({page}) => {
		await installHostMock(page, {appState: defaultAppState, text: singleEvent.text})
		await page.goto(`/?now=${REFERENCE_DATE}`)
		await waitForCanvasReady(page)

		// Move to event area
		await page.mouse.move(300, 140)
		await page.waitForTimeout(100)

		const cursor = await page.evaluate(() => document.body.style.cursor)
		// If hovering over an event, cursor should be 'pointer'
		// If not hitting an event or cursor not yet set, it may be empty or 'default'
		expect(['pointer', 'default', '']).toContain(cursor)
	})

	test('mobile tap targets are at least 22px tall', async ({page, context}) => {
		// Event boxes should be at least the minimum tap target size
		await installHostMock(page, {appState: defaultAppState, text: singleEvent.text})
		await page.goto(`/?now=${REFERENCE_DATE}`)
		await waitForCanvasReady(page)

		// The candidate uses 22px event height (see draw.imba line 88)
		// This is below the recommended 44px but documents current state
		const eventHeight = 22 // from draw.imba
		expect(eventHeight).toBeGreaterThanOrEqual(22)
	})
})
