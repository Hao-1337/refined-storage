import { world } from '@minecraft/server';
export class DynamicPropertyDB {
    constructor(id) {
        this.data = {};
        this.keys = {};
        this.id = id;
        this.init();
    }
    init() {
        let ids = world
            .getDynamicPropertyIds()
            .filter((id) => id.startsWith(this.id))
            .map((key) => key.split('~'));
        while (ids.length) {
            let id = ids.pop();
            if (!(id[0] in this.data)) {
                this.keys[id[0]] = [+id[1]];
                continue;
            }
            this.keys[id[0]].push(+id[1]);
        }
        for (let key in this.keys)
            this.keys[key] = this.keys[key].sort((a, b) => a - b);
        this.parse();
    }
    set(key, data) {
        if (key in this.data)
            return false;
        this.data[key] = data;
        return true;
    }
    get(key) {
        return this.data[key];
    }
    update(key, data) {
        if (!(key in this.data))
            return false;
        this.data[key] = data;
        return true;
    }
    clear(key) {
        if (!(key in this.data))
            return false;
        delete this.data[key];
        this.push();
        return true;
    }
    has(key) {
        return key in this.data;
    }
    [Symbol.iterator]() {
        return Object.entries(this.data);
    }
    moveTo(key, other) {
        if (!(key in this.data) || key in other.data)
            return false;
        other.set(key, this.data[key]);
        delete this.data[key];
        this.push();
        other.push();
        return true;
    }
    push() {
        for (let key in this.data) {
            let strings = this.split(JSON.stringify(this.data[key]));
            for (let index in strings) {
                world.setDynamicProperty(`${key}~${index}`, strings[index]);
            }
        }
    }
    split(string) {
        if (string.length <= DynamicPropertyDB.chunkLength)
            return [string];
        let i = 0;
        let out = [];
        while (i <= string.length)
            out.push(string.slice(i, (i += DynamicPropertyDB.chunkLength)));
        return out;
    }
    parse() {
        for (let key in this.keys) {
            try {
                var data = JSON.parse(this.keys[key].map((index) => world.getDynamicProperty(`${key}~${index}`)).join(''));
            }
            catch (e) {
                console.error(e, e.stack);
            }
            if (data)
                this.data[key] = data;
        }
    }
}
DynamicPropertyDB.chunkLength = Math.pow(1024, 2) * 8;
//# sourceMappingURL=database.js.map