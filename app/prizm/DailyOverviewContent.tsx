'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Header from './components/Header';
import PlayerPhoto from './components/PlayerPhoto';
import { useAppStore } from './store';
import { getPlayerById } from './data/players';
import {
  EVENT_DATES,
  DAY_LABELS,
  getPlayerArrivalsForDay,
  getPlayersForDay,
  getCompletedPlayerCount,
} from './data/schedule';
import { formatDate, getEventStatus, getDayNumber } from './lib/time';
import {
  Phone,
  Users,
  ChevronRight,
  Calendar,
  Layers,
  Clapperboard,
  MapPin,
  Clock,
} from 'lucide-react';
import { cn } from './lib/utils';

import type { PlayerTier } from './types';

// Format 24h time to 12h AM/PM
const to12h = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
};

// Tier badge styling
const TIER_STYLES: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: 'bg-[#FFD100]/20', text: 'text-[#FFD100]', label: 'T1' },
  2: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'T2' },
  3: { bg: 'bg-[#9CA3AF]/20', text: 'text-[#9CA3AF]', label: 'T3' },
  4: { bg: 'bg-[#4B5563]/20', text: 'text-[#6B7280]', label: 'T4' },
};

function TierBadge({ tier }: { tier?: PlayerTier }) {
  if (!tier) return null;
  const style = TIER_STYLES[tier];
  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}

const STATUS_LABELS: Record<string, { text: string; color: string }> = {
  'pre-show': { text: 'Upcoming', color: 'bg-[#F59E0B] text-black' },
  'active': { text: 'In Progress', color: 'bg-[#22c55e] text-black' },
  'lunch': { text: 'Lunch Break', color: 'bg-[#3B82F6] text-white' },
  'wrapped': { text: 'Shoot Complete', color: 'bg-[#8B5CF6] text-white' },
  'off-day': { text: 'Event Preview', color: 'bg-[#2A2A2A] text-white' },
};

