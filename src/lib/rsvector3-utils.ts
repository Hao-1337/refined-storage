import { Block } from '@minecraft/server';
import { RSVector3 } from '../refined-storage/blocks/controller';

export class RSVector3Untils {
	static has(target: RSVector3, array: RSVector3[]): boolean {
		return array.findIndex(({ x, y, z, dimensionId, id }) => x === target.x && y === target.y && z === target.z && id === target.id && dimensionId === target.dimensionId) !== -1;
	}
	static hasBlock(target: Block, array: RSVector3[]): boolean {
		return array.findIndex(({ x, y, z, dimensionId, id }) => x === target.x && y === target.y && z === target.z && id === target.typeId && dimensionId === target.dimension.id) !== -1;
	}
	static hasBlock1(target: Block, array: Block[]): boolean {
		return array.findIndex(({ x, y, z, dimension, typeId }) => x === target.x && y === target.y && z === target.z && typeId === target.typeId && dimension.id === target.dimension.id) !== -1;
	}
}
