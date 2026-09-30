# Archive

Earlier versions of the hero → About transition, kept for reference. Nothing imports these, so they don't end up in the build.

- **CardDeck.astro**: scroll-driven "card from the back of the deck". The About card slides out from under the hero and is placed in front, with the hero peeking out behind it.
- **ZoomDeck.astro**: scroll-driven dive into the map, with About opening as a circle. It sends `mapzoom` events, which the current `MapCanvas.astro` no longer handles, so it won't work without changes.
- **MapTraffic.astro**: the car light as an SVG overlay, before it moved into `MapCanvas.astro`.

To bring one back, move it out of this folder and import it in a page. CardDeck expects `slot="front"` / `slot="back"` children.

## Follow the light (retired)

A click-driven version, where the camera zoomed into the map and followed a car before the About page opened.

- **about-page.astro**: the separate `/about` page. Its imports are relative to `src/pages/`, so move it back there to use it.
- The follow mode is still in `MapCanvas.astro` (`mapfollow` / `mapreset` events), and the page sweep is in `src/scripts/sweep.ts`, used by the header's "AJ." link on other pages. Nothing on the current page triggers the follow mode.
