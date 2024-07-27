import { world } from '@minecraft/server';

export class DynamicPropertyDB {
	static chunkLength = 1024 ** 2 * 8;
	id: string;
	data: { [key: string]: string } = {};

	constructor(id: string) {
		this.id = id;
		this.init();
	}
	private split(string: string): string[] {
		if (string.length < DynamicPropertyDB.chunkLength) return [string];

		let i: number = 0;
		let out: string[] = [];

		while (i <= string.length) out.push(string.slice(i, (i += DynamicPropertyDB.chunkLength)));

		return out;
	}
	init(): void {
		let ids = world.getDynamicPropertyIds().filter((id) => id.startsWith(this.id));
	}
}
