# Prizm Lounge Production Hub

Production coordination system for Panini America Prizm Lounge at Super Bowl LX.

## Quick Start

### Prerequisites

- Node.js 20+ installed
- A Supabase account and project ([Sign up here](https://supabase.com))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nextjs-boilerplate
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

You can find these in your [Supabase Dashboard](https://supabase.com/dashboard):
- Project Settings → API → Project URL
- Project Settings → API → Project API keys → `anon` `public`

4. Set up the database:
   - Open your [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql)
   - Copy the contents of `/supabase/migration.sql`
   - Paste and run it in the SQL Editor

5. **Test your Supabase connection:**
```bash
npm run test:supabase
```

This will verify that:
- ✓ Environment variables are properly configured
- ✓ Connection to Supabase is working
- ✓ Database tables are accessible
- ✓ CRUD operations work correctly
- ✓ Realtime features are functioning

6. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run type-check` - Run TypeScript type checking
- `npm run validate` - Run type checking and linting
- `npm run test:supabase` - Test Supabase connection and setup
- `npm run clean` - Clean build artifacts and cache

## Supabase Setup

This application uses Supabase as the backend database with real-time synchronization.

### Database Schema

The application uses the following tables:

1. **notes** - Issue tracking and notes
2. **deliverables** - Task and deliverable management
3. **schedule_slots** - Player scheduling
4. **player_station_completions** - Completion tracking
5. **clip_markers** - Video/photo clip metadata

### Testing Supabase Connection

Run the comprehensive Supabase connection test:

```bash
npm run test:supabase
```

See `/scripts/README.md` for detailed information about the test suite.

### Offline Mode

The application gracefully handles offline scenarios:
- If Supabase environment variables are not configured, the app runs in offline mode
- Data sync functions will return `false` when offline
- The UI will show appropriate offline indicators

## Project Structure

```
├── app/
│   └── prizm/              # Main application
│       ├── components/     # React components
│       ├── lib/           # Utilities and database sync
│       ├── types/         # TypeScript type definitions
│       └── ...            # Feature directories
├── scripts/
│   ├── test-supabase-connection.ts  # Connection test script
│   └── README.md          # Testing documentation
├── supabase/
│   └── migration.sql      # Database schema and migrations
└── public/                # Static assets
```

## Key Features

- **Real-time Data Sync**: Automatic synchronization with Supabase using real-time subscriptions
- **Offline Support**: Graceful degradation when Supabase is unavailable
- **Type Safety**: Full TypeScript support with generated database types
- **State Management**: Zustand for efficient state management
- **Modern Stack**: Next.js 15 with App Router, React 19, Tailwind CSS 4

## Tech Stack

- **Framework**: Next.js 15.4.10 with App Router
- **React**: 19.1.0
- **Database**: Supabase (PostgreSQL + Real-time)
- **State Management**: Zustand 5.0.11
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Validation**: Zod
- **Language**: TypeScript 5.9.3

## Development

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint          # Check for issues
npm run lint:fix      # Auto-fix issues
```

### Building

```bash
npm run build
```

### Bundle Analysis

```bash
npm run build:analyze
```

## Troubleshooting

### Supabase Connection Issues

If you're experiencing connection issues:

1. Run the test script: `npm run test:supabase`
2. Check your environment variables in `.env.local`
3. Verify your Supabase project is active
4. Ensure database tables are created (run `migration.sql`)

### Common Errors

**"Supabase environment variables not configured"**
- Create `.env.local` with your Supabase credentials

**"Table does not exist"**
- Run `/supabase/migration.sql` in your Supabase SQL Editor

**Build Errors**
```bash
npm run clean
npm install
npm run build
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run `npm run validate` to check types and linting
4. Test with `npm run dev`
5. Submit a pull request

## License

Private - Panini America Internal Use Only
