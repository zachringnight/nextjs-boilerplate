# NWSL Media Day 2026 - Crew App

Production crew app for the NWSL x Panini Media Day shoot. Built for station leaders, floor managers, and production staff to manage player rotations, access interview questions, and track the shoot in real-time.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000/crew](http://localhost:3000/crew) to access the crew app.

## Features

### Live Now Dashboard
- Real-time view of all 4 stations showing who's currently at each
- Countdown timer for current time slot (flashes red when < 5 minutes)
- Quick stats showing progress through the day
- Smart status messages for pre-shoot, lunch break, and wrap

### Schedule View
- Full rotation schedule for all 3 groups
- NOW/NEXT indicators highlight current and upcoming slots
- Click any player name to view their full profile
- Jump to Now button scrolls to current time slot

### Station Tool
- For station leaders to see all players coming to their station
- Auto-expands current player on load
- Full player background, talking points, and station-specific questions
- Expand All / Collapse All for quick reference

### Players
- Searchable roster of all 11 players
- Filter by group
- Full profiles with bio, talking points, and questions by station

### Global Search (⌘K)
- Works from any view
- Find players by name, team, or position
- Shows group and time slot in results

### Large Text Mode
- Toggle with the Aa button in header
- Larger questions for reading on set or on-camera

## Adding Player Photos

Drop headshot images in `/public/players/` with matching filenames:
- `ally-watt.jpg`
- `kaleigh-kurtz.jpg`
- `manaka-matsukubo.jpg`
- `kenza-dali.jpg`
- `mia-fishel.jpg`
- `mina-tanaka.jpg`
- `casey-murphy.jpg`
- `ivonne-chacon.jpg`
- `temwa-chawinga.jpg`
- `jordyn-bloomer.jpg`
- `riley-tiernan.jpg`

## Schedule

| Group | Time | Players |
|-------|------|---------|
| Group 1 | 9:00 - 10:20 AM | Ally Watt, Kaleigh Kurtz, Manaka Matsukubo |
| Group 2 | 10:30 - 11:50 AM | Kenza Dali, Mia Fishel, Mina Tanaka, Casey Murphy |
| Group 3 | 1:00 - 2:20 PM | Ivonne Chacon, Temwa Chawinga, Jordyn Bloomer, Riley Tiernan |

**Stations:** Field, Social, VNR, Pack Rip (20 min each)

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Lucide React icons

## Deployment

```bash
npm run build
npm start
```

Or deploy to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## Project Structure

```
app/
├── crew/                    # Crew app
│   ├── page.tsx            # Main crew page with navigation
│   └── components/
│       ├── NowDashboard.tsx    # Live station overview
│       ├── ScheduleView.tsx    # Rotation schedule
│       ├── StationToolView.tsx # Station leader tool
│       ├── PlayerCard.tsx      # Player card in grid
│       ├── PlayerModal.tsx     # Full player profile modal
│       └── PlayerAvatar.tsx    # Player avatar with fallback
├── data/
│   └── players.ts          # Player data and schedule
└── components/
    └── StationIcon.tsx     # Station icons and config
```

## Event Details

- **Date:** January 28, 2026
- **Location:** MG Studio, Los Angeles
- **Client:** Panini America
- **League:** NWSL
