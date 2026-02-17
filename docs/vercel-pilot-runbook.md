# Vercel Pilot Monitoring Runbook

## Scope
Internal pilot operations for `/asw` before external client rollout.

## Required Daily Checks
1. Verify latest production deployment status in Vercel (`Ready`, no rollback).
2. Review runtime and function logs for new errors.
3. Review API route responses for repeated 5xx failures.
4. Run quick manual smoke checks in production:
   - `/asw/login` magic-link flow
   - notes create/update
   - deliverable status update
   - schedule page load and filters
   - `/asw/admin/import` dry-run with sample CSV
5. Record repeated errors in a running issue list and prioritize fixes by recurrence.

## Pre-Deploy Checklist
1. Supabase migration has been applied (events, membership, event-scoped RLS).
2. Required env vars are present in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_DEFAULT_EVENT_SLUG`
   - `DEFAULT_EVENT_SLUG`
3. CI workflow `CI` is green.
4. At least one admin user exists in `event_members` for the active event.

## Incident Rules
1. If auth fails globally, verify Supabase env vars and auth provider status first.
2. If imports fail, inspect `/api/admin/import/*` logs and payload validation errors.
3. If data appears missing, verify event slug/ID mapping and `event_members` role assignment.
4. If any issue repeats across two consecutive days, escalate into sprint work before new features.

## Phase 2 Reminder
Sentry is intentionally deferred for this internal pilot and must be added before external/client launch.
