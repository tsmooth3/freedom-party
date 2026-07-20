## Question

What is the optimal session management and authentication strategy to seamlessly support both local credentials (passwords/passphrases for admins/scorers) and Google OAuth integration, ensuring robust server-side security checks across all SvelteKit API endpoints?

---

## Resolution (Closed)

We have decided on a unified SvelteKit authentication design utilizing secure native OAuth endpoints, a standard local HMAC-signed session cookie, and a fine-grained ownership check for dynamic events.

### 1. Unified SvelteKit `event.locals.user`
Every request is parsed in `src/hooks.server.ts` to populate a unified `locals.user` object:
- `user.id`: User ID (only for Google authenticated users).
- `user.name`: Display name.
- `user.email`: Email address.
- `user.role`: System-wide role (`"ADMIN"`, `"SCORER"`, `"SPECTATOR"`). Default role for Google users is `"SPECTATOR"`.
- `user.authType`: `"LOCAL"` (HMAC session based on `ADMIN_PASSWORD`) or `"GOOGLE"` (OAuth session).

### 2. Event-Level Authorization (Creator Privileges)
To grant creators access to score their own events:
- **Event Ownership**: We add an optional `creatorId` (linking to a `User` table) on `DynamicEvent`.
- **Dynamic Scorer Privilege**: Any Google-authenticated user who creates an event is automatically authorized with `"SCORER"` privilege for that specific event. 
- **System Admins & Local Admins**: Retain global permissions to score and manage all events.

### 3. Database Schema Changes (Prisma)
We introduce the `User` table and update the `DynamicEvent` table:

```prisma
model User {
  id            Int            @id @default(autoincrement())
  email         String         @unique
  name          String?
  role          String         @default("SPECTATOR") // Default system role
  createdAt     DateTime       @default(now())
  
  createdEvents DynamicEvent[] @relation("EventCreator")
}

model DynamicEvent {
  id              Int               @id @default(autoincrement())
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  eventName       String
  eventState      String            // "SETUP", "ACTIVE", "COMPLETE"
  
  // Ownership
  creatorId       Int?
  creator         User?             @relation("EventCreator", fields: [creatorId], references: [id])

  teams           DynamicTeam[]
  rounds          DynamicRound[]
}
```

### 4. Native Authentication Implementation
- **Google OAuth**: Built natively via simple SvelteKit server routes (`/login/google` and `/login/google/callback`), exchanging the Google Auth Code for the user's details without heavy third-party libraries (like Auth.js).
- **Local Passphrase**: Maintains the 1-hour session lifetime with HMAC-signed verification.
