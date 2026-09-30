// Page-transition sweep: a panel in the next page's colour sweeps across the screen, led by a thin
// glowing yellow edge (the car's headlight pulling the new page in behind it).
//
// Transform-only on purpose: `transform` animations run on the compositor, so the sweep stays smooth
// even while the page is busy swapping. (The earlier clip-path circle ran on the main thread and stuttered.)

const EDGE = '#e9c85b';
// --ease-in-out-cubic: gathers speed, sweeps across, settles over the far edge
const EASE_IN_OUT = 'cubic-bezier(0.645, 0.045, 0.355, 1)';

export interface SweepOptions {
	color: string;
	/** Travel direction in radians: 0 = left → right, π/2 = top → bottom */
	angle: number;
	duration?: number;
}

/**
 * Creates the sweep panel ahead of time, parked off-screen, so the browser rasterises this large layer
 * while there's time to spare instead of on the sweep's first frame. Call `play` when it's time.
 */
export function prepareSweep(color: string) {
	// A square as wide as the screen's diagonal covers the whole screen at any rotation
	const size = Math.ceil(Math.hypot(innerWidth, innerHeight)) + 4;

	const panel = document.createElement('div');
	panel.dataset.sweep = '';
	panel.setAttribute('aria-hidden', 'true');
	Object.assign(panel.style, {
		position: 'fixed',
		left: '50%',
		top: '50%',
		width: `${size}px`,
		height: `${size}px`,
		margin: `${-size / 2}px 0 0 ${-size / 2}px`,
		zIndex: '50', // above the page, below the site header (100)
		background: color,
		// The leading edge: a thin headlight line with a soft glow ahead of it
		boxShadow: `3px 0 0 ${EDGE}, 14px 0 28px rgba(233, 200, 91, 0.35)`,
		pointerEvents: 'none',
		willChange: 'transform',
	});
	// Parked well outside the screen until played
	panel.style.transform = `translate(${-2 * size}px, ${-2 * size}px)`;
	document.body.append(panel);

	return {
		/** Plays the sweep; resolves once the screen is fully covered. The panel stays until `clearSweeps()`. */
		play(angle: number, duration = 700): Promise<void> {
			const rotate = `rotate(${angle}rad)`;
			return panel
				.animate(
					// Starts fully off-screen behind the trailing side, ends centred (covering everything, glow off-screen)
					[{ transform: `${rotate} translateX(-100%)` }, { transform: `${rotate} translateX(0)` }],
					{ duration, easing: EASE_IN_OUT, fill: 'forwards' },
				)
				.finished.then(() => undefined);
		},
	};
}

/** Prepares and plays a sweep in one go. */
export function sweep({ color, angle, duration = 700 }: SweepOptions): Promise<void> {
	return prepareSweep(color).play(angle, duration);
}

/**
 * Leaves the current page for `href` after a sweep. The next page reads the flag (see Layout.astro)
 * and eases its content in, instead of popping it all in at once.
 */
export function navigateAfterSweep(href: string) {
	try {
		sessionStorage.setItem('arrive', 'sweep');
	} catch {
		// Storage unavailable: the next page simply appears without the entrance
	}
	location.href = href;
}

/** Removes any sweep panels (e.g. when a page is restored from the back/forward cache). */
export function clearSweeps() {
	document.querySelectorAll('[data-sweep]').forEach((panel) => panel.remove());
}
