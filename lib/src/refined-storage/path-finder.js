import { world } from '@minecraft/server';
export class PathFinder {
    constructor() {
        this.paths = [];
        this.group = [];
    }
    contructor() {
        this.init();
    }
    init() {
        world.beforeEvents.worldInitialize.subscribe((event) => {
            event.blockTypeRegistry.registerCustomComponent('refinedstorage:cable', {
                onPlace: function ({ block }) { },
            });
        });
    }
}
//# sourceMappingURL=path-finder.js.map