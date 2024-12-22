import { Block, Container, ContainerSlot, Entity, EntityInventoryComponent, world } from '@minecraft/server';

export class BlockEntity {
	entity: Entity;
	container: Container;
	block: Block;

	constructor(block: Block, entityId: string) {
		this.block = block;

		let current = block.dimension.getEntitiesAtBlockLocation(block.center())[0];

		this.entity = current.typeId === entityId ? current : block.dimension.spawnEntity(entityId, block.location, { initialPersistence: true });
		this.entity.nameTag = this.entity.typeId.split(':')[1].formal();
		this.container = this.entity.getComponent(EntityInventoryComponent.componentId)?.container as Container;

		if (!this.container) throw new Error("Entity doesn't have container.");
	}

	kill(killEvent = 'refinedstorage:despawn'): void {
		this.entity.triggerEvent(killEvent);
		this.block.break();
	}

	uiPipe(bindingName: string, size: number) {
		this.entity.nameTag = bindingName;

		return Array.from({ length: size }, (v, i) => this.container.getSlot(i)) as ContainerSlot[];
	}
}
