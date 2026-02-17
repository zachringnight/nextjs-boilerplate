'use client';

import { useState, type KeyboardEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Station, ScheduleSlot } from '../types';
import { getPlayerById } from '../data/players';
import CountdownTimer from './CountdownTimer';
import { useAppStore } from '../store';

interface StationCardProps {
  station: Station;
  currentSlot: ScheduleSlot | null;
  nextSlot: ScheduleSlot | null;
}

export default function StationCard({ station, currentSlot, nextSlot }: StationCardProps) {
  const router = useRouter();
  const { largeText } = useAppStore();
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);
  const currentPlayer = currentSlot ? getPlayerById(currentSlot.playerId) : null;
  const nextPlayer = nextSlot ? getPlayerById(nextSlot.playerId) : null;
  const stationHref = `/prizm/stations?station=${station.id}`;

  const navigateToStation = () => {
    router.push(stationHref);
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      navigateToStation();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={navigateToStation}
      onKeyDown={handleCardKeyDown}
      className="relative bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4 hover:border-[#3A3A3A] transition-all cursor-pointer overflow-hidden"
      style={{ borderLeftColor: station.color, borderLeftWidth: '4px' }}
    >
      {/* Station Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className={largeText ? 'text-2xl' : 'text-xl'}>{station.icon}</span>
        <h3 className={`font-semibold text-white ${largeText ? 'text-lg' : 'text-base'}`}>
          {station.name.replace(' Station', '')}
        </h3>
      </div>

      {/* Current Player */}
      {currentPlayer ? (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full bg-[#2A2A2A] flex items-center justify-center text-xl font-bold text-white overflow-hidden"
              style={{ backgroundColor: station.color + '20' }}
            >
              {currentPlayer.photo && failedPhoto !== currentPlayer.photo ? (
                <Image
                  src={currentPlayer.photo}
                  alt={currentPlayer.name}
                  width={48}
                  height={48}
                  sizes="48px"
                  className="w-full h-full object-cover"
                  onError={() => setFailedPhoto(currentPlayer.photo)}
                />
              ) : (
                currentPlayer.name.charAt(0)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <Link
                href={`/prizm/players/${currentSlot!.playerId}`}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                className={`font-medium text-white hover:text-[#FFD100] transition-colors truncate block ${largeText ? 'text-lg' : 'text-base'}`}
              >
                {currentPlayer.name}
              </Link>
              <p className={`text-[#9CA3AF] truncate ${largeText ? 'text-base' : 'text-sm'}`}>
                {currentPlayer.team.split(' ').pop()}
              </p>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex items-center justify-between">
            <span className={`text-[#9CA3AF] ${largeText ? 'text-base' : 'text-sm'}`}>
              Time left:
            </span>
            <CountdownTimer date={currentSlot!.date} endTime={currentSlot!.endTime} />
          </div>
        </div>
      ) : (
        <div className="py-4 text-center">
          <p className={`text-[#9CA3AF] ${largeText ? 'text-lg' : 'text-base'}`}>
            Available
          </p>
        </div>
      )}

      {/* Next Up */}
      {nextPlayer && (
        <div className={`mt-3 pt-3 border-t border-[#2A2A2A] ${largeText ? 'text-base' : 'text-sm'}`}>
          <span className="text-[#9CA3AF]">Next: </span>
          <span className="text-white">{nextPlayer.name}</span>
          <span className="text-[#9CA3AF]"> @ {nextSlot!.startTime}</span>
        </div>
      )}

      {/* NOW badge */}
      {currentSlot && (
        <div
          className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold text-black animate-pulse"
          style={{ backgroundColor: station.color }}
        >
          NOW
        </div>
      )}
    </div>
  );
}
