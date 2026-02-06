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

// Format 24h time to 12h AM/PM
const to12h = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
};

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
      <div className="px-4 py-3 bg-[#1A1A1A] border-b border-[#2A2A2A]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className={cn('font-bold text-white', largeText ? 'text-lg' : 'text-base')}>
              Super Bowl LX Prizm Lounge
            </h2>
            <div className={cn('text-[#9CA3AF] flex items-center gap-1.5', largeText ? 'text-sm' : 'text-xs')}>
              <MapPin className="w-3 h-3" />
              <span>San Francisco Bay Area</span>
              <span className="text-[#4B5563]">|</span>
              <span>Feb 5 — 7, 2026</span>
            </div>
          </div>
          <span className={cn('px-3 py-1 rounded-full text-xs font-semibold', statusLabel.color)}>
            {statusLabel.text}
          </span>
        </div>
      </div>

      {/* Quick Links */}
      <div className="px-4 py-3 bg-[#0D0D0D] border-b border-[#2A2A2A]">
        <div className="grid grid-cols-4 gap-2">
          {[
            { href: '/prizm/schedule', icon: Calendar, label: 'Schedule', color: '#FFD100' },
            { href: '/prizm/players', icon: Users, label: 'Players', color: '#3B82F6' },
            { href: '/prizm/clips', icon: Clapperboard, label: 'Clips', color: '#22c55e' },
            { href: '/prizm/stations', icon: Layers, label: 'Stations', color: '#8B5CF6' },
          ].map(({ href, icon: Icon, label, color }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#FFD100]/30 transition-colors"
            >
              <Icon className="w-5 h-5" style={{ color }} />
              <span className="text-[11px] text-[#9CA3AF] font-medium">{label}</span>
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
      <div className="px-4 py-3 bg-[#1A1A1A] border-b border-[#2A2A2A]">
        <div className="flex items-center justify-between mb-2">
          <span className={cn('text-[#9CA3AF]', largeText ? 'text-base' : 'text-sm')}>
            {DAY_LABELS[selectedDate]} — {todayPlayers.length} player{todayPlayers.length !== 1 ? 's' : ''}
          </span>
          <span className={cn('text-white font-medium', largeText ? 'text-base' : 'text-sm')}>
            {completedCount}/{todayPlayers.length} done
          </span>
        </div>
        <div className="h-2 bg-[#2A2A2A] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#FFD100] rounded-full transition-all duration-500"
            style={{ width: todayPlayers.length > 0 ? `${(completedCount / todayPlayers.length) * 100}%` : '0%' }}
          />
        </div>
      </div>

      {/* Up Next Module */}
      {nextPlayer && (
        <div className="px-4 py-3 bg-[#FFD100]/5 border-b border-[#FFD100]/20">
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-[#FFD100]" />
            <span className={cn('text-[#FFD100] font-semibold', largeText ? 'text-base' : 'text-sm')}>Up Next</span>
          </div>
          <Link
            href={`/prizm/players/${nextPlayer.player.id}`}
            className="flex items-center gap-3 mt-2 group"
          >
            <PlayerPhoto src={nextPlayer.player.photo} name={nextPlayer.player.name} size="sm" />
            <div className="flex-1 min-w-0">
              <span className={cn('font-semibold text-white group-hover:text-[#FFD100] transition-colors', largeText ? 'text-base' : 'text-sm')}>
                {nextPlayer.player.name}
              </span>
              <span className={cn('text-[#9CA3AF] block', largeText ? 'text-sm' : 'text-xs')}>
                {nextPlayer.player.team} — Arrives {to12h(nextPlayer.arrival.arrivalTime)}
              </span>
            </div>
            <ChevronRight size={16} className="text-[#4B5563] group-hover:text-[#FFD100] transition-colors" />
          </Link>
        </div>
      )}

      {/* Player Arrivals Section */}
      <div className="p-4">
        <h2 className={cn('font-semibold text-white mb-3 flex items-center gap-2', largeText ? 'text-xl' : 'text-lg')}>
          <Users className="w-5 h-5 text-[#FFD100]" />
          Player Schedule
        </h2>

        {arrivals.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-[#6B7280] opacity-50" />
            <p className={cn('text-[#6B7280]', largeText ? 'text-base' : 'text-sm')}>No players scheduled</p>
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
                    'block bg-[#1A1A1A] rounded-xl border overflow-hidden transition-all duration-200 hover:border-[#FFD100]/50 hover:bg-[#1E1E1E] group',
                    isHere ? 'border-[#22c55e]' : isDone ? 'border-[#2A2A2A] opacity-60' : 'border-[#2A2A2A]'
                  )}
                >
                  <div className="p-4 flex items-center gap-3">
                    <PlayerPhoto src={player.photo} name={player.name} size="sm" />

                    {/* Player Info */}
                    <div className="flex-1 min-w-0">
                      <span
                        className={cn(
                          'font-semibold text-white group-hover:text-[#FFD100] transition-colors truncate block',
                          largeText ? 'text-base' : 'text-sm'
                        )}
                      >
                        {player.name}
                      </span>
                      <div className={cn('text-[#9CA3AF] flex items-center gap-2 flex-wrap', largeText ? 'text-sm' : 'text-xs')}>
                        <span>{player.team} — {player.position}</span>
                        {arrival.signingOnly && (
                          <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 text-[10px] font-medium">
                            SIGNING ONLY
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Arrival Time */}
                    <div className="text-right flex-shrink-0">
                      {arrival.status === 'tbd' ? (
                        <span className="px-2 py-1 rounded bg-[#F59E0B]/20 text-[#F59E0B] text-xs font-medium">
                          TBD
                        </span>
                      ) : (
                        <>
                          <div className={cn('text-white font-medium', largeText ? 'text-base' : 'text-sm')}>
                            {to12h(arrival.arrivalTime)}
                          </div>
                          <div className={cn('text-[#6B7280]', largeText ? 'text-sm' : 'text-xs')}>
                            to {to12h(arrival.departureTime)}
                          </div>
                        </>
                      )}
                      {isHere && (
                        <span className="mt-1 inline-block px-2 py-0.5 rounded-full bg-[#22c55e] text-black text-[10px] font-bold animate-pulse">
                          HERE
                        </span>
                      )}
                      {isDone && (
                        <span className="text-[#22c55e] text-xs">Done</span>
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
