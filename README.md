This version is a small Imba canvas recreation of the visible timeline baseline. It keeps the Markwhen custom-view host integration, but intentionally leaves out the old settings, shop, edit flows, calendar account management, and large OneView application shell.

## Development

```sh
npm install
npm run dev
npm test
npm run build
```

The app runs at `http://127.0.0.1:6180`. Use `?now=YYYY-MM-DD` to freeze the rendered date for screenshot tests.

Useful checks:

```sh
npm run build
npm test
npm run lines
```

`npm test` runs the Playwright fallback visual baseline tests and the Markwhen host integration tests.

## Code Architecture

The app is deliberately small. There is no Vite or TypeScript build surface; Imba builds the canvas app directly from `src/main.imba`.

- `src/main.imba` is the browser entry point. It creates the canvas, owns runtime state, handles resize, wheel scrolling, touch scrolling, hover, click, and tap events, and chooses between host events and demo fallback events.
- `src/markwhen.js` is the Markwhen bridge. It imports `useLpc` from `@markwhen/view-client` and `parse`, `iter`, and `isEvent` from `@markwhen/parser`. On startup it requests `appState` and `markwhenState`, transforms real Markwhen events into the small canvas event model, and exposes the `window.__oneviewMock` test hook.
- `src/timeline/data.imba` contains the standalone demo timeline used when no host state exists.
- `src/timeline/layout.imba` contains date and row-position helpers.
- `src/timeline/theme.imba` contains the light and dark canvas palettes.
- `src/timeline/draw.imba` contains all timeline drawing code. It renders dates, grid rows, normal events, multi-day floating blocks, hover/detail outlines, and returns hit regions for pointer interaction.
- `tests/visible.spec.js` covers the fallback visual baseline at desktop, laptop, and mobile sizes.
- `tests/host.spec.js` injects `window.__oneviewMock` before page load and verifies host event rendering, color-map usage, dark mode, hover messages, detail messages, and fallback behavior.

Host messages kept by the bridge:

- Requests sent on startup: `appState`, `markwhenState`.
- Requests sent from pointer interaction: `setHoveringPath`, `setDetailPath`.

The host event model is intentionally narrow:

- `title` comes from `firstLine.restTrimmed`.
- `start` and `end` come from `dateRangeIso.fromDateTimeIso` and `dateRangeIso.toDateTimeIso`.
- `path` is the parser path array from `iter`.
- `color` is looked up as `appState.colorMap[source][firstTag]`, where `source` defaults to `default`.
- `hovered` and `detail` are derived from `appState.hoveringPath` and `appState.detailPath`.

## Modifying The Code

Keep changes in the smallest file that owns the behavior:

- Change host parsing, color-map lookup, or mock behavior in `src/markwhen.js`.
- Change event hit-testing or browser input behavior in `src/main.imba`.
- Change timeline positioning in `src/timeline/layout.imba`.
- Change colors, dark mode, or palette constants in `src/timeline/theme.imba`.
- Change canvas visuals in `src/timeline/draw.imba`.
- Change fallback screenshot data in `src/timeline/data.imba`.

When adding a new host-facing behavior, add or update a `window.__oneviewMock` Playwright test in `tests/host.spec.js`. The mock records outbound requests in `window.__oneviewMock.requests`, so tests can assert exact Markwhen messages without a real host.

When changing visible fallback rendering, update or re-run the baseline screenshot tests intentionally. Avoid changing fallback visuals as a side effect of host-integration work.

Do not reintroduce the removed large app shell unless the goal explicitly changes. In particular, avoid adding Vite, TypeScript, moment, settings UI, shop UI, add/edit flows, localStorage preference systems, or calendar account management for ordinary timeline or host-message changes.
