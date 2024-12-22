import { Block, ContainerSlot, Dimension, ItemStack, Vector3 } from '@minecraft/server';
import { BlockEntity } from '../../lib/block-entity';
import { config } from '../..';

export interface ExporterConfig {
	uiBinding: string;
	blockId: string;
	baseSpeed: number;
	speedPerBoost: number;
	boostSpeedItem: string;
	boostStackItem: string;
}

export class Exporter extends BlockEntity {
	static from(dimension: Dimension, location: Vector3): Exporter | undefined {
		let block: Block;
		if ((block = dimension.getBlock(location) as Block)) return;

		return new Exporter(block);
	}

	pipe: ContainerSlot[];
	filters: ItemStack[];
	boosts: ItemStack[];

	constructor(block: Block) {
		super(block, config.exporter.blockId);
		this.pipe = this.uiPipe(config.exporter.uiBinding, 9);
		this.fetch();
	}

	fetch(): void {
		this.filters = this.pipe
			.slice(0, 8)
			.map((slot) => slot.getItem())
			.filter((item) => item) as ItemStack[];
		this.filters = this.pipe
			.slice(9, 12)
			.map((slot) => slot.getItem())
			.filter((item) => item) as ItemStack[];
	}
}
