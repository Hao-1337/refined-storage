import { Block, BlockComponentTypes, Container, ContainerSlot, Player, Direction } from '@minecraft/server';
import SPINNET from './spinnet';
function prototypeParser(item) {
    var _a, _b, _c, _d;
    try {
        return (_b = (_a = item === null || item === void 0 ? void 0 : item.constructor) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : (typeof item === 'object' ? (_d = (_c = Object.getPrototypeOf(item)) === null || _c === void 0 ? void 0 : _c.constructor) === null || _d === void 0 ? void 0 : _d.name : undefined);
    }
    catch (e) {
        return 'error';
    }
}
export function JsonString(d) {
    var _a, _b, _c;
    try {
        const isArray = Array.isArray(d);
        const out = (isArray ? [] : {});
        const keyC = isArray ? '' : '§4∆ ';
        let pIs = 'Pending';
        let cache;
        for (const k in d) {
            switch (prototypeParser(d[k])) {
                case 'error':
                    out[keyC + k] = `§go [Unable to load. Error by debug itself]`;
                    break;
                case undefined:
                case null:
                    out[keyC + k] = `§6o ${d[k]}`;
                    break;
                case 'String':
                    out[keyC + k] = `§a$ ${d[k]}`;
                    break;
                case 'Number':
                    out[keyC + k] = `§s ${d[k]}`;
                    break;
                case 'Boolean':
                    out[keyC + k] = `§${d[k] ? 'a' : 'c'}o ${d[k]}`;
                    break;
                case 'Array':
                case 'Object':
                    out[keyC + k] = JsonString(d[k]);
                    break;
                case 'Map':
                    out[keyC + k] = JsonString(Array.from(d[k].entries()));
                    break;
                case 'WeakMap':
                    out[keyC + k] = '§4o [Cannot Read WeakMap]';
                    break;
                case 'Set':
                    out[keyC + k] = JsonString(Array.from(d[k]));
                    break;
                case 'WeakSet':
                    out[keyC + k] = '§4o [Cannot Read WeakSet]';
                    break;
                case 'Date':
                    out[keyC + k] = `§e ${d[k].toString()}`;
                    break;
                case 'Promise':
                    d[k].then(() => (pIs = 'Resolve'), () => (pIs = 'Reject'));
                    out[keyC + k] = `§d [Promise ${pIs}]`;
                    break;
                case 'Function':
                    cache = (_b = SPINNET[(_a = d.constructor) === null || _a === void 0 ? void 0 : _a.name]) === null || _b === void 0 ? void 0 : _b[k];
                    out[keyC + k] = /function \(\) \{\n    \[native code\]\n\}/gm.exec(d[k].toString()) ? (cache ? `§e (${cache.param}) => ${cache.return}` : '§u [Native Function]') : '§t$ ' + d[k].toString().replace(/\s{4,}/g, '');
                    break;
                case 'GeneratorFunction':
                    out[keyC + k] = '§d Iterator<Unknow>';
                    break;
                default:
                    out[keyC + (isArray ? '' : `§0${(_c = d[k]) === null || _c === void 0 ? void 0 : _c.constructor.name}0§ `) + k] = JsonString(d[k]);
            }
        }
        return out;
    }
    catch (e) {
        console.error(e, e.stack);
        return {};
    }
}
JSON.colorStringify = function (data, space = 4) {
    if (!(typeof data === 'object'))
        return `§6${data}`;
    return JSON.stringify(JsonString(data), undefined, space).replace(/\"§(\w+?|\w+?(∆|\$))\s(§0[\s\S]+?0§(\s*)|)([\s\S]*?)\"(:\s|,|$)/gm, (_, color, type, className, isKey, name, kind) => ((_ = (isKey = type === '∆') || type === '$'), `§${color.replace(/[∆$]/g, '').split('').join('§')}${type ? '"' : ''}${name}${type ? '"' : ''}§r${isKey ? `: ${(className === null || className === void 0 ? void 0 : className.length) ? `§8[§e${className.slice(2, -3)}§8]§l >§r ` : ''}` : (kind === null || kind === void 0 ? void 0 : kind.length) ? ',' : ''}`));
};
Array.prototype.megresplice = function () {
    let output = [];
    for (let element of this) {
        if (output.includes(element))
            continue;
        output.push(element);
    }
    return output;
};
Block.prototype.setAir = function () {
    this.setType('air');
};
Block.prototype.commandSetAir = function () {
    return this.dimension.runCommand(`setblock ${this.x} ${this.y} ${this.z} air`);
};
Block.prototype.break = function () {
    return this.dimension.runCommand(`fill ${this.x} ${this.y} ${this.z} ${this.x} ${this.y} ${this.z} air 0 destroy`);
};
Block.prototype.container = function () {
    var _a;
    return (_a = this.getComponent(BlockComponentTypes.Inventory)) === null || _a === void 0 ? void 0 : _a.container;
};
Block.prototype.itemAt = function (slot) {
    var _a, _b;
    return (_b = (_a = this.getComponent(BlockComponentTypes.Inventory)) === null || _a === void 0 ? void 0 : _a.container) === null || _b === void 0 ? void 0 : _b.getSlot(slot);
};
Container.prototype.emptyWith = function (item) {
    let emptyCount = this.emptySlotsCount * item.maxAmount, items = Array.from({ length: this.size }, (v, i) => this.getItem(i)).filter((item) => item === null || item === void 0 ? void 0 : item.isStackableWith(item));
    return emptyCount + items.length > 1 ? items.map((item) => item.maxAmount - item.amount).reduce((a, b) => a + b) : items[0].amount;
};
ContainerSlot.prototype.stack = function (item) {
    let cur = this.getItem();
    if (!cur || !item || !item.isStackableWith(cur))
        return item;
    let left = item.amount - cur.amount;
    if (left > 0) {
        this.amount = this.maxAmount;
        item.amount = left;
        return item;
    }
    this.amount += item.amount;
    return;
};
Player.prototype.getDirection = function (d = false) {
    let { x: t, y: e, z: r } = this.getViewDirection();
    let n = {
        x: Math.abs(t),
        y: Math.abs(e),
        z: Math.abs(r),
    };
    let o = {
        x: t < 0,
        y: e < 0,
        z: r < 0,
    };
    (o.x = o.x !== d), (o.y = o.y !== d), (o.z = o.z !== d);
    let i = [n.x, n.y, n.z];
    let a = Math.max(n.x, n.y, n.z);
    let s = i.indexOf(a);
    switch (['x', 'y', 'z'][s]) {
        case 'x':
            return o.x ? Direction.West : Direction.East;
        case 'y':
            return o.y ? Direction.Down : Direction.Up;
        default:
            return o.z ? Direction.North : Direction.South;
    }
};
Player.prototype.getDirection2D = function () {
    let { x: t, z: e } = this.getViewDirection(), r = { x: Math.abs(t), z: Math.abs(e) }, n = { x: t < 0, z: e < 0 }, o = [r.x, r.z], i = Math.max(r.x, r.z), a = o.indexOf(i);
    switch (['x', 'z'][a]) {
        case 'x':
            return n.x ? Direction.West : Direction.East;
        default:
            return n.z ? Direction.North : Direction.South;
    }
};
Player.prototype.getFacingDirection2D = function () {
    let { x: t, z: e } = this.getViewDirection(), r = { x: Math.abs(t), z: Math.abs(e) }, n = { x: t < 0, z: e < 0 }, o = [r.x, r.z], i = Math.max(r.x, r.z), a = o.indexOf(i);
    switch (['x', 'z'][a]) {
        case 'x':
            return n.x ? Direction.East : Direction.West;
        default:
            return n.z ? Direction.South : Direction.North;
    }
};
//# sourceMappingURL=core.js.map