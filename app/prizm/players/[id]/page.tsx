'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getPlayerById, players } from '../../data/players';
import { getScheduleForPlayer, DAY_LABELS } from '../../data/schedule';
import { getStationById } from '../../data/stations';
import { useAppStore } from '../../store';
import { isCurrentSlot, isPastSlot } from '../../lib/time';
import { ArrowLeft, Calendar, Award, CreditCard, Star } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PlayerDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { schedule, largeText } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const player = getPlayerById(id);
  const playerSchedule = getScheduleForPlayer(schedule, id);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0D0D]">
        <div className="text-[#9CA3AF]">Loading...</div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-[#0D0D0D]">
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
      <div className="relative">
        <div className="h-32 bg-gradient-to-b from-[#FFD100]/20 to-[#0D0D0D]" />
        <div className="px-4 -mt-16">
          <div className="flex items-end gap-4">
            {/* Player Photo */}
            <div className="w-28 h-28 rounded-2xl bg-[#1A1A1A] border-4 border-[#0D0D0D] flex items-center justify-center text-4xl font-bold text-white overflow-hidden flex-shrink-0">
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
        {/* Bio */}
        <section className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4">
          <h2 className={`font-semibold text-white flex items-center gap-2 mb-3 ${largeText ? 'text-xl' : 'text-lg'}`}>
            <Star size={20} className="text-[#FFD100]" />
            Bio
          </h2>
          <p className={`text-[#9CA3AF] leading-relaxed ${largeText ? 'text-lg' : 'text-base'}`}>
            {player.bio}
          </p>
        </section>

        {/* Stats */}
        <section className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4">
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
        <section className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4">
          <h2 className={`font-semibold text-white flex items-center gap-2 mb-3 ${largeText ? 'text-xl' : 'text-lg'}`}>
            <CreditCard size={20} className="text-[#FFD100]" />
            Notable Panini Cards
          </h2>
          <div className="flex flex-wrap gap-2">
            {player.cardHistory.map((card, i) => (
              <span
                key={i}
                className={`px-3 py-1.5 rounded-lg bg-[#2A2A2A] text-white ${largeText ? 'text-sm' : 'text-xs'}`}
              >
                {card}
              </span>
            ))}
          </div>
        </section>

        {/* Career Moments */}
        <section className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4">
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

        {/* Schedule */}
        <section className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4">
          <h2 className={`font-semibold text-white flex items-center gap-2 mb-3 ${largeText ? 'text-xl' : 'text-lg'}`}>
            <Calendar size={20} className="text-[#FFD100]" />
            Event Schedule
          </h2>
          {playerSchedule.length === 0 ? (
            <p className={`text-[#9CA3AF] ${largeText ? 'text-base' : 'text-sm'}`}>
              No scheduled appearances
            </p>
          ) : (
            <div className="space-y-2">
              {playerSchedule.map((slot) => {
                const station = getStationById(slot.station);
                const isCurrent = isCurrentSlot(slot.date, slot.startTime, slot.endTime);
                const isPast = isPastSlot(slot.date, slot.endTime);

                return (
                  <div
                    key={slot.id}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      isCurrent
                        ? 'bg-[#22c55e]/10 border border-[#22c55e]'
                        : isPast
                        ? 'bg-[#2A2A2A]/50 opacity-60'
                        : 'bg-[#2A2A2A]'
                    }`}
                  >
                    <div className={`flex-1 ${largeText ? 'text-base' : 'text-sm'}`}>
                      <div className="text-white font-medium">
                        {DAY_LABELS[slot.date]} • {slot.startTime} - {slot.endTime}
                      </div>
                      <div className="text-[#9CA3AF]" style={{ color: station?.color }}>
                        {station?.icon} {station?.name}
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="px-2 py-1 rounded-full bg-[#22c55e] text-black text-xs font-bold animate-pulse">
                        NOW
                      </span>
                    )}
                    {isPast && (
                      <span className="text-[#22c55e]">✓</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
