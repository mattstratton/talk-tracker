# Talk Tracker

A conference talk proposal tracker for DevRel professionals and speakers. Track your speaking engagements, manage reusable talk content, and evaluate which events to submit to using a Six Sigma weighted scoring matrix.

## Features

### Core Functionality
- **Event Management** - Track conferences and events with dates, locations, CFP deadlines, and scoring
- **Talk Library** - Create and maintain reusable talk content (titles, abstracts, descriptions)
- **Proposal Tracking** - Submit proposals linking talks to events, track status through the pipeline
- **Six Sigma Scoring Matrix** - Evaluate events using customizable weighted categories (1-10 scale)
- **Team Collaboration** - Multiple users can manage talks and proposals across your organization

### Six Sigma Scoring
Evaluate which events to submit to using a weighted decision matrix:
- Configure up to 10 custom scoring categories (e.g., Travel Required, Audience Fit, Speaking Fee)
- Assign unique weights (1-10) to each category based on importance
- Score events on a 9/3/1/0 scale with custom descriptions for each level
- Set a global threshold to identify "Recommended" events worth submitting to
- View scores and recommendations on the dashboard and events pages

### Analytics & Planning
- **Dashboard** - View upcoming CFP deadlines, recent proposals, and acceptance rates
- **Calendar View** - Timeline of events sorted by date
- **Analytics** - Track acceptance rates per talk and submission statistics
- **Status Tracking** - Draft, Submitted, Accepted, Rejected, Confirmed

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org) with App Router
- **API Layer:** [tRPC](https://trpc.io) for type-safe APIs
- **Database:** PostgreSQL on [Timescale Cloud](https://www.timescale.com/)
- **ORM:** [Drizzle](https://orm.drizzle.team)
- **Authentication:** [Better Auth](https://www.better-auth.com/) with Google OAuth
- **UI:** [shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com)
- **Type Safety:** TypeScript throughout

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database (Timescale Cloud recommended)
- Google OAuth credentials

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/mattstratton/talk-tracker.git
   cd talk-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Set up Google OAuth in [Google Cloud Console](https://console.cloud.google.com/)
   - Add `BETTER_AUTH_GOOGLE_CLIENT_ID` and `BETTER_AUTH_GOOGLE_CLIENT_SECRET`
   - Configure database credentials (see Database Setup below)

4. Push database schema:
   ```bash
   npm run db:push
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

### Database Setup

This app uses PostgreSQL with schema isolation. You'll need:
- A PostgreSQL database (Timescale Cloud provides free tier)
- Schema name: `talk_tracker` (configurable via `DATABASE_SCHEMA` env var)
- User with appropriate permissions

See `CLAUDE.md` for detailed database configuration instructions.

## Usage

### First Time Setup

1. **Sign in** with Google OAuth
2. **Configure Scoring Categories** (Settings page):
   - Create up to 10 categories for evaluating events
   - Assign unique weights (1-10) to each category
   - Write descriptions for each score level (9, 3, 1, 0)
   - Set your threshold score (e.g., 70) for recommendations

3. **Add Events** - Navigate to Events and add conferences you're considering

4. **Create Talks** - Build your library of reusable talk content

5. **Score Events** - Use the scoring matrix to evaluate which events align with your goals

6. **Submit Proposals** - Link talks to events and track submission status

### Workflow

```
1. Add Event → 2. Score Event → 3. If Recommended → 4. Create Proposal → 5. Track Status
```

### Scoring Categories Example

| Category | Weight | Score 9 | Score 3 | Score 1 | Score 0 |
|----------|--------|---------|---------|---------|---------|
| Travel Required | 8 | Local/No travel | Domestic | International | Not feasible |
| Audience Size | 7 | 1000+ attendees | 500-1000 | 100-500 | <100 |
| Speaking Fee | 6 | $5000+ | $1000-5000 | Expenses only | No compensation |

**Total Score = Σ(score × weight)** - Events meeting your threshold are marked "Recommended"

## Development

### Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

npm run db:push      # Push schema changes to database
npm run db:studio    # Open Drizzle Studio

npm test             # Run integration tests
npm run test:watch   # Run tests in watch mode

npm run check        # Run linting and formatting checks
npm run check:write  # Auto-fix linting and formatting
```

### Before Committing

Always run tests and checks:
```bash
npm test && npm run check
```

### Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # React components (UI + features)
├── server/
│   ├── api/         # tRPC routers
│   ├── db/          # Drizzle schema and client
│   └── better-auth/ # Authentication config
└── trpc/            # tRPC client setup
```

## Testing

Uses Vitest for backend integration testing with isolated test database schema:
- Tests run against a separate PostgreSQL schema
- Automatically pushed before tests via global setup
- See `CLAUDE.md` for detailed testing documentation

## Deployment

Deployed on [Vercel](https://vercel.com) with automatic deployments from `main` branch.

### Manual Deployment

```bash
npx vercel --prod
```

Environment variables must be configured in Vercel dashboard or via `.env` file.

## Contributing

This is a personal project but suggestions and bug reports are welcome via GitHub issues.

## License

MIT

---

Built with [T3 Stack](https://create.t3.gg/) and powered by [Timescale Cloud](https://www.timescale.com/)
