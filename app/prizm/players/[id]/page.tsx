'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getPlayerById } from '../../data/players';
import { getPlayerArrivalsForDay, DAY_LABELS, EVENT_DATES } from '../../data/schedule';
import { stations, checklistStations } from '../../data/stations';
import { useAppStore } from '../../store';
import { StationId } from '../../types';
import PlayerPhoto from '../../components/PlayerPhoto';
import { ArrowLeft, Calendar, Award, CreditCard, Star, ClipboardCheck, Phone } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PageProps {
  params: Promise<{ id: string }>;
}

// Format 24h time to 12h AM/PM
const to12h = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
};

export default function PlayerDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const {
    schedule,
    largeText,
    togglePlayerStation,
    isStationCompleted,
    getPlayerProgress,
  } = useAppStore();

  const player = getPlayerById(id);
  const progress = getPlayerProgress(id);

  // Compute simplified arrival info across all days
  const arrivalsByDay = EVENT_DATES.map((date) => {
    const arrivals = getPlayerArrivalsForDay(schedule, date);
    return arrivals.find((a) => a.playerId === id) || null;
  }).filter(Boolean);

  const getStation = (stationId: StationId) => stations.find((s) => s.id === stationId);

  if (!player) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white">
        <div className="p-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#9CA3AF] hover:text-white"
          >
            <ArrowLeft size={20} />
            Back
          </button>
        </div>
        <div className="text-center py-12">
          <p className="text-[#9CA3AF] text-lg">Player not found</p>
          <Link href="/prizm/players" className="text-[#FFD100] hover:underline mt-2 block">
            View all players
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] pb-24">
      {/* Back Button */}
      <div className="sticky top-0 z-40 bg-[#0D0D0D]/95 backdrop-blur-sm border-b border-[#2A2A2A] px-4 py-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#9CA3AF] hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span className={largeText ? 'text-lg' : 'text-base'}>Back</span>
        </button>
      </div>

      {/* Hero Section */}
      <div className="relative animate-[fadeIn_0.4s_ease-out]">
        <div className="h-32 bg-gradient-to-b from-[#FFD100]/20 to-[#0D0D0D]" />
        <div className="px-4 -mt-16">
          <div className="flex items-end gap-4">
            <PlayerPhoto
              src={player.photo}
              name={player.name}
              size="xl"
              className="rounded-2xl border-4 border-[#0D0D0D] shadow-xl"
            />

            {/* Player Info */}
            <div className="pb-2">
              <h1 className={`font-bold text-white ${largeText ? 'text-3xl' : 'text-2xl'}`}>
                {player.name}
              </h1>
              <p className={`text-[#FFD100] ${largeText ? 'text-lg' : 'text-base'}`}>
                {player.position}
              </p>
              <p className={`text-[#9CA3AF] ${largeText ? 'text-base' : 'text-sm'}`}>
                {player.team}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Schedule (arrival times + PR info) */}
        <section className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4 animate-[fadeIn_0.4s_ease-out_0.05s_both]">
          <h2 className={cn('font-semibold text-white flex items-center gap-2 mb-3', largeText ? 'text-xl' : 'text-lg')}>
            <Calendar size={20} className="text-[#FFD100]" />
            Event Schedule
          </h2>
          {arrivalsByDay.length === 0 ? (
            <p className={cn('text-[#9CA3AF]', largeText ? 'text-base' : 'text-sm')}>
              No scheduled appearances
            </p>
          ) : (
            <div className="space-y-3">
              {arrivalsByDay.map((arrival) => {
                if (!arrival) return null;
                return (
                  <div key={arrival.date} className="bg-[#2A2A2A] rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn('text-white font-medium', largeText ? 'text-base' : 'text-sm')}>
                        {DAY_LABELS[arrival.date]}
                      </span>
                      {arrival.status === 'tbd' ? (
                        <span className="px-2 py-0.5 rounded bg-[#F59E0B]/20 text-[#F59E0B] text-xs font-medium">
                          TBD
                        </span>
                      ) : (
                        <span className={cn('text-[#FFD100] font-medium', largeText ? 'text-base' : 'text-sm')}>
                          {to12h(arrival.arrivalTime)} — {to12h(arrival.departureTime)}
                        </span>
                      )}
                    </div>
                    {arrival.signingOnly && (
                      <span className="text-purple-400 text-xs">Signing only</span>
                    )}
                    {arrival.prCall && (
                      <div className="flex items-center gap-2 mt-2 bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 rounded-lg px-3 py-2">
                        <Phone className="w-3.5 h-3.5 text-[#8B5CF6] flex-shrink-0" />
                        <div className={cn('flex-1 min-w-0', largeText ? 'text-sm' : 'text-xs')}>
                          <span className="text-[#8B5CF6] font-medium">PR {to12h(arrival.prCall.time)}</span>
                          <span className="text-[#9CA3AF]"> — {arrival.prCall.outlet}</span>
                          {arrival.prCall.contact && (
                            <span className="text-[#6B7280]"> ({arrival.prCall.contact})</span>
                          )}
                        </div>
                        {arrival.prCall.callIn && arrival.prCall.callIn !== 'TBD' && (
                          <a
                            href={`tel:${arrival.prCall.callIn}`}
                            className="text-[#8B5CF6] text-xs font-mono hover:underline flex-shrink-0"
                          >
                            {arrival.prCall.callIn}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Station Checklist */}
        <section className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4 animate-[fadeIn_0.4s_ease-out_0.1s_both]">
          <h2 className={cn('font-semibold text-white flex items-center gap-2 mb-1', largeText ? 'text-xl' : 'text-lg')}>
            <ClipboardCheck size={20} className="text-[#FFD100]" />
            Station Checklist
          </h2>
          <p className={cn('text-[#9CA3AF] mb-3', largeText ? 'text-base' : 'text-sm')}>
            {progress.completed}/{progress.total} stations completed
          </p>

          {/* Progress bar */}
          <div className="h-2 bg-[#2A2A2A] rounded-full overflow-hidden mb-4">
            <div
              className="h-full transition-all duration-500 ease-out"
              style={{
                width: `${progress.percentage}%`,
                backgroundColor: progress.percentage === 100 ? '#22c55e' : '#FFD100',
              }}
            />
          </div>

          {/* Station Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {checklistStations.map((stationId) => {
              const station = getStation(stationId);
              if (!station) return null;
              const completed = isStationCompleted(id, stationId);

              return (
                <button
                  key={stationId}
                  onClick={() => togglePlayerStation(id, stationId)}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-lg border transition-all duration-200',
                    completed
                      ? 'bg-green-500/20 border-green-500/50'
                      : 'bg-[#0D0D0D] border-[#2A2A2A] hover:border-[#FFD100]/50'
                  )}
                >
                  {/* Checkbox */}
                  <div
                    className={cn(
                      'w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all duration-200',
                      completed ? 'bg-green-500' : 'border-2 border-[#4B5563]'
                    )}
                  >
                    {completed && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>

                  {/* Station Info */}
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span>{station.icon}</span>
                    <span
                      className={cn(
                        'truncate',
                        largeText ? 'text-sm' : 'text-xs',
                        completed ? 'text-green-400' : 'text-white'
                      )}
                    >
                      {station.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Bio */}
        <section className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4 animate-[fadeIn_0.4s_ease-out_0.15s_both]">
          <h2 className={`font-semibold text-white flex items-center gap-2 mb-3 ${largeText ? 'text-xl' : 'text-lg'}`}>
            <Star size={20} className="text-[#FFD100]" />
            Bio
          </h2>
          <p className={`text-[#9CA3AF] leading-relaxed ${largeText ? 'text-lg' : 'text-base'}`}>
            {player.bio}
          </p>
        </section>

        {/* Stats */}
        <section className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4 animate-[fadeIn_0.4s_ease-out_0.2s_both]">
          <h2 className={`font-semibold text-white flex items-center gap-2 mb-3 ${largeText ? 'text-xl' : 'text-lg'}`}>
            <Award size={20} className="text-[#FFD100]" />
            Career Highlights
          </h2>
          <div className="space-y-2">
            {player.stats.map((stat, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 ${largeText ? 'text-base' : 'text-sm'}`}
              >
                <span className="text-[#FFD100]">•</span>
                <span className="text-white">{stat}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Card History */}
        <section className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4 animate-[fadeIn_0.4s_ease-out_0.25s_both]">
          <h2 className={`font-semibold text-white flex items-center gap-2 mb-3 ${largeText ? 'text-xl' : 'text-lg'}`}>
            <CreditCard size={20} className="text-[#FFD100]" />
            Notable Panini Cards
          </h2>
          <div className="flex flex-wrap gap-2">
            {player.cardHistory.map((card, i) => (
              <span
                key={i}
                className={`px-3 py-1.5 rounded-lg bg-[#2A2A2A] text-white border border-[#3A3A3A] ${largeText ? 'text-sm' : 'text-xs'}`}
              >
                {card}
              </span>
            ))}
          </div>
        </section>

        {/* Career Moments */}
        <section className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4 animate-[fadeIn_0.4s_ease-out_0.3s_both]">
          <h2 className={`font-semibold text-white flex items-center gap-2 mb-3 ${largeText ? 'text-xl' : 'text-lg'}`}>
            <Star size={20} className="text-[#FFD100]" />
            Career Moments
          </h2>
          <div className="space-y-2">
            {player.moments.map((moment, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 ${largeText ? 'text-base' : 'text-sm'}`}
              >
                <span className="text-[#FFD100]">{i + 1}.</span>
                <span className="text-white">{moment}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
