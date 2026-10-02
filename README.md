# Asgeir Jacobsen — Portfolio

Personal portfolio site for Asgeir Jacobsen, Informatics student at NTNU. Built with [Astro](https://astro.build), no UI framework (apart from the separate [Asgard](#asgard) page), and almost no dependencies. The motion is written by hand in CSS, canvas and SVG.

The site is a work in progress: more projects are on the way, the CV isn't up yet, and it isn't made for phones yet (phone visitors get a small notice saying so).

## Highlights

- **Type-built name.** The name in the hero is drawn on a canvas as a grid of small monospace characters, clipped to the letter shapes. The characters scramble in from left to right, flicker now and then, and scramble around the cursor.
- **Name → heading morph.** As you scroll, the name's characters break loose, drift down and condense into the About heading. It's tied to the scroll position, so scrolling back up reverses it.
- **Tromsø at night.** The hero background is a faint street map of Tromsø built from OpenStreetMap data. A small light drives a random route through the streets every few seconds.
- **GitHub activity easter egg.** Hovering the GitHub icon reveals the real contribution calendar, fetched at build time, in a wave that comes out of the icon.
- **Projects.** A list of coloured bands, each with its own texture. Clicking one slides its project page in from the right, and every project page is designed around the project itself (see [Projects](#projects)).
- **Small details.** A cursor blob that trails the pointer, a navigation underline that turns into an arrow toward the hovered item, and a Contact link that copies the email address. `prefers-reduced-motion` is respected everywhere, and animations pause when they are off screen.

## Projects

The list and the sliding project pane live in `src/components/Projects.astro`. Each project there has a year, name, description, tags (with logos from `src/components/projects/logos.ts`), links, its colours (`accent` and `onAccent`), a `vibe` for its row's texture, and optionally its own page component. Each project has its own address (`#projects/<slug>`), so links and the back button work.

| Project | Page | Look |
| :-- | :-- | :-- |
| This website | `projects/ThisWebsite.astro` | Live miniatures of the site's own effects (`projects/this-website/`) |
| KartTracker | `projects/KartTracker.astro` | A game menu: mode select, laps, a spinnable track wheel (`projects/kart-tracker/`) |
| Når stenger ølsalget? | `projects/Olsalget.astro` | A glass of beer: foam on top, an animated group chat, the 17 May mode (`projects/olsalget/`) |

To add a project: add an entry to the list in `Projects.astro`. Without a `component` it gets a simple generic page; to give it its own, make a component in `src/components/projects/` (the existing ones show the pattern) and set `component`. Screenshots go in `src/assets/` so Astro can optimise them.

## Asgard

A separate experiment at `/asgard`: a 2D top-down town for keeping track of AI agents. It opens straight into a [Phaser 3](https://phaser.io) world you walk around with WASD or the arrow keys, after a short loading screen. Stand next to an agent or a house and press E for a menu with the agent's role, current task and what it's doing right now. Agents walk around town on their own daily schedules.

It's the only part of the site that uses React (through `@astrojs/react`) and Phaser, and both load only on that page. Phaser itself only downloads when you enter the town.

The town starts empty. Everything in it is set in `src/asgard/config/`:

| File | What it holds |
| :-- | :-- |
| `world.ts` | Map size, zoom (`'fit'` shows the whole town, a number gives a close-up that follows the player), the border fence, the player, the clock (real or a fast simulated day), paths and props, and `DEBUG` (coordinates under the mouse, a grid, reach circles and agent routes) |
| `buildings.ts` | Houses: `id`, `name`, `x`/`y` (top-left), `style`, the `agent` who lives there |
| `agents.ts` | Agents: `name`, `role`, `task`, `spawn` (a house id or `{ x, y }`), `sprite`, and a `schedule` of `{ time: '07:45', destination: 'mayors-house', action: 'report' }` (or `destinationX`/`destinationY`, with optional `via` waypoints) |
| `assets.ts` | Sprite sheets, house styles, props and characters, the only place that knows about the art |

Positions are in world pixels, with 16 × 16 tiles. The art is Kenney's [Tiny Town](https://kenney.nl/assets/tiny-town) and [Tiny Dungeon](https://kenney.nl/assets/tiny-dungeon) (CC0), in `public/asgard/assets/`. The types are in `src/asgard/types.ts`, the engine in `src/asgard/engine/` and the React screens in `src/asgard/ui/`.

## Colour palette

Palette from [Coolors](https://coolors.co/palette/04151f-183a37-efd6ac-c44900-432534). Defined as CSS custom properties in `src/layouts/Layout.astro` (`:root`). Components use the role tokens, and new pages or sections can use the named colours.

| Colour | Hex | Token | Used for |
| :-- | :-- | :-- | :-- |
| Ink Black | `#04151f` | `--color-ink-black` | Hero (`--color-hero`) |
| Burnt Orange | `#c44900` | `--color-burnt-orange` | About (`--color-about`) |
| Dark Slate Grey | `#183a37` | `--color-dark-slate-grey` | Projects (`--color-projects`) |
| Wheat | `#efd6ac` | `--color-wheat` | Not used yet |
| Midnight Violet | `#432534` | `--color-midnight-violet` | Not used yet |

### Project colours

A second palette for the Projects section, one colour per project (the `accent` and `onAccent` fields in `src/components/Projects.astro`). Also defined in `:root`.

| Colour | Hex | Token |
| :-- | :-- | :-- |
| Dark Walnut | `#582f0e` | `--color-dark-walnut` |
| Saddle Brown | `#7f4f24` | `--color-saddle-brown` |
| Toffee Brown | `#936639` | `--color-toffee-brown` |
| Camel | `#a68a64` | `--color-camel` |
| Khaki Beige | `#b6ad90` | `--color-khaki-beige` |
| Dry Sage | `#c2c5aa` | `--color-dry-sage` |
| Dry Sage 2 | `#a4ac86` | `--color-dry-sage-2` |
| Dusty Olive | `#656d4a` | `--color-dusty-olive` |
| Ebony | `#414833` | `--color-ebony` |
| Charcoal Brown | `#333d29` | `--color-charcoal-brown` |

Light colours (Camel, Khaki Beige, Dry Sage, Dry Sage 2) need dark text, like Charcoal Brown; the rest work with the cream text. A project can also use a colour of its own when it has one: Når stenger ølsalget? uses the beer amber of the real site (`#f2ae2e`, dark text `#251c1c`).

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
  tromso-map.svg          Street map line art (generated)
  tromso-routes.json      Car routes (generated)
scripts/
  build-map.mjs           OpenStreetMap → SVG
  build-routes.mjs        SVG → drivable routes
src/
  layouts/Layout.astro    <head>, metadata, palette, global styles; header, cursor blob and phone notice
  pages/index.astro       The page: hero, About and Projects
  pages/asgard.astro      Asgard, the agent town (React + Phaser)
  asgard/                 Asgard's config, engine and React screens
  assets/                 Images, optimised at build time (portrait, project screenshots)
  scripts/sweep.ts        The colour sweep between pages
  components/
    Header.astro          Navigation, profile links, Contact (copies the email), the CV note
    Hero.astro            Intro, scroll hint, map background
    Name.astro            Canvas name built from characters
    NameMorph.astro       Scroll transition from the name to the About heading
    MapCanvas.astro       Tromsø street map and the light driving through it
    MapSpotlight.astro    The cursor as a torch over the map
    About.astro           About section
    CharHeading.astro     Headings with a character grid behind them
    CharPortrait.astro    The portrait drawn in characters
    ActivityGrid.astro    GitHub contribution calendar easter egg
    CursorBlob.astro      Cursor follower
    PhoneNotice.astro     "Not made for phones yet" note on small screens
    Projects.astro        Project list and the sliding project pane
    projects/             One page component per project, plus its parts in a folder of its own
    archive/              Earlier experiments, kept for reference (not used)
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
- Typefaces: [Inter Tight](https://fonts.google.com/specimen/Inter+Tight) and [Bowlby One SC](https://fonts.google.com/specimen/Bowlby+One+SC) (KartTracker's logo), both under the SIL Open Font License.
- Tool logos: [Simple Icons](https://simpleicons.org) (CC0).
- Asgard's pixel art: [Kenney](https://kenney.nl) Tiny Town and Tiny Dungeon (CC0).
- Holiday data on the Når stenger ølsalget? page comes from the real app, which uses [webapi.no](https://webapi.no).
