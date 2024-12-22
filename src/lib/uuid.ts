import { v4 } from 'uuid';

function fallbackRNG(): Uint8Array {
	const array = new Uint8Array(16);
	for (let i = 0; i < array.length; i++) {
		array[i] = Math.floor(Math.random() * 256);
	}
	return array;
}

export function v4UUID(): string {
	return v4({ random: fallbackRNG() });
}
