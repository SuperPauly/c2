/**
 * App server management helper for parity tests.
 * Handles starting candidate and original apps locally.
 */
import {execSync, spawn} from 'node:child_process'
import {existsSync} from 'node:fs'
import {resolve} from 'node:path'

const CANDIDATE_PORT = 6180
const ORIGINAL_PORT = 6181
const CANDIDATE_URL = `http://127.0.0.1:${CANDIDATE_PORT}`
const ORIGINAL_URL = `http://127.0.0.1:${ORIGINAL_PORT}`

const CANDIDATE_DIR = resolve(import.meta.dirname, '../../..')
const ORIGINAL_DIR = process.env.ORIGINAL_C2_DIR || '/tmp/original-c2'

async function waitForServer(url, timeoutMs = 60000) {
	const deadline = Date.now() + timeoutMs
	while (Date.now() < deadline) {
		try {
			const res = await fetch(url, {signal: AbortSignal.timeout(2000)})
			if (res.ok || res.status === 304) return true
		} catch {}
		await new Promise(r => setTimeout(r, 500))
	}
	throw new Error(`Server at ${url} did not become reachable within ${timeoutMs}ms`)
}

async function isReachable(url) {
	try {
		await fetch(url, {signal: AbortSignal.timeout(2000)})
		return true
	} catch {
		return false
	}
}

function ensureInstalled(dir) {
	if (!existsSync(resolve(dir, 'node_modules'))) {
		console.log(`Installing dependencies in ${dir}...`)
		execSync('npm install', {cwd: dir, stdio: 'pipe'})
	}
}

/**
 * Clone and prepare the original repository if not already present.
 */
export function ensureOriginalCloned() {
	if (!existsSync(ORIGINAL_DIR)) {
		console.log(`Cloning original repository to ${ORIGINAL_DIR}...`)
		execSync(`git clone --depth=1 https://github.com/mark-when/c2.git ${ORIGINAL_DIR}`, {stdio: 'pipe'})
	}
	ensureInstalled(ORIGINAL_DIR)
}

/**
 * Start the original app on port 6181. Returns a cleanup function.
 */
export async function startOriginal() {
	if (await isReachable(ORIGINAL_URL)) {
		console.log('Original app already running on port 6181')
		return () => {}
	}

	ensureOriginalCloned()

	const proc = spawn('npx', ['vite', '--port', String(ORIGINAL_PORT), '--host', '127.0.0.1'], {
		cwd: ORIGINAL_DIR,
		stdio: 'pipe',
		env: {...process.env},
	})

	proc.stderr?.on('data', d => {
		const msg = d.toString()
		if (msg.includes('error') || msg.includes('Error')) console.error('[original]', msg)
	})

	await waitForServer(ORIGINAL_URL)
	console.log('Original app started on port 6181')

	return () => {
		proc.kill('SIGTERM')
	}
}

/**
 * Start the candidate app on port 6180. Returns a cleanup function.
 */
export async function startCandidate() {
	if (await isReachable(CANDIDATE_URL)) {
		console.log('Candidate app already running on port 6180')
		return () => {}
	}

	ensureInstalled(CANDIDATE_DIR)

	const proc = spawn('npm', ['run', 'dev'], {
		cwd: CANDIDATE_DIR,
		stdio: 'pipe',
		env: {...process.env},
	})

	proc.stderr?.on('data', d => {
		const msg = d.toString()
		if (msg.includes('error') || msg.includes('Error')) console.error('[candidate]', msg)
	})

	await waitForServer(CANDIDATE_URL)
	console.log('Candidate app started on port 6180')

	return () => {
		proc.kill('SIGTERM')
	}
}

export {CANDIDATE_URL, ORIGINAL_URL, CANDIDATE_PORT, ORIGINAL_PORT}
