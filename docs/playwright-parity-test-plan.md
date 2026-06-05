# Playwright Parity Test Plan

## Purpose

This test suite proves whether `SuperPauly/c2` (the candidate) behaves consistently with `mark-when/c2` (the original). Failing tests define the implementation contract for the Imba migration agent.

## Running the Original App Locally

```bash
cd /tmp/original-c2
npm install
npx vite --port 6181 --host 127.0.0.1
```

The original uses Vite and runs on port 6181 for comparison purposes.

## Running the Candidate App Locally

```bash
cd /path/to/SuperPauly/c2
npm install
npm run dev
```

The candidate uses Imba's dev server and runs on port 6180.

## What Is Compared by Screenshot

- Initial timeline view at multiple viewports (mobile, tablet, desktop).
- Dark mode rendering.
- Dense overlapping events.
- Empty state.
- Event selection/detail highlight state.
- Hover state on desktop.

Screenshots are captured from both apps at the same viewport, with a fixed date (`2026-01-15T12:00:00.000Z`) and deterministic fixture data. Pixel comparison uses strict thresholds to surface meaningful differences.

## What Is Compared by Behaviour

- Initial load correctness (title, canvas presence, no errors).
- Wheel scrolling moves the timeline.
- Touch dragging moves the timeline.
- Pointer dragging behaviour.
- Event hover dispatches `setHoveringPath`.
- Event click/tap dispatches `setDetailPath`.
- Dark mode toggle updates palette.
- Colour map updates apply to events.
- Markwhen state updates re-render the timeline.
- Large event sets remain responsive.
- Empty event sets render gracefully.
- Repeated state updates do not duplicate events.

## What Is Compared by Host Protocol Messages

- `appState` request is made on load.
- `markwhenState` request is made on load.
- `setHoveringPath` sent on hover with correct path.
- `setDetailPath` sent on click/tap with correct path.
- Dark mode state received through `appState`.
- Colour map received through `appState`.
- `hoveringPath` and `detailPath` received and applied.

## Mobile Gestures Tested

- Touch drag vertically (scrolls timeline).
- Touch drag horizontally (if supported).
- Pinch in (zoom in).
- Pinch out (zoom out).
- Pinch followed by drag.
- Drag followed by pinch.
- Repeated pinch gestures.
- Canvas owns touch gestures (no accidental page scroll).
- Orientation/viewport resize.

## Known Limitations of Playwright Gesture Simulation

- `Input.synthesizePinchGesture` CDP command is not supported in headless Chromium shell.
- Multi-touch simulation via `page.evaluate` dispatching TouchEvents may be blocked by compositor-level handling in the browser.
- Pinch tests may need to be skipped if neither CDP nor synthetic events produce reliable zoom in the app.
- Canvas anti-aliasing can cause minor pixel differences between runs.
- Font rendering varies across platforms; visual tests may need platform-specific baselines in CI.

## How Another Agent Should Use Failures

1. Run `npx playwright test` to see the full failure report.
2. Consult `docs/playwright-parity-failures.md` for a structured matrix of failures.
3. Each failing test names the feature area and expected behaviour.
4. Implement the fix in the candidate app.
5. Re-run the specific test file to verify.
6. Do not weaken assertions or raise thresholds to pass.

## Commands for Running the Suite

```bash
# Install dependencies
npm install

# Run all parity tests
npx playwright test

# Run specific test files
npx playwright test tests/parity/visual.spec.js
npx playwright test tests/parity/behaviour.spec.js
npx playwright test tests/parity/markwhen-host.spec.js
npx playwright test tests/parity/mobile-gestures.spec.js
npx playwright test tests/parity/settings.spec.js
npx playwright test tests/parity/accessibility-and-errors.spec.js

# Run with UI for debugging
npx playwright test --ui

# Update visual baselines (candidate only)
npx playwright test tests/parity/visual.spec.js --update-snapshots
```
