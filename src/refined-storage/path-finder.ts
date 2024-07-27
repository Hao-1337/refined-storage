import { Vector3, world } from '@minecraft/server';
import { DynamicPropertyDB } from '../lib/database';
import { Vector3Utils } from '@minecraft/math';
import { Config } from '..';

export type PathFinderGroup = (PathFinderGroup | Vector3[])[];

export class PathFinder {
	pipeId: string = 'refinedstorage:cable';
	paths: Vector3[] = [];
	group: PathFinderGroup = [];
	db: DynamicPropertyDB;

	constructor({ pipeId }: Config) {
		this.pipeId = pipeId || this.pipeId;
		this.db = new DynamicPropertyDB(`[hao1337]${this.pipeId}`);

		this.db.set('pipe', []);
		this.db.set('group', []);

		this.paths = this.db.data.pipe || [];
		this.group = this.db.data.group || [];
	}

	private handle(): void {
		const cache = new Set(),
			locs = [...this.paths];

		this.group = [];

		for (const start of locs) {
			if (cache.has(start)) continue;
			const current = [];
			const queue = [start];
			while (queue.length > 0) {
				const point = queue.shift() as Vector3;
				if (cache.has(point)) continue;
				cache.add(point);
				current.push(point);
				for (const neighbor of locs) {
					if (cache.has(neighbor)) continue;
					if ((point.x - neighbor.x) ** 2 + (point.y - neighbor.y) ** 2 + (point.z - neighbor.z) ** 2 <= 1) queue.push(neighbor);
				}
			}
			this.group.push(current);
		}

		this.db.update('pipe', this.paths);
		this.db.update('group', this.group);
		this.db.push();
	}

	setPath(location: Vector3): void {
		this.paths.find((v) => Vector3Utils.equals(location, v)) || this.paths.push(location);
		this.handle();
	}

	removePath(location: Vector3): void {
		this.paths.splice(
			this.paths.findIndex((v) => Vector3Utils.equals(location, v)),
			1
		);
		this.handle();
	}
}
