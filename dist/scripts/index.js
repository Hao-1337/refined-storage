// src/refined-storage/path-finder.ts
import { world } from "@minecraft/server";
var PathFinder = class {
  constructor() {
    this.paths = [];
    this.group = [];
  }
  contructor() {
    this.init();
  }
  init() {
    world.beforeEvents.worldInitialize.subscribe((event) => {
      event.blockTypeRegistry.registerCustomComponent("refinedstorage:cable", {
        onPlace: function({ block }) {
        }
      });
    });
  }
};

// src/core.ts
import { Block, BlockComponentTypes, Container, ContainerSlot, Player, Direction } from "@minecraft/server";

// src/spinnet.ts
var SPINNET = {};
var spinnet_default = SPINNET;

// src/core.ts
function prototypeParser(item) {
  try {
    return item?.constructor?.name ?? (typeof item === "object" ? Object.getPrototypeOf(item)?.constructor?.name : void 0);
  } catch (e) {
    return "error";
  }
}
function JsonString(d) {
  try {
    const isArray = Array.isArray(d);
    const out = isArray ? [] : {};
    const keyC = isArray ? "" : "\xA74\u2206 ";
    let pIs = "Pending";
    let cache;
    for (const k in d) {
      switch (prototypeParser(d[k])) {
        case "error":
          out[keyC + k] = `\xA7go [Unable to load. Error by debug itself]`;
          break;
        case void 0:
        case null:
          out[keyC + k] = `\xA76o ${d[k]}`;
          break;
        case "String":
          out[keyC + k] = `\xA7a$ ${d[k]}`;
          break;
        case "Number":
          out[keyC + k] = `\xA7s ${d[k]}`;
          break;
        case "Boolean":
          out[keyC + k] = `\xA7${d[k] ? "a" : "c"}o ${d[k]}`;
          break;
        case "Array":
        case "Object":
          out[keyC + k] = JsonString(d[k]);
          break;
        case "Map":
          out[keyC + k] = JsonString(Array.from(d[k].entries()));
          break;
        case "WeakMap":
          out[keyC + k] = "\xA74o [Cannot Read WeakMap]";
          break;
        case "Set":
          out[keyC + k] = JsonString(Array.from(d[k]));
          break;
        case "WeakSet":
          out[keyC + k] = "\xA74o [Cannot Read WeakSet]";
          break;
        case "Date":
          out[keyC + k] = `\xA7e ${d[k].toString()}`;
          break;
        case "Promise":
          d[k].then(
            () => pIs = "Resolve",
            () => pIs = "Reject"
          );
          out[keyC + k] = `\xA7d [Promise ${pIs}]`;
          break;
        case "Function":
          cache = spinnet_default[d.constructor?.name]?.[k];
          out[keyC + k] = /function \(\) \{\n    \[native code\]\n\}/gm.exec(d[k].toString()) ? cache ? `\xA7e (${cache.param}) => ${cache.return}` : "\xA7u [Native Function]" : "\xA7t$ " + d[k].toString().replace(/\s{4,}/g, "");
          break;
        case "GeneratorFunction":
          out[keyC + k] = "\xA7d Iterator<Unknow>";
          break;
        default:
          out[keyC + (isArray ? "" : `\xA70${d[k]?.constructor.name}0\xA7 `) + k] = JsonString(d[k]);
      }
    }
    return out;
  } catch (e) {
    console.error(e, e.stack);
    return {};
  }
}
JSON.colorStringify = function(data, space = 4) {
  if (!(typeof data === "object"))
    return `\xA76${data}`;
  return JSON.stringify(JsonString(data), void 0, space).replace(
    /\"§(\w+?|\w+?(∆|\$))\s(§0[\s\S]+?0§(\s*)|)([\s\S]*?)\"(:\s|,|$)/gm,
    (_, color, type, className, isKey, name, kind) => (_ = (isKey = type === "\u2206") || type === "$", `\xA7${color.replace(/[∆$]/g, "").split("").join("\xA7")}${type ? '"' : ""}${name}${type ? '"' : ""}\xA7r${isKey ? `: ${className?.length ? `\xA78[\xA7e${className.slice(2, -3)}\xA78]\xA7l >\xA7r ` : ""}` : kind?.length ? "," : ""}`)
  );
};
Array.prototype.megresplice = function() {
  let output = [];
  for (let element of this) {
    if (output.includes(element))
      continue;
    output.push(element);
  }
  return output;
};
Block.prototype.setAir = function() {
  this.setType("air");
};
Block.prototype.commandSetAir = function() {
  return this.dimension.runCommand(`setblock ${this.x} ${this.y} ${this.z} air`);
};
Block.prototype.break = function() {
  return this.dimension.runCommand(`fill ${this.x} ${this.y} ${this.z} ${this.x} ${this.y} ${this.z} air 0 destroy`);
};
Block.prototype.container = function() {
  return this.getComponent(BlockComponentTypes.Inventory)?.container;
};
Block.prototype.itemAt = function(slot) {
  return this.getComponent(BlockComponentTypes.Inventory)?.container?.getSlot(slot);
};
Container.prototype.emptyWith = function(item) {
  let emptyCount = this.emptySlotsCount * item.maxAmount, items = Array.from({ length: this.size }, (v, i) => this.getItem(i)).filter((item2) => item2?.isStackableWith(item2));
  return emptyCount + items.length > 1 ? items.map((item2) => item2.maxAmount - item2.amount).reduce((a, b) => a + b) : items[0].amount;
};
ContainerSlot.prototype.stack = function(item) {
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
Player.prototype.getDirection = function(d = false) {
  let { x: t, y: e, z: r } = this.getViewDirection();
  let n = {
    x: Math.abs(t),
    y: Math.abs(e),
    z: Math.abs(r)
  };
  let o = {
    x: t < 0,
    y: e < 0,
    z: r < 0
  };
  o.x = o.x !== d, o.y = o.y !== d, o.z = o.z !== d;
  let i = [n.x, n.y, n.z];
  let a = Math.max(n.x, n.y, n.z);
  let s = i.indexOf(a);
  switch (["x", "y", "z"][s]) {
    case "x":
      return o.x ? Direction.West : Direction.East;
    case "y":
      return o.y ? Direction.Down : Direction.Up;
    default:
      return o.z ? Direction.North : Direction.South;
  }
};
Player.prototype.getDirection2D = function() {
  let { x: t, z: e } = this.getViewDirection(), r = { x: Math.abs(t), z: Math.abs(e) }, n = { x: t < 0, z: e < 0 }, o = [r.x, r.z], i = Math.max(r.x, r.z), a = o.indexOf(i);
  switch (["x", "z"][a]) {
    case "x":
      return n.x ? Direction.West : Direction.East;
    default:
      return n.z ? Direction.North : Direction.South;
  }
};
Player.prototype.getFacingDirection2D = function() {
  let { x: t, z: e } = this.getViewDirection(), r = { x: Math.abs(t), z: Math.abs(e) }, n = { x: t < 0, z: e < 0 }, o = [r.x, r.z], i = Math.max(r.x, r.z), a = o.indexOf(i);
  switch (["x", "z"][a]) {
    case "x":
      return n.x ? Direction.East : Direction.West;
    default:
      return n.z ? Direction.South : Direction.North;
  }
};

// src/index.ts
var path = new PathFinder();

//# sourceMappingURL=../debug/index.js.map
