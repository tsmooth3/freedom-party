## Question

How should the database schema and SvelteKit route flows be restructured to support flexible sport shooting event types (e.g. standard, 5-stand, trap, skeet) with dynamic round, team, and station setups, while preserving complete backwards compatibility with older/legacy shoot events?

---

## Resolution (Closed)

We have decided on a highly cohesive, modern, and 100% backward-compatible database schema and SvelteKit routing design for Team 5-Stand and dynamic shooting events.

### 1. Database Schema Additions (Prisma)
To preserve legacy events completely, we will leave existing tables untouched and introduce a new set of dynamic tables:
- `DynamicEvent`: Holds dynamic shoot events (e.g. Team 5-Stand).
- `DynamicTeam`: Configures teams of exactly 2 shooters (`shooter1` and `shooter2`) shooting simultaneously as a team.
- `DynamicRound`: Represents a competition round of an event.
- `StationLayout`: Configures the shooting sequence/menu for each station (1 to 6) in a round, specifying `launchType` ("REPORT_TRIPLE", "TRIPLE_1_PLUS_2", "TRIPLE_2_PLUS_1", "QUAD_2_PLUS_2"), `sequence` (e.g. "1 -> 3 -> 2"), and `totalClays` (3 or 4).
- `TeamStationScore`: Records the number of hits (0 to 4) out of the total clays for a team at that station.

### 2. SvelteKit Routing & Scope
Only the following routes and their supporting `/api` endpoints are in-scope for this refactor:
- `/shootEvents`: Page to create/configure dynamic events, teams, and round menus (overlaying target configurations on `blank_menu.png`).
- `/clays`: Scoring cockpit to dynamically load active team station menus and record 0-4 team scores with automatic station transitions.
- `/watchEvent`: Interactive live score presenter for spectator viewing.
- **Out of Scope**: The `/slide` route is completely excluded from this refactor.
