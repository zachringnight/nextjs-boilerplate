'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import ScheduleSlotRow from '../components/ScheduleSlotRow';
import { useAppStore } from '../store';
import { getScheduleForDay, DAY_LABELS, EVENT_DATES } from '../data/schedule';
import { formatDate, isCurrentSlot } from '../lib/time';
import { ChevronDown } from 'lucide-react';

export default function SchedulePage() {
  const { schedule, selectedDay, setSelectedDay, largeText } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const currentSlotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const daySchedule = getScheduleForDay(schedule, selectedDay);

  // Find the current slot index
  const currentSlotIndex = daySchedule.findIndex(slot =>
    isCurrentSlot(slot.date, slot.startTime, slot.endTime)
  );

  // Find the next slot (first future slot)
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const nextSlotIndex = daySchedule.findIndex(slot =>
    slot.date === formatDate(now) && slot.startTime > currentTime
  );

  const scrollToNow = () => {
    currentSlotRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#9CA3AF]">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Schedule" />

      {/* Day Tabs */}
      <div className="sticky top-[73px] z-30 bg-[#0D0D0D] border-b border-[#2A2A2A]">
        <div className="flex">
          {EVENT_DATES.map((date, index) => (
            <button
              key={date}
              onClick={() => setSelectedDay(date as typeof selectedDay)}
              className={`flex-1 py-3 px-4 text-center transition-colors ${
                selectedDay === date
                  ? 'text-[#FFD100] border-b-2 border-[#FFD100] bg-[#FFD100]/5'
                  : 'text-[#9CA3AF] hover:text-white'
              } ${largeText ? 'text-lg' : 'text-base'}`}
            >
              <div className="font-semibold">Day {index + 1}</div>
              <div className={`${largeText ? 'text-sm' : 'text-xs'} opacity-75`}>
                {DAY_LABELS[date]}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Schedule List */}
      <div className="p-4 space-y-2">
        {daySchedule.length === 0 ? (
          <div className="text-center py-12">
            <p className={`text-[#9CA3AF] ${largeText ? 'text-lg' : 'text-base'}`}>
              No scheduled slots for this day
            </p>
          </div>
        ) : (
          daySchedule.map((slot, index) => (
            <div
              key={slot.id}
              ref={index === currentSlotIndex ? currentSlotRef : undefined}
            >
              {/* NEXT badge for upcoming slot */}
              {index === nextSlotIndex && currentSlotIndex === -1 && (
                <div className="flex items-center gap-2 mb-1 ml-2">
                  <span className="px-2 py-0.5 rounded-full bg-[#F59E0B] text-black text-xs font-bold">
                    NEXT
                  </span>
                </div>
              )}
              <ScheduleSlotRow slot={slot} />
            </div>
          ))
        )}
      </div>

      {/* Jump to Now Button */}
      {currentSlotIndex !== -1 && selectedDay === formatDate(new Date()) && (
        <button
          onClick={scrollToNow}
          className="jump-to-now flex items-center gap-2 px-4 py-2 bg-[#22c55e] text-black rounded-full font-semibold shadow-lg hover:bg-[#16a34a] transition-colors"
        >
          <ChevronDown size={20} />
          Jump to Now
        </button>
      )}
    </div>
  );
}
