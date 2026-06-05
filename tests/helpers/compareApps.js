/**
 * Comparison helpers for running assertions across both candidate and original apps.
 */

export const CANDIDATE_URL = 'http://127.0.0.1:6180'
export const ORIGINAL_URL = 'http://127.0.0.1:6181'

/**
 * Navigate to the candidate app with a fixed date parameter.
 */
export async function gotoCandidate(page, {now = '2026-01-15', path = '/'} = {}) {
	const url = `${CANDIDATE_URL}${path}?now=${now}`
	await page.goto(url)
}

/**
 * Navigate to the original app with a fixed date parameter.
 * Note: original may not support ?now= parameter; behaviour may differ.
 */
export async function gotoOriginal(page, {now = '2026-01-15', path = '/'} = {}) {
	const url = `${ORIGINAL_URL}${path}?now=${now}`
	await page.goto(url)
}

/**
 * Run an action on both apps and compare results.
 * @param {object} opts
 * @param {import('@playwright/test').Page} opts.candidatePage
 * @param {import('@playwright/test').Page} opts.originalPage
 * @param {function} opts.action - async function(page) to run on each
 * @returns {Promise<{candidate: any, original: any}>}
 */
export async function compareAction({candidatePage, originalPage, action}) {
	const [candidate, original] = await Promise.all([
		action(candidatePage),
		action(originalPage),
	])
	return {candidate, original}
}
