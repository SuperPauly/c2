/**
 * Markwhen state fixtures for parity testing.
 * Each fixture provides a deterministic markwhenState object.
 */

/** Empty markwhen document. */
export const emptyState = {
	text: '',
}

/** Single one-day event. */
export const singleEvent = {
	text: '2026-01-15: Team standup #work',
}

/** Multi-day event spanning 3 days. */
export const multiDayEvent = {
	text: '2026-01-15/2026-01-17: Conference trip #travel',
}

/** All-day event (no time component). */
export const allDayEvent = {
	text: '2026-01-15: Company holiday #holiday',
}

/** Dense same-day events – multiple events on the same date. */
export const denseSameDayEvents = {
	text: [
		'2026-01-15: Morning standup #work',
		'2026-01-15: Design review #work',
		'2026-01-15: Lunch with team #social',
		'2026-01-15: Sprint planning #work',
		'2026-01-15: Code review session #work',
	].join('\n'),
}

/** Overlapping events across multiple days. */
export const overlappingEvents = {
	text: [
		'2026-01-14/2026-01-16: Sprint 1 #work',
		'2026-01-15/2026-01-17: Training course #learning',
		'2026-01-15: Daily standup #work',
	].join('\n'),
}

/** Event crossing a month boundary. */
export const monthBoundaryEvent = {
	text: '2026-01-30/2026-02-02: Month-end review #work',
}

/** Event crossing a year boundary. */
export const yearBoundaryEvent = {
	text: '2025-12-30/2026-01-03: New Year break #holiday',
}

/** Event with multiple tags. */
export const taggedEvent = {
	text: '2026-01-15: Tagged meeting #work #important #recurring',
}

/** Event without any tags. */
export const untaggedEvent = {
	text: '2026-01-15: Plain event with no tags',
}

/** Event with a long title. */
export const longTitleEvent = {
	text: '2026-01-15: This is a very long event title that should test text overflow and truncation behaviour in the timeline rendering engine',
}

/** Event with a long description. */
export const longDescriptionEvent = {
	text: '2026-01-15: Brief title\nThis event has a much longer description that provides additional context about what the event entails and why it is important for the team to attend.',
}

/** Event with blank/missing description. */
export const blankDescriptionEvent = {
	text: '2026-01-15: Just a title',
}

/** Many events for performance and scrolling tests. */
export const manyEvents = {
	text: Array.from({length: 50}, (_, i) => {
		const day = String((i % 28) + 1).padStart(2, '0')
		const month = String(Math.floor(i / 28) + 1).padStart(2, '0')
		return `2026-${month}-${day}: Event number ${i + 1} #batch`
	}).join('\n'),
}

/** Multiple sources with different colour assignments. */
export const multiSourceEvents = {
	text: [
		'2026-01-15: Work meeting #work',
		'2026-01-16: Gym session #health',
		'2026-01-17: Family dinner #personal',
	].join('\n'),
}
