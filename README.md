## Improve 90

A 90-day behavioral calendar built with Next.js 14, Material UI, Supabase, and multi-role access control (admin, editor, viewer). The experience includes:

- Single-day calendar pagination with configurable assignments and data inputs
- Tracker section for daily behavior metrics
- Insights surface that organizes captured data by input type
- Admin workspace for inviting users and ingesting 90-day templates from CSV

## Stack

- Next.js 14 App Router + TypeScript
- Material UI design system with custom theme
- React Query + Zustand-ready architecture for client data needs
- Supabase (Postgres, Auth, RLS) for persistence and multi-role security
- PapaParse for CSV ingestion; date-fns for schedule math

## Local Setup

1. **Install dependencies**
	```bash
	npm install
	```
2. **Configure environment variables** via `.env.local` (see `.env.example`). Required keys:
	- `NEXT_PUBLIC_SUPABASE_URL`
	- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
	- `SUPABASE_SERVICE_ROLE_KEY` (serverless/admin routes only)
3. **Provision Supabase**
	- Create a new Supabase project
	- Run the SQL in `supabase/schema.sql` via the SQL editor to create tables, enums, constraints, and policies
	- Enable email/password auth providers
4. **Seed the initial admin**
	- Sign up via Supabase Auth and set the `role` column to `admin` in `profiles`
5. **Run the dev server**
	```bash
	npm run dev
	```
	Visit `http://localhost:3000` — the root route redirects to the calendar.

## CSV Calendar Format

Admins upload a 90-day template using the Admin ▸ Template panel. Expected headers:

| Column | Required | Description |
| --- | --- | --- |
| `day_number` | ✅ | 1–90 index |
| `assignment_title` | ✅ | Headline for the day |
| `assignment_summary` | | Supporting copy |
| `tracker_prompt` | | Text displayed in tracker card |
| `field_key` | | Machine-safe key |
| `field_label` | | User-facing label |
| `field_type` | | `short_text`, `long_text`, `number`, `boolean`, `select`, `multi_select`, `scale`, `date`, `file` |
| `field_required` | | `true` or `false` |
| `field_options` | | Pipe-separated list used by select/multi-select/scale (single values may be left blank) |

After the first set of `field_*` columns, you can keep appending more groups of five values (`field_key`, `field_label`, `field_type`, `field_required`, `field_options`). Groups with numbered suffixes (e.g., `_2`, `_3`, `_4`) are interpreted as tracker behaviors when their `field_type` is `scale`, `number`, or `boolean`. Option strings are only treated as selectable options when they contain delimiters such as `|` or `,`; otherwise the value is assumed to be the next field/metric key. This allows a compact CSV where the second group’s key can immediately follow the first group’s `field_required` column without leaving blank option cells. All tracker behaviors detected this way populate `calendar_behavior_templates`, and they render inside the Tracker card as 7-point sliders in the UI.

## Supabase Roles

- **Admin**: invite accounts, assign roles, upload calendars
- **Editor**: edit calendar inputs and trackers
- **Viewer**: read-only access across calendar and insights

Row-Level Security rules ensure users can only mutate their own entries/logs, while admins can manage all supporting tables.

## Deployments

### Vercel (Next.js frontend)

1. **Connect the repo**
	- Push `main` to GitHub (`Kayhofm/ImproveApp`).
	- In the Vercel dashboard choose **Add New Project → Import Git Repository** and select `ImproveApp`.
2. **Configure build settings** *(defaults work)*
	- Framework preset: `Next.js`
	- Install command: `npm install`
	- Build command: `npm run build`
	- Output directory: `.vercel/output` (set automatically by Vercel for Next.js 13+)
3. **Set environment variables** for **Production**, **Preview**, and **Development**: 
	- `NEXT_PUBLIC_SUPABASE_URL`
	- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
	- `SUPABASE_SERVICE_ROLE_KEY` *(server-side API routes only; treat as secret)*
	- (Optional) `NEXT_PUBLIC_SITE_URL` if you link Supabase Auth redirects to a custom domain.
	Use the dashboard or CLI: `vercel env add NEXT_PUBLIC_SUPABASE_URL` etc., then `vercel env pull .env.local` for local parity.
4. **Deploy**
	- Click **Deploy** to create the Production environment.
	- Enable **Preview Deployments** so every PR gets its own URL tied to the same Supabase project or a staging project.
5. **Post-deploy**
	- Map your custom domain and add it to Supabase Auth → Redirect URLs.
	- Run `vercel logs <deployment-url>` if you need to inspect runtime errors.

### Supabase (database + auth)

- Run the SQL in `supabase/schema.sql` against your hosted project.
- Store the service-role key solely inside Vercel’s encrypted envs—never commit it.
- Schedule automated backups and RLS policy checks inside Supabase.

### Railway (optional background jobs)

- Railway is only needed if you plan to run cron jobs (e.g., nightly insights aggregation or reminder emails). Frontend + API routes live entirely on Vercel.
- Recommended setup:
	1. Create a **Railway project** and provision a **Node.js service** (or Scheduled Job) that connects to the same Supabase Postgres URL.
	2. Copy the same Supabase env vars (`SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`) into the Railway service variables. Never expose anon keys in worker logs.
	3. Use Railway’s **Deploy Trigger** or cron schedule to execute scripts (e.g., `/railway/insights-cron.ts`) that call Supabase REST/RPC. These scripts can live in a `/workers` folder and be deployed through `railway up`.
- Keep Railway detached until those workers exist; today’s app and APIs run fully on Vercel.

## Testing & Quality

- `npm run lint` — static analysis via ESLint + Next.js rules
- Component logic is split into presentational pieces (`components/*`) plus API/service layers, easing unit or integration tests later

## Roadmap Ideas

- Multi-calendar support with per-user enrollment
- Automated insight snapshots and chart visualizations
- Notification worker (Railway) for reminders or status digests
- Localization and custom theming per cohort
