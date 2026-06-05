import {
  touchDrag, pinchOut, pinchIn, swipeUp, swipeDown,
  waitForCanvasReady, sampleCanvas, pixelsChanged
} from './helpers/gestures.js'

const APP_URL = 'http://10.0.2.2:6180/?now=2026-01-15'
const CENTRE   = {x: 200, y: 400}

describe('Appium mobile gesture tests — c2 calendar', function () {

  before(async function () {
    try {
      const caps = await browser.capabilities;
      if (!caps?.platformName) {
        return this.skip('No Appium device connected — run `emulator -avd <name>` first')
      }
    } catch (e) {
      console.log('Skipping tests, could not connect to emulator')
    }
  })

  beforeEach(async function () {
    if (this.currentTest.parent.pending) return;
    await browser.url(APP_URL)
    await waitForCanvasReady(browser)
  })

  afterEach(async function () {
    if (this.currentTest.parent.pending) return;
    await browser.releaseActions()
  })

  it('swipe up scrolls the timeline', async function () {
    if (!global.browser || !browser.capabilities) return this.skip('No device');
    const before = await sampleCanvas(browser)
    await swipeUp(browser, {x: 195, startY: 600, deltaY: 300})
    await browser.pause(300)
    const after = await sampleCanvas(browser)
    expect(pixelsChanged(before, after)).toBe(true)
  })

  it('swipe down scrolls the timeline in reverse', async function () {
    if (!global.browser || !browser.capabilities) return this.skip('No device');
    await swipeUp(browser, {x: 195, startY: 600, deltaY: 300})
    await browser.pause(200)
    const before = await sampleCanvas(browser)
    await swipeDown(browser, {x: 195, startY: 300, deltaY: 300})
    await browser.pause(300)
    const after = await sampleCanvas(browser)
    expect(pixelsChanged(before, after)).toBe(true)
  })

  it('pinch-out does not crash the app', async function () {
    if (!global.browser || !browser.capabilities) return this.skip('No device');
    await pinchOut(browser, CENTRE, {distance: 150})
    await browser.pause(400)
    const sample = await sampleCanvas(browser)
    expect(sample).not.toBeNull()
  })

  it('pinch-in does not crash the app', async function () {
    if (!global.browser || !browser.capabilities) return this.skip('No device');
    await pinchIn(browser, CENTRE, {distance: 150})
    await browser.pause(400)
    const sample = await sampleCanvas(browser)
    expect(sample).not.toBeNull()
  })

  it('pinch followed by drag does not crash', async function () {
    if (!global.browser || !browser.capabilities) return this.skip('No device');
    await pinchOut(browser, CENTRE)
    await browser.pause(100)
    await swipeUp(browser, {x: 195, startY: 600, deltaY: 200})
    await browser.pause(200)
    const logs = await browser.getLogs('browser')
    const errors = logs.filter(l => l.level === 'SEVERE' && !l.message.includes('favicon'))
    expect(errors).toHaveLength(0)
  })

  it('drag followed by pinch does not crash', async function () {
    if (!global.browser || !browser.capabilities) return this.skip('No device');
    await swipeUp(browser, {x: 195, startY: 600, deltaY: 200})
    await browser.pause(100)
    await pinchOut(browser, CENTRE)
    await browser.pause(200)
    const logs = await browser.getLogs('browser')
    const errors = logs.filter(l => l.level === 'SEVERE' && !l.message.includes('favicon'))
    expect(errors).toHaveLength(0)
  })

  it('repeated pinch cycles do not corrupt state', async function () {
    if (!global.browser || !browser.capabilities) return this.skip('No device');
    for (let i = 0; i < 3; i++) {
      await pinchOut(browser, CENTRE, {distance: 80})
      await browser.pause(100)
      await pinchIn(browser, CENTRE, {distance: 80})
      await browser.pause(100)
    }
    const sample = await sampleCanvas(browser)
    expect(sample).not.toBeNull()
    const logs = await browser.getLogs('browser')
    const errors = logs.filter(l => l.level === 'SEVERE' && !l.message.includes('favicon'))
    expect(errors).toHaveLength(0)
  })

  it('page does not scroll when canvas owns the gesture', async function () {
    if (!global.browser || !browser.capabilities) return this.skip('No device');
    const before = await browser.execute(() => window.scrollY)
    await swipeUp(browser, {x: 195, startY: 600, deltaY: 300})
    await browser.pause(300)
    const after = await browser.execute(() => window.scrollY)
    expect(after).toBe(before)
  })

  it('canvas redraws after orientation change', async function () {
    if (!global.browser || !browser.capabilities) return this.skip('No device');
    const before = await browser.execute(() => {
      const c = document.querySelector('canvas')
      return {w: c.width, h: c.height}
    })
    await browser.setWindowSize(844, 390)
    await browser.pause(400)
    const after = await browser.execute(() => {
      const c = document.querySelector('canvas')
      return {w: c.width, h: c.height}
    })
    expect(after.w !== before.w || after.h !== before.h).toBe(true)
  })
})
