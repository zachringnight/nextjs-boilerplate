'use client';

import { useState, useEffect, useMemo } from 'react';
import { useMounted } from './hooks/useMounted';
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
} from 'lucide-react';
import { cn } from './lib/utils';

// Format 24h time to 12h AM/PM
const to12h = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
};

export default function DailyOverviewPage() {
  const {
    schedule,
    largeText,
  } = useAppStore();

  const [selectedDate, setSelectedDate] = useState(EVENT_DATES[0] as string);
  const mounted = useMounted();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const today = formatDate(now);
  const status = getEventStatus();
  const dayNum = getDayNumber(selectedDate);
  const todayPlayers = getPlayersForDay(schedule, selectedDate);
  const completedCount = getCompletedPlayerCount(schedule, selectedDate, now);

  // Player arrivals for the selected day
  const arrivals = useMemo(
    () => getPlayerArrivalsForDay(schedule, selectedDate),
    [schedule, selectedDate]
  );

  const getStatusBanner = () => {
    switch (status) {
      case 'pre-show':
        return { text: 'Pre-Show — Starting at 10:00 AM', color: 'bg-[#F59E0B]', textColor: 'text-black' };
      case 'lunch':
        return { text: 'Lunch Break — Back at 1:00 PM', color: 'bg-[#3B82F6]', textColor: 'text-white' };
      case 'wrapped':
        return { text: "That's a Wrap! See you tomorrow!", color: 'bg-[#8B5CF6]', textColor: 'text-white' };
      case 'off-day':
        return { text: 'Event Preview Mode', color: 'bg-[#2A2A2A]', textColor: 'text-white' };
      default:
        return null;
    }
  };

  const statusBanner = getStatusBanner();

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#9CA3AF]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <Header title="Daily Overview" />

      {/* Status Banner */}
      {statusBanner && (
        <div className={`${statusBanner.color} ${statusBanner.textColor} px-4 py-2 text-center font-medium ${largeText ? 'text-lg' : 'text-base'}`}>
          {statusBanner.text}
        </div>
      )}

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

      {/* ======================== */}
      {/* PLAYER ARRIVALS SECTION  */}
      {/* ======================== */}
      <div className="p-4">
        <h2 className={cn('font-semibold text-white mb-3 flex items-center gap-2', largeText ? 'text-xl' : 'text-lg')}>
          <Users className="w-5 h-5 text-[#FFD100]" />
          Player Schedule
        </h2>

        {arrivals.length === 0 ? (
          <div className="text-center py-8 text-[#6B7280]">No players scheduled</div>
        ) : (
          <div className="space-y-2">
            {arrivals.map((arrival) => {
              const player = getPlayerById(arrival.playerId);
              if (!player) return null;

              const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
              const isHere =
                selectedDate === today &&
                arrival.status === 'scheduled' &&
                arrival.arrivalTime <= currentTime &&
                arrival.departureTime > currentTime;
              const isDone =
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
