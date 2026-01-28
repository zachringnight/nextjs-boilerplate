# Shoot Packet Template

This template provides the structure for creating media day shoot packets for any event. It's based on the NWSL Media Day 2026 Panini Shoot build.

## Quick Start

### 1. Copy Template Files

```bash
# From the project root, run:
./scripts/new-shoot.sh "Event Name" "partner-name"

# Or manually copy files:
cp template/config.ts app/config.ts
cp template/participants.ts app/data/participants.ts
```

### 2. Update Configuration

Edit `app/config.ts` with your event details:

```typescript
export const eventConfig: EventConfig = {
  name: 'YOUR EVENT NAME',
  subtitle: 'Partner Name • Event Type',
  date: 'Month DD, YYYY',
  location: 'Venue Name, City',
  // ... more settings
};
```

### 3. Add Participants

Edit `app/data/participants.ts` with your participant data:

```typescript
export const participants: Participant[] = [
  {
    id: 'jane-doe',
    name: 'JANE DOE',
    firstName: 'Jane',
    lastName: 'Doe',
    // ... participant details
  },
  // ... more participants
];
```

### 4. Add Photos

Place participant photos in `/public/participants/`:

```
public/
  participants/
    jane-doe.jpg
    john-smith.jpg
    ...
```

**Photo Requirements:**
- Format: JPG or PNG
- Recommended size: 400x400px minimum
- Naming: Match the `id` field (e.g., `jane-doe.jpg`)

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000/crew` to see your shoot packet.

---

## File Structure

```
template/
├── README.md          # This file
├── config.ts          # Event configuration template
└── participants.ts    # Participant data template

app/
├── config.ts          # Your event config (copy from template)
├── data/
│   └── participants.ts    # Your participant data
├── crew/
│   ├── page.tsx           # Main crew app page
│   └── components/
│       ├── NowDashboard.tsx     # Live station view
│       ├── ScheduleView.tsx     # Rotation schedule
│       ├── StationToolView.tsx  # Station manager tool
│       ├── PlayerCard.tsx       # Participant card
│       ├── PlayerModal.tsx      # Participant detail modal
│       └── PlayerAvatar.tsx     # Avatar with fallback
└── globals.css        # Styling and theme variables
```

---

## Configuration Reference

### Event Config (`config.ts`)

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Event name (displayed in header) |
| `subtitle` | string | Partner/event type subtitle |
| `date` | string | Event date |
| `location` | string | Venue and city |
| `timezone` | string | IANA timezone (e.g., 'America/Los_Angeles') |
| `metaTitle` | string | Browser tab title |
| `metaDescription` | string | SEO description |
| `accentColor` | string | Primary accent color (hex) |
| `stations` | array | Station configurations |
| `groups` | array | Rotation group settings |
| `rotationDurationMinutes` | number | Minutes per station |

### Station Config

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique station identifier |
| `name` | string | Full station name |
| `shortName` | string | Abbreviated name |
| `icon` | string | Icon character (emoji or symbol) |
| `color` | string | Station color (hex) |
| `colorClass` | string | Tailwind color class |
| `description` | string | Station purpose |

### Participant Data (`participants.ts`)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | URL-safe slug |
| `name` | string | Display name (uppercase) |
| `firstName` | string | First name |
| `lastName` | string | Last name |
| `pronunciation` | string? | Optional pronunciation guide |
| `subtitle` | string | Secondary info line |
| `photo` | string | Path to photo |
| `position` | string | Role/position |
| `team` | string | Team/organization |
| `nationality` | string | Country name |
| `flag` | string | Emoji flag |
| `group` | number | Rotation group (1, 2, 3) |
| `groupTime` | string | Time slot display |
| `participantNumber` | number | Order in shoot |
| `bio` | string[] | 3-5 bullet points |
| `talkingPoints` | string[] | Key messages |
| `questions` | array | Station-specific questions |

---

## Customization

### Changing Stations

Modify the `stations` array in `config.ts`:

```typescript
stations: [
  {
    id: 'interview',
    name: 'Interview Station',
    shortName: 'Interview',
    icon: '🎙️',
    color: '#22c55e',
    colorClass: 'green-500',
    description: 'Long-form interviews',
  },
  // Add more stations...
],
```

### Changing Colors

Update CSS variables in `app/globals.css`:

```css
:root {
  --background: #0a0a0a;
  --foreground: #ffffff;
  --accent-gold: #c9a227;
  --card-bg: #141414;
  --card-border: #2a2a2a;
  --station-field: #22c55e;
  /* Add custom station colors */
}
```

### Adding/Removing Groups

Modify the `groups` array in `config.ts` and update `rotationSchedule` in `participants.ts`.

---

## Features

### Live Dashboard
Real-time view showing current station assignments with countdown timers.

### Schedule View
Full rotation schedule with NOW/NEXT indicators and clickable names.

### Station Tool
Floor manager view with all participants for a specific station, expanded questions and talking points.

### Player Directory
Searchable, filterable grid of all participants with quick access to profiles.

### Global Search
Press `Cmd/Ctrl + K` to search participants from anywhere.

### Large Text Mode
Toggle button for improved readability on larger displays.

### Print Support
Print-friendly styles with `no-print` classes for on-screen-only elements.

---

## Tips

1. **Photos**: If a photo is missing, the app shows a generated avatar based on the participant's name and position.

2. **Timezone**: Set the correct timezone in config for accurate "Live Now" functionality.

3. **Questions**: Write questions as conversation starters, not yes/no prompts.

4. **Bio bullets**: Keep them short and scannable for quick crew reference.

5. **Talking points**: These help interviewers know what angles to pursue.

---

## Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

For static hosting, the app can be exported:

```bash
npm run build
# Output is in .next/
```

---

## Support

For issues or feature requests, contact the development team.
