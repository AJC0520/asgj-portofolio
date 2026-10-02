// Houses in Asgard. Empty to begin with: add one object per building.
// `x`/`y` is the top-left corner (a house is 48 × 48 px). Use DEBUG in ./world.ts to find coordinates.
//
// Example:
//   {
//     id: 'mayors-house',
//     name: "The Mayor's House",
//     x: 432,
//     y: 160,
//     style: 'stone-red',
//     agent: 'mayor',
//     description: 'Where reports end up.',
//   },

import type { Building } from '../types';




export const BUILDINGS: Building[] = [

    {
     id: 'mayors-house',
     name: "The Mayor's House",
     x: 432,
     y: 160,
     style: 'wood-chimney',
     agent: 'mayor',
     description: 'Where reports end up.',
   },
];
