// Agents in Asgard. Empty to begin with: add one object per agent.
// `spawn` is a building id (they start at its door) or { x, y }.
// `schedule` (optional) is their day: at each `time` they walk to the destination and do the `action` there.
// The schedule repeats every day. When the town opens, each agent is already wherever its schedule last sent it.
//
// Example:
//   {
//     id: 'agent-a',
//     name: 'Agent A',
//     role: 'Collects news from around town',
//     task: "Summarising this morning's reports",
//     spawn: 'agent-a-house',
//     sprite: CHARACTERS.ranger,
//     schedule: [
//       { time: '07:45', destination: 'mayors-house', action: 'report' },
//       { time: '09:00', destinationX: 200, destinationY: 300, via: [{ x: 200, y: 180 }], action: 'patrol' },
//       { time: '17:00', destination: 'agent-a-house', action: 'rest' },
//     ],
//   },

import type { Agent } from '../types';
import { CHARACTERS } from './assets';

export const AGENTS: Agent[] = [
       {
     id: 'agent-a',
     name: 'Agent A',
     role: 'Collects news from around town',
     task: "Summarising this morning's reports",
     spawn: 'agent-a-house',
     sprite: CHARACTERS.ranger,
     schedule: [
       { time: '07:45', destination: 'mayors-house', action: 'report' },
       { time: '09:00', destinationX: 200, destinationY: 300, via: [{ x: 200, y: 180 }], action: 'patrol' },
       { time: '17:00', destination: 'agent-a-house', action: 'rest' },
     ],
   },
];
