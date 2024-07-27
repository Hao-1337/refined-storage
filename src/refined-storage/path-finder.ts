import { BlockComponentOnPlaceEvent, Vector3, world, WorldInitializeBeforeEvent } from '@minecraft/server';
import { DynamicPropertyDB } from '../lib/database';

export type PathFinderGroup = (PathFinderGroup | Vector3[])[];

export class PathFinder {
	paths: Vector3[] = [];
	group: PathFinderGroup = [];
	db: DynamicPropertyDB = new DynamicPropertyDB('pipe');

	contructor() {
		this.init();
	}
	protected init(): void {
		world.beforeEvents.worldInitialize.subscribe((event: WorldInitializeBeforeEvent): void => {
			event.blockTypeRegistry.registerCustomComponent('refinedstorage:cable', {
				onPlace: function ({ block }: BlockComponentOnPlaceEvent) {},
			});
		});
	}
}
