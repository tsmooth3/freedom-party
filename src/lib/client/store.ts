import { localStorageStore } from '@skeletonlabs/skeleton';
import type { Writable } from 'svelte/store';

export const ammos: Writable<string> = localStorageStore('ammos','----');
export const clays: Writable<string> = localStorageStore('clays','--');

export function miss() {
    ammos.update((a) => a + 'o');
    clays.update((c) => c + 'o');
}
export function hit() {
    ammos.update((a) => a + 'x');
    clays.update((c) => c + 'x');
}
export function clear() {
    ammos.set('');
    clays.set('');
}