import { PathFinder } from './refined-storage/index';
import { system, world } from '@minecraft/server';
import './core.ts';
import { ImporterConfig } from './refined-storage/blocks/importer';

interface Config {
	connectComponent: string;
	pipeId: string;
}
interface RSConfig {
	importer: ImporterConfig;
}

const config: Config = {
	connectComponent: 'refinedstorage:connectable',
	pipeId: 'refinedstorage:cable',
};
const rsConfig: RSConfig = {
	importer: {
		uiBinding: 'rs:importer',
		blockId: 'refinedstorage:importer',

		baseSpeed: 3,
		speedPerBoost: 1,

		boostSpeedItem: '',
		boostStackItem: '',
	},
};
const path = new PathFinder(config);

export { config, rsConfig, Config, RSConfig, path };

world.debug(path);

system.runInterval(() => {
	for (let player of world.getPlayers()) {
		let block = player.getBlockFromViewDirection();

		block?.block &&
			player.onScreenDisplay.setActionBar(
				JSON.colorStringify(
					{
						typeId: block.block.typeId,
						...block.block.permutation.getAllStates(),
					},
					0
				)
			);
	}
}, 10);
