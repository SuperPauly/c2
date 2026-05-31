import {defineConfig, devices} from '@playwright/test'
import {existsSync} from 'node:fs'

const cachedChrome = '/root/.cache/ms-playwright/chromium_headless_shell-1217/chrome-headless-shell-linux64/chrome-headless-shell'

export default defineConfig({
	testDir: './tests',
	snapshotPathTemplate: '{testDir}/baseline/{arg}{ext}',
	expect: {timeout: 5000},
	use: {
		baseURL: 'http://127.0.0.1:6180',
		browserName: 'chromium',
		deviceScaleFactor: 1,
		launchOptions: existsSync(cachedChrome) ? {executablePath: cachedChrome} : {},
	},
	projects: [{name: 'chromium', use: {...devices['Desktop Chrome']}}],
	webServer: {
		command: 'npm run dev',
		url: 'http://127.0.0.1:6180',
		reuseExistingServer: !process.env.CI,
		timeout: 120000,
	},
})
