// The town's clock, in minutes after midnight: the real time, or a fast simulated day (CLOCK in ../config/world.ts)

import { CLOCK } from '../config/world';
import { DAY, parseTime } from './schedule';

export function createClock() {
	const startedAt = performance.now();
	const startMinutes = CLOCK.mode === 'simulated' ? parseTime(CLOCK.start) : 0;

	return {
		now(): number {
			if (CLOCK.mode === 'simulated') {
				const elapsed = ((performance.now() - startedAt) / 1000) * CLOCK.minutesPerSecond;
				return (startMinutes + elapsed) % DAY;
			}
			const d = new Date();
			return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
		},
	};
}
