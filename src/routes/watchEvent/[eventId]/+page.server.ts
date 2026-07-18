import type { PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.eventId);
	let isDynamic = false;

	if (!isNaN(id)) {
		const dynamicEvent = await prisma.dynamicEvent.findUnique({
			where: { id }
		});
		if (dynamicEvent) {
			isDynamic = true;
		}
	}

	return {
		id: params.eventId,
		isDynamic
	};
};
