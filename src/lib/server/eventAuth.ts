import prisma from '$lib/server/prisma';

export type AppUser = {
	id?: number;
	role: 'ADMIN' | 'SCORER' | 'SPECTATOR' | string;
	authType?: 'LOCAL' | 'GOOGLE';
} | null | undefined;

export type EventAuthFields = {
	creatorId: number | null;
	scorers?: { userId: number }[];
};

/** True when the user may record/edit scores for this dynamic event. */
export function canScoreDynamicEvent(user: AppUser, event: EventAuthFields): boolean {
	if (!user) return false;
	if (user.role === 'ADMIN') return true;
	if (user.id == null || !Number.isFinite(user.id)) return false;
	if (event.creatorId !== null && event.creatorId === user.id) return true;
	if (event.scorers?.some((s) => s.userId === user.id)) return true;
	return false;
}

/** Creator (Google user id match) or ADMIN may manage the scorer grant list. */
export function canManageEventScorers(user: AppUser, event: { creatorId: number | null }): boolean {
	if (!user) return false;
	if (user.role === 'ADMIN') return true;
	if (user.id == null || !Number.isFinite(user.id)) return false;
	return event.creatorId !== null && event.creatorId === user.id;
}

export async function loadEventAuth(eventId: number) {
	return prisma.dynamicEvent.findUnique({
		where: { id: eventId },
		select: {
			id: true,
			creatorId: true,
			eventState: true,
			scorers: { select: { userId: true } }
		}
	});
}

export function publicUserLabel(u: { name: string | null; email: string } | null | undefined): string {
	if (!u) return 'Unknown';
	return (u.name && u.name.trim()) || u.email;
}
