import { BlockComponentOnPlaceEvent, Vector3, world, WorldInitializeBeforeEvent } from '@minecraft/server';

export type PathFinderGroup = (PathFinderGroup | Vector3[])[];

export class PathFinder {
	paths: Vector3[] = [];
	group: PathFinderGroup = [];
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
