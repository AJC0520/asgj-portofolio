// Every picture Asgard uses, in one place. To use other art, add its sprite sheet to SHEETS and point the entries
// below at its frames. Frames are numbered left to right, top to bottom, starting at 0.
//
// Included (both CC0, free for any use; licences next to the files in public/asgard/assets/):
//   Kenney Tiny Town     https://kenney.nl/assets/tiny-town     ground, paths, houses, trees, props
//   Kenney Tiny Dungeon  https://kenney.nl/assets/tiny-dungeon  characters

export const SHEETS = {
	town: { url: '/asgard/assets/tiny-town.png', frameWidth: 16, frameHeight: 16 },
	dungeon: { url: '/asgard/assets/tiny-dungeon.png', frameWidth: 16, frameHeight: 16 },
} as const;

export type SheetKey = keyof typeof SHEETS;

// The ground: grass, with a few tufts and flowers sprinkled in (a frame listed more often shows up more often)
export const GROUND = { sheet: 'town' as SheetKey, frames: [...Array(26).fill(0), 1, 1, 1, 1, 2] };

// Path styles for PathArea entries
export const PATH_STYLES = {
	dirt: { sheet: 'town' as SheetKey, frames: [39, 39, 39, 40, 41, 42] },
	stones: { sheet: 'town' as SheetKey, frames: [43] },
};

// Buildings: a grid of tiles, top row first. Each tile is 16 × 16 px, so a 3 × 3 house is 48 × 48 px.
// `door` is the column of the door (x.5 for a door between two columns, like a castle gate); agents walk to the
// spot just in front of it. -1 is an empty cell: grass you can walk on (the gaps beside a castle's towers).
type BuildingStyle = { sheet: SheetKey; door: number; tiles: number[][] };

export const HOUSE_STYLES = {
	// Small houses, 3 × 3 (48 × 48 px)
	wood: { sheet: 'town', door: 1, tiles: [[48, 49, 50], [60, 63, 62], [72, 85, 75]] },
	'wood-chimney': { sheet: 'town', door: 1, tiles: [[48, 51, 50], [60, 63, 62], [72, 85, 75]] },
	'wood-red': { sheet: 'town', door: 1, tiles: [[52, 53, 54], [64, 67, 66], [72, 85, 75]] },
	stone: { sheet: 'town', door: 1, tiles: [[48, 49, 50], [60, 63, 62], [76, 89, 79]] },
	'stone-red': { sheet: 'town', door: 1, tiles: [[52, 53, 54], [64, 67, 66], [76, 89, 79]] },

	// Wide houses with windows, 5 × 3 (80 × 48 px)
	'wood-wide': { sheet: 'town', door: 2, tiles: [[48, 49, 49, 49, 50], [60, 61, 63, 61, 62], [72, 84, 85, 84, 75]] },
	'stone-red-wide': { sheet: 'town', door: 2, tiles: [[52, 53, 53, 53, 54], [64, 65, 67, 65, 66], [76, 88, 89, 88, 79]] },

	// Two storeys, 4 × 4 (64 × 64 px)
	'wood-tall': { sheet: 'town', door: 2, tiles: [[48, 49, 49, 50], [60, 61, 61, 62], [72, 84, 84, 75], [72, 73, 85, 75]] },
	'stone-red-tall': { sheet: 'town', door: 2, tiles: [[52, 53, 53, 54], [64, 65, 65, 66], [76, 88, 88, 79], [76, 77, 89, 79]] },

	// A long hall, 7 × 3 (112 × 48 px)
	hall: {
		sheet: 'town',
		door: 3,
		tiles: [[48, 49, 49, 49, 49, 49, 50], [60, 61, 61, 63, 61, 61, 62], [72, 84, 73, 85, 73, 84, 75]],
	},

	// A town hall: two storeys and a row of windows, 7 × 4 (112 × 64 px)
	'town-hall': {
		sheet: 'town',
		door: 3,
		tiles: [
			[52, 53, 53, 53, 53, 53, 54],
			[64, 65, 65, 67, 65, 65, 66],
			[76, 88, 88, 88, 88, 88, 79],
			[76, 88, 77, 89, 77, 88, 79],
		],
	},

	// A castle with two towers and a portcullis gate, 8 × 5 (128 × 80 px)
	castle: {
		sheet: 'town',
		door: 3.5,
		tiles: [
			[99, 101, -1, -1, -1, -1, 99, 101],
			[126, 126, 99, 100, 100, 101, 126, 126],
			[125, 126, 126, 125, 125, 126, 126, 125],
			[126, 126, 126, 111, 112, 126, 126, 126],
			[126, 126, 126, 123, 124, 126, 126, 126],
		],
	},

	// The same castle with the gate open and lit windows, 8 × 5 (128 × 80 px)
	'castle-open': {
		sheet: 'town',
		door: 3.5,
		tiles: [
			[99, 101, -1, -1, -1, -1, 99, 101],
			[125, 126, 99, 100, 100, 101, 126, 125],
			[126, 126, 103, 126, 126, 103, 126, 126],
			[126, 126, 126, 113, 114, 126, 126, 126],
			[126, 126, 126, 123, 124, 126, 126, 126],
		],
	},

	// A stone gatehouse, 4 × 4 (64 × 64 px)
	gatehouse: { sheet: 'town', door: 1.5, tiles: [[99, 100, 100, 101], [126, 125, 125, 126], [126, 111, 112, 126], [126, 123, 124, 126]] },

	// A tall, narrow watchtower, 2 × 6 (32 × 96 px)
	tower: { sheet: 'town', door: 0.5, tiles: [[99, 101], [126, 126], [125, 125], [126, 126], [111, 112], [123, 124]] },
} satisfies Record<string, BuildingStyle>;

