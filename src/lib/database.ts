export class DynamicPropertyDB {
	id: string;
	data: { [key: string]: string } = {};

	constructor(id: string) {
		this.id = id;
		this.init();
	}
	init(): void {}
}
