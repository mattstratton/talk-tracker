# Prowl Rename Checklist

All local code changes have been completed. Follow these steps to complete the rename:

## ✅ Completed (Local Code)
- [x] Directory renamed from `talk-tracker` to `prowl`
- [x] package.json updated
- [x] CLAUDE.md updated with new name and description
- [x] README.md updated with new name and description
- [x] .env files updated with new schema names
- [x] UI text updated (app header, sign-in form, metadata)
- [x] Calendar export filename updated

## Database Setup

### 1. Drop Old Database Schema and User
Connect to your Tiger Cloud database and run:

```sql
-- Drop old schema and user
DROP SCHEMA IF EXISTS talk_tracker CASCADE;
DROP SCHEMA IF EXISTS test_talk_tracker CASCADE;
DROP USER IF EXISTS talk_tracker;
DROP USER IF EXISTS test_talk_tracker;
```

### 2. Create New Schema and User

```sql
-- Create new production schema
CREATE SCHEMA prowl;

-- Create new production user
CREATE USER prowl WITH PASSWORD 'your-secure-password-here';

-- Grant permissions to production user
GRANT USAGE ON SCHEMA prowl TO prowl;
GRANT CREATE ON SCHEMA prowl TO prowl;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA prowl TO prowl;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA prowl TO prowl;
ALTER DEFAULT PRIVILEGES IN SCHEMA prowl GRANT ALL ON TABLES TO prowl;
ALTER DEFAULT PRIVILEGES IN SCHEMA prowl GRANT ALL ON SEQUENCES TO prowl;

-- Create test schema
CREATE SCHEMA test_prowl;

-- Create test user
CREATE USER test_prowl WITH PASSWORD 'your-test-password-here';

-- Grant permissions to test user
GRANT USAGE ON SCHEMA test_prowl TO test_prowl;
GRANT CREATE ON SCHEMA test_prowl TO test_prowl;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA test_prowl TO test_prowl;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA test_prowl TO test_prowl;
ALTER DEFAULT PRIVILEGES IN SCHEMA test_prowl GRANT ALL ON TABLES TO test_prowl;
ALTER DEFAULT PRIVILEGES IN SCHEMA test_prowl GRANT ALL ON SEQUENCES TO test_prowl;
```

### 3. Update Local .env Connection String
Update your `.env` file with the new user credentials:

```
DATABASE_URL="postgresql://prowl:your-password@your-host:port/tsdb?sslmode=require"
DATABASE_SCHEMA="prowl"
```

### 4. Push Schema to Database

```bash
cd prowl
npm run db:push
```

## GitHub Repository Rename

### Option 1: Rename Existing Repository (Recommended)
1. Go to your GitHub repository: https://github.com/mattstratton/talk-tracker
2. Click **Settings**
3. Scroll to **Repository name** section
4. Change name from `talk-tracker` to `prowl`
5. Click **Rename**

**Note:** GitHub automatically redirects old URLs, so existing clones will continue to work.

### Option 2: Create New Repository
If you prefer a fresh start:
1. Create new repo at https://github.com/new
2. Name it `prowl`
3. Update your local remote:
   ```bash
   cd prowl
   git remote set-url origin https://github.com/mattstratton/prowl.git
   git push -u origin main
   ```

## Vercel Project Update

### 1. Update Environment Variables
Go to your Vercel project settings and update these environment variables:

```
DATABASE_SCHEMA=prowl
DATABASE_URL=postgresql://prowl:your-password@your-host:port/tsdb?sslmode=require
```

**Important:** Update for all environments (Production, Preview, Development)

### 2. Optional: Rename Vercel Project
1. Go to your Vercel project settings
2. Click **General**
3. Scroll to **Project Name**
4. Change from `talk-tracker` to `prowl`
5. Save

**Note:** This will change your Vercel URL from `talk-tracker-*.vercel.app` to `prowl-*.vercel.app`

### 3. Redeploy
After updating environment variables:
```bash
vercel --prod
```

Or trigger a new deployment by pushing to your main branch.

## Git Commit Changes

After completing database and external service changes:

```bash
cd prowl
git add .
git commit -m "Rename project from talk-tracker to prowl

- Update all branding and references
- Change database schema from talk_tracker to prowl
- Update package name and metadata
- Expand description to reflect full conference presence management"
git push
```

## Post-Deployment Checklist
- [ ] Verify app loads at new Vercel URL (if renamed)
- [ ] Test Google OAuth login
- [ ] Create a test event
- [ ] Create a test talk
- [ ] Create a test proposal
- [ ] Verify database is using `prowl` schema
- [ ] Check that calendar export downloads as "prowl-events.ics"

## Notes
- All references to "Talk Tracker" have been changed to "Prowl"
- App description now emphasizes full conference presence management (speaking, sponsorships, budgets, etc.)
- Database schema isolation maintained with `prowl` and `test_prowl` schemas
- Old GitHub URLs will redirect automatically if you renamed the repo
