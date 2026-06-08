// wdio.conf.js — WebdriverIO + Appium config for mobile browser testing
// The app is a web app served locally; Appium drives it in mobile Chrome on an Android emulator.
// From the emulator, the host machine's localhost is reachable at 10.0.2.2.

export const config = {
  runner: 'local',
  specs: ['./tests/appium/**/*.spec.js'],
  maxInstances: 1,

  capabilities: [{
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': 'emulator-5554',
    'appium:browserName': 'Chrome',
    'appium:chromedriverAutodownload': true,
    'appium:newCommandTimeout': 120,
    'appium:nativeWebScreenshot': true,
  }],

  logLevel: 'warn',
  bail: 0,
  baseUrl: 'http://10.0.2.2:6180',
  waitforTimeout: 15000,
  connectionRetryTimeout: 10000, // Reduced to timeout fast if no emulator
  connectionRetryCount: 0,       // No retries

  services: [['appium', {
    command: 'appium',
    args: { port: 4723, log: './appium.log' },
  }]],

  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
  },
}
