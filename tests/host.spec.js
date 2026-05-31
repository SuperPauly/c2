import {test, expect} from '@playwright/test'

const hostText = '2026-05-30: Host launch #work'

async function rgbAt(page, x, y) {
	return page.locator('canvas').evaluate((canvas, point) => {
		const data = canvas.getContext('2d').getImageData(point.x, point.y, 1, 1).data
		return Array.from(data.slice(0, 3))
	}, {x, y})
}

function closeTo(rgb, hex, distance = 10) {
	const target = hex.match(/[0-9a-f]{2}/gi).map(v => parseInt(v, 16))
	return rgb.every((value, i) => Math.abs(value - target[i]) <= distance)
}

async function installMock(page, appState = {}) {
	await page.addInitScript(({hostText, appState}) => {
		window.__oneviewMock = {
			text: hostText,
			appState: {
				colorMap: {default: {work: '#12aabb'}},
				...appState,
			},
			requests: [],
		}
	}, {hostText, appState})
}

test.describe('Markwhen host bridge', () => {
	test('renders host events with color map and posts hover/detail paths', async ({page}) => {
		await installMock(page)
		await page.setViewportSize({width: 1440, height: 900})
		await page.goto('/?now=2026-05-31')
		await page.waitForFunction(() => window.__oneviewMock.requests.some(r => r.type === 'markwhenState'))

		expect(closeTo(await rgbAt(page, 300, 140), '#12aabb')).toBe(true)
		expect(closeTo(await rgbAt(page, 120, 20), '#df2db8')).toBe(false)

		await page.mouse.move(300, 140)
		await page.mouse.click(300, 140)
		const requests = await page.evaluate(() => window.__oneviewMock.requests)
		expect(requests).toEqual(expect.arrayContaining([
			expect.objectContaining({type: 'appState'}),
			expect.objectContaining({type: 'markwhenState'}),
			expect.objectContaining({type: 'setHoveringPath', params: [0]}),
			expect.objectContaining({type: 'setDetailPath', params: [0]}),
		]))
	})

	test('uses the host dark mode palette', async ({page}) => {
		await installMock(page, {isDark: true})
		await page.setViewportSize({width: 1440, height: 900})
		await page.goto('/?now=2026-05-31')
		await page.waitForFunction(() => window.__oneviewMock.requests.some(r => r.type === 'markwhenState'))

		expect(await rgbAt(page, 10, 10)).toEqual([16, 20, 24])
		expect(closeTo(await rgbAt(page, 300, 140), '#12aabb')).toBe(true)
	})

	test('keeps the standalone demo fallback without host state', async ({page}) => {
		await page.setViewportSize({width: 1440, height: 900})
		await page.goto('/?now=2026-05-31')

		expect(closeTo(await rgbAt(page, 300, 140), '#12aabb')).toBe(false)
		expect(closeTo(await rgbAt(page, 120, 20), '#3b79d8')).toBe(true)
	})
})
