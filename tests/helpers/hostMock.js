/**
 * Host mock helper – injects a mock Markwhen host bridge into the page.
 * Works with the candidate app's __oneviewMock interface.
 */

/**
 * Install the host mock before page navigation.
 * Must be called before page.goto().
 */
export async function installHostMock(page, {appState = {}, markwhenState = null, text = ''} = {}) {
	const mockState = {
		appState: {
			colorMap: {},
			...appState,
		},
		markwhenState: markwhenState,
		text: text,
		requests: [],
	}

	await page.addInitScript((state) => {
		window.__oneviewMock = {
			appState: state.appState,
			markwhenState: state.markwhenState,
			text: state.text,
			requests: [],
		}
	}, mockState)
}

/**
 * Read all host messages sent by the app.
 */
export async function readHostMessages(page) {
	return page.evaluate(() => window.__oneviewMock?.requests || [])
}

/**
 * Update the appState and trigger a re-render via the mock bridge.
 */
export async function updateAppState(page, appState) {
	await page.evaluate((newState) => {
		const mock = window.__oneviewMock
		if (!mock) throw new Error('Host mock not installed')
		mock.appState = {...mock.appState, ...newState}
		// Trigger the app to re-request appState
		mock.requests.push({type: 'appState:updated'})
		// Dispatch a message event to simulate host update
		window.postMessage({
			type: 'appState',
			data: mock.appState,
		}, '*')
	}, appState)
}

/**
 * Update the markwhenState and trigger a re-render via the mock bridge.
 */
export async function updateMarkwhenState(page, markwhenState) {
	await page.evaluate((newState) => {
		const mock = window.__oneviewMock
		if (!mock) throw new Error('Host mock not installed')
		mock.markwhenState = newState
		mock.text = newState?.text || newState?.rawText || ''
		mock.requests.push({type: 'markwhenState:updated'})
		window.postMessage({
			type: 'markwhenState',
			data: newState,
		}, '*')
	}, markwhenState)
}

/**
 * Filter host messages by type.
 */
export async function readHostMessagesByType(page, type) {
	const messages = await readHostMessages(page)
	return messages.filter(m => m.type === type)
}

/**
 * Wait until a specific message type appears in the mock requests.
 */
export async function waitForHostMessage(page, type, timeoutMs = 5000) {
	await page.waitForFunction(
		({type, timeout}) => {
			const mock = window.__oneviewMock
			return mock?.requests?.some(r => r.type === type)
		},
		{type, timeout: timeoutMs},
		{timeout: timeoutMs}
	)
}
