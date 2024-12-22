import './core.ts';
import { PathFinder } from './refined-storage/index';
import { BlockPermutation, system, world } from '@minecraft/server';
import './refined-storage/blocks/controller.ts';
import { ImporterConfig } from './refined-storage/blocks/importer';
import { ExporterConfig } from './refined-storage/blocks/exporter';
import { RSControllerIds } from './refined-storage/blocks/controller';

interface Config {
	connectComponent: string;
	ioComponent: string;
	importer: ImporterConfig;
	exporter: ExporterConfig;
	ids: RSControllerIds;
}

const config: Config = {
	connectComponent: 'refinedstorage:connectable',
	ioComponent: 'refinedstorage:IO',

	ids: {
		cable: 'refinedstorage:cable',
		controller: 'refinedstorage:controller',
		importer: 'refinedstorage:importer',
		exporter: 'refinedstorage:exporter',
	},

	importer: {
		uiBinding: 'rs:importer',
		blockId: 'refinedstorage:importer',

		baseSpeed: 3,
		speedPerBoost: 1,

		boostSpeedItem: '',
		boostStackItem: '',
	},

	exporter: {
		uiBinding: 'rs:exporter',
		blockId: 'refinedstorage:exporter',

		baseSpeed: 3,
		speedPerBoost: 1,

		boostSpeedItem: '',
		boostStackItem: '',
	},
};

const path = new PathFinder();

export { config, Config, path };

world.debug(path);

system.runInterval(() => {
	for (let player of world.getPlayers()) {
		let block = player.getBlockFromViewDirection();
		let entity = player.getEntitiesFromViewDirection({})?.[0];

		block?.block &&
			player.onScreenDisplay.setActionBar(
				JSON.colorStringify(
					{
						typeId: block.block.typeId,
						...block.block.permutation.getAllStates(),
						entity: entity?.entity?.typeId,
						distance: entity?.distance,
					},
					2
				)
			);
	}
}, 10);
