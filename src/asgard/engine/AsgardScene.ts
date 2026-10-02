// The town itself (Phaser): builds the map from the config, moves the player and the agents, notices what the player
// is standing next to, and reports to the React menus through the bus. All content comes from ../config/.

import Phaser from 'phaser';
import { AGENTS } from '../config/agents';
import { BORDER_STYLES, GROUND, HOUSE_STYLES, PATH_STYLES, PROPS as PROP_TYPES, SHEETS, type SheetKey } from '../config/assets';
import { BUILDINGS } from '../config/buildings';
import { AGENT_SPEED, BORDER, DEBUG, INTERACT_RADIUS, PATHS, PLAYER, PROPS, WORLD } from '../config/world';
import type { Agent, Point, ScheduleEntry, Sprite, Target } from '../types';
import type { Bus } from './bus';
import { createClock } from './clock';
import { destinationName, destinationOf, doorOf, entriesBetween, entryAt, formatTime, resolvePlace } from './schedule';

type Walker = {
	agent: Agent;
	sprite: Phaser.GameObjects.Sprite;
	label: Phaser.GameObjects.Text;
	route: Point[]; // points still to walk through; empty when standing still
	entry?: ScheduleEntry; // the schedule entry it's carrying out
	step: number; // walking time, for the wobble
};

const WOBBLE = 7; // degrees a character rocks while walking

export class AsgardScene extends Phaser.Scene {
	private bus: Bus;
	private clock!: ReturnType<typeof createClock>;
	private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
	private keys!: Record<'up' | 'down' | 'left' | 'right' | 'w' | 'a' | 's' | 'd', Phaser.Input.Keyboard.Key>;
	private walkers: Walker[] = [];
	private near: Target | null = null;
	private inputEnabled = true;
	private lastMinutes?: number;
	private lastClock = '';
	private playerStep = 0;
	private debug?: Phaser.GameObjects.Graphics;
	private pointerInside = false;

	constructor(bus: Bus) {
		super('asgard');
		this.bus = bus;
	}

	preload() {
		this.load.on('progress', (value: number) => this.bus.emit('progress', value));
		this.events.once('create', () => this.bus.emit('ready', true)); // after create() has built the town
		for (const [key, sheet] of Object.entries(SHEETS)) {
			this.load.spritesheet(key, sheet.url, { frameWidth: sheet.frameWidth, frameHeight: sheet.frameHeight });
		}
	}

	create() {
		// The (simulated) day starts now that the town is ready, not while it was loading
		this.clock = createClock();
		const t = WORLD.tileSize;
		const solid = this.buildMap();

		this.physics.world.setBounds(0, 0, WORLD.width, WORLD.height);

		// The player: a small body at the feet, so it can walk up close to things
		this.player = this.physics.add.sprite(PLAYER.spawn.x, PLAYER.spawn.y, PLAYER.sprite.sheet, PLAYER.sprite.frame);
		this.player.body.setSize(10, 6).setOffset(3, 10);
		this.player.setCollideWorldBounds(true).setDepth(20);
		this.physics.add.collider(this.player, solid);

		// Agents start wherever their schedule has them right now (or at their spawn)
		const now = this.clock.now();
		for (const agent of AGENTS) {
			const entry = entryAt(agent, now);
			const at = entry ? destinationOf(entry) : resolvePlace(agent.spawn);
			const sprite = this.add.sprite(at.x, at.y, agent.sprite.sheet, agent.sprite.frame).setDepth(10);
			const label = this.add
				.text(at.x, at.y - t, agent.name, { fontFamily: 'monospace', fontSize: '24px', color: '#ffffff', stroke: '#1b1b1b', strokeThickness: 6 })
				.setOrigin(0.5, 1)
				.setScale(1 / 3)
				.setDepth(30);
			this.walkers.push({ agent, sprite, label, route: [], entry, step: 0 });
		}
		this.lastMinutes = now;

		// Camera: the whole town fitted to the window, or (with a number zoom) a close-up that follows the player
		const camera = this.cameras.main;
		camera.roundPixels = true;
		if (WORLD.zoom === 'fit') {
			this.fit();
			this.scale.on('resize', () => this.fit());
		} else {
			camera.setBounds(0, 0, WORLD.width, WORLD.height);
			camera.setZoom(WORLD.zoom);
			camera.startFollow(this.player, true, 0.15, 0.15);
		}

		// Keys: arrows or WASD to walk; E, Space or Enter to interact
		const keyboard = this.input.keyboard!;
		this.keys = keyboard.addKeys({
			up: 'UP',
			down: 'DOWN',
			left: 'LEFT',
			right: 'RIGHT',
			w: 'W',
			a: 'A',
			s: 'S',
			d: 'D',
		}) as AsgardScene['keys'];
		const interact = () => {
			if (this.inputEnabled && this.near) this.bus.emit('interact', this.near);
		};
		keyboard.on('keydown-E', interact);
		keyboard.on('keydown-SPACE', interact);
		keyboard.on('keydown-ENTER', interact);

		if (DEBUG) {
			this.drawGrid();
			this.debug = this.add.graphics().setDepth(40);
			this.input.on('pointermove', () => (this.pointerInside = true));
			this.input.on('gameout', () => {
				this.pointerInside = false;
				this.bus.emit('pointer', null);
			});
		}
	}

