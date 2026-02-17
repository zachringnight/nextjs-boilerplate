'use client';

import Link from 'next/link';
import { ScheduleSlot } from '../types';
import { getPlayerById } from '../data/players';
import { getStationById } from '../data/stations';
import { isCurrentSlot, isPastSlot } from '../lib/time';
import { useAppStore } from '../store';
import PlayerPhoto from './PlayerPhoto';

interface ScheduleSlotRowProps {
  slot: ScheduleSlot;
  showPRDetails?: boolean;
}

export default function ScheduleSlotRow({ slot, showPRDetails = false }: ScheduleSlotRowProps) {
  const { largeText } = useAppStore();
  const player = getPlayerById(slot.playerId);
  const station = getStationById(slot.station);

  if (!player || !station) return null;

  const isCurrent = isCurrentSlot(slot.date, slot.startTime, slot.endTime);
  const isPast = isPastSlot(slot.date, slot.endTime);
  const isCancelled = slot.status === 'cancelled';
  const isTBD = slot.status === 'tbd';

  return (
    <Link href={`/prizm/players/${player.id}`}>
      <div
        className={`flex flex-col gap-2 p-3 rounded-xl border transition-all ${
          isTBD
            ? 'bg-[#1A1A1A]/50 border-[#f59e0b]/50 border-dashed'
            : isCancelled
            ? 'bg-[#1A1A1A]/50 border-[#2A2A2A] opacity-50'
            : isCurrent
            ? 'bg-[#22c55e]/10 border-[#22c55e]'
            : isPast
            ? 'bg-[#1A1A1A]/50 border-[#2A2A2A] opacity-60'
            : 'bg-[#1A1A1A] border-[#2A2A2A] hover:border-[#3A3A3A]'
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Time */}
          <div className={`w-20 flex-shrink-0 ${largeText ? 'text-base' : 'text-sm'}`}>
            {isTBD ? (
              <span className="font-mono text-[#f59e0b]">TBD</span>
            ) : (
              <>
                <span className={`font-mono ${isPast ? 'text-[#9CA3AF]' : 'text-white'}`}>
                  {slot.startTime}
                </span>
                <span className="text-[#9CA3AF]"> - </span>
                <span className={`font-mono ${isPast ? 'text-[#9CA3AF]' : 'text-white'}`}>
                  {slot.endTime}
                </span>
              </>
            )}
          </div>

          {/* Player Photo */}
          <PlayerPhoto
            src={player.photo}
            name={player.name}
            size="sm"
            className="!text-lg"
          />

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
            {station.icon} {station.name.replace(' Station', '').replace(' / Buffer', '')}
          </div>

          {/* Status Badge */}
          {isCurrent && (
            <div className="px-2 py-1 rounded-full bg-[#22c55e] text-black text-xs font-bold animate-pulse">
              NOW
            </div>
          )}
          {isPast && !isCancelled && !isTBD && (
            <div className="text-[#22c55e]">✓</div>
          )}
          {isCancelled && (
            <div className="px-2 py-1 rounded-full bg-[#EF4444]/20 text-[#EF4444] text-xs font-medium">
              Cancelled
            </div>
          )}
          {isTBD && (
            <div className="px-2 py-1 rounded-full bg-[#f59e0b]/20 text-[#f59e0b] text-xs font-medium">
              TBD
            </div>
          )}
        </div>

        {/* PR Call Details */}
        {showPRDetails && slot.prCallInfo && (
          <div className="ml-[92px] p-2 bg-[#8b5cf6]/10 rounded-lg border border-[#8b5cf6]/20">
            <div className={`flex flex-wrap gap-x-4 gap-y-1 ${largeText ? 'text-sm' : 'text-xs'}`}>
              <span className="text-[#8b5cf6] font-medium">{slot.prCallInfo.outlet}</span>
              {slot.prCallInfo.contact && (
                <span className="text-[#9CA3AF]">{slot.prCallInfo.contact}</span>
              )}
              {slot.prCallInfo.callIn && (
                <span className="text-white font-mono">{slot.prCallInfo.callIn}</span>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {slot.notes && !slot.prCallInfo && (
          <div className={`ml-[92px] text-[#9CA3AF] italic ${largeText ? 'text-sm' : 'text-xs'}`}>
            {slot.notes}
          </div>
        )}
      </div>
    </Link>
  );
}
