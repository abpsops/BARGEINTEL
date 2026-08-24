# BARGEINTEL AIS Detection Worker

A standalone, always-on Node service that watches AISStream.io for the
Fujairah bounding box, detects when a tracked competitor barge and any
other vessel sit stationary and close together for a sustained period, and
writes that as a candidate STS event into Supabase.

This is **not** part of the frontend build — it's a separate long-running
process, because detecting activity you missed while your browser was
closed requires something that never closes.

## What it does — and what it doesn't

- Detects: two vessels within ~400m, both under ~1 knot, for 45+ continuous
  minutes. That pattern is a strong signal of an STS operation.
- Does **not** know whether it was bunkering, cargo transfer, or something
  else entirely — AIS carries no cargo information. Every detected event is
  written with `operation_type: OTHER_STS`, `confidence: medium`, and
  `raw_operation_label: "AIS-detected proximity event"` — reviewable and
  reclassifiable in the app, never asserted as confirmed bunkering.
- Only sees vessels broadcasting AIS. A barge with its transponder off (or
  simply out of range of a receiving station) won't be detected — this is a
  detection aid, not a complete record.

## Running it

```bash
cd worker
npm install
cp .env.example .env
# fill in AISSTREAM_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
npm start
```

`SUPABASE_SERVICE_ROLE_KEY` is in Supabase under **Project Settings → API →
service_role** — not the anon key the frontend uses. This key bypasses Row
Level Security, so it belongs only here, never in a browser bundle or a
committed file.

## Tests

```bash
npm test
```

Covers the detection state machine directly — distance calculation,
minimum-duration enforcement, separation handling, and stale-encounter
sweeping — without touching a real AIS connection.

## Deploying it somewhere that stays on

Pick any host that runs a long-lived process (this is *not* a fit for
Cloudflare Pages/Workers' request-response model, or GitHub Actions, which
only run on a schedule or on push):

- **Railway / Render**: point it at the `worker/` folder, or build
  `worker/Dockerfile`; set the three env vars in their dashboard.
- **Fly.io**: `fly launch` from `worker/`, using the included Dockerfile.
- **A VPS**: `npm run build && node dist/index.js` under `pm2` or a
  `systemd` unit so it restarts on crash/reboot.

The client auto-reconnects with backoff on any AISStream disconnect, so it
tolerates being restarted or losing network briefly without manual
intervention.

## Tuning detection sensitivity

Thresholds live at the top of `src/detection.ts`:

| Constant | Default | Meaning |
|---|---|---|
| `PROXIMITY_METERS` | 400 | Max distance to count as "alongside" |
| `MAX_SPEED_KNOTS` | 1.0 | Max speed for either vessel to count as stationary |
| `MIN_DURATION_MS` | 45 min | Minimum time close+slow before it counts as a candidate event |
| `STALE_TIMEOUT_MS` | 20 min | How long without an update before an open encounter is closed out |

Tightening these (smaller distance, longer minimum duration) reduces false
positives at the cost of missing shorter or looser encounters.
