import { Vector3, world } from '@minecraft/server';
import { DynamicPropertyDB } from '../lib/database';
import { Vector3Utils } from '@minecraft/math';
import { config, Config } from '..';
import { RSVector3 } from './blocks/controller';
import { v4UUID } from '../lib/uuid';

export interface PathGroup {
	id: String;
	group: RSVector3[];
}

export type PathFinderGroup = PathGroup[];

export class PathFinder {
	pipeId: string = config.ids.cable;
	paths: RSVector3[] = [];
	group: PathFinderGroup = [];
	db: DynamicPropertyDB<RSVector3[] | PathGroup[]>;

	constructor() {
		this.db = new DynamicPropertyDB(`[hao1337]${this.pipeId}`);

		this.db.set('pipe', []);
		this.db.set('group', []);

		this.paths = (this.db.data.pipe as RSVector3[]) || [];
		this.group = (this.db.data.group as PathGroup[]) || [];
	}

	private handle(): void {
		const cache: Set<RSVector3> = new Set(),
			locs: RSVector3[] = [...this.paths];

		this.group = [];

		for (const start of locs) {
			if (cache.has(start)) continue;
			const current: RSVector3[] = [];
			const queue: RSVector3[] = [start];

			while (queue.length > 0) {
				const point = queue.shift() as RSVector3;
				if (cache.has(point)) continue;
				cache.add(point);
				current.push(point);

				for (const neighbor of locs) {
					if (cache.has(neighbor)) continue;
					if (point.dimensionId === neighbor.dimensionId && Math.abs(point.x - neighbor.x) + Math.abs(point.y - neighbor.y) + Math.abs(point.z - neighbor.z) === 1) queue.push(neighbor);
				}
			}
			this.group.push({ id: v4UUID(), group: current });
		}

		this.db.update('pipe', this.paths);
		this.db.update('group', this.group);
		this.db.push();
	}

	setPath(location: RSVector3): void {
		this.paths.find((v) => Vector3Utils.equals(location, v) && v.dimensionId === location.dimensionId) || this.paths.push(location);
		this.handle();
	}

	removePath(location: RSVector3): void {
		let index = this.paths.findIndex((v) => Vector3Utils.equals(location, v) && v.dimensionId === location.dimensionId);
		if (index !== -1) {
			this.paths.splice(index, 1);
			this.handle();
		}
	}
}
