'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSchedulePlayers } from '../data/schedule';
import type { Player } from '../types';
import {
  Clock,
  Zap,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Languages,
  Search,
  RotateCcw,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { isCurrentPlayer, isUpcomingPlayer, formatTime, findCurrentPlayer, parseTime, getEventDay } from '../lib/schedule-utils';
import { UPDATE_INTERVALS, DAY_STYLES, STATUS_COLORS } from '../lib/constants';
import { useMounted } from '../hooks/useMounted';
import { Skeleton } from './Skeleton';

interface ScheduleViewProps {
  onPlayerClick: (playerId: string) => void;
}

type StatusFilter = 'all' | 'live' | 'upcoming' | 'embargoed' | 'translator' | 'tbd';
type SortOption = 'time' | 'name' | 'team';

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'live', label: 'Live' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'embargoed', label: 'Embargoed' },
  { value: 'translator', label: 'Translator' },
  { value: 'tbd', label: 'TBD Time' },
];

function getScheduleMinutes(player: Player): number {
  const parsed = parseTime(player.scheduledTime);
  if (!parsed) return Number.MAX_SAFE_INTEGER;
  return parsed.hours * 60 + parsed.minutes;
}

function DaySchedule({
  day,
  dayPlayers,
  onPlayerClick,
  currentTime,
  eventDay,
  isExpanded,
  onToggle,
}: {
  day: 1 | 2;
  dayPlayers: Player[];
  onPlayerClick: (playerId: string) => void;
  currentTime: Date;
  eventDay: 1 | 2 | null;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const styles = DAY_STYLES[day];
  const panelId = `day-${day}-schedule-panel`;
  const embargoedCount = useMemo(() => dayPlayers.filter((player) => player.embargoed).length, [dayPlayers]);
  const clearCount = useMemo(() => dayPlayers.filter((player) => !player.embargoed).length, [dayPlayers]);
  const hasCurrentPlayer = useMemo(
    () => eventDay === day && dayPlayers.some((player) => isCurrentPlayer(player, currentTime, eventDay)),
    [day, dayPlayers, currentTime, eventDay]
  );

  return (
    <div className={`bg-[#141414] border ${styles.border} rounded-xl overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.35)]`}>
      <button
        onClick={onToggle}
        className={`w-full min-h-[48px] ${styles.header} px-4 py-3 border-b border-[#2a2a2a] flex items-center justify-between`}
        aria-expanded={isExpanded}
        aria-controls={panelId}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className={`font-bold ${styles.text}`}>DAY {day}</h3>
          <span className="text-sm text-gray-400">{styles.dateDisplay}</span>
          {hasCurrentPlayer && (
            <span className="flex items-center gap-1 bg-amber-500 text-black px-2 py-0.5 rounded text-xs font-bold animate-pulse">
              <Zap className="w-3 h-3" /> LIVE
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="text-gray-400">{dayPlayers.length} visible</span>
            <span className="text-green-400">{clearCount} clear</span>
            <span className="text-red-400">{embargoedCount} embargo</span>
          </div>
          {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
      </button>

      {isExpanded && (
        <div id={panelId} className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-[#2a2a2a] bg-[#0f0f0f]">
                <th className="text-left py-3 px-4 text-gray-500 font-medium w-24">Time</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Player</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium w-20">Team</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium w-32">Status</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium w-44">Notes</th>
              </tr>
            </thead>
            <tbody>
              {dayPlayers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 px-4 text-center text-sm text-gray-500">
                    No players match the current filters for Day {day}.
                  </td>
                </tr>
              )}
              {dayPlayers.map((player) => {
                const isCurrent = eventDay === day && isCurrentPlayer(player, currentTime, eventDay);
                const isUpcoming = eventDay === day && !isCurrent && isUpcomingPlayer(player, currentTime, eventDay);

                return (
                  <tr
                    key={player.id}
                    className={`border-b border-[#2a2a2a] last:border-0 transition-colors ${
                      isCurrent
                        ? 'bg-amber-500/12 border-l-2 border-l-amber-500'
                        : isUpcoming
                        ? 'bg-blue-500/6'
                        : 'hover:bg-[#1a1a1a]'
                    }`}
                  >
                    <td className="py-3 px-4 align-top">
                      <div className="flex flex-col gap-1">
                        {isCurrent && (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-amber-500 text-black font-bold animate-pulse w-fit">
                            <Zap className="w-3 h-3" /> NOW
                          </span>
                        )}
                        {isUpcoming && (
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${STATUS_COLORS.upcoming.bg} ${STATUS_COLORS.upcoming.text} w-fit`}>
                            <Clock className="w-3 h-3" /> NEXT
                          </span>
                        )}
                        <span className={`font-mono text-xs ${isCurrent ? 'text-amber-400 font-bold' : 'text-gray-300'}`}>
                          {player.scheduledTime || 'TBD'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onPlayerClick(player.id)}
                        className="min-h-[44px] flex items-center gap-2 hover:text-amber-400 transition-colors text-left"
                      >
                        <span className="text-lg">{player.flag}</span>
                        <span className={`font-medium ${isCurrent ? 'text-amber-400' : 'text-white'}`}>
                          {player.firstName} {player.lastName}
                        </span>
                      </button>
                      {player.pronunciation && (
                        <p className="text-xs text-gray-500 italic ml-7">{player.pronunciation}</p>
                      )}
                    </td>
                    <td className="text-center py-3 px-4 align-top">
                      <span className="text-xs text-gray-400 font-medium">{player.teamAbbr}</span>
                    </td>
                    <td className="text-center py-3 px-4 align-top">
                      {player.embargoed ? (
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${STATUS_COLORS.embargoed.bg} ${STATUS_COLORS.embargoed.text}`}>
                          <AlertTriangle className="w-3 h-3" /> EMBARGO
                        </span>
                      ) : (
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${STATUS_COLORS.clear.bg} ${STATUS_COLORS.clear.text}`}>
                          Clear
                        </span>
                      )}
                    </td>
                    <td className="text-center py-3 px-4 align-top">
                      <div className="flex flex-col gap-1 items-center">
                        {player.translatorNeeded && (
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${STATUS_COLORS.translator.bg} ${STATUS_COLORS.translator.text}`}>
                            <Languages className="w-3 h-3" /> Translator
                          </span>
                        )}
                        {player.notes.length > 0 && (
                          <span className="text-xs text-gray-400">{player.notes[0]}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function ScheduleView({ onPlayerClick }: ScheduleViewProps) {
  const { players, day1Players, day2Players } = useSchedulePlayers();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([1, 2]));
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('time');
  const mounted = useMounted();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, UPDATE_INTERVALS.schedule);
    return () => clearInterval(interval);
  }, []);

  const formattedTime = useMemo(() => formatTime(currentTime), [currentTime]);
  const eventDay = useMemo(() => getEventDay(currentTime), [currentTime]);

  const toggleDay = useCallback((day: number) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  }, []);

  const currentPlayer = useMemo(
    () => findCurrentPlayer(players, currentTime, eventDay),
    [currentTime, eventDay, players]
  );

  const jumpToNow = useCallback(() => {
    if (currentPlayer) {
      setSearchQuery('');
      setStatusFilter('all');
      setExpandedDays(new Set([currentPlayer.day]));
    }
  }, [currentPlayer]);

  const hasActiveFilters = searchQuery.trim().length > 0 || statusFilter !== 'all' || sortBy !== 'time';

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilter('all');
    setSortBy('time');
  }, []);

  const filterAndSortPlayers = useCallback((input: Player[]) => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = input.filter((player) => {
      const matchesSearch =
        query.length === 0 ||
        player.name.toLowerCase().includes(query) ||
        player.team.toLowerCase().includes(query) ||
        player.teamAbbr.toLowerCase().includes(query) ||
        player.nationality.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      switch (statusFilter) {
        case 'live':
          return eventDay !== null && isCurrentPlayer(player, currentTime, eventDay);
        case 'upcoming':
          return eventDay !== null && isUpcomingPlayer(player, currentTime, eventDay);
        case 'embargoed':
          return player.embargoed;
        case 'translator':
          return player.translatorNeeded;
        case 'tbd':
          return !player.scheduledTime;
        case 'all':
        default:
          return true;
      }
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName);
        case 'team':
          return a.team.localeCompare(b.team) || a.lastName.localeCompare(b.lastName);
        case 'time':
        default:
          return getScheduleMinutes(a) - getScheduleMinutes(b) || a.lastName.localeCompare(b.lastName);
      }
    });
  }, [currentTime, eventDay, searchQuery, sortBy, statusFilter]);

  const filteredDay1Players = useMemo(() => filterAndSortPlayers(day1Players), [day1Players, filterAndSortPlayers]);
  const filteredDay2Players = useMemo(() => filterAndSortPlayers(day2Players), [day2Players, filterAndSortPlayers]);

  const visiblePlayers = useMemo(
    () => [...filteredDay1Players, ...filteredDay2Players],
    [filteredDay1Players, filteredDay2Players]
  );

  const visibleSummary = useMemo(() => {
    return {
      total: visiblePlayers.length,
      clear: visiblePlayers.filter((player) => !player.embargoed).length,
      embargoed: visiblePlayers.filter((player) => player.embargoed).length,
      translator: visiblePlayers.filter((player) => player.translatorNeeded).length,
    };
  }, [visiblePlayers]);

  if (!mounted) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Player Schedule</h2>
          <p className="text-sm text-gray-500">Exclusive appearances + Signing only</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          {currentPlayer && (
            <button
              onClick={jumpToNow}
              className="min-h-[44px] flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
            >
              <Zap className="w-3 h-3" />
              Jump to Now
            </button>
          )}
          <div className="text-right">
            <div className="flex items-center gap-2 text-amber-400">
              <Clock className="w-4 h-4" />
              <span className="font-mono font-bold">{formattedTime}</span>
            </div>
            <p className="text-xs text-gray-500">PT (Los Angeles)</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#2A2A2A] bg-[linear-gradient(140deg,#1a1a1a_0%,#111111_55%,#161616_100%)] p-4 shadow-[0_8px_20px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search players, team, or nationality..."
              data-testid="schedule-search-input"
              className="w-full min-h-[44px] bg-[#141414] border border-[#2a2a2a] rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD100]/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="relative flex-1 lg:flex-none">
              <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortOption)}
                className="w-full lg:w-44 min-h-[44px] appearance-none bg-[#141414] border border-[#2A2A2A] rounded-xl pl-9 pr-8 py-3 text-sm text-white focus:outline-none focus:border-[#FFD100]/50"
                aria-label="Sort schedule"
              >
                <option value="time">Sort: Time</option>
                <option value="name">Sort: Name</option>
                <option value="team">Sort: Team</option>
              </select>
            </label>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="shrink-0 min-h-[44px] flex items-center gap-1.5 px-3 py-3 rounded-xl border border-[#3A3A3A] bg-[#141414] text-[#D1D5DB] hover:text-white hover:border-[#FFD100]/40 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-sm">Reset</span>
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {statusFilters.map((option) => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              aria-pressed={statusFilter === option.value}
              className={`min-h-[44px] flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                statusFilter === option.value
                  ? 'bg-[#FFD100] text-black'
                  : 'bg-[#141414] text-gray-300 hover:bg-[#1a1a1a]'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-white">{visibleSummary.total}</p>
          <p className="text-xs text-gray-500">Visible Players</p>
        </div>
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-green-400">{visibleSummary.clear}</p>
          <p className="text-xs text-gray-500">Clear for Use</p>
        </div>
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-red-400">{visibleSummary.embargoed}</p>
          <p className="text-xs text-gray-500">Embargoed</p>
        </div>
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-amber-400">{visibleSummary.translator}</p>
          <p className="text-xs text-gray-500">Need Translator</p>
        </div>
      </div>

      {visibleSummary.total === 0 && (
        <div className="text-center py-10 rounded-xl border border-[#2A2A2A] bg-[#141414]">
          <p className="text-gray-200 font-medium mb-2">No schedule rows match your current filters.</p>
          <p className="text-sm text-gray-500 mb-4">Try resetting filters to view the full schedule.</p>
          <button
            onClick={resetFilters}
            className="min-h-[44px] px-4 py-2 rounded-lg bg-[#FFD100] text-black font-semibold hover:brightness-95 transition-all"
          >
            Reset Filters
          </button>
        </div>
      )}

      <DaySchedule
        day={1}
        dayPlayers={filteredDay1Players}
        onPlayerClick={onPlayerClick}
        currentTime={currentTime}
        eventDay={eventDay}
        isExpanded={expandedDays.has(1)}
        onToggle={() => toggleDay(1)}
      />
      <DaySchedule
        day={2}
        dayPlayers={filteredDay2Players}
        onPlayerClick={onPlayerClick}
        currentTime={currentTime}
        eventDay={eventDay}
        isExpanded={expandedDays.has(2)}
        onToggle={() => toggleDay(2)}
      />

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 text-sm text-gray-500">
        <strong className="text-gray-400">Note:</strong> This view updates every 30 seconds. `TBD` times are staged and should be confirmed before publishing run-of-show.
      </div>
    </div>
  );
}