	// Scale the camera so the whole map fits the window, with a little room around it, and centre it
	private fit() {
		const camera = this.cameras.main;
		const margin = 0.96;
		camera.setZoom(Math.min(this.scale.width / WORLD.width, this.scale.height / WORLD.height) * margin);
		camera.centerOn(WORLD.width / 2, WORLD.height / 2);
		this.drawGrid();
	}

	// Ground, paths, houses and props as tile layers. Returns the layer the player collides with.
	private buildMap() {
		const t = WORLD.tileSize;
		const cols = Math.ceil(WORLD.width / t);
		const rows = Math.ceil(WORLD.height / t);
		const map = this.make.tilemap({ tileWidth: t, tileHeight: t, width: cols, height: rows });

		// Every sheet becomes a tileset; a tile's index is its sheet's first index plus its frame
		const first: Partial<Record<SheetKey, number>> = {};
		const tilesets: Phaser.Tilemaps.Tileset[] = [];
		let next = 0;
		for (const [key, sheet] of Object.entries(SHEETS) as [SheetKey, (typeof SHEETS)[SheetKey]][]) {
			const image = this.textures.get(key).getSourceImage() as HTMLImageElement;
			tilesets.push(map.addTilesetImage(key, key, sheet.frameWidth, sheet.frameHeight, 0, 0, next)!);
			first[key] = next;
			next += (image.width / sheet.frameWidth) * (image.height / sheet.frameHeight);
		}
		const index = (sprite: Sprite) => first[sprite.sheet]! + sprite.frame;

		const ground = map.createBlankLayer('ground', tilesets)!;
		const paths = map.createBlankLayer('paths', tilesets)!;
		const decor = map.createBlankLayer('decor', tilesets)!;
		const solid = map.createBlankLayer('solid', tilesets)!;

		// A fixed scatter (the same every time) of the ground's frames: a hash of the tile's position, so no pattern shows
		const pick = <T>(list: T[], c: number, r: number) => {
			let h = Math.imul(c, 374761393) + Math.imul(r, 668265263);
			h = Math.imul(h ^ (h >>> 13), 1274126177);
			return list[((h ^ (h >>> 16)) >>> 0) % list.length];
		};

		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) ground.putTileAt(index({ sheet: GROUND.sheet, frame: pick(GROUND.frames, c, r) }), c, r);
		}

		for (const area of PATHS) {
			const style = PATH_STYLES[area.style ?? 'dirt'];
			const c0 = Math.floor(area.x / t);
			const r0 = Math.floor(area.y / t);
			const c1 = Math.ceil((area.x + area.width) / t);
			const r1 = Math.ceil((area.y + area.height) / t);
			for (let r = Math.max(0, r0); r < Math.min(rows, r1); r++) {
				for (let c = Math.max(0, c0); c < Math.min(cols, c1); c++) paths.putTileAt(index({ sheet: style.sheet, frame: pick(style.frames, c, r) }), c, r);
			}
		}

		for (const building of BUILDINGS) {
			const style = HOUSE_STYLES[building.style];
			const c0 = Math.round(building.x / t);
			const r0 = Math.round(building.y / t);
			style.tiles.forEach((row, r) =>
				row.forEach((frame, c) => {
					if (frame >= 0) solid.putTileAt(index({ sheet: style.sheet as SheetKey, frame }), c0 + c, r0 + r); // -1: empty
				}),
			);
		}

		for (const prop of PROPS) {
			const type = PROP_TYPES[prop.type];
			(type.solid ? solid : decor).putTileAt(index(type), Math.round(prop.x / t), Math.round(prop.y / t));
		}

		// The fence around the edge
		if (BORDER !== 'none') {
			const b = BORDER_STYLES[BORDER];
			const at = (frame: number, c: number, r: number) => solid.putTileAt(index({ sheet: b.sheet, frame }), c, r);
			for (let c = 1; c < cols - 1; c++) {
				at(b.top, c, 0);
				at(b.bottom, c, rows - 1);
			}
			for (let r = 1; r < rows - 1; r++) {
				at(b.left, 0, r);
				at(b.right, cols - 1, r);
			}
			at(b.topLeft, 0, 0);
			at(b.topRight, cols - 1, 0);
			at(b.bottomLeft, 0, rows - 1);
			at(b.bottomRight, cols - 1, rows - 1);
		}

		solid.setCollisionByExclusion([-1]);
		return solid;
	}

	private grid?: Phaser.GameObjects.Graphics;

	// The debug grid, one screen pixel wide at the current zoom
	private drawGrid() {
		if (!DEBUG) return;
		const t = WORLD.tileSize;
		this.grid ??= this.add.graphics().setDepth(5);
		const grid = this.grid.clear();
		grid.lineStyle(1 / this.cameras.main.zoom, 0x000000, 0.12);
		for (let x = 0; x <= WORLD.width; x += t) grid.lineBetween(x, 0, x, WORLD.height);
		for (let y = 0; y <= WORLD.height; y += t) grid.lineBetween(0, y, WORLD.width, y);
	}

	update(_time: number, delta: number) {
		const dt = Math.min(delta, 50) / 1000;
		this.movePlayer(dt);
		this.runSchedules();
		this.moveAgents(dt);
		this.findNear();
		if (this.debug) this.drawDebug();
	}

	private movePlayer(dt: number) {
		const k = this.keys;
		let vx = 0;
		let vy = 0;
		if (this.inputEnabled) {
			vx = (k.right.isDown || k.d.isDown ? 1 : 0) - (k.left.isDown || k.a.isDown ? 1 : 0);
			vy = (k.down.isDown || k.s.isDown ? 1 : 0) - (k.up.isDown || k.w.isDown ? 1 : 0);
		}
		const length = Math.hypot(vx, vy) || 1;
		this.player.setVelocity((vx / length) * PLAYER.speed, (vy / length) * PLAYER.speed);
		if (vx) this.player.setFlipX(vx < 0);
		this.playerStep = vx || vy ? this.playerStep + dt : 0;
		this.player.setAngle(Math.sin(this.playerStep * 14) * WOBBLE * (vx || vy ? 1 : 0));
	}

	// Start the walks whose time has come since the last frame
	private runSchedules() {
		const now = this.clock.now();
		const clock = formatTime(now);
		if (clock !== this.lastClock) {
			this.lastClock = clock;
			this.bus.emit('clock', clock);
		}
		if (this.lastMinutes === undefined || now === this.lastMinutes) return;
		for (const walker of this.walkers) {
			const due = entriesBetween(walker.agent, this.lastMinutes, now);
			const entry = due[due.length - 1]; // if several are due at once, the latest wins
			if (entry) {
				walker.entry = entry;
				walker.route = [...(entry.via ?? []), destinationOf(entry)];
			}
		}
		this.lastMinutes = now;
	}

	private moveAgents(dt: number) {
		for (const walker of this.walkers) {
			const { sprite, label, route } = walker;
			const speed = walker.agent.speed ?? AGENT_SPEED;
			let budget = speed * dt;
			while (route.length && budget > 0) {
				const to = route[0];
				const dx = to.x - sprite.x;
				const dy = to.y - sprite.y;
				const distance = Math.hypot(dx, dy);
				if (distance <= budget) {
					sprite.setPosition(to.x, to.y);
					route.shift();
					budget -= distance;
				} else {
					sprite.setPosition(sprite.x + (dx / distance) * budget, sprite.y + (dy / distance) * budget);
					if (dx) sprite.setFlipX(dx < 0);
					budget = 0;
				}
			}
			const walking = route.length > 0;
			walker.step = walking ? walker.step + dt : 0;
			sprite.setAngle(walking ? Math.sin(walker.step * 12) * WOBBLE : 0);
			label.setPosition(sprite.x, sprite.y - WORLD.tileSize / 2 - 1);
		}
	}

	// The nearest agent or building door within reach, if any; tells the menus when it changes
	private findNear() {
		const { x, y } = this.player;
		let best: { target: Target; distance: number } | null = null;
		const consider = (target: Target, point: Point) => {
			const distance = Math.hypot(point.x - x, point.y - y);
			if (distance <= INTERACT_RADIUS && (!best || distance < best.distance)) best = { target, distance };
		};
		for (const walker of this.walkers) consider({ kind: 'agent', agent: walker.agent }, walker.sprite);
		for (const building of BUILDINGS) {
			const agent = AGENTS.find((a) => a.id === building.agent);
			consider({ kind: 'building', building, agent }, doorOf(building));
		}
		const target = (best as { target: Target } | null)?.target ?? null;
		const id = (value: Target | null) => (value ? (value.kind === 'agent' ? `a:${value.agent.id}` : `b:${value.building.id}`) : '');
		if (id(target) !== id(this.near)) {
			this.near = target;
			this.bus.emit('near', target);
		}
	}

	private drawDebug() {
		const g = this.debug!;
		g.clear();
		// Reach around everything you can interact with
		const px = 1 / this.cameras.main.zoom; // one screen pixel
		g.lineStyle(px, 0xffff00, 0.6);
		for (const walker of this.walkers) g.strokeCircle(walker.sprite.x, walker.sprite.y, INTERACT_RADIUS);
		for (const building of BUILDINGS) {
			const door = doorOf(building);
			g.strokeCircle(door.x, door.y, INTERACT_RADIUS);
		}
		// Each walking agent's route
		g.lineStyle(px, 0xff00ff, 0.9);
		for (const walker of this.walkers) {
			let from: Point = walker.sprite;
			for (const point of walker.route) {
				g.lineBetween(from.x, from.y, point.x, point.y);
				from = point;
			}
		}
		// The mouse position in the world
		const pointer = this.input.activePointer;
		if (this.pointerInside) {
			const world = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
			const t = WORLD.tileSize;
			this.bus.emit('pointer', { x: Math.round(world.x), y: Math.round(world.y), col: Math.floor(world.x / t), row: Math.floor(world.y / t) });
		}
	}

	// ——— For the React side ———

	setInputEnabled(enabled: boolean) {
		this.inputEnabled = enabled;
		if (!enabled) this.player?.setVelocity(0, 0);
	}

	// What an agent is doing right now, in words
	statusOf(agentId: string): string {
		const walker = this.walkers.find((w) => w.agent.id === agentId);
		const entry = walker?.entry;
		if (!walker || !entry) return 'At home';
		const where = destinationName(entry);
		if (walker.route.length) return `Walking to ${where}${entry.action ? ` (${entry.action})` : ''}`;
		return entry.action ? `${entry.action[0].toUpperCase()}${entry.action.slice(1)} at ${where}` : `At ${where}`;
	}
}
