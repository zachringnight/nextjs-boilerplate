'use client';

import { useState, useEffect } from 'react';
import Header from './components/Header';
import StationCard from './components/StationCard';
import { stations } from './data/stations';
import { getCurrentSlot, getNextSlot, getPlayersForDay, getCompletedPlayerCount } from './data/schedule';
import { useAppStore } from './store';
import { formatDate, getEventStatus, getDayNumber } from './lib/time';

export default function LiveNowPage() {
  const { schedule, largeText } = useAppStore();
  const [now, setNow] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const today = formatDate(now);
  const status = getEventStatus();
  const dayNum = getDayNumber(today);
  const todayPlayers = getPlayersForDay(schedule, today);
  const completedCount = getCompletedPlayerCount(schedule, today, now);

  const getStatusBanner = () => {
    switch (status) {
      case 'pre-show':
        return {
          text: 'Pre-Show • Starting at 10:00 AM',
          color: 'bg-[#F59E0B]',
          textColor: 'text-black'
        };
      case 'lunch':
        return {
          text: 'Lunch Break • Back at 1:00 PM',
          color: 'bg-[#3B82F6]',
          textColor: 'text-white'
        };
      case 'wrapped':
        return {
          text: "That's a Wrap! See you tomorrow!",
          color: 'bg-[#8B5CF6]',
          textColor: 'text-white'
        };
      case 'off-day':
        return {
          text: 'Event Preview Mode',
          color: 'bg-[#2A2A2A]',
          textColor: 'text-white'
        };
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
    <div>
      <Header title="Live Now" />

      {/* Status Banner */}
      {statusBanner && (
        <div className={`${statusBanner.color} ${statusBanner.textColor} px-4 py-2 text-center font-medium ${largeText ? 'text-lg' : 'text-base'}`}>
          {statusBanner.text}
        </div>
      )}

      {/* Progress Bar */}
      <div className="px-4 py-3 bg-[#1A1A1A] border-b border-[#2A2A2A]">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[#9CA3AF] ${largeText ? 'text-base' : 'text-sm'}`}>
            Day {dayNum} of 3
          </span>
          <span className={`text-white font-medium ${largeText ? 'text-base' : 'text-sm'}`}>
            {completedCount} of {todayPlayers.length} players today
          </span>
        </div>
        <div className="h-2 bg-[#2A2A2A] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#FFD100] rounded-full transition-all duration-500"
            style={{ width: todayPlayers.length > 0 ? `${(completedCount / todayPlayers.length) * 100}%` : '0%' }}
          />
        </div>
      </div>

      {/* Station Grid */}
      <div className="p-4">
        <h2 className={`font-semibold text-white mb-4 ${largeText ? 'text-xl' : 'text-lg'}`}>
          All Stations
        </h2>
        <div className="station-grid">
          {stations.map((station) => {
            const currentSlot = getCurrentSlot(schedule, station.id, now);
            const nextSlot = getNextSlot(schedule, station.id, now);

            return (
              <StationCard
                key={station.id}
                station={station}
                currentSlot={currentSlot}
                nextSlot={nextSlot}
              />
            );
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4 text-center">
            <div className={`text-[#FFD100] font-bold ${largeText ? 'text-3xl' : 'text-2xl'}`}>
              {stations.filter(s => getCurrentSlot(schedule, s.id, now)).length}
            </div>
            <div className={`text-[#9CA3AF] ${largeText ? 'text-base' : 'text-sm'}`}>
              Active Stations
            </div>
          </div>
          <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4 text-center">
            <div className={`text-[#22c55e] font-bold ${largeText ? 'text-3xl' : 'text-2xl'}`}>
              {todayPlayers.length - completedCount}
            </div>
            <div className={`text-[#9CA3AF] ${largeText ? 'text-base' : 'text-sm'}`}>
              Players Remaining
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
