import { Block, World, world, BlockComponentTypes, CommandResult, Container, ContainerSlot, ItemStack, Player, Direction, EntityQueryOptions } from '@minecraft/server';
import SPINNET from './spinnet';

declare module '@minecraft/server' {
	interface Block {
		setAir(): void;
		commandSetAir(): CommandResult;
		break(): CommandResult;
		container(): Container | undefined;
		itemAt(slot: number): ContainerSlot | undefined;
	}
	interface Container {
		emptyWith(item: ItemStack): number;
	}
	interface ContainerSlot {
		stack(item: ItemStack): ItemStack | undefined;
	}
	interface Player {
		getDirection(inverse?: boolean): Direction;
		getDirection2D(): Direction;
		getFacingDirection2D(): Direction;
	}
	interface World {
		debug(data: unknown, option?: EntityQueryOptions): void | never;
	}
}

declare global {
	interface JSON {
		colorStringify(data: unknown, space?: number): string;
	}

	interface String {
		formal(): string;
	}
}

export type JsonStringResult = { [key: string]: string | JsonStringResult };

function prototypeParser(item: any): string | undefined {
	try {
		return item?.constructor?.name ?? (typeof item === 'object' ? Object.getPrototypeOf(item)?.constructor?.name : undefined);
	} catch (e) {
		return 'error';
	}
}

export function JsonString(d: any): JsonStringResult {
	try {
		const isArray = Array.isArray(d);
		const out = (isArray ? [] : {}) as JsonStringResult;
		const keyC = isArray ? '' : '§c∆ ';
		let pIs = 'Pending';
		let cache: any;

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
					out[keyC + k] = `§${d[k] ? 'q' : 'm'}o ${d[k]}`;
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
					d[k].then(
						() => (pIs = 'Resolve'),
						() => (pIs = 'Reject')
					);
					out[keyC + k] = `§d [Promise ${pIs}]`;
					break;
				case 'Function':
					cache = SPINNET[d.constructor?.name]?.[k];
					out[keyC + k] = /function \(\) \{\n    \[native code\]\n\}/gm.exec(d[k].toString()) ? (cache ? `§e (${cache.param}) => ${cache.return}` : '§u [Native Function]') : '§t$ ' + d[k].toString().replace(/\s{4,}/g, '');
					break;
				case 'GeneratorFunction':
					out[keyC + k] = '§d Iterator<Unknow>';
					break;
				default:
					out[keyC + (isArray ? '' : `§0${d[k]?.constructor.name}0§ `) + k] = JsonString(d[k]);
			}
		}
		return out;
	} catch (e) {
		console.error(e, (e as Error).stack);
		return {};
	}
}

JSON.colorStringify = function (data: unknown, space = 4): string {
	if (!(typeof data === 'object')) return `§6${data}`;
	return JSON.stringify(JsonString(data), undefined, space).replace(
		/\"§(\w+?(∆|\$)|\w+?)\s(§0[\s\S]+?0§(\s*)|)([\s\S]*?)\"(:\s*?|,|$|[\}\]])/gm,
		(_: string | boolean, color, type, className, isKey, name, kind) => (
			(_ = (isKey = type === '∆') || type === '$'), `§${color.replace(/[∆$]/g, '').split('').join('§')}${type ? '"' : ''}${name}${type ? '"' : ''}§r${isKey ? `: ${className?.length ? `§8[§e${className.slice(2, -3)}§8]§l >§r ` : ''}` : kind?.length ? kind[0] : ''}`
		)
	);
};

world.debug = function (t: any, e = {}): void {
	const tell = (m: string) => {
			for (let d of world.getPlayers(e)) d.sendMessage(m);
		},
		o = t?.constructor?.name;
	let line;
	try {
		let u = {};
		(u as Map<unknown, unknown>).clear();
	} catch (e) {
		line = `${(e as Error).stack}`.match(/\d+/g)?.[1] || NaN;
	}

	let data = o?.includes('Error') ? `§4[Debugger Error]§c ${t}\n${t.stack}` : `§4[Debugger<§eLine: §f${line}§c> - Class: ${o ?? 'None'}]§r ${JSON.colorStringify(t, 0)}`;
	return tell(data);
};

export function megresplice<T>(array: Array<T>): Array<T> {
	let output: Array<T> = [];
	for (let element of array) {
		if (output.includes(element)) continue;
		output.push(element);
	}
	return output;
}

Block.prototype.setAir = function (): void {
	this.setType('air');
};
Block.prototype.commandSetAir = function (): CommandResult {
	return this.dimension.runCommand(`setblock ${this.x} ${this.y} ${this.z} air`);
};
Block.prototype.break = function (): CommandResult {
	return this.dimension.runCommand(`fill ${this.x} ${this.y} ${this.z} ${this.x} ${this.y} ${this.z} air 0 destroy`);
};
Block.prototype.container = function (): Container | undefined {
	return this.getComponent(BlockComponentTypes.Inventory)?.container;
};
Block.prototype.itemAt = function (slot: number): ContainerSlot | undefined {
	return this.getComponent(BlockComponentTypes.Inventory)?.container?.getSlot(slot);
};

Container.prototype.emptyWith = function (item: ItemStack): number {
	let emptyCount: number = this.emptySlotsCount * item.maxAmount,
		items = <ItemStack[]>Array.from({ length: this.size }, (v, i) => this.getItem(i)).filter((item) => item?.isStackableWith(item));

	return emptyCount + items.length > 1 ? items.map((item) => item.maxAmount - item.amount).reduce((a, b) => a + b) : items[0].amount;
};

ContainerSlot.prototype.stack = function (item: ItemStack | undefined): ItemStack | undefined {
	let cur = this.getItem();
	if (!cur || !item || !item.isStackableWith(cur)) return item;

	let left = item.amount - cur.amount;

	if (left > 0) {
		this.amount = this.maxAmount;
		item.amount = left;
		return item;
	}

	this.amount += item.amount;
	return;
};

Player.prototype.getDirection = function (d = false): Direction {
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

Player.prototype.getDirection2D = function (): Direction {
	let { x: t, z: e } = this.getViewDirection(),
		r = { x: Math.abs(t), z: Math.abs(e) },
		n = { x: t < 0, z: e < 0 },
		o = [r.x, r.z],
		i = Math.max(r.x, r.z),
		a = o.indexOf(i);
	switch (['x', 'z'][a]) {
		case 'x':
			return n.x ? Direction.West : Direction.East;
		default:
			return n.z ? Direction.North : Direction.South;
	}
};

Player.prototype.getFacingDirection2D = function (): Direction {
	let { x: t, z: e } = this.getViewDirection(),
		r = { x: Math.abs(t), z: Math.abs(e) },
		n = { x: t < 0, z: e < 0 },
		o = [r.x, r.z],
		i = Math.max(r.x, r.z),
		a = o.indexOf(i);
	switch (['x', 'z'][a]) {
		case 'x':
			return n.x ? Direction.East : Direction.West;
		default:
			return n.z ? Direction.South : Direction.North;
	}
};

String.prototype.formal = function () {
	return this[0].toUpperCase() + this.slice(1);
};
