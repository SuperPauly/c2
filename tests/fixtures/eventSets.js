/**
 * Pre-parsed event set fixtures for direct canvas testing.
 * These bypass markwhen parsing and provide event objects directly.
 */

const REF_DATE = new Date('2026-01-15T12:00:00.000Z')

function dayOffset(days) {
	return new Date(REF_DATE.getTime() + days * 864e5)
}

/** Empty event set. */
export const emptyEventSet = []

/** Single event on the reference date. */
export const singleEventSet = [
	{
		start: new Date('2026-01-15T00:00:00.000Z'),
		end: new Date('2026-01-16T00:00:00.000Z'),
		title: 'Team standup',
		color: '#2563eb',
		path: [0],
		pathKey: '0',
		hovered: false,
		detail: false,
		floating: false,
	},
]

/** Dense events – 5 events on the same day. */
export const denseEventSet = Array.from({length: 5}, (_, i) => ({
	start: new Date('2026-01-15T00:00:00.000Z'),
	end: new Date('2026-01-16T00:00:00.000Z'),
	title: `Event ${i + 1}`,
	color: ['#2563eb', '#16a34a', '#dc2626', '#f59e0b', '#7c3aed'][i],
	path: [i],
	pathKey: String(i),
	hovered: false,
	detail: false,
	floating: false,
}))

/** Multi-day floating event. */
export const floatingEventSet = [
	{
		start: new Date('2026-01-15T00:00:00.000Z'),
		end: new Date('2026-01-18T00:00:00.000Z'),
		title: 'Conference',
		color: '#7c3aed',
		path: [0],
		pathKey: '0',
		hovered: false,
		detail: false,
		floating: true,
	},
]

/** Large event set for performance testing. */
export const largeEventSet = Array.from({length: 100}, (_, i) => ({
	start: dayOffset(i - 50),
	end: dayOffset(i - 49),
	title: `Event ${i + 1}`,
	color: '#6b7280',
	path: [i],
	pathKey: String(i),
	hovered: false,
	detail: false,
	floating: i % 10 === 0,
}))

/** Event with hover state. */
export const hoveredEventSet = [
	{
		start: new Date('2026-01-15T00:00:00.000Z'),
		end: new Date('2026-01-16T00:00:00.000Z'),
		title: 'Hovered event',
		color: '#2563eb',
		path: [0],
		pathKey: '0',
		hovered: true,
		detail: false,
		floating: false,
	},
]

/** Event with detail state. */
export const detailEventSet = [
	{
		start: new Date('2026-01-15T00:00:00.000Z'),
		end: new Date('2026-01-16T00:00:00.000Z'),
		title: 'Selected event',
		color: '#2563eb',
		path: [0],
		pathKey: '0',
		hovered: false,
		detail: true,
		floating: false,
	},
]
