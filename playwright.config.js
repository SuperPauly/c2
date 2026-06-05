import {defineConfig, devices} from '@playwright/test'
import {existsSync, readdirSync} from 'node:fs'
import {resolve} from 'node:path'

function findChrome() {
	const cacheDir = process.env.HOME
		? resolve(process.env.HOME, '.cache/ms-playwright')
		: '/root/.cache/ms-playwright'
	if (!existsSync(cacheDir)) return undefined
	const dirs = readdirSync(cacheDir).filter(d => d.startsWith('chromium_headless_shell'))
	for (const dir of dirs.sort().reverse()) {
		const candidate = resolve(cacheDir, dir, 'chrome-headless-shell-linux64/chrome-headless-shell')
		if (existsSync(candidate)) return candidate
	}
	return undefined
}

const cachedChrome = findChrome()

const CANDIDATE_URL = 'http://127.0.0.1:6180'
const ORIGINAL_URL = 'http://127.0.0.1:6181'

const commonUse = {
	browserName: 'chromium',
	timezoneId: 'UTC',
	locale: 'en-GB',
	launchOptions: cachedChrome ? {executablePath: cachedChrome} : {},
	trace: 'on-first-retry',
	video: 'on-first-retry',
}

export default defineConfig({
	testDir: './tests',
	snapshotPathTemplate: '{testDir}/baseline/{projectName}/{arg}{ext}',
	expect: {timeout: 10000},
	timeout: 60000,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	use: {
		baseURL: CANDIDATE_URL,
		...commonUse,
	},
	projects: [
		{
			name: 'chromium-desktop',
			use: {
				...devices['Desktop Chrome'],
				viewport: {width: 1366, height: 768},
				deviceScaleFactor: 1,
			},
		},
		{
			name: 'chromium-tablet',
			use: {
				viewport: {width: 768, height: 1024},
				deviceScaleFactor: 1,
				isMobile: false,
			},
		},
		{
			name: 'chromium-mobile',
			use: {
				viewport: {width: 390, height: 844},
				deviceScaleFactor: 1,
				isMobile: true,
				hasTouch: true,
			},
		},
		{
			name: 'chromium-mobile-hidpi',
			use: {
				viewport: {width: 412, height: 915},
				deviceScaleFactor: 2,
				isMobile: true,
				hasTouch: true,
			},
		},
	],
	webServer: [
		{
			command: 'npm run dev',
			url: CANDIDATE_URL,
			reuseExistingServer: !process.env.CI,
			timeout: 120000,
		},
	],
})
