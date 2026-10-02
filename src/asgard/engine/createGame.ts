// Starts the town inside an element. The React side loads this file only when you enter the town, so Phaser
// (a large library) isn't downloaded until the town opens.

import Phaser from 'phaser';
import { AsgardScene } from './AsgardScene';
import type { Bus } from './bus';

export function createGame(parent: HTMLElement, bus: Bus) {
	const scene = new AsgardScene(bus);
	const game = new Phaser.Game({
		type: Phaser.AUTO,
		parent,
		pixelArt: true, // crisp pixels when scaled up
		backgroundColor: '#1b2a1b',
		scale: { mode: Phaser.Scale.RESIZE, width: '100%', height: '100%' },
		physics: { default: 'arcade', arcade: { debug: false } },
		scene,
	});

	return {
		setInputEnabled: (enabled: boolean) => scene.setInputEnabled(enabled),
		statusOf: (agentId: string) => scene.statusOf(agentId),
		destroy: () => game.destroy(true),
	};
}

export type Game = ReturnType<typeof createGame>;
