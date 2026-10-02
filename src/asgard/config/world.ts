// The world: its size, the player, the clock, and what lies on the ground.
// Everything starts empty: add paths and props below, buildings in ./buildings.ts, agents in ./agents.ts.
// Positions are in world pixels; one tile is 16 × 16. Turn on DEBUG to read coordinates off the map.

import type { PathArea, Prop } from '../types';
import { type BorderStyle, CHARACTERS } from './assets';

// Shows the world coordinates (and tile) under the mouse, a grid, and each agent's destination
export const DEBUG = true;

export const WORLD = {
	width: 960, // px (60 tiles)
	height: 640, // px (40 tiles)
	tileSize: 16,
	// 'fit': the whole town on screen, scaled to the window (and rescaled when it changes).
	// A number (e.g. 3): a close-up camera that follows the player.
	zoom: 'fit' as 'fit' | number,
};

// The edge of the map: a fence around the whole town (one tile thick, inside the map). 'none': no visible edge.
// Either way, nobody can walk off the map.
export const BORDER: BorderStyle | 'none' = 'fence';

export const PLAYER = {
	spawn: { x: 480, y: 320 },
	sprite: CHARACTERS.villager,
	speed: 80, // px per second
};

// How close (px) the player must be to an agent, or a building's door, to interact with it
export const INTERACT_RADIUS = 22;

// Default walking speed for agents (px per second); an agent can set its own
export const AGENT_SPEED = 40;

// The time that schedules follow.
//   real: your computer's clock.
//   simulated: starts at `start` and runs `minutesPerSecond` game minutes per real second (to test schedules fast).
export const CLOCK: { mode: 'real' } | { mode: 'simulated'; start: string; minutesPerSecond: number } = { mode: 'real' };

// Dirt or stone paths: rectangles, snapped to the grid. Overlapping rectangles join up.
// Example: { x: 0, y: 320, width: 960, height: 32 }
export const PATHS: (PathArea & { style?: 'dirt' | 'stones' })[] = [];

// Trees, bushes, fences, … (types in PROPS in ./assets.ts)
// Example: { type: 'pine-tree', x: 128, y: 96 }
export const PROPS: Prop[] = [];
