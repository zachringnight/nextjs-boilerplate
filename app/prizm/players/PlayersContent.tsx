'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import { players } from '../data/players';
import { stationMap } from '../data/stations';
import { useAppStore } from '../store';
import { Search, X, NotebookPen, StickyNote, ClipboardCopy } from 'lucide-react';
import {
  DAY_FILTERS,
  PLAYER_STATUS_LABELS,
  STATUS_FILTERS,
  formatAssignment,
  formatTime,
  getNextPlayerSlot,
  getPlayerSchedule,
  getPlayerStatus,
  getSortKeyForSlot,
} from '../lib/player-utils';

export default function PlayersContent() {
  const { schedule, largeText, notes } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [now, setNow] = useState<Date | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<'next' | 'az' | 'team'>('next');
  const [sheetPlayerId, setSheetPlayerId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [autoFocusSearch, setAutoFocusSearch] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: hydrate time after mount for SSR safety
    setNow(new Date());
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setAutoFocusSearch(params.get('focus') === '1');
  }, []);

  useEffect(() => {
    const syncKey = 'prizm:lastSync';
    const stored = window.localStorage.getItem(syncKey);
    setLastSync(stored);
    const handleOnline = () => {
      setIsOnline(true);
      const timestamp = new Date().toISOString();
      window.localStorage.setItem(syncKey, timestamp);
      setLastSync(timestamp);
    };
    const handleOffline = () => setIsOnline(false);
    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!isOnline) return;
    const timestamp = new Date().toISOString();
    window.localStorage.setItem('prizm:lastSync', timestamp);
    setLastSync(timestamp);
  }, [isOnline, schedule]);

  useEffect(() => {
    if (!sheetPlayerId) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sheetPlayerId]);

  const noteCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const note of notes) {
      if (!note.playerId) continue;
      counts.set(note.playerId, (counts.get(note.playerId) ?? 0) + 1);
    }
    return counts;
  }, [notes]);

  const filteredPlayers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return players.filter((player) => {
      if (query) {
        const matches =
          player.name.toLowerCase().includes(query) ||
          player.team.toLowerCase().includes(query) ||
          player.position.toLowerCase().includes(query);
        if (!matches) return false;
      }

      if (selectedDay) {
        const daySlots = getPlayerSchedule(schedule, player.id, selectedDay);
        if (daySlots.length === 0) return false;
      }

      if (selectedStation) {
        const stationSlots = getPlayerSchedule(schedule, player.id, selectedDay ?? undefined);
        const hasStation = stationSlots.some((slot) => slot.station === selectedStation);
        if (!hasStation) return false;
      }

      if (selectedStatus) {
        const statusKey = getPlayerStatus(schedule, player.id, now, selectedDay ?? undefined);
        if (selectedStatus === 'not-started') {
          if (!['not-started', 'offsite', 'tbd'].includes(statusKey)) return false;
        } else if (statusKey !== selectedStatus) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, schedule, selectedDay, selectedStation, selectedStatus, now]);

  const sortedPlayers = useMemo(() => {
    const list = [...filteredPlayers];
    if (sortOption === 'az') {
      return list.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortOption === 'team') {
      return list.sort((a, b) => a.team.localeCompare(b.team));
    }

    return list.sort((a, b) => {
      const aSlot = getNextPlayerSlot(schedule, a.id, now, selectedDay ?? undefined);
      const bSlot = getNextPlayerSlot(schedule, b.id, now, selectedDay ?? undefined);
      return getSortKeyForSlot(aSlot).localeCompare(getSortKeyForSlot(bSlot));
    });
  }, [filteredPlayers, sortOption, schedule, now, selectedDay]);

  const selectedPlayer = useMemo(
    () => players.find((player) => player.id === sheetPlayerId) ?? null,
    [sheetPlayerId]
  );

  const timelineDate = selectedDay ?? (now ? now.toISOString().split('T')[0] : null);

  const selectedPlayerSchedule = useMemo(() => {
    if (!selectedPlayer) return [];
    return getPlayerSchedule(schedule, selectedPlayer.id, timelineDate ?? undefined);
  }, [selectedPlayer, schedule, timelineDate]);

  const selectedPlayerNextSlot = useMemo(() => {
    if (!selectedPlayer) return null;
    return getNextPlayerSlot(schedule, selectedPlayer.id, now, selectedDay ?? undefined);
  }, [selectedPlayer, schedule, now, selectedDay]);

  const selectedPlayerStatus = useMemo(() => {
    if (!selectedPlayer) return null;
    return getPlayerStatus(schedule, selectedPlayer.id, now, selectedDay ?? undefined);
  }, [selectedPlayer, schedule, now, selectedDay]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() || selectedDay || selectedStation || selectedStatus
  );

  const retrySync = () => {
    if (!navigator.onLine) return;
    window.dispatchEvent(new Event('online'));
    const timestamp = new Date().toISOString();
    window.localStorage.setItem('prizm:lastSync', timestamp);
    setLastSync(timestamp);
  };

  const handleCopySchedule = async () => {
    if (!selectedPlayer) return;
    const slot = selectedPlayerNextSlot ?? selectedPlayerSchedule[0];
    if (!slot) return;
    const line = `${selectedPlayer.name} • ${formatAssignment(slot)}`;
    try {
      await navigator.clipboard.writeText(line);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1500);
    } catch (error) {
      console.error('Failed to copy schedule line', error);
    }
  };

  return (
    <div className="pb-6">
      <Header title="Players" />

      <div className="sticky top-[73px] z-30 border-b border-[#2A2A2A] bg-[#0D0D0D]/95 backdrop-blur">
        <div className="px-4 pt-4 pb-3 space-y-3">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search players, teams, or roles..."
              autoFocus={autoFocusSearch}
              inputMode="search"
              className={`w-full bg-[#151515] border border-[#2A2A2A] rounded-xl pl-10 pr-10 py-2.5 text-white placeholder-[#6B7280] focus:border-[#FFD100] focus:outline-none transition-colors ${
                largeText ? 'text-lg' : 'text-base'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-white"
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {DAY_FILTERS.map((day) => (
              <button
                key={day.key}
                onClick={() => setSelectedDay(selectedDay === day.date ? null : day.date)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  selectedDay === day.date
                    ? 'border-[#FFD100] bg-[#FFD100]/15 text-[#FFD100]'
                    : 'border-[#2A2A2A] text-[#D1D5DB] hover:border-[#FFD100]/70'
                }`}
              >
                {day.label}
              </button>
            ))}

            {Array.from(stationMap.values()).map((station) => (
              <button
                key={station.id}
                onClick={() =>
                  setSelectedStation(selectedStation === station.id ? null : station.id)
                }
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  selectedStation === station.id
                    ? 'border-[#FFD100] bg-[#FFD100]/15 text-[#FFD100]'
                    : 'border-[#2A2A2A] text-[#D1D5DB] hover:border-[#FFD100]/70'
                }`}
              >
                {station.name}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {STATUS_FILTERS.map((status) => (
              <button
                key={status.key}
                onClick={() =>
                  setSelectedStatus(selectedStatus === status.key ? null : status.key)
                }
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  selectedStatus === status.key
                    ? 'border-[#FFD100] bg-[#FFD100]/15 text-[#FFD100]'
                    : 'border-[#2A2A2A] text-[#D1D5DB] hover:border-[#FFD100]/70'
                }`}
              >
                {status.label}
              </button>
            ))}

            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-[#9CA3AF]">Sort:</span>
              {(['next', 'az', 'team'] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => setSortOption(option)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    sortOption === option
                      ? 'border-[#FFD100] bg-[#FFD100]/15 text-[#FFD100]'
                      : 'border-[#2A2A2A] text-[#D1D5DB] hover:border-[#FFD100]/70'
                  }`}
                >
                  {option === 'next' ? 'Next' : option === 'az' ? 'A–Z' : 'Team'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#9CA3AF]">
            <span>
              {sortedPlayers.length} player{sortedPlayers.length !== 1 ? 's' : ''}
              {searchQuery && ` matching “${searchQuery}”`}
            </span>
            {hasActiveFilters && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDay(null);
                  setSelectedStation(null);
                  setSelectedStatus(null);
                }}
                className="text-[#FFD100] hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {!isOnline && (
        <div className="px-4 py-3 border-b border-[#2A2A2A] bg-[#111111] text-xs text-[#9CA3AF] flex flex-wrap items-center justify-between gap-2">
          <span>
            Offline mode • showing cached roster
            {lastSync && ` • Last sync ${new Date(lastSync).toLocaleTimeString()}`}
          </span>
          <button
            onClick={retrySync}
            className="text-[#FFD100] hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      <div className="p-4 space-y-2">
        {sortedPlayers.length === 0 ? (
          <div className="text-center py-12">
            <p className={`text-[#9CA3AF] ${largeText ? 'text-lg' : 'text-base'}`}>
              No players found for &ldquo;{searchQuery || 'these filters'}&rdquo;
            </p>
          </div>
        ) : (
          sortedPlayers.map((player) => {
            const statusKey = getPlayerStatus(schedule, player.id, now, selectedDay ?? undefined);
            const nextSlot = getNextPlayerSlot(schedule, player.id, now, selectedDay ?? undefined);
            const noteCount = noteCounts.get(player.id) ?? 0;
            const statusLabel = PLAYER_STATUS_LABELS[statusKey];
            const statusTone =
              statusKey === 'now'
                ? 'bg-[#FFD100]/20 text-[#FFD100]'
                : statusKey === 'up-next'
                  ? 'bg-blue-500/15 text-blue-200'
                  : statusKey === 'complete'
                    ? 'bg-emerald-500/15 text-emerald-200'
                    : statusKey === 'tbd'
                      ? 'bg-amber-500/15 text-amber-200'
                      : 'bg-[#2A2A2A] text-[#D1D5DB]';

            return (
              <button
                key={player.id}
                onClick={() => setSheetPlayerId(player.id)}
                className="w-full text-left rounded-2xl border border-[#2A2A2A] bg-[#141414] p-3 transition hover:border-[#FFD100]/60 hover:bg-[#1B1B1B] active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className={`font-semibold text-white truncate ${largeText ? 'text-lg' : 'text-base'}`}>
                      {player.name}
                    </p>
                    <p className={`text-[#9CA3AF] truncate ${largeText ? 'text-base' : 'text-sm'}`}>
                      {player.team} • {player.position}
                    </p>
                    <p className={`mt-1 text-[#F3F4F6] ${largeText ? 'text-base' : 'text-sm'}`}>
                      {formatAssignment(nextSlot)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusTone}`}>
                      {statusLabel}
                    </span>
                    {noteCount > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#2A2A2A] px-2 py-1 text-[11px] text-[#FDE68A]">
                        <StickyNote size={12} />
                        {noteCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {selectedPlayer && (
        <div className="fixed inset-0 z-50">
          <button
            onClick={() => setSheetPlayerId(null)}
            className="absolute inset-0 bg-black/60"
            aria-label="Close player details"
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-[#2A2A2A] bg-[#0F0F0F] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={`font-semibold text-white ${largeText ? 'text-xl' : 'text-lg'}`}>
                  {selectedPlayer.name}
                </p>
                <p className={`text-[#9CA3AF] ${largeText ? 'text-base' : 'text-sm'}`}>
                  {selectedPlayer.team} • {selectedPlayer.position}
                </p>
              </div>
              {selectedPlayerStatus && (
                <span className="rounded-full bg-[#FFD100]/15 px-3 py-1 text-xs font-semibold text-[#FFD100]">
                  {PLAYER_STATUS_LABELS[selectedPlayerStatus]}
                </span>
              )}
            </div>

            <div className="mt-3 rounded-2xl border border-[#2A2A2A] bg-[#141414] p-4">
              <p className="text-xs uppercase tracking-wide text-[#9CA3AF]">Next assignment</p>
              <p className={`mt-1 text-white ${largeText ? 'text-lg' : 'text-base'}`}>
                {formatAssignment(selectedPlayerNextSlot)}
              </p>
              {selectedPlayerNextSlot?.notes && (
                <p className="mt-1 text-xs text-[#FDE68A]">{selectedPlayerNextSlot.notes}</p>
              )}
            </div>

            <div className="mt-4">
              <p className="text-xs uppercase tracking-wide text-[#9CA3AF]">Today’s timeline</p>
              <div className="mt-2 space-y-2">
                {selectedPlayerSchedule.length === 0 ? (
                  <p className="text-sm text-[#9CA3AF]">No scheduled blocks for this day.</p>
                ) : (
                  selectedPlayerSchedule.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between rounded-xl border border-[#2A2A2A] bg-[#141414] px-3 py-2 text-sm"
                    >
                      <div>
                        <p className="text-white">
                          {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                        </p>
                        <p className="text-[#9CA3AF]">{stationMap.get(slot.station)?.name}</p>
                      </div>
                      {slot.status === 'tbd' && (
                        <span className="rounded-full bg-amber-500/15 px-2 py-1 text-xs text-amber-200">
                          TBD
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs uppercase tracking-wide text-[#9CA3AF]">Station prompts</p>
              <div className="mt-2 rounded-2xl border border-[#2A2A2A] bg-[#141414] p-3 text-sm text-[#D1D5DB]">
                {selectedPlayerNextSlot ? (
                  <ul className="list-disc pl-4 space-y-1">
                    {(selectedPlayer.questions?.signing && selectedPlayerNextSlot.station === 'signing'
                      ? selectedPlayer.questions.signing
                      : selectedPlayer.questions?.packRip && selectedPlayerNextSlot.station === 'packRip'
                        ? selectedPlayer.questions.packRip
                        : stationMap
                            .get(selectedPlayerNextSlot.station)
                            ?.questions?.map((text) => ({
                              type: 'question' as const,
                              text,
                            })) ?? []
                    )
                      .slice(0, 3)
                      .map((prompt, index) => (
                        <li key={`${prompt.text}-${index}`}>{prompt.text}</li>
                      ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[#9CA3AF]">No station prompts available.</p>
                )}
              </div>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              <Link
                href={`/prizm/notes?playerId=${selectedPlayer.id}`}
                className="flex items-center justify-center gap-2 rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-sm font-semibold text-white hover:border-[#FFD100]/70"
              >
                <NotebookPen size={16} />
                Add note/issue
              </Link>
              <Link
                href={`/prizm/clips?playerId=${selectedPlayer.id}`}
                className="flex items-center justify-center gap-2 rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-sm font-semibold text-white hover:border-[#FFD100]/70"
              >
                <StickyNote size={16} />
                Add clip marker
              </Link>
              <button
                onClick={handleCopySchedule}
                className="flex items-center justify-center gap-2 rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-sm font-semibold text-white hover:border-[#FFD100]/70"
              >
                <ClipboardCopy size={16} />
                {copyState === 'copied' ? 'Copied' : 'Copy schedule line'}
              </button>
            </div>

            <div className="mt-4 text-center">
              <Link
                href={`/prizm/players/${selectedPlayer.id}`}
                className="text-sm text-[#FFD100] hover:underline"
              >
                View full player details
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
