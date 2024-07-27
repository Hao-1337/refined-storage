import { Vector3, world } from '@minecraft/server';

export class DynamicPropertyDB {
	static chunkLength: number = 1024 ** 2 * 8;

	id: string;
	data: { [key: string]: any } = {};
	keys: { [key: string]: number[] } = {};

	constructor(id: string) {
		this.id = id;
		this.init();
	}

	init(): void {
		let ids: string[][] = world
			.getDynamicPropertyIds()
			.filter((id) => id.startsWith(this.id))
			.map((key) => key.split('~'));

		while (ids.length) {
			let id = ids.pop() as string[];

			if (!(id[0] in this.data)) {
				this.keys[id[0]] = [+id[1]];
				continue;
			}

			this.keys[id[0]].push(+id[1]);
		}

		for (let key in this.keys) this.keys[key] = this.keys[key].sort((a, b) => a - b);

		this.parse();
	}

	set(key: string, data: any): boolean {
		if (key in this.data) return false;
		this.data[key] = data;
		return true;
	}

	get(key: string): any | undefined {
		return this.data[key];
	}

	update(key: string, data: any): boolean {
		if (!(key in this.data)) return false;
		this.data[key] = data;
		return true;
	}

	clear(key: string): boolean {
		if (!(key in this.data)) return false;
		delete this.data[key];

		this.push();

		return true;
	}

	has(key: string): boolean {
		return key in this.data;
	}

	[Symbol.iterator](): [string, any][] {
		return Object.entries(this.data);
	}

	moveTo(key: string, other: DynamicPropertyDB): boolean {
		if (!(key in this.data) || key in other.data) return false;

		other.set(key, this.data[key]);
		delete this.data[key];

		this.push();
		other.push();

		return true;
	}

	push(): void {
		for (let key in this.data) {
			let strings: string[] = this.split(JSON.stringify(this.data[key]));

			for (let index in strings) {
				world.setDynamicProperty(`${key}~${index}`, strings[index]);
			}
		}
	}

	private split(string: string): string[] {
		if (string.length <= DynamicPropertyDB.chunkLength) return [string];

		let i: number = 0;
		let out: string[] = [];

		while (i <= string.length) out.push(string.slice(i, (i += DynamicPropertyDB.chunkLength)));

		return out;
	}

	private parse(): void {
		for (let key in this.keys) {
			try {
				var data = JSON.parse((this.keys[key].map((index) => world.getDynamicProperty(`${key}~${index}`)) as string[]).join(''));
			} catch (e) {
				console.error(e, (e as Error).stack);
			}
			if (data) this.data[key] = data;
		}
	}
}
