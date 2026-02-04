'use client';

import Link from 'next/link';
import { ScheduleSlot } from '../types';
import { getPlayerById } from '../data/players';
import { getStationById } from '../data/stations';
import { isCurrentSlot, isPastSlot } from '../lib/time';
import { useAppStore } from '../store';

interface ScheduleSlotRowProps {
  slot: ScheduleSlot;
}

export default function ScheduleSlotRow({ slot }: ScheduleSlotRowProps) {
  const { largeText } = useAppStore();
  const player = getPlayerById(slot.playerId);
  const station = getStationById(slot.station);

  if (!player || !station) return null;

  const isCurrent = isCurrentSlot(slot.date, slot.startTime, slot.endTime);
  const isPast = isPastSlot(slot.date, slot.endTime);
  const isCancelled = slot.status === 'cancelled';

  return (
    <Link href={`/prizm/players/${player.id}`}>
      <div
        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
          isCancelled
            ? 'bg-[#1A1A1A]/50 border-[#2A2A2A] opacity-50'
            : isCurrent
            ? 'bg-[#22c55e]/10 border-[#22c55e]'
            : isPast
            ? 'bg-[#1A1A1A]/50 border-[#2A2A2A] opacity-60'
            : 'bg-[#1A1A1A] border-[#2A2A2A] hover:border-[#3A3A3A]'
        }`}
      >
        {/* Time */}
        <div className={`w-20 flex-shrink-0 ${largeText ? 'text-base' : 'text-sm'}`}>
          <span className={`font-mono ${isPast ? 'text-[#9CA3AF]' : 'text-white'}`}>
            {slot.startTime}
          </span>
          <span className="text-[#9CA3AF]"> - </span>
          <span className={`font-mono ${isPast ? 'text-[#9CA3AF]' : 'text-white'}`}>
            {slot.endTime}
          </span>
        </div>

        {/* Player Photo */}
        <div className="w-10 h-10 rounded-full bg-[#2A2A2A] flex items-center justify-center text-lg font-bold text-white overflow-hidden flex-shrink-0">
          {player.photo ? (
            <img
              src={player.photo}
              alt={player.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = player.name.charAt(0);
              }}
            />
          ) : (
            player.name.charAt(0)
          )}
        </div>

        {/* Player Info */}
        <div className="flex-1 min-w-0">
          <p className={`font-medium truncate ${
            isCancelled ? 'line-through text-[#9CA3AF]' : isPast ? 'text-[#9CA3AF]' : 'text-white'
          } ${largeText ? 'text-lg' : 'text-base'}`}>
            {player.name}
          </p>
          <p className={`text-[#9CA3AF] truncate ${largeText ? 'text-base' : 'text-sm'}`}>
            {player.team.split(' ').pop()}
          </p>
        </div>

        {/* Station Badge */}
        <div
          className={`px-2 py-1 rounded-full text-xs font-medium ${largeText ? 'text-sm' : 'text-xs'}`}
          style={{
            backgroundColor: station.color + '20',
            color: station.color
          }}
        >
          {station.icon} {station.name.replace(' Station', '')}
        </div>

        {/* Status Badge */}
        {isCurrent && (
          <div className="px-2 py-1 rounded-full bg-[#22c55e] text-black text-xs font-bold animate-pulse">
            NOW
          </div>
        )}
        {isPast && !isCancelled && (
          <div className="text-[#22c55e]">✓</div>
        )}
        {isCancelled && (
          <div className="px-2 py-1 rounded-full bg-[#EF4444]/20 text-[#EF4444] text-xs font-medium">
            Cancelled
          </div>
        )}
      </div>
    </Link>
  );
}
