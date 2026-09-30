# Asgeir Jacobsen — Portfolio

Personal portfolio site for Asgeir Jacobsen, Informatics student at NTNU. Built with [Astro](https://astro.build), no UI framework, and almost no dependencies. The motion is written by hand in CSS, canvas and SVG.

## Highlights

- **Type-built name.** The name in the hero is drawn on a canvas as a grid of small monospace characters, clipped to the letter shapes. The characters scramble in from left to right, flicker now and then, and scramble around the cursor.
- **Name → heading morph.** As you scroll, the name's characters break loose, drift down and condense into the About heading. It's tied to the scroll position, so scrolling back up reverses it.
- **Tromsø at night.** The hero background is a faint street map of Tromsø built from OpenStreetMap data. A small light drives a random route through the streets every few seconds.
- **GitHub activity easter egg.** Hovering the GitHub icon reveals the real contribution calendar, fetched at build time, in a wave that comes out of the icon.
- **Small details.** A cursor blob that trails the pointer and a scroll hint. `prefers-reduced-motion` is respected everywhere, and animations pause when they are off screen.

## Colour palette

Defined as CSS custom properties in `src/layouts/Layout.astro` (`:root`). Components use the role tokens, and new pages or sections can use the named colours.

| Colour | Hex | Token | Used for |
| :-- | :-- | :-- | :-- |
| Ink Black | `#04151f` | `--color-ink-black` | Hero (`--color-hero`) |
| Burnt Orange | `#c44900` | `--color-burnt-orange` | About (`--color-about`) |
| Dark Slate Grey | `#183a37` | `--color-dark-slate-grey` | Not used yet |
| Wheat | `#efd6ac` | `--color-wheat` | Not used yet |
| Midnight Violet | `#432534` | `--color-midnight-violet` | Not used yet |

A section can also tint the fixed header while it's underneath it: `data-header-color="var(--color-…)"`.

### Palettes tried before

Kept here so you can switch back. Paste one into the `:root` block and point the role tokens at it.

- **Deep space:** Deep Space Blue `#003049` (hero) · Flag Red `#d62828` (about) · Princeton Orange `#f77f00` · Sunflower Gold `#fcbf49` · Vanilla Custard `#eae2b7`
- **Teal:** Teal `#177e89` · Dark Teal `#084c61` · Scarlet Rush `#db3a34` · Sunflower Gold `#ffc857` · Graphite `#323031` (never applied)

## Getting started

Requires Node.js 22.12 or newer.

```sh
npm install
npm run dev        # http://localhost:4321
```

| Command           | Action                                         |
| :---------------- | :--------------------------------------------- |
| `npm run dev`     | Start the dev server at `localhost:4321`       |
| `npm run build`   | Build the production site to `./dist/`         |
| `npm run preview` | Preview the production build locally           |

### GitHub activity (optional)

The activity grid uses your real GitHub contributions when a token is available. Otherwise it falls back to mock data, so the site builds either way.

1. Create a [fine-grained personal access token](https://github.com/settings/personal-access-tokens). Set repository access to **Public repositories (read-only)** and leave all permissions at **No access**.
2. Add it to a `.env` file in the project root. The file is git-ignored.

   ```sh
   GITHUB_TOKEN=github_pat_...
   ```

The calendar belongs to the token's owner, so there's no username to configure. Contributions to private repositories only appear if "Include private contributions on my profile" is enabled in your GitHub settings.

## Tromsø map

The map and the car routes are generated once and committed as static files, so visitors never contact OpenStreetMap.

```sh
node scripts/build-map.mjs      # downloads streets + coastline → public/tromso-map.svg
node scripts/build-routes.mjs   # chains streets into drives   → public/tromso-routes.json
```

To show a different area, change `BBOX` in `scripts/build-map.mjs`, then run both scripts again, in that order. The public servers that supply the map data are often busy, so the script tries several mirrors. If all of them fail, wait a minute and try again.

## Project structure

```text
public/
  tromso-map.svg        Street map line art (generated)
  tromso-routes.json    Car routes (generated)
scripts/
  build-map.mjs         OpenStreetMap → SVG
  build-routes.mjs      SVG → drivable routes
src/
  layouts/Layout.astro  <head>, metadata, global styles, cursor blob
  pages/index.astro     The page: hero and About section in a card deck
  components/
    Hero.astro          Top bar, intro, scroll hint, map background
    Name.astro          Canvas name built from characters
    CardDeck.astro      Scroll-driven card-deck transition
    MapTraffic.astro    The light driving through the map
    ActivityGrid.astro  GitHub contribution calendar easter egg
    CursorBlob.astro    Cursor follower
    About.astro         About section (placeholder content)
```

## Deploying

The site is fully static: deploy `dist/` to any static host (Vercel, Netlify, GitHub Pages, …).

- **Environment:** add `GITHUB_TOKEN` as an environment variable or secret on the host. Without it, the deployed site shows the mock activity grid.
- **Keep the activity grid current:** GitHub data is fetched at build time, so schedule a daily rebuild, for example with a deploy hook called from a scheduled GitHub Action.
- **Link previews:** set `site` in `astro.config.mjs` to the live domain. The canonical URL and Open Graph image tags are only added once it's set.

## License

The source code is licensed under the [MIT License](LICENSE): feel free to learn from it and reuse it. Personal content (name, bio, CV, photos, project write-ups) is © Asgeir Jacobsen, all rights reserved. If you fork the site, please swap in your own. See [LICENSE](LICENSE) for details.

## Credits

- Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors, available under the ODbL.
- Typeface: [Inter Tight](https://fonts.google.com/specimen/Inter+Tight) (SIL Open Font License).
