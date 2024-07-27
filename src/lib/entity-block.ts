import { Block, Container, ContainerSlot, Entity, EntityInventoryComponent, world } from '@minecraft/server';

export class BlockEntity {
	entity: Entity;
	container: Container;
	block: Block;

	constructor(block: Block, entityId: string) {
		this.block = block;
		this.entity = block.dimension.spawnEntity(entityId, block.location, { initialPersistence: true });
		this.container = this.entity.getComponent(EntityInventoryComponent.componentId)?.container as Container;

		if (!this.container) throw new Error("Entity doesn't have container.");
	}

	kill(killEvent = 'refinedstorage:despawn'): void {
		let items = Array.from({ length: this.container.size }, (v, i) => this.container.getItem(i));

		this.entity.triggerEvent(killEvent);

		for (let item of items) item && this.block.dimension.spawnItem(item, this.block.location);
		this.block.break();
	}

	uiPipe(bindingName: string, size: number) {
		this.entity.nameTag = bindingName;

		return Array.from({ length: size }, (v, i) => this.container.getSlot(i)) as ContainerSlot[];
	}
}
