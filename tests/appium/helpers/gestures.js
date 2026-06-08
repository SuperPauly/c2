/**
 * Appium W3C Actions gesture helpers.
 * Uses WebdriverIO v9 action API — no deprecated touchAction calls.
 */

export async function touchDrag(driver, start, end, {duration = 600} = {}) {
  await driver
    .action('pointer', {parameters: {pointerType: 'touch'}})
    .move({x: start.x, y: start.y})
    .down()
    .pause(50)
    .move({x: end.x, y: end.y, duration})
    .up()
    .perform()
  await driver.releaseActions()
}

export async function pinchGesture(driver, centre, startDist, endDist, {duration = 600} = {}) {
  const f1 = driver
    .action('pointer', {id: 'finger1', parameters: {pointerType: 'touch'}})
    .move({x: centre.x, y: centre.y - startDist})
    .down().pause(50)
    .move({x: centre.x, y: centre.y - endDist, duration})
    .up()
  const f2 = driver
    .action('pointer', {id: 'finger2', parameters: {pointerType: 'touch'}})
    .move({x: centre.x, y: centre.y + startDist})
    .down().pause(50)
    .move({x: centre.x, y: centre.y + endDist, duration})
    .up()
  await driver.actions([f1, f2])
  await driver.releaseActions()
}

export async function pinchOut(driver, centre, {distance = 150, duration = 600} = {}) {
  return pinchGesture(driver, centre, 30, 30 + distance, {duration})
}

export async function pinchIn(driver, centre, {distance = 150, duration = 600} = {}) {
  return pinchGesture(driver, centre, 30 + distance, 30, {duration})
}

export async function swipeUp(driver, {x = 200, startY = 600, deltaY = 300, duration = 500} = {}) {
  return touchDrag(driver, {x, y: startY}, {x, y: startY - deltaY}, {duration})
}

export async function swipeDown(driver, {x = 200, startY = 300, deltaY = 300, duration = 500} = {}) {
  return touchDrag(driver, {x, y: startY}, {x, y: startY + deltaY}, {duration})
}

export async function waitForCanvasReady(driver, timeoutMs = 10000) {
  await driver.waitUntil(async () => {
    return driver.execute(() => {
      const canvas = document.querySelector('canvas')
      if (!canvas || canvas.width === 0) return false
      const ctx = canvas.getContext('2d')
      const w = canvas.width, h = canvas.height
      const pts = [[5,5],[w/4,h/4],[w/2,h/2],[w*3/4,h/2],[w/2,h*3/4]]
      const colours = new Set()
      for (const [x, y] of pts) {
        const d = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data
        colours.add(`${d[0]},${d[1]},${d[2]}`)
        if (colours.size > 2) return true
      }
      return colours.size > 1
    })
  }, {timeout: timeoutMs, interval: 300, timeoutMsg: 'Canvas did not render content within timeout'})
}

export async function sampleCanvas(driver) {
  return driver.execute(() => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return null
    const ctx = canvas.getContext('2d')
    const w = canvas.width, h = canvas.height
    return [
      [w/4,h/4],[w/2,h/4],[w*3/4,h/4],
      [w/4,h/2],[w/2,h/2],[w*3/4,h/2],
      [w/4,h*3/4],[w/2,h*3/4],
    ].map(([x,y]) => {
      const d = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data
      return [d[0], d[1], d[2]]
    })
  })
}

export function pixelsChanged(before, after, threshold = 5) {
  if (!before || !after) return false
  return before.some((px, i) => px.some((v, j) => Math.abs(v - after[i][j]) > threshold))
}
