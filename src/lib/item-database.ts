import { world, system, ItemStack, Dimension, EntityInventoryComponent, Vector3, StructureManager, StructureSaveMode } from '@minecraft/server';

/**
 * Translate to typescript by Hao1337
 *
 * @Class Quick Item Database V3.5.1 by Carchi77
 * @Contributors Drag0nD - Coptaine
 * @ Made to fix script api's missing method to save items as object.
 * @ Optimized for low end devices while keeping fast loading times.
 * @ Does NOT impact ingame performance.
 * @ Uses entities inventory and structures.
 * @ Zero data loss: items are saved as a perfect clone.
 * @Example How to setup a database:
 * ```
 * // Initializing a database with a namespace and logs active
 * const itemDatabase = new ItemDatabase("namespace", 1, 100, true);
 *
 *
 * ```
 **/
export class ItemDatabase {
	public static ENTITY_ID: string = 'hao1337:item_database';

	private saveRate: number;
	private validNamespace: boolean;
	private queuedKeys: string[] = [];
	private queuedValues: (ItemStack[] | ItemStack | undefined)[] = [];
	private settings: { namespace: string; logs: boolean };
	private structure: StructureManager;
	private quickAccess: Map<string, ItemStack[] | ItemStack> = new Map();
	private dimension: Dimension;
	private sL: Vector3;

	constructor(namespace = '', saveRate = 2, QAMsize = 100, logs = false) {
		this.saveRate = saveRate;
		this.settings = {
			logs: logs || false,
			namespace: namespace,
		};
		this.validNamespace = /^[a-z0-9_]*$/.test(namespace);
		this.structure = world.structureManager;
		this.dimension = world.getDimension('overworld');
		this.sL = world.getDynamicProperty('storagelocation') as Vector3;

		world.afterEvents.playerSpawn.subscribe((e) => {
			if (!this.validNamespace) {
				throw new Error(`§c[Item Database] ${namespace} isn't a valid namespace. Accepted chars: a-z, 0-9, _`);
			} else if (!world.getDynamicProperty('init')) {
				const { player } = e;
				const plc = player.location;
				if (!this.sL) {
					this.sL = { x: plc.x, y: 318, z: plc.z };
					world.setDynamicProperty('storagelocation', this.sL);
					this.dimension.runCommand(`/tickingarea add ${this.sL.x} 319 ${this.sL.z} ${this.sL.x} 318 ${this.sL.z} storagearea`);
				}
				this.sL = world.getDynamicProperty('storagelocation') as Vector3;
				world.setDynamicProperty('init', true);
				console.log(`§q[Item Database] initialized successfully. Namespace: ${this.settings.namespace}`);
			}
		});

		system.runInterval(() => {
			const diff = this.quickAccess.size - QAMsize;
			if (diff > 0) {
				for (let i = 0; i < diff; i++) {
					this.quickAccess.delete(this.quickAccess.keys().next().value as string);
				}
			}

			if (this.queuedKeys.length) {
				const start = Date.now();
				const k = Math.min(this.saveRate, this.queuedKeys.length);

				for (let i = 0; i < k; i++) {
					this.romSave(this.queuedKeys[0], this.queuedValues[0]);
					if (logs) this.timeWarn(start, this.queuedKeys[0], 'saved');
					this.queuedKeys.shift();
					this.queuedValues.shift();
				}
			}
		});
	}

	QAMusage(): number {
		return this.quickAccess.size;
	}

	private load(key: string): { canStr: boolean; inv: any } {
		if (key.length > 30) throw new Error(`§c[Item Database] Out of range: <${key}> has more than 30 characters`);

		let canStr = false;
		try {
			this.structure.place(key, this.dimension, this.sL, { includeEntities: true });
			canStr = true;
		} catch {
			this.dimension.spawnEntity(ItemDatabase.ENTITY_ID, this.sL);
		}

		const entities = this.dimension.getEntities({ location: this.sL, type: ItemDatabase.ENTITY_ID });
		if (entities.length > 1) entities.forEach((e, index) => entities[index + 1]?.remove());

		const entity = entities[0];
		const inv = (entity.getComponent('inventory') as EntityInventoryComponent).container;
		return { canStr, inv };
	}

	private async save(key: string, canStr: boolean): Promise<void> {
		if (canStr) this.structure.delete(key);
		this.structure.createFromWorld(key, this.dimension, this.sL, this.sL, { saveMode: StructureSaveMode.World, includeEntities: true });

		const entities = this.dimension.getEntities({ location: this.sL, type: ItemDatabase.ENTITY_ID });
		entities.forEach((e) => e.remove());
	}

	private timeWarn(time: number, key: string, action: string): void {
		console.warn(`[Item Database] ${Date.now() - time}ms => ${action} ${key}`);
	}

