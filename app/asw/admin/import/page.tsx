'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, ShieldCheck, FileText, AlertTriangle } from 'lucide-react';
import { useAuthContext } from '../../components/AuthProvider';

type ImportTarget = 'players' | 'schedule' | 'deliverables';

const targetMeta: Record<ImportTarget, { label: string; endpoint: string; columns: string[] }> = {
  players: {
    label: 'Players',
    endpoint: '/api/admin/import/players',
    columns: [
      'id',
      'name',
      'first_name',
      'last_name',
      'team',
      'team_abbr',
      'position',
      'day',
      'scheduled_time',
      'photo',
      'embargoed',
      'translator_needed',
    ],
  },
  schedule: {
    label: 'Schedule Slots',
    endpoint: '/api/admin/import/schedule',
    columns: ['id', 'player_id', 'date', 'start_time', 'end_time', 'station', 'status', 'notes'],
  },
  deliverables: {
    label: 'Deliverables',
    endpoint: '/api/admin/import/deliverables',
    columns: ['id', 'title', 'type', 'status', 'due_day', 'player_id', 'priority'],
  },
};

interface ImportResponse {
  mode?: 'dry-run' | 'commit';
  totalRows?: number;
  inserts?: number;
  updates?: number;
  error?: string;
  issues?: Array<{ row: number; message: string }>;
}

export default function ImportAdminPage() {
  const { mode, loading, session, canAdmin, access } = useAuthContext();
  const [target, setTarget] = useState<ImportTarget>('players');
  const [file, setFile] = useState<File | null>(null);
  const [working, setWorking] = useState(false);
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [lastDryRunOk, setLastDryRunOk] = useState(false);

  const meta = targetMeta[target];

  const statusText = useMemo(() => {
    if (!result) return null;
    if (result.error) return result.error;
    if (result.mode === 'dry-run') {
      return `Dry run complete: ${result.totalRows ?? 0} rows (${result.inserts ?? 0} inserts, ${result.updates ?? 0} updates).`;
    }
    if (result.mode === 'commit') {
      return `Import complete: ${result.totalRows ?? 0} rows (${result.inserts ?? 0} inserts, ${result.updates ?? 0} updates).`;
    }
    return null;
  }, [result]);

  const runImport = async (dryRun: boolean) => {
    if (!file) {
      setResult({ error: 'Choose a CSV file before running import.' });
      return;
    }

    if (mode === 'bypass') {
      setResult({ error: 'CSV import APIs require Supabase auth + service keys and are unavailable in local bypass mode.' });
      return;
    }

    if (!session?.access_token) {
      setResult({ error: 'Missing session access token. Please sign in again.' });
      return;
    }

    setWorking(true);
    setResult(null);

    try {
      const csv = await file.text();
      const url = `${meta.endpoint}?eventSlug=${encodeURIComponent(access?.eventSlug || 'asw-2026')}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ csv, dryRun }),
      });

      const payload = (await response.json()) as ImportResponse;
      setResult(payload);

      if (!response.ok) {
        setLastDryRunOk(false);
        return;
      }

      if (dryRun) {
        setLastDryRunOk(true);
      } else {
        setLastDryRunOk(false);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Import request failed.';
      setResult({ error: message });
      setLastDryRunOk(false);
    } finally {
      setWorking(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-sm text-[#9CA3AF]">Checking permissions...</div>
    );
  }

  if (mode !== 'bypass' && !session) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-xl border border-[#2A2A2A] bg-[#141414] p-5">
          <p className="text-sm text-[#9CA3AF]">Sign in is required to access CSV import tools.</p>
          <Link href="/asw/login" className="mt-3 inline-block text-sm font-semibold text-[#FFD100] hover:underline">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  if (!canAdmin) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-300">
          CSV import is admin-only. Ask an admin for elevated access.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="flex items-center gap-3">
        <Link
          href="/asw/admin"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[#2A2A2A] bg-[#141414] px-3 text-sm text-[#D1D5DB] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="text-2xl font-bold text-white">CSV Import</h1>
      </div>

      <p className="mt-2 text-sm text-[#9CA3AF]">
        Upload CSV, run a dry run preview, then commit. Imports are scoped to event <span className="font-mono text-[#D1D5DB]">{access?.eventSlug}</span>.
      </p>

      <div className="mt-4 rounded-2xl border border-[#2A2A2A] bg-[linear-gradient(140deg,#1a1a1a_0%,#111111_55%,#161616_100%)] p-4 shadow-[0_8px_20px_rgba(0,0,0,0.35)]">
        <div className="grid gap-2 sm:grid-cols-3">
          {(Object.keys(targetMeta) as ImportTarget[]).map((key) => (
            <button
              key={key}
              onClick={() => {
                setTarget(key);
                setFile(null);
                setResult(null);
                setLastDryRunOk(false);
              }}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                target === key
                  ? 'border-[#FFD100]/50 bg-[#FFD100]/10 text-[#FFD100]'
                  : 'border-[#2A2A2A] bg-[#0F0F0F] text-[#D1D5DB] hover:text-white'
              }`}
            >
              {targetMeta[key].label}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-lg border border-[#2A2A2A] bg-[#0F0F0F] p-3">
          <p className="text-xs uppercase tracking-wide text-[#6B7280]">Expected columns</p>
          <p className="mt-1 text-sm text-[#D1D5DB]">{meta.columns.join(', ')}</p>
        </div>

        <label className="mt-4 flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl border border-dashed border-[#3A3A3A] bg-[#0F0F0F] px-4 py-3 text-sm text-[#D1D5DB] hover:border-[#FFD100]/30">
          <Upload className="h-4 w-4 text-[#FFD100]" />
          <span>{file ? file.name : 'Choose CSV file'}</span>
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => {
              const next = event.target.files?.[0] ?? null;
              setFile(next);
              setResult(null);
              setLastDryRunOk(false);
            }}
          />
        </label>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => void runImport(true)}
            disabled={working || !file}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[#2A2A2A] bg-[#141414] px-4 text-sm font-semibold text-white hover:border-[#FFD100]/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileText className="h-4 w-4" />
            Dry Run
          </button>
          <button
            onClick={() => void runImport(false)}
            disabled={working || !file || !lastDryRunOk}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#FFD100] px-4 text-sm font-semibold text-black hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShieldCheck className="h-4 w-4" />
            Commit Import
          </button>
        </div>

        {statusText ? (
          <p className={`mt-4 text-sm ${result?.error ? 'text-red-300' : 'text-green-300'}`}>{statusText}</p>
        ) : null}

        {result?.issues && result.issues.length > 0 ? (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-300">
              <AlertTriangle className="h-4 w-4" />
              Validation Issues
            </p>
            <ul className="space-y-1 text-xs text-red-200">
              {result.issues.map((issue) => (
                <li key={`${issue.row}-${issue.message}`}>Row {issue.row}: {issue.message}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
