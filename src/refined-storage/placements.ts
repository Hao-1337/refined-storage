import { Block, BlockComponentOnPlaceEvent, BlockComponentPlayerDestroyEvent, BlockExplodeAfterEvent, Direction, Vector3, world, WorldInitializeBeforeEvent } from '@minecraft/server';
import { BlockStateSuperset } from '@minecraft/vanilla-data';
import { config, path } from '..';
import { DynamicPropertyDB } from '../lib/database';
import { Vector3Utils } from '@minecraft/math';
import { RSVector3 } from './blocks/controller';

const database: DynamicPropertyDB<RSVector3[]> = new DynamicPropertyDB('refinedstorage:block_storage');

declare module '@minecraft/server' {
	interface Vector3 {
		id?: string;
	}
}

interface RenfinedStorageBlockStates {
	/**
	 * If block get place correctly
	 */
	['refinedstorage:placed']?: boolean;
	['refinedstorage:up']?: boolean;
	['refinedstorage:down']?: boolean;
	['refinedstorage:west']?: boolean;
	['refinedstorage:east']?: boolean;
	['refinedstorage:north']?: boolean;
	['refinedstorage:south']?: boolean;
}

type States = BlockStateSuperset & RenfinedStorageBlockStates;

declare module '@minecraft/server' {
	interface BlockPermutation {
		getState<T extends keyof States>(key: T): States[T] | undefined;
		withState<T extends keyof States>(name: T, value: States[T]): BlockPermutation;
	}
}

export { database as blocks };

world.beforeEvents.worldInitialize.subscribe((event: WorldInitializeBeforeEvent): void => {
	event.blockComponentRegistry.registerCustomComponent(config.connectComponent, {
		onPlace: ({ block }: BlockComponentOnPlaceEvent) => {
			if (block.permutation.getState('refinedstorage:placed')) return;
			if (block.typeId === config.ids.importer || block.typeId === config.ids.exporter) block.dimension.spawnEntity(block.typeId, block.bottomCenter(), { initialPersistence: true }).nameTag = block.typeId.split(':')[1].formal();
			add(block);
			changeConnector(block);
			path.setPath({ ...block.location, id: block.typeId, dimensionId: block.dimension.id });
		},
		onPlayerDestroy: ({ destroyedBlockPermutation: old, block }: BlockComponentPlayerDestroyEvent) => {
			remove({ id: old.type.id, ...block.location, dimensionId: block.dimension.id });
			path.removePath({ ...block.location, id: old.type.id, dimensionId: block.dimension.id });
			changeConnector(block, true);
		},
	});
});

world.afterEvents.blockExplode.subscribe(({ explodedBlockPermutation: old, block }: BlockExplodeAfterEvent) => {
	if (old.type.id === config.ids.cable) path.removePath({ ...block.location, id: old.type.id, dimensionId: block.dimension.id });
	if (old.hasTag(config.connectComponent)) changeConnector(block);
});

function changeConnector(block: Block, isBreak = false): void {
	if (!block.isValid()) return;

	let blocks: { [key: string]: [string, Block | undefined] } = {
		down: ['up', block.below()],
		up: ['down', block.above()],
		east: ['west', block.east()],
		west: ['east', block.west()],
		north: ['south', block.north()],
		south: ['north', block.south()],
	};

	isBreak || block.isAir || block.setPermutation(block.permutation.withState('refinedstorage:placed', true));

	if (block.typeId === 'refinedstorage:wireless_transmitter') {
		let direction = block.permutation.getState('minecraft:block_face') as string,
			[, block1] = blocks[blocks[direction][0]];

		if (block1?.hasTag(config.connectComponent) && !block1.hasTag('refinedstorage:without_direction')) block1.setPermutation(block1.permutation.withState(`refinedstorage:${direction}` as keyof RenfinedStorageBlockStates, !isBreak));

		return;
	}

	for (let [direction, [direction1, block1]] of Object.entries(blocks)) {
		if (!isBreak && block1?.typeId === 'refinedstorage:wireless_transmitter') {
			if ((block1.permutation.getState('minecraft:block_face') as string) === direction) block.setPermutation(block.permutation.withState(`refinedstorage:${direction}` as keyof RenfinedStorageBlockStates, !isBreak));
			continue;
		}
		if (block1?.hasTag(config.connectComponent)) {
			if (!block1.hasTag('refinedstorage:without_direction')) block1.setPermutation(block1.permutation.withState(`refinedstorage:${direction1}` as keyof RenfinedStorageBlockStates, !isBreak));

			isBreak || block.hasTag('refinedstorage:without_direction') || block.setPermutation(block.permutation.withState(`refinedstorage:${direction}` as keyof RenfinedStorageBlockStates, true));
		}
	}
}

export function add(block: Block): void {
	if ((database.data[block.typeId] as RSVector3[] | undefined)?.find((v) => Vector3Utils.equals(block.location, v) && v.dimensionId === block.dimension.id)) return;
	if (database.has(block.typeId)) return database.data[block.typeId].push({ ...block.location, dimensionId: block.dimension.id, id: block.typeId }), database.push();

	database.data[block.typeId] = [{ ...block.location, dimensionId: block.dimension.id, id: block.typeId }];
	database.push();
}

export function remove(block: RSVector3): void {
	let index = (database.data[block.id] as RSVector3[]).findIndex((v) => Vector3Utils.equals(block, v) && v.dimensionId === block.dimensionId);
	if (index !== -1) {
		database.data[block.id].splice(index, 1);
		database.push();
	}
}
