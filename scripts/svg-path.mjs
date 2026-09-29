// Compact SVG path data for polylines, shared by build-map.mjs and build-routes.mjs.
// Relative commands at 0.1-unit precision: short deltas instead of repeated absolute coordinates
// make the map ~35% smaller, even after gzip. Deltas are taken between rounded points, so it's lossless.

// Work in whole tenths so rounding never drifts
const tenths = (v) => Math.round(v * 10);

function formatTenths(t) {
	const sign = t < 0 ? '-' : '';
	const abs = Math.abs(t);
	const whole = Math.floor(abs / 10);
	const frac = abs % 10;
	if (!frac) return `${sign}${whole}`;
	return `${sign}${whole || ''}.${frac}`;
}

// Numbers separated only where needed: a "-" starts a new number, and so does a "." once the previous one had one
function joinNumbers(values) {
	let out = '';
	let prevHasDot = false;
	for (const value of values) {
		const s = formatTenths(value);
		const needsSeparator = out && !(s[0] === '-' || (s[0] === '.' && prevHasDot));
		out += (needsSeparator ? ' ' : '') + s;
		prevHasDot = s.includes('.');
	}
	return out;
}

/** Polylines ([[x, y], …] each) → path data: absolute start, then relative moves and lines */
export function encodePath(polylines) {
	let d = '';
	let prev = null;
	for (const points of polylines) {
		const deltas = [];
		points.forEach(([x, y], i) => {
			const p = [tenths(x), tenths(y)];
			if (i === 0) d += prev ? `m${joinNumbers([p[0] - prev[0], p[1] - prev[1]])}` : `M${joinNumbers(p)}`;
			else deltas.push(p[0] - prev[0], p[1] - prev[1]);
			prev = p;
		});
		// One "l" per polyline; the following pairs repeat it implicitly
		if (deltas.length) d += `l${joinNumbers(deltas)}`;
	}
	return d;
}

/** Path data (M/m/L/l, absolute or relative) → polylines of absolute points */
export function decodePath(d) {
	const polylines = [];
	let x = 0;
	let y = 0;
	for (const [, cmd, args] of d.matchAll(/([MmLl])([^MmLl]*)/g)) {
		const nums = (args.match(/-?(?:\d+\.?\d*|\.\d+)/g) ?? []).map((n) => tenths(Number(n)));
		for (let i = 0; i + 1 < nums.length; i += 2) {
			const relative = cmd === 'm' || cmd === 'l';
			x = relative ? x + nums[i] : nums[i];
			y = relative ? y + nums[i + 1] : nums[i + 1];
			// Extra pairs after a move are implicit lines
			if ((cmd === 'M' || cmd === 'm') && i === 0) polylines.push([]);
			polylines.at(-1).push([x / 10, y / 10]);
		}
	}
	return polylines;
}
