// The loading screen: a wizard walks along a dirt path that is laid tile by tile as the town loads.
// Motion is transform and opacity only; with reduced motion the wizard stands still and the path simply fills in.
// `progress` is how far along the town is (0 to 1); `done` means it is built. The screen eases toward the progress,
// so it never jumps, and once the wizard reaches the end it lifts away to reveal the town.

import { useEffect, useRef, useState } from 'react';
import { CHARACTERS, PATH_STYLES, SHEETS } from '../config/assets';

const TILES = 10; // path tiles (each 32 px on screen: the 16 px art at 2x)
const SCALE = 2;
const COLUMNS = 12; // frames per row in the sprite sheets
const ROWS = 11;

// What is happening, by how far along it is
const STAGES = ['Clearing the ground', 'Laying the paths', 'Raising the houses', 'Waking the agents'];

function frameStyle(sheet: keyof typeof SHEETS, frame: number): React.CSSProperties {
	const { url, frameWidth, frameHeight } = SHEETS[sheet];
	const w = frameWidth * SCALE;
	const h = frameHeight * SCALE;
	return {
		width: w,
		height: h,
		backgroundImage: `url(${url})`,
		backgroundSize: `${COLUMNS * w}px ${ROWS * h}px`,
		backgroundPosition: `-${(frame % COLUMNS) * w}px -${Math.floor(frame / COLUMNS) * h}px`,
	};
}

const reduceMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export function Loader({ progress, done, onExited }: { progress: number; done: boolean; onExited: () => void }) {
	const walker = useRef<HTMLDivElement>(null);
	const track = useRef<HTMLDivElement>(null);
	const target = useRef(0);
	const [shown, setShown] = useState(0); // the eased progress, for the labels and the path
	const [leaving, setLeaving] = useState(false);

	target.current = done ? 1 : Math.min(progress, 0.97); // only a finished town reaches the end

	// Ease toward the target every frame, and carry the wizard along the path
	useEffect(() => {
		let frame = 0;
		let last = performance.now();
		let value = 0;
		let lastShown = -1;
		let held = 0; // how long the wizard has stood at the end
		const tick = (now: number) => {
			const dt = Math.min(0.05, (now - last) / 1000);
			last = now;
			value += (target.current - value) * (1 - Math.exp(-(reduceMotion() ? 20 : 4.5) * dt));
			if (target.current === 1 && value > 0.995) {
				value = 1;
				held += dt;
				if (held > 0.2) {
					setLeaving(true);
					return;
				}
			}
			const width = track.current?.clientWidth ?? 0;
			walker.current?.style.setProperty('transform', `translate3d(${value * (width - 12 - SCALE * 16)}px, 0, 0)`);
			// Re-render only when something visible changes: a tile's worth or a percent
			const step = Math.round(value * 100);
			if (step !== lastShown) {
				lastShown = step;
				setShown(value);
			}
			frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, []);

	// Once it has lifted away, tell the town it can take over
	useEffect(() => {
		if (!leaving) return;
		const timer = setTimeout(onExited, reduceMotion() ? 0 : 520);
		return () => clearTimeout(timer);
	}, [leaving, onExited]);

	const revealed = Math.floor(shown * TILES + 0.5);
	const stage = done && shown > 0.99 ? 'Welcome to Asgard' : STAGES[Math.min(STAGES.length - 1, Math.floor(shown * STAGES.length))];

	return (
		<div className={`asgard-loader${leaving ? ' leaving' : ''}`} role="status" aria-live="polite" aria-label="Loading the town">
			<div className="asgard-fireflies" aria-hidden="true">
				{Array.from({ length: 9 }, (_, i) => (
					<span key={i} style={{ '--i': i } as React.CSSProperties} />
				))}
			</div>

			<div className="asgard-loader-card">
				<h1 className="asgard-loader-title" aria-hidden="true">
					Asgard
				</h1>

				<div className="asgard-path" ref={track} aria-hidden="true">
					<div className="asgard-path-tiles">
						{Array.from({ length: TILES }, (_, i) => (
							<span
								key={i}
								className={i < revealed ? 'on' : undefined}
								style={frameStyle('town', PATH_STYLES.dirt.frames[(i * 3) % PATH_STYLES.dirt.frames.length])}
							/>
						))}
					</div>
					<div className="asgard-walker" ref={walker}>
						<span className="asgard-wizard" style={frameStyle(CHARACTERS.wizard.sheet, CHARACTERS.wizard.frame)} />
					</div>
				</div>

				<p className="asgard-loader-text">
					<span key={stage} className="asgard-stage">
						{stage}
					</span>
					<span className="asgard-percent">{Math.round(shown * 100)}%</span>
				</p>
			</div>
		</div>
	);
}
