export * from './path-finder';
import './placements';
import './blocks/controller.ts';

import { DisplaySlotId, ObjectiveSortOrder, ScoreboardObjective, world } from '@minecraft/server';

const id = 'hao1337:refined_test';
var obj: ScoreboardObjective;

world.afterEvents.worldInitialize.subscribe((l) => {
	obj = world.scoreboard.getObjective(id) || world.scoreboard.addObjective(id, '\xA7l\xA7aRS Debug Data');
	world.scoreboard.setObjectiveAtDisplaySlot(DisplaySlotId.Sidebar, { objective: obj, sortOrder: ObjectiveSortOrder.Ascending });
});

export function debugAsScoreboard(data: Record<string, any>) {
	let n: number = 0;
	obj.getParticipants().forEach((p) => obj.removeParticipant(p));

	for (let [k, v] of Object.entries(data)) {
		if (k.startsWith('debug-space')) {
			obj.setScore(`\xA7${v as number}`, n++);
			continue;
		}

		switch (typeof v) {
			case 'object':
				if (Array.isArray(v)) return obj.setScore(k + ': []', n++);
				obj.setScore('\xA76' + k + '\xA7f: {}', 0);
				return;
			case 'string':
				obj.setScore('\xA76' + k + `\xA7f: \xA7a"${v}\xA7r\xA7a"`, n++);
				break;
			case 'number':
				obj.setScore('\xA76' + k + `\xA7f: \xA7s${v}`, n++);
				break;
			case 'boolean':
				obj.setScore('\xA76' + k + `\xA7f: \xA7${v ? 'qtrue' : 'mfalse'}`, n++);
				break;
		}
	}
}
