import { localStorageStore } from '@skeletonlabs/skeleton';
import type { Writable } from 'svelte/store';
import type { ShootEvent, TeamScore } from "$lib/shared/utils"

export let localShootEvents: ShootEvent[] = []
let uid = Date.now();
export let localShootEvent: ShootEvent = {
    eventId: uid,
    eventDate: new Date(),
    eventName: "Freedom_Clays_" + uid,
    eventState: "NEW",
    eventFormat: [],
    eventTeamScores: []
}

export const localEvents: Writable<ShootEvent[]> = localStorageStore('localEvents', localShootEvents);
export const thisEvent: Writable<ShootEvent> = localStorageStore('thisEvent', localShootEvent);

export function local_addShootEvent(se: ShootEvent) {
    let success: boolean = false;
    if (!localShootEvents.find((e) => e.eventId === se.eventId)) {
        localShootEvents.push(se);
        localEvents.set(localShootEvents);
        success = true;
    }
    return success
}

export function resetShootEvent() {
    let uid = Date.now();
    let newShootEvent: ShootEvent = {
        eventId: uid,
        eventDate: new Date(),
        eventName: "Freedom_Clays_" + uid,
        eventState: "NEW",
        eventFormat: [],
        eventTeamScores: []
    }
    thisEvent.set(newShootEvent)
}

export function local_addTeamToEvent(id: number, t: TeamScore) {
    let se = localShootEvents.find((e) => e.eventId === id)
    if (se) {
        se.eventFormat.forEach(round => {
            t.teamScores.push(round)
        });
        se.eventTeamScores.push(t)
    }
}

export function local_clearEventRounds(id: number) {
    let se = localShootEvents.find((e) => e.eventId === id)
    if (se) se.eventFormat = []
    se?.eventTeamScores.forEach(team => {
        team.teamScores = []
    });
}

export function local_clearEventTeams(id: number) {
    let se = localShootEvents.find((e) => e.eventId === id)
    if (se) se.eventTeamScores = []
}

export function local_removeShootEvent(id: number) {
    localShootEvents = localShootEvents.filter((shootEvent) => shootEvent.eventId != id);
}

export function local_clearShootEvents() {
    localShootEvents = [];
}

export function local_getShootEvents() {
    return localShootEvents;
}
export function local_getShootEventById(id: number): ShootEvent | undefined {
    return localShootEvents.find((e) => e.eventId === id);
}