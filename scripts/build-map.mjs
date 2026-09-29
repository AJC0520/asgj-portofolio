// Builds public/tromso-map.svg: Tromsø's street grid + coastline as faint line art for the hero background.
// Data © OpenStreetMap contributors (ODbL) — keep the attribution on the page.
// Run once (or whenever you want to refresh the map): node scripts/build-map.mjs

import { writeFile } from 'node:fs/promises';
import { encodePath } from './svg-path.mjs';

// Tromsø city centre, Tromsøysundet and the Tromsdalen side of the bridge
const BBOX = { south: 69.628, west: 18.88, north: 69.672, east: 19.03 };
const WIDTH = 1600; // SVG units; the file scales to fit the hero

const ROADS = 'motorway|trunk|primary|secondary|tertiary|unclassified|residential|living_street|pedestrian';
const query = `
[out:json][timeout:25];
(
  way["highway"~"^(${ROADS})$"](${BBOX.south},${BBOX.west},${BBOX.north},${BBOX.east});
  way["natural"="coastline"](${BBOX.south},${BBOX.west},${BBOX.north},${BBOX.east});
);
out geom;`;

// Public Overpass instances are often busy; try the mirrors in turn
const SERVERS = [
	'https://overpass-api.de/api/interpreter',
	'https://overpass.kumi.systems/api/interpreter',
	'https://overpass.private.coffee/api/interpreter',
	'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

async function fetchOverpass() {
	for (const server of SERVERS) {
		try {
			const res = await fetch(server, {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'portfolio-map-builder' },
				body: 'data=' + encodeURIComponent(query),
			});
			if (res.ok) return res.json();
			console.warn(`${server}: ${res.status}, trying next`);
		} catch (error) {
			console.warn(`${server}: ${error.message}, trying next`);
		}
	}
	throw new Error('All Overpass servers failed — try again in a minute');
}

const { elements } = await fetchOverpass();

// Equirectangular projection, corrected for latitude so the map isn't stretched
const midLat = ((BBOX.north + BBOX.south) / 2) * (Math.PI / 180);
const spanX = (BBOX.east - BBOX.west) * Math.cos(midLat);
const spanY = BBOX.north - BBOX.south;
const scale = WIDTH / spanX;
const HEIGHT = Math.round(spanY * scale);
const project = ({ lat, lon }) => [
	(lon - BBOX.west) * Math.cos(midLat) * scale,
	(BBOX.north - lat) * scale,
];

// Drop points closer than ~1 unit to the previous one: invisible at this opacity, halves the file
function simplify(points) {
	const kept = [];
	points.map(project).forEach(([x, y], i, all) => {
		const last = kept.at(-1);
		const isEnd = i === all.length - 1;
		if (last && !isEnd && Math.hypot(x - last[0], y - last[1]) < 1.2) return;
		kept.push([x, y]);
	});
	return kept;
}

const major = /^(motorway|trunk|primary|secondary)$/;
const layers = { coast: [], major: [], minor: [] };
for (const way of elements) {
	if (!way.geometry?.length) continue;
	const points = simplify(way.geometry);
	if (way.tags?.natural === 'coastline') layers.coast.push(points);
	else if (major.test(way.tags?.highway)) layers.major.push(points);
	else layers.minor.push(points);
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" fill="none" stroke="#f4efe1" stroke-linecap="round" stroke-linejoin="round">
<path stroke-width="0.6" d="${encodePath(layers.minor)}"/>
<path stroke-width="1.4" d="${encodePath(layers.major)}"/>
<path stroke-width="1.8" d="${encodePath(layers.coast)}"/>
</svg>
`;

await writeFile(new URL('../public/tromso-map.svg', import.meta.url), svg);
console.log(
	`tromso-map.svg: ${layers.minor.length} streets, ${layers.major.length} main roads, ${layers.coast.length} coastline ways, ${(svg.length / 1024).toFixed(0)} KB, ${WIDTH}×${HEIGHT}`,
);
