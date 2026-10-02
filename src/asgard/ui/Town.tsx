// The town: the Phaser canvas, with React on top of it (the loading screen, the clock, the controls and "press E" hints,
// the menu and debug readouts).

import { useEffect, useMemo, useRef, useState } from 'react';
import { DEBUG } from '../config/world';
import { createBus, type Events } from '../engine/bus';
import type { Game } from '../engine/createGame';
import type { Target } from '../types';
import { InteractionMenu } from './InteractionMenu';
import { Loader } from './Loader';

const nameOf = (target: Target) => (target.kind === 'agent' ? target.agent.name : target.building.name);

export function Town() {
	const host = useRef<HTMLDivElement>(null);
	const game = useRef<Game | null>(null);
	const bus = useMemo(createBus, []);

	// Loading: Phaser itself downloads first (its size is unknown, so that part eases toward half), then the town's
	// pictures load (real progress), then the town is built. The loader shows until the town is ready and has lifted away.
	const [progress, setProgress] = useState(0);
	const [ready, setReady] = useState(false);
	const [loaderGone, setLoaderGone] = useState(false);
	const [near, setNear] = useState<Target | null>(null);
	const [open, setOpen] = useState<Target | null>(null);
	const [clock, setClock] = useState('');
	const [pointer, setPointer] = useState<Events['pointer']>(null);

	// Start the game (Phaser is only downloaded now), and stop it when leaving
	useEffect(() => {
		let cancelled = false;
		let started: Game | undefined;
		const raise = (value: number) => setProgress((current) => Math.max(current, value));
		const off = [
			bus.on('near', setNear),
			bus.on('interact', setOpen),
			bus.on('clock', setClock),
			bus.on('pointer', setPointer),
			bus.on('progress', (value) => raise(0.55 + 0.4 * value)),
			bus.on('ready', () => setReady(true)),
		];

		let downloading = true;
		const startedAt = performance.now();
		const creep = setInterval(() => {
			if (!downloading) return;
			raise(0.5 * (1 - Math.exp(-(performance.now() - startedAt) / 1500)));
		}, 100);

		import('../engine/createGame').then(({ createGame }) => {
			downloading = false;
			if (cancelled || !host.current) return;
			raise(0.55);
			started = createGame(host.current, bus);
			game.current = started;
		});
		return () => {
			cancelled = true;
			clearInterval(creep);
			off.forEach((unsubscribe) => unsubscribe());
			started?.destroy();
			game.current = null;
		};
	}, [bus]);

	// The player stands still while a menu is open
	useEffect(() => {
		game.current?.setInputEnabled(!open);
	}, [open]);

	return (
		<div className="asgard-town">
			<div className="asgard-canvas" ref={host} />

			{!loaderGone && <Loader progress={progress} done={ready} onExited={() => setLoaderGone(true)} />}

			<div className="asgard-hud">
				<a className="asgard-button small" href="/#projects/asgard">
					← Back to the portfolio
				</a>
				{clock && <span className="asgard-clock">{clock}</span>}
			</div>

			{loaderGone && !open && (
				<p className="asgard-controls">
					<kbd>W</kbd>
					<kbd>A</kbd>
					<kbd>S</kbd>
					<kbd>D</kbd> or arrows to walk <span aria-hidden="true">·</span> <kbd>E</kbd> to interact
				</p>
			)}

			{near && !open && (
				<p className="asgard-hint">
					Press <kbd>E</kbd> to {near.kind === 'agent' ? 'talk to' : 'visit'} {nameOf(near)}
				</p>
			)}

			{open && <InteractionMenu target={open} statusOf={(id) => game.current?.statusOf(id) ?? ''} onClose={() => setOpen(null)} />}

			{DEBUG && pointer && (
				<p className="asgard-debug">
					x {pointer.x} · y {pointer.y}
					<span>
						tile {pointer.col}, {pointer.row}
					</span>
				</p>
			)}
		</div>
	);
}
