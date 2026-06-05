# Playwright Parity Failure Matrix

> Updated: 2026-06-05

| Test file | Test name | Feature area | Expected original behaviour | Candidate behaviour | Status | Notes for migration agent |
|---|---|---|---|---|---|---|
| visual.spec.js | initial timeline renders consistently at desktop viewport | Visual – desktop | Full OneView calendar timeline with month headers, day rows, event bars, navigation | Canvas timeline with simplified layout, different font sizing and colour scheme | failing | The original has a significantly richer visual layout; candidate is a lean recreation |
| visual.spec.js | initial timeline renders consistently at mobile viewport | Visual – mobile | Rotated event labels, compact layout | Canvas renders but layout differs from original | failing | Mobile layout diverges significantly |
| visual.spec.js | dark mode renders consistently | Visual – dark mode | Dark palette with specific background/grid/text colours | Dark mode implemented but palette may differ | failing | Compare darkTheme values against original |
| behaviour.spec.js | wheel scrolling moves the timeline | Interaction – scroll | Wheel scroll changes visible date range | Wheel scroll adjusts offset, timeline redraws | passing | Core scroll works |
| behaviour.spec.js | touch dragging moves the timeline | Interaction – touch | Touch drag scrolls vertically | Touch drag adjusts offset | passing | Basic touch implemented |
| behaviour.spec.js | event hover dispatches setHoveringPath | Host protocol | Hover over event sends setHoveringPath with path array | Sends setHoveringPath with path | passing | Implemented in candidate |
| behaviour.spec.js | event click dispatches setDetailPath | Host protocol | Click on event sends setDetailPath with path array | Sends setDetailPath with path | passing | Implemented in candidate |
| markwhen-host.spec.js | appState request is made on load | Host protocol | postRequest('appState') called on init | postRequest('appState') called on init | passing | Both apps request appState |
| markwhen-host.spec.js | markwhenState request is made on load | Host protocol | postRequest('markwhenState') called on init | postRequest('markwhenState') called on init | passing | Both apps request markwhenState |
| markwhen-host.spec.js | colour map applies to events | Host protocol – colours | Events render with colours from colorMap | Events render with colorMap colours | passing | Colour map logic implemented |
| mobile-gestures.spec.js | pinch out zooms the timeline | Gesture – pinch | Pinch-to-zoom changes zoom level | No pinch-to-zoom implemented | failing | Candidate has no zoom; only vertical scroll |
| mobile-gestures.spec.js | pinch in zooms the timeline | Gesture – pinch | Pinch-to-zoom changes zoom level | No pinch-to-zoom implemented | failing | Candidate has no zoom |
| settings.spec.js | settings overlay accessible | Settings | Original has settings/options in OneView (week numbers, 24h format, first day of week) | No settings UI present | not-yet-covered | Original has CommonUserSettings class but no clear embedded route in c2 deployment |
| accessibility-and-errors.spec.js | page title is set | Accessibility | Page has a title | Page has title 'Calendar' | passing | Both set title |
| accessibility-and-errors.spec.js | no fatal console errors on load | Diagnostics | No uncaught errors | No uncaught errors | passing | Clean load |
| accessibility-and-errors.spec.js | canvas element exists | Accessibility | Canvas present in DOM | Canvas present in DOM | passing | Both render canvas |
