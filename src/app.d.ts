// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type { PrismaClient } from "@prisma/client"

// and what to do when importing types
declare global {
	namespace App {
		interface Locals {
			isAdmin: boolean;
			user: {
				id?: number;
				email?: string;
				name: string;
				role: 'ADMIN' | 'SCORER' | 'SPECTATOR';
				authType: 'LOCAL' | 'GOOGLE';
			} | null;
		}
		// interface PageData {}
		// interface Error {}
		// interface Platform {}
	}
	var prisma: PrismaClient
}

export { }
