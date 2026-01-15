# Prowl

Prowl the conference circuit with your DevRel team. Prowl helps you manage your entire conference presence - from speaking engagements and sponsorships to budget tracking and event prioritization.

## Product

**Features:**
- Google OAuth login for team members
- Create and manage events/conferences (name, date, location)
- Create and manage reusable talks (title, abstract, description)
- Submit proposals linking a talk to an event
- Track proposal status (Draft, Submitted, Accepted, Rejected, Confirmed)
- Track talk type (Keynote, Regular session, Lightning talk, Workshop)
- Track company participation (Speaking, Sponsoring, Attending, Exhibiting, Volunteering)
- Budget tracking per event participation
- Event scoring and prioritization matrix
- View all proposals across the team
- View individual team member's proposals

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **API:** tRPC for type-safe APIs
- **Database:** PostgreSQL on Timescale Cloud
  - Schema: `prowl`
  - User: `prowl`
- **ORM:** Drizzle
- **Auth:** Better Auth with Google OAuth
- **UI:** shadcn/ui + Tailwind CSS
- **Type Safety:** TypeScript

## Database Schema

**Tables:**
- `events` - Conference/event information (name, date, location, CFP deadline)
- `talks` - Reusable talk content library (title, abstract, description)
- `proposals` - Submission records linking talks to events with status tracking
- `user`, `session`, `account`, `verification` - Better Auth tables

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Set up Google OAuth credentials in Google Cloud Console
   - Add `BETTER_AUTH_GOOGLE_CLIENT_ID` and `BETTER_AUTH_GOOGLE_CLIENT_SECRET`
   - Database credentials should already be configured

3. Push database schema:
   ```bash
   npm run db:push
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

## Testing

This app uses Vitest for backend integration testing with an isolated test database schema.

**Test infrastructure:**
- Tests run against a separate PostgreSQL schema (see `DATABASE_SCHEMA` in `.env.test.local`)
- A dedicated test user has permissions only on the test schema
- Schema is automatically pushed before tests via global setup
- Tests use `.env.test.local` for database configuration (gitignored)

**Writing tests:**
```typescript
import { describe, it, expect } from "vitest";
import { appRouter } from "~/server/api/root";
import { createCallerFactory } from "~/server/api/trpc";
import { db } from "~/server/db";

const createCaller = createCallerFactory(appRouter);
const caller = createCaller({ session: null, db, headers: new Headers() });

describe("myRouter", () => {
  it("returns data", async () => {
    const result = await caller.my.getData();
    expect(result).toBeDefined();
  });
});
```

## Commands

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server

### Database
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio

### Testing & Quality
- `npm test` - Run integration tests
- `npm run test:watch` - Run tests in watch mode
- `npm run check` - Run linting and formatting checks
- `npm run check:write` - Auto-fix linting and formatting issues
- `npm run typecheck` - Run TypeScript type checking

### Before Committing
Always run tests and checks before committing:
```bash
npm test && npm run check
```

This runs:
- Integration tests against isolated test database
- Biome linting and formatting
- TypeScript type checking with strict settings

## Adding New Features

### New tRPC Router
1. Create router file in `src/server/api/routers/`
2. Register in `src/server/api/root.ts`
3. Add tests in `src/test/routers/`

### New Page
1. Create page in `src/app/`
2. Use shadcn components from `src/components/ui/`
3. Connect to backend using tRPC hooks

## Architecture Notes

- All API routes are protected and require authentication
- Database operations use Drizzle ORM with type-safe queries
- Frontend uses React Server Components for initial data loading
- Client components handle interactive features with tRPC mutations
- Isolated test database schema prevents test data from affecting production
