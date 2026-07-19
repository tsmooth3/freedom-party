import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';

export const load: PageServerLoad = async ({ locals, url }) => {
	// Require authentication to create an event
	if (!locals.user) {
		throw redirect(303, '/admin/login?redirect=/shootEvents/new-dynamic');
	}

	const editId = url.searchParams.get('edit');
	let editEvent = null;

	if (editId) {
		const idNum = Number(editId);
		if (!isNaN(idNum)) {
			const event = await prisma.dynamicEvent.findUnique({
				where: { id: idNum },
				include: {
					teams: true,
					rounds: {
						include: {
							stations: true
						}
					}
				}
			});

			if (event) {
				editEvent = {
					id: event.id,
					eventName: event.eventName,
					eventState: event.eventState,
					teams: event.teams.map(t => ({
						teamName: t.teamName,
						shooter1: t.shooter1,
						shooter2: t.shooter2
					})),
					stations: event.rounds[0]?.stations.map(st => ({
						stationIndex: st.stationIndex,
						launchType: st.launchType,
						sequence: st.sequence
					})) || []
				};
			}
		}
	}

	return {
		user: locals.user,
		editEvent
	};
};
