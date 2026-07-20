# Freedom Party

Web app for Freedom Party events: **team 5-stand (dynamic) clay scoring**, legacy sporting clays events, a public **slip & slide speed leaderboard**, and live **watch** views.

Stack: **SvelteKit 2 + Svelte 5**, **Prisma**, **PostgreSQL**, **Tailwind / Skeleton UI**, **PM2** + **`@sveltejs/adapter-node`** in production.

License: [GPL-3.0](./LICENSE).

## Features

| Area | Route(s) | Notes |
|------|----------|--------|
| Dynamic 5-stand cockpit | `/clays` | Create/score team events, stand layouts, live standings. Scoring UI requires sign-in; guests can browse and open the watch board. |
| Create / edit dynamic event | `/shootEvents/new-dynamic` | Auth required (server redirect to login). |
| Watch leaderboard | `/watchEvent/[eventId]` | Public live view for an event. |
| Legacy sporting clays | `/clays` (legacy tab), `/shootEvents/...` | Older event model kept for compatibility. |
| Slip & slide speeds | `/slide` | Public leaderboard; admin radar entry when signed in as admin. |
| Auth | `/login`, `/login/google`, `/admin/login` | Google OAuth + optional local admin. Roles: `ADMIN`, `SCORER`, `SPECTATOR`. |
| Admin | `/admin/dashboard` | User/event admin (admin session required). |

## Requirements

- Node.js 20+ recommended  
- PostgreSQL  
- npm  

## Local development

```bash
git clone <repo-url> freedom-party
cd freedom-party
cp ecosystem.config.cjs.txt ecosystem.config.cjs   # optional; for PM2 shape only
# Create .env (see below) — never commit it
npm install          # postinstall runs prisma generate
npx prisma migrate deploy
npm run dev          # vite --host → http://localhost:5173
```

Useful scripts:

```bash
npm run dev          # dev server
npm run build        # production bundle → ./build
npm run preview      # preview production build
npm run check        # svelte-check
npx prisma studio    # DB UI
```

## Environment variables

Use a root `.env` for local dev. Production typically sets the same keys via PM2 (`ecosystem.config.cjs` — gitignored; start from `ecosystem.config.cjs.txt`).

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | yes | Prisma connection (app). |
| `DIRECT_URL` | yes | Prisma `directUrl` (migrations / direct PG). Often same as `DATABASE_URL` if you are not using a pooler. |
| `ADMIN_PASSWORD` | yes in prod | Local admin password **and** HMAC secret for session cookies. Changing it invalidates all sessions. |
| `ORIGIN` | yes in prod | Public origin, e.g. `https://example.com` (no trailing slash). Needed for SvelteKit form actions behind a proxy. |
| `PORT` | prod | HTTP port for `adapter-node` (default template: `3141`). |
| `PROTOCOL_HEADER` | prod + proxy | e.g. `x-forwarded-proto` |
| `HOST_HEADER` | prod + proxy | e.g. `x-forwarded-host` |
| `PORT_HEADER` | optional | e.g. `x-forwarded-port` |
| `GOOGLE_CLIENT_ID` | for Google login | OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | for Google login | OAuth client secret |
| `GOOGLE_REDIRECT_URI` | recommended | e.g. `https://<host>/login/google/callback` (must match Google Console) |
| `DISABLE_LOCAL_ADMIN` | optional | `true` hides/disables `/admin/login` (Google-only admin path) |
| `NODE_ENV` | prod | `production` |

Example local `.env` shape (placeholders only):

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/freedomparty?schema=public"
DIRECT_URL="postgresql://USER:PASSWORD@localhost:5432/freedomparty?schema=public"
ADMIN_PASSWORD="dev-only-secret"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_REDIRECT_URI="http://localhost:5173/login/google/callback"
```

## Database (Prisma)

- Schema: `prisma/schema.prisma`  
- Migrations: `prisma/migrations/`  
- Client is generated on `npm install` (`postinstall`: `prisma generate`).

### Apply migrations

```bash
# local or prod (uses DATABASE_URL / DIRECT_URL from env)
npx prisma migrate deploy
```

Prefer **`migrate deploy`** in production. Use **`migrate dev`** only on disposable local DBs when authoring new migrations.

### New migration after schema changes

```bash
npx prisma migrate diff \
  --from-migrations prisma/migrations \
  --to-schema-datamodel prisma/schema.prisma \
  --shadow-database-url "$DIRECT_URL" \
  --script > /tmp/migration.sql
# review /tmp/migration.sql, then place under prisma/migrations/<timestamp>_<name>/migration.sql
```

Or interactively (applies to the linked dev database):

```bash
npx prisma migrate dev --name describe_change
```

### Backup (Postgres)

```bash
pg_dump "$DIRECT_URL" -Fc -f "backup-$(date +%Y%m%d-%H%M).dump"
```

Restore example:

```bash
pg_restore -d "$DIRECT_URL" --clean --if-exists backup.dump   # careful on shared DBs
```

Always backup before prod migrations.

## Production deploy

Target: Node server running `./build/index.js` under PM2, Postgres, reverse proxy (TLS + forwarded headers).

1. **Commit and push** the revision you want (including any new `prisma/migrations/*`).  
2. On the server:

```bash
cd /path/to/freedom-party
git pull
npm ci
# ensure prod env is set (PM2 ecosystem or shell)
pg_dump "$DIRECT_URL" -Fc -f "pre-deploy-$(date +%Y%m%d-%H%M).dump"
npx prisma migrate deploy
npm run build
pm2 restart freedom-party --update-env
# first time:
#   cp ecosystem.config.cjs.txt ecosystem.config.cjs  # fill secrets
#   pm2 start ecosystem.config.cjs && pm2 save
```

3. **Proxy** to `PORT` (e.g. 3141); forward `Host`, `X-Forwarded-Proto`, and ideally `X-Forwarded-Port`.  
4. Confirm Google OAuth redirect URI matches prod.  
5. Smoke-test: home, `/clays` signed out (no create/score controls), sign-in, score submit, `/slide`, `/watchEvent/<id>`.

See `ecosystem.config.cjs.txt` for the full env template (`watch: false`, `ORIGIN`, DB, auth, Google).

**Do not** commit `ecosystem.config.cjs` with real secrets (listed in `.gitignore`).

## Auth model (short)

- **Local admin:** `/admin/login` with `ADMIN_PASSWORD` → `admin_session` cookie.  
- **Google:** `/login/google` → callback sets `google_session` (signed with the same secret as `ADMIN_PASSWORD`).  
- Users land in Prisma `User` with a role; `locals.user` / `locals.isAdmin` are set in `src/hooks.server.ts`.  
- Dynamic event **creation and scoring** expect a signed-in user; public pages stay readable.

## Project layout

```
prisma/                 # schema + migrations
src/routes/             # SvelteKit pages & API
  clays/                # dynamic cockpit + legacy tab
  shootEvents/          # event setup / legacy scoring
  watchEvent/           # public live board
  slide/                # slip & slide leaderboard
  admin/                # admin UI
  api/                  # JSON/form backends
src/lib/                # components, server prisma, images
ecosystem.config.cjs.txt  # PM2 production template
static/                 # static assets
```

## Notes

- UI is **Svelte 5** runes (`$state`, `$derived`, `$props`). Prefer that style in new components.  
- `prisma generate` alone does **not** change the database; use **`migrate deploy`**.  
- `db push` is fine for throwaway local experiments; production should stay on migrations.