export default function DailyOverviewContent() {
  const {
    schedule,
    largeText,
  } = useAppStore();

  const [selectedDate, setSelectedDate] = useState(EVENT_DATES[0] as string);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: hydrate time after mount for SSR safety
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const today = now ? formatDate(now) : '';
  const status = getEventStatus();
  const dayNum = getDayNumber(selectedDate);
  const todayPlayers = getPlayersForDay(schedule, selectedDate);
  const completedCount = now ? getCompletedPlayerCount(schedule, selectedDate, now) : 0;
  const statusLabel = STATUS_LABELS[status] || STATUS_LABELS['off-day'];

  // Player arrivals for the selected day
  const arrivals = useMemo(
    () => getPlayerArrivalsForDay(schedule, selectedDate),
    [schedule, selectedDate]
  );

  // Find next upcoming player
  const nextPlayer = useMemo(() => {
    if (!now) return null;
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const upcoming = arrivals.find(
      (a) => a.status === 'scheduled' && a.arrivalTime > currentTime && selectedDate === today
    );
    if (!upcoming) return null;
    const player = getPlayerById(upcoming.playerId);
    return player ? { player, arrival: upcoming } : null;
  }, [arrivals, now, today, selectedDate]);

  return (
    <div className="pb-24">
      <Header title="Prizm Lounge" />

      {/* Event Info Bar */}
      <div className="px-4 py-4 bg-gradient-to-r from-[#1A1A1A] to-[#141414] border-b border-[#2A2A2A]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className={cn('font-bold text-white tracking-tight', largeText ? 'text-lg' : 'text-base')}>
              Super Bowl LX Prizm Lounge
            </h2>
            <div className={cn('text-[#9CA3AF] flex items-center gap-1.5 mt-0.5', largeText ? 'text-sm' : 'text-xs')}>
              <MapPin className="w-3 h-3 text-[#FFD100]" />
              <span>San Francisco Bay Area</span>
              <span className="text-[#4B5563]">&middot;</span>
              <span>Feb 5 &ndash; 7, 2026</span>
            </div>
          </div>
          <span className={cn('px-3 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm', statusLabel.color)}>
            {statusLabel.text}
          </span>
        </div>
      </div>

      {/* Quick Links */}
      <div className="px-4 py-4 bg-[#0D0D0D] border-b border-[#2A2A2A]">
        <div className="grid grid-cols-4 gap-3">
          {[
            { href: '/prizm/schedule', icon: Calendar, label: 'Schedule', color: '#FFD100' },
            { href: '/prizm/players', icon: Users, label: 'Players', color: '#3B82F6' },
            { href: '/prizm/clips', icon: Clapperboard, label: 'Clips', color: '#22c55e' },
            { href: '/prizm/stations', icon: Layers, label: 'Stations', color: '#8B5CF6' },
          ].map(({ href, icon: Icon, label, color }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-2 py-3 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#FFD100]/30 hover:bg-[#1E1E1E] transition-all active:scale-[0.97] touch-target"
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <span className="text-xs text-[#9CA3AF] font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Day Tabs */}
      <div className="sticky top-[73px] z-30 bg-[#0D0D0D] border-b border-[#2A2A2A]">
        <div className="flex">
          {EVENT_DATES.map((date, index) => {
            const isSelected = selectedDate === date;
            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={cn(
                  'flex-1 py-3 px-4 text-center transition-colors',
                  isSelected
                    ? 'text-[#FFD100] border-b-2 border-[#FFD100] bg-[#FFD100]/5'
                    : 'text-[#9CA3AF] hover:text-white',
                  largeText ? 'text-lg' : 'text-base'
                )}
              >
                <div className="font-semibold">Day {index + 1}</div>
                <div className={cn('opacity-75', largeText ? 'text-sm' : 'text-xs')}>
                  {DAY_LABELS[date]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Progress */}
      {/* Day Progress */}
      <div className="px-4 py-4 bg-[#1A1A1A] border-b border-[#2A2A2A]">
        <div className="flex items-center justify-between mb-2">
          <span className={cn('text-[#9CA3AF]', largeText ? 'text-base' : 'text-sm')}>
            {DAY_LABELS[selectedDate]} &mdash; {todayPlayers.length} player{todayPlayers.length !== 1 ? 's' : ''}
          </span>
          <span className={cn('text-white font-bold tabular-nums', largeText ? 'text-base' : 'text-sm')}>
            {completedCount}/{todayPlayers.length} <span className="text-[#9CA3AF] font-normal">done</span>
          </span>
        </div>
        <div className="h-2.5 bg-[#2A2A2A] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: todayPlayers.length > 0 ? `${(completedCount / todayPlayers.length) * 100}%` : '0%',
              background: 'linear-gradient(90deg, #FFD100, #FFAA00)',
            }}
          />
        </div>
      </div>

      {/* Up Next Module */}
      {nextPlayer && (
        <div className="px-4 py-4 bg-gradient-to-r from-[#FFD100]/8 to-[#FFD100]/3 border-b border-[#FFD100]/20 animate-appear">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-[#FFD100]/20 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-[#FFD100]" />
            </div>
            <span className={cn('text-[#FFD100] font-bold uppercase tracking-wider', largeText ? 'text-sm' : 'text-xs')}>Up Next</span>
          </div>
          <Link
            href={`/prizm/players/${nextPlayer.player.id}`}
            className="flex items-center gap-3 group"
          >
            <PlayerPhoto src={nextPlayer.player.photo} name={nextPlayer.player.name} size="sm" />
            <div className="flex-1 min-w-0">
              <span className={cn('font-semibold text-white group-hover:text-[#FFD100] transition-colors', largeText ? 'text-base' : 'text-sm')}>
                {nextPlayer.player.name}
              </span>
              <span className={cn('text-[#9CA3AF] block', largeText ? 'text-sm' : 'text-xs')}>
                {nextPlayer.player.team} &mdash; Arrives {to12h(nextPlayer.arrival.arrivalTime)}
              </span>
            </div>
            <ChevronRight size={18} className="text-[#FFD100]/50 group-hover:text-[#FFD100] transition-colors" />
          </Link>
        </div>
      )}

      {/* Player Arrivals Section */}
      <div className="p-4">
        <h2 className={cn('font-bold text-white mb-4 flex items-center gap-2 tracking-tight', largeText ? 'text-xl' : 'text-lg')}>
          <Users className="w-5 h-5 text-[#FFD100]" />
          Player Schedule
        </h2>

        {arrivals.length === 0 ? (
          <div className="text-center py-12 px-6">
            <div className="w-16 h-16 rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-[#4B5563]" />
            </div>
            <p className={cn('text-white font-semibold mb-1', largeText ? 'text-lg' : 'text-base')}>No players scheduled</p>
            <p className={cn('text-[#6B7280]', largeText ? 'text-sm' : 'text-xs')}>Select a different day above to view the schedule</p>
          </div>
        ) : (
          <div className="space-y-2">
            {arrivals.map((arrival) => {
              const player = getPlayerById(arrival.playerId);
              if (!player) return null;

              const currentTime = now
                ? `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
                : '';
              const isHere =
                now &&
                selectedDate === today &&
                arrival.status === 'scheduled' &&
                arrival.arrivalTime <= currentTime &&
                arrival.departureTime > currentTime;
              const isDone =
                now &&
                selectedDate === today &&
                arrival.status === 'scheduled' &&
                arrival.departureTime <= currentTime;

              return (
                <Link
                  key={arrival.playerId}
                  href={`/prizm/players/${player.id}`}
                  className={cn(
                    'block rounded-xl border overflow-hidden transition-all duration-200 hover:border-[#FFD100]/50 group active:scale-[0.99]',
                    isHere ? 'border-[#22c55e] bg-[#22c55e]/5 glow-green' : isDone ? 'border-[#2A2A2A] bg-[#1A1A1A]/60 opacity-60' : 'border-[#2A2A2A] bg-[#1A1A1A] hover:bg-[#1E1E1E]'
                  )}
                >
                  <div className="p-4 flex items-center gap-3">
                    <PlayerPhoto src={player.photo} name={player.name} size="sm" />

                    {/* Player Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            'font-semibold text-white group-hover:text-[#FFD100] transition-colors truncate',
                            largeText ? 'text-base' : 'text-sm'
                          )}
                        >
                          {player.name}
                        </span>
                        <TierBadge tier={player.tier} />
                      </div>
                      <div className={cn('text-[#9CA3AF] flex items-center gap-2 flex-wrap', largeText ? 'text-sm' : 'text-xs')}>
                        <span>{player.team} &mdash; {player.position}</span>
                        {arrival.signingOnly && (
                          <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-wider">
                            Signing Only
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Arrival Time */}
                    <div className="text-right flex-shrink-0">
                      {arrival.status === 'tbd' ? (
                        <span className="px-2.5 py-1 rounded-lg bg-[#F59E0B]/20 text-[#F59E0B] text-xs font-bold">
                          TBD
                        </span>
                      ) : (
                        <>
                          <div className={cn('text-white font-semibold tabular-nums', largeText ? 'text-base' : 'text-sm')}>
                            {to12h(arrival.arrivalTime)}
                          </div>
                          <div className={cn('text-[#6B7280] tabular-nums', largeText ? 'text-sm' : 'text-xs')}>
                            to {to12h(arrival.departureTime)}
                          </div>
                        </>
                      )}
                      {isHere && (
                        <span className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#22c55e] text-black text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
                          HERE
                        </span>
                      )}
                      {isDone && (
                        <span className="text-[#22c55e] text-xs font-medium">Done</span>
                      )}
                    </div>

                    <ChevronRight size={16} className="text-[#4B5563] group-hover:text-[#FFD100] transition-colors flex-shrink-0" />
                  </div>

                  {/* PR Call Info */}
                  {arrival.prCall && (
                    <div className="px-4 pb-3 pt-0">
                      <div className="flex items-center gap-2 bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 rounded-lg px-3 py-2">
                        <Phone className="w-3.5 h-3.5 text-[#8B5CF6] flex-shrink-0" />
                        <div className={cn('flex-1 min-w-0', largeText ? 'text-sm' : 'text-xs')}>
                          <span className="text-[#8B5CF6] font-medium">
                            PR {to12h(arrival.prCall.time)}
                          </span>
                          <span className="text-[#9CA3AF]"> — {arrival.prCall.outlet}</span>
                          {arrival.prCall.contact && (
                            <span className="text-[#6B7280]"> ({arrival.prCall.contact})</span>
                          )}
                        </div>
                        {arrival.prCall.callIn && arrival.prCall.callIn !== 'TBD' && (
                          <span
                            className="text-[#8B5CF6] text-xs font-mono flex-shrink-0"
                          >
                            {arrival.prCall.callIn}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
