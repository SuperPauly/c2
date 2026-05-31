import {events} from './timeline/data.imba'
import {draw} from './timeline/draw.imba'
import {createMarkwhenBridge, pathKey} from './markwhen.js'

const params = new URLSearchParams(location.search)
let state = {
	canvas: document.createElement('canvas')
	offset: 0
	now: new Date(params.get('now') || Date.now())
	hostEvents: null
	isDark: false
	hits: []
	hoverKey: ''
	postRequest: null
}

document.title = 'Calendar'
document.body.style.margin = '0'
document.body.style.overflow = 'hidden'
document.body.appendChild state.canvas
const ctx = state.canvas.getContext('2d')

def render
	const dpr = Math.min(devicePixelRatio || 1, 2)
	state.canvas.width = innerWidth * dpr
	state.canvas.height = innerHeight * dpr
	state.canvas.style.width = innerWidth + 'px'
	state.canvas.style.height = innerHeight + 'px'
	ctx.setTransform dpr, 0, 0, dpr, 0, 0
	state.hits = draw ctx, innerWidth, innerHeight, state.now, state.offset, state.hostEvents || events(state.now), {dark: state.isDark}

def hitAt x, y
	for h in state.hits
		if x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h
			return h
	null

def setHover hit
	const key = hit ? hit.pathKey : ''
	if key == state.hoverKey
		return
	state.hoverKey = key
	document.body.style.cursor = hit && hit.path ? 'pointer' : 'default'
	if state.postRequest
		state.postRequest 'setHoveringPath', hit ? hit.path : undefined

def setDetail hit
	if hit && hit.path && state.postRequest
		state.postRequest 'setDetailPath', hit.path

addEventListener 'resize', render
addEventListener 'wheel' do(e)
	state.offset = Math.max(0, state.offset + e.deltaY)
	render()

let touchY = 0
addEventListener 'touchstart' do(e)
	touchY = e.touches[0].clientY
addEventListener 'touchmove' do(e)
	const y = e.touches[0].clientY
	state.offset = Math.max(0, state.offset + touchY - y)
	touchY = y
	render()
addEventListener 'touchend' do(e)
	const t = e.changedTouches[0]
	setDetail hitAt(t.clientX, t.clientY)
addEventListener 'mousemove' do(e)
	setHover hitAt(e.clientX, e.clientY)
addEventListener 'mouseleave' do
	setHover null
addEventListener 'click' do(e)
	setDetail hitAt(e.clientX, e.clientY)

const bridge = createMarkwhenBridge do(payload)
	const appState = payload.appState || {}
	state.hostEvents = payload.events
	state.isDark = !!appState.isDark
	for e in state.hostEvents || []
		if e.pathKey == pathKey(appState.hoveringPath)
			state.hoverKey = e.pathKey
	render()
state.postRequest = bridge.postRequest

render!
