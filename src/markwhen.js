import {parse, iter, isEvent} from '@markwhen/parser'
import {useLpc} from '@markwhen/view-client'

const samePath = (a, b) => pathKey(a) === pathKey(b)

export const pathKey = path => Array.isArray(path) ? path.join(',') : ''

const normalizeMarkwhenState = state => {
	if (!state?.parsed && !state?.transformed && !state?.rawText && !state?.text) return null
	if (state.transformed) return state
	const parsed = state.parsed || parse(state.rawText || state.text || '')
	return {...state, parsed, transformed: parsed.events}
}

const eventColor = (node, colorMap = {}) => {
	const tag = node.tags?.[0]
	const source = node.source || 'default'
	return tag ? colorMap?.[source]?.[tag] : undefined
}

export const eventsFromMarkwhen = (markwhenState, appState = {}) => {
	const root = markwhenState?.transformed
	if (!root) return null
	const colorMap = appState.colorMap || {}
	const events = []
	for (const {eventy, path} of iter(root)) {
		if (!eventy || !isEvent(eventy)) continue
		const start = new Date(eventy.dateRangeIso.fromDateTimeIso)
		const end = new Date(eventy.dateRangeIso.toDateTimeIso)
		if (isNaN(start.getTime()) || isNaN(end.getTime())) continue
		events.push({
			start,
			end,
			title: eventy.firstLine?.restTrimmed || '',
			color: eventColor(eventy, colorMap),
			path,
			pathKey: pathKey(path),
			hovered: samePath(path, appState.hoveringPath),
			detail: samePath(path, appState.detailPath),
			floating: end.getTime() - start.getTime() > 864e5,
		})
	}
	return events
}

export const createMarkwhenBridge = onChange => {
	const state = {appState: {colorMap: {}}, markwhenState: null}
	const apply = () => onChange({
		appState: state.appState,
		markwhenState: state.markwhenState,
		events: eventsFromMarkwhen(state.markwhenState, state.appState),
	})
	const listeners = {
		appState(appState) {
			state.appState = {...state.appState, ...appState, colorMap: appState?.colorMap || state.appState.colorMap || {}}
			apply()
		},
		markwhenState(markwhenState) {
			state.markwhenState = normalizeMarkwhenState(markwhenState)
			apply()
		},
	}
	const mock = window.__oneviewMock
	if (mock) {
		mock.requests ||= []
		const postRequest = (type, params) => {
			mock.requests.push({type, params})
			if (type === 'appState') listeners.appState(mock.appState || {})
			if (type === 'markwhenState') listeners.markwhenState(mock.markwhenState || mock.parsed || {text: mock.text})
			return Promise.resolve()
		}
		postRequest('appState')
		postRequest('markwhenState')
		return {postRequest}
	}
	const bridge = useLpc(listeners)
	bridge.postRequest('appState')
	bridge.postRequest('markwhenState')
	return bridge
}
