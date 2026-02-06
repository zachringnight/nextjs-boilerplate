# Supabase Connection Testing

This directory contains scripts for testing and validating the Supabase connection.

## Prerequisites

Before running the Supabase connection test, you need to:

1. **Set up environment variables**: Create a `.env.local` file in the root directory with your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

You can find these values in your [Supabase Dashboard](https://supabase.com/dashboard) under:
- Project Settings → API → Project URL
- Project Settings → API → Project API keys → `anon` `public`

2. **Set up database tables** (Optional but recommended for full testing): Run the migration SQL file to create the required tables:
   - Open your [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql)
   - Copy the contents of `/supabase/migration.sql`
   - Paste and run it in the SQL Editor

## Running the Test

To test your Supabase connection, run:

```bash
npm run test:supabase
```

## What the Test Does

The test script performs the following checks:

### 1. Environment Variables ✓
- Validates that `NEXT_PUBLIC_SUPABASE_URL` is set
- Validates that `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set
- Checks that the URL is properly formatted

### 2. Basic Connection ✓
- Attempts to establish a connection to Supabase
- Verifies authentication session can be retrieved

### 3. Database Access ✓
- Tests access to all database tables:
  - `notes`
  - `deliverables`
  - `schedule_slots`
  - `player_station_completions`
- Reports which tables exist and which need to be created

### 4. CRUD Operations ✓
- Tests INSERT, SELECT, UPDATE, and DELETE operations on the `notes` table
- Cleans up test data after completion

### 5. Realtime Connection ✓
- Verifies that Supabase Realtime features are working
- Tests subscription and connection establishment

## Expected Output

### Success Case

```
🔍 Supabase Connection Test Suite

============================================================
TEST 1: Environment Variables
============================================================
✓ NEXT_PUBLIC_SUPABASE_URL is set: https://xxx.supabase.co
✓ NEXT_PUBLIC_SUPABASE_ANON_KEY is set
✓ NEXT_PUBLIC_SUPABASE_URL is a valid URL

============================================================
TEST 2: Basic Connection
============================================================
✓ Successfully connected to Supabase
✓ Auth session check passed

============================================================
TEST 3: Database Access
============================================================
✓ Table 'notes' is accessible
✓ Table 'deliverables' is accessible
✓ Table 'schedule_slots' is accessible
✓ Table 'player_station_completions' is accessible

============================================================
TEST 4: Basic CRUD Operations (Notes Table)
============================================================
ℹ Testing INSERT operation...
✓ INSERT successful (ID: xxx)
ℹ Testing SELECT operation...
✓ SELECT successful
ℹ Testing UPDATE operation...
✓ UPDATE successful
ℹ Testing DELETE operation...
✓ DELETE successful
✓ All CRUD operations passed

============================================================
TEST 5: Realtime Connection
============================================================
ℹ Testing realtime subscription...
✓ Realtime connection established
✓ Realtime features are working

============================================================
SUMMARY
============================================================

✓ Environment Variables: PASSED
✓ Basic Connection: PASSED
✓ Database Access: PASSED
✓ CRUD Operations: PASSED
✓ Realtime Connection: PASSED

🎉 All tests passed! (5/5)
✓ Your Supabase connection is working correctly!
```

### Failure Cases

If tests fail, the script will provide detailed error messages to help you diagnose the issue:

- **Missing environment variables**: Instructions to create `.env.local`
- **Connection errors**: Check your Supabase URL and credentials
- **Table not found**: Run the migration.sql file
- **Permission errors**: Check Row Level Security (RLS) policies in Supabase

## Troubleshooting

### "Environment variables not configured"
Create a `.env.local` file with your Supabase credentials.

### "Table does not exist"
Run the `/supabase/migration.sql` file in your Supabase SQL Editor.

### "Connection failed"
- Verify your Supabase project URL and API key
- Check that your Supabase project is active
- Ensure you have internet connectivity

### "Permission denied"
- Check Row Level Security (RLS) policies in your Supabase dashboard
- The migration.sql file includes policies that allow anonymous access

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Next.js with Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
