import { world } from '@minecraft/server';
import { DynamicPropertyDB } from '../lib/database';
export class PathFinder {
    constructor() {
        this.paths = [];
        this.group = [];
        this.db = new DynamicPropertyDB('pipe');
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