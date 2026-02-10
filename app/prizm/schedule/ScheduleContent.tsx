'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import PlayerPhoto from '../components/PlayerPhoto';
import { useAppStore } from '../store';
import { getPlayerById } from '../data/players';
import {
  EVENT_DATES,
  DAY_LABELS,
  getPlayerArrivalsForDay,
  getPRCallsForDay,
  PlayerArrival,
} from '../data/schedule';
import { formatDate } from '../lib/time';
import {
  Clock,
  Phone,
  Users,
  ChevronDown,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../lib/utils';

// Format 24h time to 12h AM/PM
const to12h = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
};

export default function ScheduleContent() {
  const { schedule, largeText } = useAppStore();
  const [selectedDate, setSelectedDate] = useState(EVENT_DATES[0] as string);
  const [showPROnly, setShowPROnly] = useState(false);

  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: hydrate time after mount for SSR safety
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  const today = now ? formatDate(now) : '';

  const arrivals = useMemo(
    () => getPlayerArrivalsForDay(schedule, selectedDate),
    [schedule, selectedDate]
  );

  const prCalls = useMemo(
    () => arrivals.filter((a) => a.prCall !== null),
    [arrivals]
  );

  const displayList = showPROnly ? prCalls : arrivals;

  return (
    <div className="pb-24">
      <Header title="Schedule" />

      {/* Day Tabs */}
      <div className="sticky top-[73px] z-30 bg-[#0D0D0D] border-b border-[#2A2A2A]">
        <div className="flex">
          {EVENT_DATES.map((date, index) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={cn(
                'flex-1 py-3 px-4 text-center transition-colors',
                selectedDate === date
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
          ))}
        </div>
      </div>

      {/* Filter Toggle */}
      <div className="px-4 py-3 bg-[#1A1A1A] border-b border-[#2A2A2A] flex items-center gap-2">
        <button
          onClick={() => setShowPROnly(false)}
          className={cn(
            'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all touch-target',
            !showPROnly ? 'bg-[#FFD100] text-black shadow-sm' : 'bg-[#2A2A2A] text-[#9CA3AF] hover:bg-[#3A3A3A]'
          )}
        >
          <Users className="w-4 h-4 inline mr-1.5" />
          All Players ({arrivals.length})
        </button>
        <button
          onClick={() => setShowPROnly(true)}
          className={cn(
            'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all touch-target',
            showPROnly ? 'bg-[#8B5CF6] text-white shadow-sm' : 'bg-[#2A2A2A] text-[#9CA3AF] hover:bg-[#3A3A3A]'
          )}
        >
          <Phone className="w-4 h-4 inline mr-1.5" />
          PR Interviews ({prCalls.length})
        </button>
      </div>

      {/* Player List */}
      <div className="p-4 space-y-2.5">
        {displayList.length === 0 ? (
          <div className="text-center py-12 px-6">
            <div className="w-16 h-16 rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-[#4B5563]" />
            </div>
            <p className={cn('text-white font-semibold mb-1', largeText ? 'text-lg' : 'text-base')}>
              {showPROnly ? 'No PR interviews scheduled' : 'No players scheduled'}
            </p>
            <p className={cn('text-[#6B7280]', largeText ? 'text-sm' : 'text-xs')}>
              {showPROnly ? 'Switch to All Players to see the full schedule' : 'Select a different day to view its schedule'}
            </p>
          </div>
        ) : (
          displayList.map((arrival) => {
            const player = getPlayerById(arrival.playerId);
            if (!player) return null;

            const currentTime = now
              ? `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
              : '';
            const isHere =
              now !== null &&
              selectedDate === today &&
              arrival.status === 'scheduled' &&
              arrival.arrivalTime <= currentTime &&
              arrival.departureTime > currentTime;
            const isDone =
              now !== null &&
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
                    <span
                      className={cn(
                        'font-semibold text-white group-hover:text-[#FFD100] transition-colors truncate block',
                        largeText ? 'text-base' : 'text-sm'
                      )}
                    >
                      {player.name}
                    </span>
                    <div className={cn('text-[#9CA3AF] flex items-center gap-2', largeText ? 'text-sm' : 'text-xs')}>
                      <span>{player.team} &mdash; {player.position}</span>
                      {arrival.signingOnly && (
                        <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-wider">
                          Signing Only
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Time */}
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
                    {isDone && <span className="text-[#22c55e] text-xs font-medium">Done</span>}
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
                          {to12h(arrival.prCall.time)}
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

                {/* Notes */}
                {arrival.notes && !arrival.signingOnly && (
                  <div className="px-4 pb-3 pt-0">
                    <p className="text-[#6B7280] text-xs italic">{arrival.notes}</p>
                  </div>
                )}
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