	private async queueSaving(key: string, value: ItemStack[] | ItemStack | undefined): Promise<void> {
		this.queuedKeys.push(key);
		this.queuedValues.push(value);
	}

	private async romSave(key: string, value: ItemStack[] | ItemStack | undefined): Promise<void> {
		const { canStr, inv } = this.load(key);
		if (!value) {
			for (let i = 0; i < 256; i++) inv.setItem(i, undefined);
			world.setDynamicProperty(key, void 0);
		}

		if (Array.isArray(value)) {
			try {
				for (let i = 0; i < 256; i++) inv.setItem(i, value[i] || undefined);
			} catch {
				throw new Error(`§c[Item Database] Invalid value type. Supported: ItemStack | ItemStack[] | undefined`);
			}
			world.setDynamicProperty(key, true);
		} else {
			try {
				inv.setItem(0, value);
				world.setDynamicProperty(key, false);
			} catch {
				throw new Error(`§c[Item Database] Invalid value type. Supported: ItemStack | ItemStack[] | undefined`);
			}
		}
		this.save(key, canStr);
	}

	set(key: string, value: ItemStack[] | ItemStack): void {
		if (!this.validNamespace) throw new Error(`§c[Item Database] Invalid namespace: <${this.settings.namespace}>. Accepted chars: a-z, 0-9, _`);
		if (!/^[a-z0-9_]*$/.test(key)) throw new Error(`§c[Item Database] Invalid key: <${key}>. Accepted chars: a-z, 0-9, _`);

		const time = Date.now();
		key = `${this.settings.namespace}:${key}`;

		if (Array.isArray(value)) {
			if (value.length > 255) throw new Error(`§c[Item Database] Out of range: <${key}> has more than 255 ItemStacks`);
			world.setDynamicProperty(key, true);
		} else {
			world.setDynamicProperty(key, false);
		}

		this.quickAccess.set(key, value);

		if (this.queuedKeys.includes(key)) {
			const i = this.queuedKeys.indexOf(key);
			this.queuedValues.splice(i, 1);
			this.queuedKeys.splice(i, 1);
		}

		this.queueSaving(key, value);
		if (this.settings.logs) this.timeWarn(time, key, 'set');
	}

	get(key: string): ItemStack | ItemStack[] {
		if (!this.validNamespace) throw new Error(`§c[Item Database] Invalid namespace: <${this.settings.namespace}>. Accepted chars: a-z, 0-9, _`);
		if (!/^[a-z0-9_]*$/.test(key)) throw new Error(`§c[Item Database] Invalid key: <${key}>. Accepted chars: a-z, 0-9, _`);

		const time = Date.now();
		key = `${this.settings.namespace}:${key}`;

		if (this.quickAccess.has(key)) {
			if (this.settings.logs) this.timeWarn(time, key, 'got');
			return this.quickAccess.get(key)!;
		}
		if (!this.structure.get(key)) throw new Error(`§c[Item Database] No data found for key: <${key}>`);

		const { inv } = this.load(key);
		const isArray = world.getDynamicProperty(key) === true;

		const result = isArray ? Array.from({ length: 256 }, (_, i) => inv.getItem(i)).filter((item) => item) : inv.getItem(0);

		this.quickAccess.set(key, result as ItemStack | ItemStack[]);

		if (this.settings.logs) this.timeWarn(time, key, 'got');
		return result as ItemStack | ItemStack[];
	}

	delete(key: string): void {
		if (!this.validNamespace) throw new Error(`§c[Item Database] Invalid namespace: <${this.settings.namespace}>. Accepted chars: a-z, 0-9, _`);
		if (!/^[a-z0-9_]*$/.test(key)) throw new Error(`§c[Item Database] Invalid key: <${key}>. Accepted chars: a-z, 0-9, _`);

		const time = Date.now();
		key = `${this.settings.namespace}:${key}`;

		this.quickAccess.delete(key);

		if (this.queuedKeys.includes(key)) {
			const i = this.queuedKeys.indexOf(key);
			this.queuedValues.splice(i, 1);
			this.queuedKeys.splice(i, 1);
		}

		this.queueSaving(key, undefined);
		if (this.settings.logs) this.timeWarn(time, key, 'deleted');
	}

	has(key: string): boolean {
		if (!this.validNamespace) throw new Error(`§c[Item Database] Invalid namespace: <${this.settings.namespace}>. Accepted chars: a-z, 0-9, _`);
		if (!/^[a-z0-9_]*$/.test(key)) throw new Error(`§c[Item Database] Invalid key: <${key}>. Accepted chars: a-z, 0-9, _`);

		key = `${this.settings.namespace}:${key}`;
		return this.quickAccess.has(key) || this.structure.get(key) !== undefined;
	}
}
