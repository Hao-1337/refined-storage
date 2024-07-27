import { world } from '@minecraft/server';
export class DynamicPropertyDB {
    constructor(id) {
        this.data = {};
        this.id = id;
        this.init();
    }
    split(string) {
        if (string.length < DynamicPropertyDB.chunkLength)
            return [string];
        let i = 0;
        let out = [];
        while (i <= string.length)
            out.push(string.slice(i, (i += DynamicPropertyDB.chunkLength)));
        return out;
    }
    init() {
        let ids = world.getDynamicPropertyIds().filter((id) => id.startsWith(this.id));
    }
}
DynamicPropertyDB.chunkLength = Math.pow(1024, 2) * 8;
//# sourceMappingURL=database.js.map