export type HouseStyle = keyof typeof HOUSE_STYLES;

// The edge of the map: a ring of tiles the player can't cross (BORDER in ./world.ts)
export const BORDER_STYLES = {
	fence: { sheet: 'town' as SheetKey, topLeft: 44, top: 45, topRight: 46, left: 56, right: 58, bottomLeft: 68, bottom: 45, bottomRight: 70 },
};

export type BorderStyle = keyof typeof BORDER_STYLES;

// Decorations. `solid`: the player can't walk through it.
export const PROPS = {
	'pine-tree': { sheet: 'town' as SheetKey, frame: 16, solid: true },
	'pine-tree-small': { sheet: 'town' as SheetKey, frame: 28, solid: true },
	'autumn-tree': { sheet: 'town' as SheetKey, frame: 15, solid: true },
	'autumn-tree-small': { sheet: 'town' as SheetKey, frame: 27, solid: true },
	bush: { sheet: 'town' as SheetKey, frame: 5, solid: true },
	sprout: { sheet: 'town' as SheetKey, frame: 17, solid: false },
	mushrooms: { sheet: 'town' as SheetKey, frame: 29, solid: false },
	well: { sheet: 'town' as SheetKey, frame: 92, solid: true },
	beehive: { sheet: 'town' as SheetKey, frame: 94, solid: true },
	target: { sheet: 'town' as SheetKey, frame: 95, solid: true },
	sign: { sheet: 'town' as SheetKey, frame: 83, solid: true },
	'fence-left': { sheet: 'town' as SheetKey, frame: 80, solid: true },
	'fence-middle': { sheet: 'town' as SheetKey, frame: 81, solid: true },
	'fence-right': { sheet: 'town' as SheetKey, frame: 82, solid: true },
};

export type PropType = keyof typeof PROPS;

// Characters, for the player and agents: e.g. `sprite: CHARACTERS.wizard`
export const CHARACTERS = {
	wizard: { sheet: 'dungeon' as SheetKey, frame: 84 },
	villager: { sheet: 'dungeon' as SheetKey, frame: 85 },
	smith: { sheet: 'dungeon' as SheetKey, frame: 86 },
	viking: { sheet: 'dungeon' as SheetKey, frame: 87 },
	farmer: { sheet: 'dungeon' as SheetKey, frame: 88 },
	knight: { sheet: 'dungeon' as SheetKey, frame: 96 },
	guard: { sheet: 'dungeon' as SheetKey, frame: 97 },
	merchant: { sheet: 'dungeon' as SheetKey, frame: 98 },
	princess: { sheet: 'dungeon' as SheetKey, frame: 99 },
	elder: { sheet: 'dungeon' as SheetKey, frame: 100 },
	ranger: { sheet: 'dungeon' as SheetKey, frame: 112 },
};
