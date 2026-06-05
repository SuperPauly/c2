/**
 * AppState fixtures for parity testing.
 * Simulates various host appState configurations.
 */

/** Default light mode with no special state. */
export const defaultAppState = {
	colorMap: {},
	isDark: false,
}

/** Dark mode enabled. */
export const darkModeAppState = {
	colorMap: {},
	isDark: true,
}

/** Source colour map – assigns colours to tagged events. */
export const sourceColourMapAppState = {
	colorMap: {
		default: {
			work: '#2563eb',
			health: '#16a34a',
			personal: '#dc2626',
			holiday: '#f59e0b',
			travel: '#7c3aed',
			social: '#ec4899',
			learning: '#0891b2',
			batch: '#6b7280',
		},
	},
	isDark: false,
}

/** Dark mode with colour map. */
export const darkWithColoursAppState = {
	colorMap: {
		default: {
			work: '#60a5fa',
			health: '#4ade80',
			personal: '#f87171',
		},
	},
	isDark: true,
}

/** AppState with hoveringPath set to first event. */
export const hoveringFirstEventAppState = {
	colorMap: {},
	isDark: false,
	hoveringPath: [0],
}

/** AppState with detailPath set to first event. */
export const detailFirstEventAppState = {
	colorMap: {},
	isDark: false,
	detailPath: [0],
}

/** AppState with both hovering and detail paths. */
export const hoverAndDetailAppState = {
	colorMap: {},
	isDark: false,
	hoveringPath: [0],
	detailPath: [1],
}
