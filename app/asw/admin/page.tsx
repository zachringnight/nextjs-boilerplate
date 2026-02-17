'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarClock,
  Save,
  RotateCcw,
  Search,
  AlertCircle,
} from 'lucide-react';
import { useASWStore } from '../store';
import { useSchedulePlayers, type PlayerScheduleOverride } from '../data/schedule';
import type { Player } from '../types';
import { parseTime } from '../lib/schedule-utils';
import { useAuthContext } from '../components/AuthProvider';

type DayFilter = 'all' | 1 | 2;

function toSortMinutes(time: string | null): number {
  const parsed = parseTime(time);
  if (!parsed) return Number.MAX_SAFE_INTEGER;
  return parsed.hours * 60 + parsed.minutes;
}

function normalizeTimeInput(value: string): string | null | 'invalid' {
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;

  const match = trimmed.match(/^([1-9]|1[0-2]):([0-5][0-9])\s*(AM|PM)$/i);
  if (!match) return 'invalid';

  const hour = match[1];
  const minutes = match[2];
  const period = match[3].toUpperCase();
  return `${hour}:${minutes} ${period}`;
}

function ScheduleRow({
  player,
  basePlayer,
  onSave,
  onReset,
}: {
  player: Player;
  basePlayer: Player;
  onSave: (playerId: string, override: PlayerScheduleOverride) => void;
  onReset: (playerId: string) => void;
}) {
  const [draftDay, setDraftDay] = useState<1 | 2>(player.day);
  const [draftTime, setDraftTime] = useState(player.scheduledTime ?? '');
  const [error, setError] = useState('');

  const hasOverride = player.day !== basePlayer.day || player.scheduledTime !== basePlayer.scheduledTime;

  const handleSave = () => {
    const normalizedTime = normalizeTimeInput(draftTime);
    if (normalizedTime === 'invalid') {
      setError('Use format like 12:05 PM (or leave empty for TBD).');
      return;
    }

    onSave(player.id, {
      day: draftDay,
      scheduledTime: normalizedTime,
    });
    setError('');
  };

  const handleReset = () => {
    onReset(player.id);
    setDraftDay(basePlayer.day);
    setDraftTime(basePlayer.scheduledTime ?? '');
    setError('');
  };

  return (
    <div className="rounded-xl border border-[#2A2A2A] bg-[#141414] p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="font-semibold text-white truncate">
            {player.firstName} {player.lastName}
          </p>
          <p className="text-xs text-[#9CA3AF]">
            {player.teamAbbr} • Base: Day {basePlayer.day}, {basePlayer.scheduledTime || 'TBD'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasOverride && (
            <span className="rounded-full bg-amber-500/20 px-2 py-1 text-[11px] font-medium text-amber-300">
              Override Active
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-[120px_1fr_auto_auto] sm:items-end">
        <label className="flex flex-col gap-1 text-xs text-[#9CA3AF]">
          Day
          <select
            value={draftDay}
            onChange={(event) => setDraftDay(Number(event.target.value) as 1 | 2)}
            className="min-h-[44px] rounded-lg border border-[#2A2A2A] bg-[#0F0F0F] px-3 text-sm text-white"
            aria-label={`Edit day for ${player.firstName} ${player.lastName}`}
          >
            <option value={1}>Day 1</option>
            <option value={2}>Day 2</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-[#9CA3AF]">
          Time (PT)
          <input
            value={draftTime}
            onChange={(event) => setDraftTime(event.target.value)}
            placeholder="12:05 PM or blank for TBD"
            className="min-h-[44px] rounded-lg border border-[#2A2A2A] bg-[#0F0F0F] px-3 text-sm text-white placeholder:text-[#6B7280]"
            aria-label={`Edit time for ${player.firstName} ${player.lastName}`}
          />
        </label>

        <button
          onClick={handleSave}
          className="min-h-[44px] rounded-lg bg-[#FFD100] px-3 text-sm font-semibold text-black hover:brightness-95"
          aria-label={`Save schedule override for ${player.firstName} ${player.lastName}`}
        >
          <Save className="mr-1 inline h-4 w-4" />
          Save
        </button>

        <button
          onClick={handleReset}
          className="min-h-[44px] rounded-lg border border-[#3A3A3A] bg-[#0F0F0F] px-3 text-sm text-[#D1D5DB] hover:text-white"
          aria-label={`Reset schedule override for ${player.firstName} ${player.lastName}`}
        >
          <RotateCcw className="mr-1 inline h-4 w-4" />
          Reset
        </button>
      </div>

      {error && (
        <p className="mt-2 flex items-center gap-1 text-xs text-red-400">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}

export default function AdminSchedulePage() {
  const { mode, loading, session, canEdit, canAdmin } = useAuthContext();
  const { players, basePlayerById, overrideCount } = useSchedulePlayers();
  const setScheduleOverride = useASWStore((state) => state.setScheduleOverride);
  const clearScheduleOverride = useASWStore((state) => state.clearScheduleOverride);
  const resetScheduleOverrides = useASWStore((state) => state.resetScheduleOverrides);

  const [searchQuery, setSearchQuery] = useState('');
  const [dayFilter, setDayFilter] = useState<DayFilter>('all');

  const filteredPlayers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return players
      .filter((player) => {
        const matchesDay = dayFilter === 'all' || player.day === dayFilter;
        if (!matchesDay) return false;

        if (!query) return true;
        return (
          player.name.toLowerCase().includes(query) ||
          player.team.toLowerCase().includes(query) ||
          player.teamAbbr.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        const daySort = a.day - b.day;
        if (daySort !== 0) return daySort;

        const timeSort = toSortMinutes(a.scheduledTime) - toSortMinutes(b.scheduledTime);
        if (timeSort !== 0) return timeSort;

        return a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName);
      });
  }, [dayFilter, players, searchQuery]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-[#9CA3AF]">
        Checking permissions...
      </div>
    );
  }

  if (mode !== 'bypass' && !session) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-xl border border-[#2A2A2A] bg-[#141414] p-5">
          <p className="text-sm text-[#9CA3AF]">Sign in is required to access Schedule Admin.</p>
          <Link href="/asw/login" className="mt-3 inline-block text-sm font-semibold text-[#FFD100] hover:underline">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-300">
          Your role has read-only access. Ask an admin for editor access to use Schedule Admin.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="flex items-center gap-3">
        <Link
          href="/asw"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[#2A2A2A] bg-[#141414] px-3 text-sm text-[#D1D5DB] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="text-2xl font-bold text-white">Schedule Admin</h1>
        {canAdmin ? (
          <Link
            href="/asw/admin/import"
            className="ml-auto inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[#2A2A2A] bg-[#141414] px-3 text-sm text-[#D1D5DB] hover:text-white"
          >
            CSV Import
          </Link>
        ) : null}
      </div>

      <p className="mt-2 text-sm text-[#9CA3AF]">
        Update player day/time without code changes. Overrides are saved locally in this browser.
      </p>

      <div className="mt-4 rounded-2xl border border-[#2A2A2A] bg-[linear-gradient(140deg,#1a1a1a_0%,#111111_55%,#161616_100%)] p-4 shadow-[0_8px_20px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search player or team..."
              className="w-full min-h-[44px] rounded-xl border border-[#2A2A2A] bg-[#0F0F0F] pl-9 pr-3 text-sm text-white placeholder:text-[#6B7280]"
              aria-label="Search players"
            />
          </label>

          <label className="flex items-center gap-2 text-xs text-[#9CA3AF]">
            <CalendarClock className="h-4 w-4 text-[#FFD100]" />
            <span className="sr-only">Filter by day</span>
            <select
              value={dayFilter}
              onChange={(event) => {
                const value = event.target.value;
                setDayFilter(value === 'all' ? 'all' : (Number(value) as 1 | 2));
              }}
              className="min-h-[44px] rounded-lg border border-[#2A2A2A] bg-[#0F0F0F] px-3 text-sm text-white"
              aria-label="Filter by day"
            >
              <option value="all">All days</option>
              <option value={1}>Day 1</option>
              <option value={2}>Day 2</option>
            </select>
          </label>

          <button
            onClick={resetScheduleOverrides}
            className="min-h-[44px] rounded-lg border border-red-500/40 bg-red-500/10 px-3 text-sm font-medium text-red-300 hover:bg-red-500/15"
            aria-label="Reset all schedule overrides"
          >
            <RotateCcw className="mr-1 inline h-4 w-4" />
            Reset All
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#9CA3AF]">
          <span className="rounded-full bg-[#0F0F0F] px-2 py-1">{players.length} players</span>
          <span className="rounded-full bg-amber-500/15 px-2 py-1 text-amber-300">{overrideCount} overrides</span>
          <span className="rounded-full bg-[#0F0F0F] px-2 py-1">{filteredPlayers.length} visible</span>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {filteredPlayers.length === 0 && (
          <div className="rounded-xl border border-[#2A2A2A] bg-[#141414] p-6 text-center text-sm text-[#9CA3AF]">
            No players matched your current filters.
          </div>
        )}

        {filteredPlayers.map((player) => {
          const basePlayer = basePlayerById.get(player.id);
          if (!basePlayer) return null;

          return (
            <ScheduleRow
              key={`${player.id}-${player.day}-${player.scheduledTime ?? 'tbd'}`}
              player={player}
              basePlayer={basePlayer}
              onSave={setScheduleOverride}
              onReset={clearScheduleOverride}
            />
          );
        })}
      </div>
    </div>
  );
}
