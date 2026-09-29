// Builds public/tromso-routes.json: drivable routes for the hero's "car" light, made by chaining
// connected streets from public/tromso-map.svg. No network needed — run after build-map.mjs:
//   node scripts/build-routes.mjs

import { readFile, writeFile } from 'node:fs/promises';

const ROUTES = 90;
const MIN_LENGTH = 450; // map units (~3 m each): shorter drives read as a blip
const MAX_LENGTH = 1600;

const svg = await readFile(new URL('../public/tromso-map.svg', import.meta.url), 'utf8');
const viewBox = svg.match(/viewBox="([^"]+)"/)[1];

// Streets and main roads only (not the coastline); each way starts with its own "M"
const layers = [...svg.matchAll(/<path stroke-width="([\d.]+)" d="([^"]+)"\/>/g)];
const ways = layers
	.filter(([, width]) => width !== '1.8')
	.flatMap(([, width, d]) =>
		d
			.split('M')
			.filter(Boolean)
			.map((segment) => ({
				major: width === '1.4',
				points: segment.split('L').map((pair) => pair.trim().split(' ').map(Number)),
			})),
	)
	.filter((way) => way.points.length > 1);

const key = ([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`;
const heading = (a, b) => Math.atan2(b[1] - a[1], b[0] - a[0]);
const length = (points) => points.slice(1).reduce((sum, p, i) => sum + Math.hypot(p[0] - points[i][0], p[1] - points[i][1]), 0);

// Ways that touch each endpoint, in either direction
const byEndpoint = new Map();
ways.forEach((way, index) => {
	for (const [end, reversed] of [
		[way.points[0], false],
		[way.points.at(-1), true],
	]) {
		const k = key(end);
		if (!byEndpoint.has(k)) byEndpoint.set(k, []);
		byEndpoint.get(k).push({ index, reversed });
	}
});

const oriented = (index, reversed) => (reversed ? [...ways[index].points].reverse() : ways[index].points);

// Random drive: keep taking the connecting street that turns the least (with some randomness)
function drive() {
	const majors = ways.map((w, i) => (w.major ? i : -1)).filter((i) => i >= 0);
	const start = Math.random() < 0.6 ? majors[Math.floor(Math.random() * majors.length)] : Math.floor(Math.random() * ways.length);
	const used = new Set([start]);
	let route = oriented(start, Math.random() < 0.5);
	const target = MIN_LENGTH + Math.random() * (MAX_LENGTH - MIN_LENGTH);

	while (length(route) < target) {
		const end = route.at(-1);
		const current = heading(route.at(-2), end);
		const options = (byEndpoint.get(key(end)) ?? []).filter((o) => !used.has(o.index));
		if (!options.length) break;

		const next = options
			.map((o) => {
				const points = oriented(o.index, o.reversed);
				const turn = Math.abs(((heading(points[0], points[1]) - current + 3 * Math.PI) % (2 * Math.PI)) - Math.PI);
				return { ...o, points, score: turn + Math.random() * 0.8 };
			})
			.sort((a, b) => a.score - b.score)[0];

		used.add(next.index);
		route = route.concat(next.points.slice(1));
	}
	return route;
}

const routes = [];
for (let attempt = 0; routes.length < ROUTES && attempt < ROUTES * 40; attempt++) {
	const route = drive();
	const total = length(route);
	if (total < MIN_LENGTH) continue;
	routes.push({
		d: 'M' + route.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L'),
		length: Math.round(total),
	});
}

await writeFile(new URL('../public/tromso-routes.json', import.meta.url), JSON.stringify({ viewBox, routes }));
console.log(`tromso-routes.json: ${routes.length} routes from ${ways.length} streets`);
