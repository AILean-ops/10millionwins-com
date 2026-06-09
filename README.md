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

The local admin dashboard can run on localhost or the Mac mini Tailscale interface.

- Mac/local command: `set -a; source admin/.admin-session; set +a; npm run admin`
- Phone URL through the Morning Brief Tailscale server: `http://100.84.92.118:8791/wins-admin/`

## Required Cloudflare Setup

1. Create D1 database: `wrangler d1 create 10millionwins-db`
2. Replace `database_id` in `wrangler.jsonc`.
3. Apply migration: `npm run db:migrate:remote`
4. Set the Pages secret `ADMIN_TOKEN`.
5. Deploy the Pages project and attach `10millionwins.com`.

## Data Policy

Submissions are not published until approved. The share card is available immediately to the submitter, but the public wall only shows approved rows.

## Phone Approval Dashboard

The LaunchAgent source is `admin/com.aileansolutions.10millionwins-admin.plist`.

It runs `admin/start-admin.sh`, which sources the ignored `admin/.admin-session` file for:

- `TEN_MILLION_WINS_ADMIN_TOKEN`
- `TEN_MILLION_WINS_API_BASE`
- `TEN_MILLION_WINS_ADMIN_HOST`
- `TEN_MILLION_WINS_ADMIN_PORT`
- `TEN_MILLION_WINS_ALLOWED_CLIENTS`

The Node service should stay localhost-only. Brian's phone reaches it through the Morning Brief Tailscale server proxy at `/wins-admin/` and `/admin-api/`.
