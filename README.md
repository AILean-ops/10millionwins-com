# 10 Million AI Wins

Cloudflare-backed public submission, sharing, search, and moderation system for `10millionwins.com`.

## What It Does

- Collects simple public AI Win submissions.
- Generates an instant branded share card in the browser.
- Stores submissions in Cloudflare D1 with moderation state.
- Displays approved wins on a searchable public wall.
- Provides a local Mac mini dashboard for approve/reject/promote workflows.

## Local Commands

```bash
npm install
npm run build
npm run db:migrate:local
npm run pages:dev
npm run admin
```

The admin dashboard defaults to `http://127.0.0.1:8791`.

## Required Cloudflare Setup

1. Create D1 database: `wrangler d1 create 10millionwins-db`
2. Replace `database_id` in `wrangler.jsonc`.
3. Apply migration: `npm run db:migrate:remote`
4. Set the Pages secret `ADMIN_TOKEN`.
5. Deploy the Pages project and attach `10millionwins.com`.

## Data Policy

Submissions are not published until approved. The share card is available immediately to the submitter, but the public wall only shows approved rows.
