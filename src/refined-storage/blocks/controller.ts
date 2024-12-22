import { Block, Dimension, system, Vector3, world } from '@minecraft/server';
import { config, path } from '../..';
import { blocks, remove } from '../placements';
import { v4UUID } from '../../lib/uuid';
import { debugAsScoreboard, PathGroup } from '..';
import { RSVector3Untils } from '../../lib/rsvector3-utils';

export interface RSVector3 {
	x: number;
	y: number;
	z: number;
	id: string;
	dimensionId: string;
}

export interface RSControllerIds {
	controller: string;
	cable: string;

	importer: string;
	exporter: string;
}

export class RefinedStorage {
	static async Interval() {
		try {
			// world.debug(RefinedStorage.Controller.size);
			// world.debug(path.group.map(({ id }) => id));
			const already: Set<Block> = new Set();

			for (let current of RefinedStorage.Controller) {
				current.update();
				if (!current.cores.length) {
					RefinedStorage.Controller.delete(current);
					continue;
				}

				current.update(path.group.find(({ group }) => RSVector3Untils.hasBlock(current.cores[0], group)) as PathGroup);

				const other = [...RefinedStorage.Controller].find(({ connects, id }) => id !== current.id && connects.id === current.connects.id);
				if (other) {
					current.mergeWith(other);
					RefinedStorage.Controller.delete(other);
				}

				current.cores.forEach((b) => already.add(b));
			}

			for (let loc of (blocks.data[config.ids.controller] || []) as RSVector3[]) {
				try {
					var block = world.getDimension(loc.dimensionId).getBlock(loc as Vector3) as Block;
				} catch {
					continue;
				}
				if (!block || !block.isValid() || already.has(block)) continue;

				let pathGroup = path.group.find(({ group }) => RSVector3Untils.hasBlock(block, group)) as PathGroup,
					controller = [...RefinedStorage.Controller].find((con) => RSVector3Untils.hasBlock1(block, con.cores));

				if (!controller) {
					RefinedStorage.Controller.add(new RefinedStorage(block, pathGroup));
					continue;
				}
			}
		} catch (e) {
			console.error(e, (e as Error).stack);
		}
	}

	static Controller: Set<RefinedStorage> = new Set();

	id: String = v4UUID();
	dimension: Dimension;
	connects: PathGroup;
	cores: Block[] = [];
	importer: Block[] = [];
	exporter: Block[] = [];

	constructor(controller: Block, path: PathGroup) {
		// world.debug(path);
		this.dimension = controller.dimension;
		this.cores.push(controller);
		this.update(path);
	}

	mergeWith(other: RefinedStorage) {
		world.debug('Merge event');
	}

	update(path?: PathGroup) {
		if (path) this.connects = path;

		this.cores = [];
		this.exporter = [];
		this.importer = [];

		for (let location of this.connects.group) {
			let block = this.dimension.getBlock(location as Vector3);
			switch (block?.typeId) {
				case config.ids.controller:
					this.cores.push(block);
					break;
				case config.ids.exporter:
					this.exporter.push(block);
					break;
				case config.ids.importer:
					this.importer.push(block);
					break;
				default:
					remove(location);
			}
		}

		debugAsScoreboard({
			core: this.cores.length,
			cable: this.cable.length,
			totals: this.connects.group.length,
			'debug-space-2': 2,
			importer: this.importer.length,
			exporter: this.exporter.length,
			'debug-space-1': 1,
			mapLength: RefinedStorage.Controller.size,
		});
	}

	get cable(): Block[] {
		return this.connects.group.filter(({ id }) => id === config.ids.cable).map((loc) => this.dimension.getBlock(loc) as Block);
	}
}

system.runTimeout(() => system.runInterval(RefinedStorage.Interval, 2), 5);
