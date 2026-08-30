# BunkerWatch AIS Detection Worker

Two ways to run STS detection from live AIS data. Pick one:

## Option A: GitHub Actions polling (free, no hosting account needed)

`.github/workflows/ais-poll.yml` runs `npm run poll` every ~15 minutes as a
GitHub Actions job. Each run connects to AISStream for 50 seconds, compares
what it saw against encounters left open from the previous run (stored in
Supabase's `ais_encounter_state` table), and exits.

**Trade-off**: detection happens in 15-minute snapshots, not continuously.
A real 45+ minute STS operation is still reliably caught (it'll span
several snapshots), but the recorded start/end times are approximate —
accurate to within a poll interval, not to the minute.

Setup:
1. Run `supabase/migration_ais_polling.sql` in Supabase SQL Editor (once,
   after `schema.sql`).
2. In the GitHub repo: **Settings → Secrets and variables → Actions**, add:
   - `AISSTREAM_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API → `service_role`,
     not the anon key)
3. That's it — the workflow runs on its own schedule. Check the **Actions**
   tab to see individual runs and their logs.

## Option B: Always-on worker (continuous, needs a host that stays running)

`npm start` runs `src/index.ts` as a long-lived process — more precise
(catches encounters as they happen, not just every 15 minutes), but needs
somewhere that keeps a process running 24/7, which free static/serverless
hosts (GitHub Pages, Vercel, Cloudflare Pages) cannot do by design.

## What it detects — and what it doesn't

- Detects: two vessels within ~400m, both under ~1 knot, for 45+ minutes
  (continuous model) or across enough 15-minute snapshots to add up to that
  (polling model).
- Does **not** know whether it was bunkering, cargo transfer, or something
  else — AIS carries no cargo information. Every detected event is written
  with `operation_type: OTHER_STS`, `confidence: medium`, and
  `raw_operation_label: "AIS-detected proximity event"` — reviewable and
  reclassifiable in the app, never asserted as confirmed bunkering.
- Only sees vessels broadcasting AIS. A barge with its transponder off (or
  out of range of a receiving station) won't be detected.

## Running Option B locally

```bash
cd worker
npm install
cp .env.example .env
# fill in AISSTREAM_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
npm start
```

## Known current issue: AISStream delivering zero data (as of Aug 2026)

As of testing on 28 Aug 2026, AISStream.io accepts the subscription
(`SubscriptionConfirmation` arrives, confirming the API key is valid) but
delivers **zero** `PositionReport`/`ShipStaticData` messages afterward —
tested with two different fresh API keys, both with identical results.

This matches a still-open issue on AISStream's own GitHub
([aisstream/aisstream#15](https://github.com/aisstream/aisstream/issues/15)),
reported independently in Python with a full-world bounding box, same
symptom. This points to a service-side problem, not this codebase or a
specific account/key.

**No action needed to "fix" this from our side.** The scheduled GitHub
Actions poll (`ais-poll.yml`) keeps running automatically every ~15
minutes (subject to GitHub's own throttling on scheduled workflows) — the
moment AISStream starts delivering data again, detection will resume on
its own with no redeploy or config change required. To check whether it's
recovered, look at the most recent run's log for
`[ais] collected N vessel fixes` with `N > 0`.

## Tests

```bash
npm test
```

Covers both detection models directly — distance calculation, minimum-
duration enforcement, separation handling, and stale-encounter sweeping —
without touching a real AIS connection.

## Deploying Option B somewhere that stays on

Pick any host that runs a long-lived process — Railway, Render (background
workers start at $7/month; no free tier for that service type), Fly.io, or
a VPS with `pm2`/`systemd`. Not a fit for Cloudflare Pages/Workers, GitHub
Pages, or Vercel's serverless functions — none support long-lived
processes.

## Tuning detection sensitivity

Thresholds live at the top of `src/detection.ts`:

| Constant | Default | Meaning |
|---|---|---|
| `PROXIMITY_METERS` | 400 | Max distance to count as "alongside" |
| `MAX_SPEED_KNOTS` | 1.0 | Max speed for either vessel to count as stationary |
| `MIN_DURATION_MS` | 45 min | Minimum time close+slow before it counts as a candidate event |
| `STALE_TIMEOUT_MS` | 20 min | (Option B only) how long without an update before an open encounter is closed out |
| `POLL_STALE_MS` in `periodicReconcile.ts` | 45 min | (Option A only) how many missed polls before an open encounter is closed out |

Tightening these (smaller distance, longer minimum duration) reduces false
positives at the cost of missing shorter or looser encounters.

# retest with fresh AISStream key
