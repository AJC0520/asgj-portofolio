// The shapes of everything you can put in Asgard. The actual data lives in ./config/.
// All positions are in world pixels: (0, 0) is the top-left corner of the map, one tile is 16 × 16.
// Turn on DEBUG in ./config/world.ts to see the coordinates under the mouse.

import type { HouseStyle, PropType, SheetKey } from './config/assets';

export type Point = { x: number; y: number };

// A picture from one of the sprite sheets in ./config/assets.ts
export type Sprite = { sheet: SheetKey; frame: number };

// Somewhere an agent can be: exact coordinates, or the id of a building (meaning: in front of its door)
export type Place = Point | string;

export interface Building {
	id: string; // unique, used by agents to refer to it (e.g. 'mayors-house')
	name: string; // shown in its menu
	x: number; // top-left corner, snapped to the 16 px grid
	y: number;
	style: HouseStyle; // what it looks like (see HOUSE_STYLES in ./config/assets.ts)
	agent?: string; // id of the agent who lives or works here
	description?: string;
}

export interface Agent {
	id: string; // unique (e.g. 'agent-a')
	name: string;
	role: string; // what the agent is: shown in its menu
	task: string; // what it's doing right now: shown in its menu
	spawn: Place; // where it starts, usually its house's id
	sprite: Sprite; // what it looks like (see CHARACTERS in ./config/assets.ts)
	speed?: number; // walking speed in pixels per second (default: AGENT_SPEED in ./config/world.ts)
	schedule?: ScheduleEntry[]; // where it goes and when (empty: it stays put)
}

// One stop in an agent's day. Give either a building id (`destination`) or coordinates (`destinationX`/`destinationY`).
export interface ScheduleEntry {
	time: string; // 24-hour 'HH:MM', e.g. '07:45'
	destination?: string; // a building id: walk to its door
	destinationX?: number;
	destinationY?: number;
	via?: Point[]; // optional points to walk through on the way (to follow a path instead of cutting across)
	action?: string; // what it does there (e.g. 'report'); shown in its menu while it does it
}

// A rectangle of dirt path, snapped to the 16 px grid
export interface PathArea {
	x: number;
	y: number;
	width: number;
	height: number;
}

// A single decoration: a tree, a bush, flowers, … (see PROPS in ./config/assets.ts)
export interface Prop {
	type: PropType;
	x: number;
	y: number;
}

// What the player is standing next to
export type Target = { kind: 'agent'; agent: Agent } | { kind: 'building'; building: Building; agent?: Agent };
