// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
	// interface Locals {}
	// interface PageData {}
	// interface Error {}
	// interface Platform {}
	interface ShootEvent {
		eventId: number,
		eventDate: Date,
		eventLeaders: string[],
		eventFormat: EventRound[],
		teamScores: TeamScore[],
	}
	interface EventRound {
		roundId: number,
		roundName: string,
		roundClays: string,
		roundAmmo: string,
	}
	interface TeamScore {
		teamId: number,
		teamName: string,
		shooter1: string,
		shooter2: string,
		roundScores: EventRound[],
	}
}
