// The schedule engine: turns the clock and an agent's schedule into where it should be going.
// No Phaser here: just data in, data out.

import { BUILDINGS } from '../config/buildings';
import { HOUSE_STYLES } from '../config/assets';
import { WORLD } from '../config/world';
import type { Agent, Building, Place, Point, ScheduleEntry } from '../types';

export const DAY = 24 * 60; // minutes

// '07:45' → 465 (minutes after midnight)
export function parseTime(time: string): number {
	const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
	if (!match) throw new Error(`Asgard: "${time}" is not a time. Use 24-hour HH:MM, e.g. "07:45".`);
	return (Number(match[1]) * 60 + Number(match[2])) % DAY;
}

export const formatTime = (minutes: number) =>
	`${String(Math.floor(minutes / 60) % 24).padStart(2, '0')}:${String(Math.floor(minutes) % 60).padStart(2, '0')}`;

export const buildingById = (id: string) => BUILDINGS.find((building) => building.id === id);

// The spot just in front of a building's door
export function doorOf(building: Building): Point {
	const style = HOUSE_STYLES[building.style];
	const t = WORLD.tileSize;
	return { x: building.x + style.door * t + t / 2, y: building.y + style.tiles.length * t + t / 2 };
}

// A place (coordinates or a building id) as coordinates
export function resolvePlace(place: Place): Point {
	if (typeof place !== 'string') return place;
	const building = buildingById(place);
	if (!building) throw new Error(`Asgard: there is no building with the id "${place}".`);
	return doorOf(building);
}

// Where a schedule entry sends the agent
export function destinationOf(entry: ScheduleEntry): Point {
	if (entry.destination) return resolvePlace(entry.destination);
	if (entry.destinationX !== undefined && entry.destinationY !== undefined) return { x: entry.destinationX, y: entry.destinationY };
	throw new Error(`Asgard: the schedule entry at ${entry.time} needs a destination, or destinationX and destinationY.`);
}

// A readable name for an entry's destination ("The Mayor's House", or "200, 300")
export function destinationName(entry: ScheduleEntry): string {
	if (entry.destination) return buildingById(entry.destination)?.name ?? entry.destination;
	return `${entry.destinationX}, ${entry.destinationY}`;
}

// The schedule sorted by time, with each entry's time in minutes
export function sortedSchedule(agent: Agent) {
	return (agent.schedule ?? [])
		.map((entry) => ({ entry, at: parseTime(entry.time) }))
		.sort((a, b) => a.at - b.at);
}

// The entry in force at a given time: the last one that has started. Before the first entry of the day,
// that's yesterday's last one (schedules repeat daily). Undefined if the schedule is empty.
export function entryAt(agent: Agent, minutes: number): ScheduleEntry | undefined {
	const schedule = sortedSchedule(agent);
	if (!schedule.length) return undefined;
	const started = schedule.filter((item) => item.at <= minutes);
	return (started.length ? started[started.length - 1] : schedule[schedule.length - 1]).entry;
}

// Entries whose time falls in (from, to], handling midnight. Used every tick to start walks on time.
export function entriesBetween(agent: Agent, from: number, to: number): ScheduleEntry[] {
	const schedule = sortedSchedule(agent);
	const inRange = (at: number) => (from <= to ? at > from && at <= to : at > from || at <= to);
	return schedule.filter((item) => inRange(item.at)).map((item) => item.entry);
}
