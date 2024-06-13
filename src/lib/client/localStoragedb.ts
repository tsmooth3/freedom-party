import { localStorageStore } from '@skeletonlabs/skeleton';
import type { Writable } from 'svelte/store';
import type { ShootEvent } from "$lib/shared/utils"

let uid = Math.floor(Math.random()*90000) + 10000;
export let localShootEvent: ShootEvent = {
    eventId: uid,
    eventDate: new Date(),
    eventName: "Freedom_Clays_" + uid,
    eventState: "NEW",
    eventTeams: [],
    eventRounds: [],
    eventStations: []
}

export const thisEvent: Writable<ShootEvent> = localStorageStore('thisEvent', localShootEvent);
export const myAmmo: Writable<String> = localStorageStore('myAmmo', '');
export const myClays: Writable<String> = localStorageStore('myClays', '');
export const myTeamShotsFired: Writable<number> = localStorageStore('myTeamShotsFired', 0);
export const myTeamTotal: Writable<number> = localStorageStore('myTeamTotal', 0);


export function resetShootEvent() {
    let uid = Math.floor(Math.random()*90000) + 10000;
    let newShootEvent: ShootEvent = {
        eventId: uid,
        eventDate: new Date(),
        eventName: "Freedom_Clays_" + uid,
        eventState: "NEW",
        eventTeams: [],
        eventRounds: [],
        eventStations: []
    }
    thisEvent.set(newShootEvent)
}