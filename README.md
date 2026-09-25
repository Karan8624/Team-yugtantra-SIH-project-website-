# AMR Fleet Control

Control hub and live status display for the SIH warehouse AMR — built with Next.js (App Router), TypeScript, and Tailwind CSS.

## What's here

- **`/` — Operator (Simple) View.** The default screen: plain-language robot status, big icon tiles, three large touch-friendly action buttons. Designed so a factory-floor worker (not just an engineer) can use it comfortably.
- **`/technical` — Technical View.** The full SCADA-style dashboard, now modeling a small **fleet of 3 robots** that move and run their own mission cycles independently:
  - **Overview** — battery, speed, payload, attachment, the warehouse floor plan (all 3 robots visible, click one to select it), a simulated dashcam cutout, system health, motor temp trend, and live proxy sensor readings.
  - **Alerts** — log with ACK/Resolve, tagged with which robot raised each one.
  - **Mission Control** — robot controls (for whichever robot is selected) and task dispatch (pick stations + optionally assign a robot), plus the live 12-step Mission Sequence panel for the selected robot.
  - **Activity Log** — a station-visit history per robot (picked up here, dropped there, returning to base).
  - A **robot picker** in the header switches which robot the Overview cards, Mission Control, and Activity Log focus on.
- Both views read from the **same live state** (see `src/lib/telemetry.tsx`), so switching views never shows conflicting numbers.
- **Dark / light mode** via `next-themes` (toggle in the header of both views).
- **Language switcher** — English, Hindi, and Marathi are wired up now (`src/lib/messages/*.ts`); adding a language is adding one more file in that shape and one line in `src/lib/locale.tsx`.

## Running it

```bash
npm install
npm run dev
```

Open http://localhost:3000 for the Operator view, or http://localhost:3000/technical for the full dashboard.

```bash
npm run build   # production build — verified clean, no type or lint errors
npm run start   # run the production build locally
```

## Deploying to Vercel

This is a stock Next.js App Router project, so Vercel needs no configuration:

1. Push this folder to a GitHub repo.
2. In Vercel, "Add New Project" → import that repo → Deploy. That's it — every push to the connected branch auto-deploys.

No environment variables are required yet (see "Connecting real hardware" below for when that changes).

## The Telemetry Layer — how mock data becomes real data later

Every screen reads robot state from one place: `src/lib/telemetry.tsx`. `TelemetryState.robots` is an array of 3 independent `RobotState` objects; `TelemetryProvider` runs a mock simulation for each one (a shared `setInterval` tick, plus a per-robot state machine tied to the Mission Sequence steps). Nothing else in the app generates its own numbers — components only ever call `useTelemetry()`, which also exposes the *currently selected* robot's fields directly (`battery`, `speed`, `mission`, etc.) so most screens don't need to think about the fleet at all.

This means connecting real hardware later is a matter of rewriting the *inside* of `telemetry.tsx`, not touching any screen — one real data feed per robot, replacing the mock tick. Search that file for **`HARDWARE TODO`** comments — those mark exactly where a real data feed plugs in (the background tick effect, and the action functions like `emergencyStop`, `dispatchTask`, etc.).

The sensor-to-field mapping (which physical component produces which value shown on screen) is documented separately in `hardware_compatibility.md` from the project planning — keep that alongside this repo as the reference for that work.

### What's still open (by design — the team hasn't finalized the hardware yet)

- **Microcontroller and communication protocol are not chosen yet.** Nothing in this codebase assumes a specific one. Once decided (the team was leaning toward Wi-Fi + MQTT for the ESP32 as a reasonable default, but hasn't committed), the integration point is still just `telemetry.tsx` — replace the mock tick with a subscription to whatever feed the hardware produces (an MQTT client, a WebSocket, or a polled HTTP endpoint) and call the same `setState` shape.
- **No backend exists yet.** This is a pure frontend. Connecting real hardware will need something in between (a small API route under `src/app/api/`, or a separate service) to receive data from the microcontroller and hand it to the browser — that's a genuinely separate piece of work, not something to bolt onto this repo casually.

## Project structure

```
src/
  app/
    page.tsx              Operator view route ("/")
    technical/page.tsx     Technical view route ("/technical")
    layout.tsx              Root layout: theme + locale + telemetry providers
    globals.css             Design tokens (light/dark), Tailwind v4 @theme
  components/
    OperatorView.tsx        The Simple View screen
    LanguageSwitcher.tsx
    ThemeToggle.tsx
    icons.tsx                Shared inline SVG icon set
    technical/
      TopBar.tsx             Header, robot picker, tabs, compact controls strip
      OverviewTab.tsx
      AlertsTab.tsx
      MissionControlTab.tsx
      MissionSequencePanel.tsx
      ActivityLogTab.tsx      Per-robot station-visit / pickup / drop history
      FloorPlan.tsx           Multi-robot map + simulated dashcam cutout
      TechnicalDashboard.tsx Tab-switching shell for /technical
  lib/
    telemetry.tsx            The Telemetry Layer (mock now, real later)
    locale.tsx                i18n context (no routing, just a React context + localStorage)
    messages/{en,hi,mr}.ts    Translated strings
    utils.ts                  cn() class-merging helper
```

## Notes on choices made for this hackathon build

- **No component library CLI was run** (e.g. shadcn/ui's installer) — the sandbox this was built in couldn't reach its registry, so UI primitives here are hand-built Tailwind components. They're intentionally simple; swapping in shadcn/ui or Tremor components later is straightforward since nothing here is deeply coupled to the current markup.
- **Fonts are the system stack**, not next/font/google — same reachability reason. Swapping to Space Grotesk / IBM Plex Mono (used in the original design mockups) is one `next/font/google` import in `layout.tsx` plus updating the two `--font-*` variables in `globals.css` — do this once you're building somewhere with normal internet access.
- **i18n is a lightweight custom context**, not next-intl's full routing solution — chosen to avoid restructuring routes under `[locale]/` for a 3-language hackathon demo. It covers UI chrome (labels, buttons, headers); a few live status sentences in the Operator view are still English-only — call this out if asked, and treat full sentence-level translation as a fast-follow, not a gap that undermines the feature.
