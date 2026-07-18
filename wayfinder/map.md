# Wayfinder Map: Freedom Party Replatforming

## Destination

A complete architecture blueprint and database schema design for replatforming the shoot-events system to a highly-maintainable SvelteKit configuration, with flexible event workflows, an updated UI framework (moving away from skeleton.dev), Google/local authentication, and an admin role, whilst preserving backwards compatibility for displaying old events.

## Notes

- **Domain**: Sport shooting event scoring and live presentation.
- **Framework**: SvelteKit with Svelte 5.
- **Database**: PostgreSQL (Prisma ORM).
- **Primary Skills**: `wayfinder`, `domain-modeling`, `grilling`.

## Decisions so far

- **Admin Portal & Secure Cascade Deletion** — Implemented signed cookie-based admin session authentication, administrative routes (`/admin/login` and `/admin/dashboard`), and a database-level transaction API (`/api/admin/shootEvents/[eventId]`) to safely cascade delete entire shooting events (along with their teams, rounds, station layouts, and scores).

## Open Tickets (Frontier)

- [Database Schema Redesign & Flexible Event Workflows](./ticket-1-schema-design.md) (HITL) — Designing the PostgreSQL/Prisma schema to support multiple sport shooting styles with dynamic rounds/stations while maintaining backwards compatibility.
- [UI Framework Pivot](./ticket-2-ui-pivot.md) (HITL) — Selecting a Svelte 5-native and maintainable alternative to replace Skeleton.dev.
- [Authentication Strategy](./ticket-3-auth-strategy.md) (HITL) — Designing dual support for Google OAuth and local passphrase/credentials authentication.

## Not yet specified

<!-- Fog of war: in-scope items that are still too blurry to ticket -->

- **Deployment & Hosting Migration**: Updating the PM2/Node deployment configurations or considering containerization/serverless once the platform decisions are locked.
- **Sound Effects & Live SSE Broadcasting**: Ensuring the existing sound effects (LockChime.wav) and SSE-based live-view updates are integrated seamlessly into the new structure.

## Out of scope

- Creating custom administrative tooling outside the core event/user management boundaries.
- Re-architecting the slide presenter (`/slide` routes) unless it directly breaks under the new schema.
