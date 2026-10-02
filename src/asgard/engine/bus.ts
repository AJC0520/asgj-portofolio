// How the game (Phaser) and the menus (React) talk: a small typed event bus, one per running town.

import type { Target } from '../types';

export type Events = {
	near: Target | null; // what the player is standing next to (null: nothing)
	interact: Target; // the player pressed the interact key next to it
	pointer: { x: number; y: number; col: number; row: number } | null; // debug: world position under the mouse
	clock: string; // the town's time, 'HH:MM'
	progress: number; // how much of the town's pictures have loaded, 0 to 1
	ready: true; // the town is built and the game is running
};

export function createBus() {
	const listeners = new Map<keyof Events, Set<(value: never) => void>>();
	return {
		// Returns a function that unsubscribes
		on<K extends keyof Events>(event: K, listener: (value: Events[K]) => void) {
			if (!listeners.has(event)) listeners.set(event, new Set());
			const set = listeners.get(event)!;
			set.add(listener);
			return () => {
				set.delete(listener);
			};
		},
		emit<K extends keyof Events>(event: K, value: Events[K]) {
			listeners.get(event)?.forEach((listener) => (listener as (value: Events[K]) => void)(value));
		},
	};
}

export type Bus = ReturnType<typeof createBus>;
