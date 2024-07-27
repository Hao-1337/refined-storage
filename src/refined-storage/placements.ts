import { Block, BlockComponentOnPlaceEvent, BlockComponentPlayerDestroyEvent, BlockExplodeAfterEvent, Direction, world, WorldInitializeBeforeEvent } from '@minecraft/server';
import { config, path } from '..';

world.beforeEvents.worldInitialize.subscribe((event: WorldInitializeBeforeEvent): void => {
	event.blockTypeRegistry.registerCustomComponent(config.pipeId, {
		onPlace: ({ block }: BlockComponentOnPlaceEvent) => {
			if (block.permutation.getState('refinedstorage:placed')) return;
			path.setPath(block.location);
			changeConnector(block);
		},
		onPlayerDestroy: ({ block }: BlockComponentPlayerDestroyEvent) => {
			path.removePath(block.location);
			changeConnector(block, true);
		},
	});
	event.blockTypeRegistry.registerCustomComponent(config.connectComponent, {
		onPlace: ({ block }: BlockComponentOnPlaceEvent) => block.permutation.getState('refinedstorage:placed') || changeConnector(block),
		onPlayerDestroy: ({ block }: BlockComponentPlayerDestroyEvent) => changeConnector(block, true),
	});
});

world.afterEvents.blockExplode.subscribe(({ explodedBlockPermutation: old, block }: BlockExplodeAfterEvent) => {
	if (old.type.id === config.pipeId) path.removePath(block.location);
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

		if (block1?.hasTag(config.connectComponent) && !block1.hasTag('refinedstorage:without_direction')) block1.setPermutation(block1.permutation.withState(`refinedstorage:${direction}`, !isBreak));

		return;
	}

	for (let [direction, [direction1, block1]] of Object.entries(blocks)) {
		if (!isBreak && block1?.typeId === 'refinedstorage:wireless_transmitter') {
			if ((block1.permutation.getState('minecraft:block_face') as string) === direction) block.setPermutation(block.permutation.withState(`refinedstorage:${direction}`, !isBreak));
			continue;
		}
		if (block1?.hasTag(config.connectComponent)) {
			if (!block1.hasTag('refinedstorage:without_direction')) block1.setPermutation(block1.permutation.withState(`refinedstorage:${direction1}`, !isBreak));

			isBreak || block.hasTag('refinedstorage:without_direction') || block.setPermutation(block.permutation.withState(`refinedstorage:${direction}`, true));
		}
	}
}
