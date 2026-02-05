'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Header from './components/Header';
import { useAppStore } from './store';
import { getPlayerById, players } from './data/players';
import {
  EVENT_DATES,
  DAY_LABELS,
  getPlayerArrivalsForDay,
  getPlayersForDay,
  getCompletedPlayerCount,
} from './data/schedule';
import {
  ChecklistCategory,
  EventDay,
  CHECKLIST_CATEGORIES,
  EVENT_DAYS,
} from './types';
import { formatDate, getEventStatus, getDayNumber } from './lib/time';
import {
  Clock,
  Phone,
  Users,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronRight,
  Settings,
  Video,
  Package,
  Trash2,
  Plus,
  ExternalLink,
} from 'lucide-react';
import { cn } from './lib/utils';

// Checklist category config (matches checklist page)
const categoryConfig: Record<
  ChecklistCategory,
  { icon: typeof Settings; color: string; label: string }
> = {
  setup: { icon: Settings, color: 'bg-blue-500', label: 'Setup' },
  player: { icon: Users, color: 'bg-purple-500', label: 'Player' },
  content: { icon: Video, color: 'bg-green-500', label: 'Content' },
  teardown: { icon: Package, color: 'bg-amber-500', label: 'Teardown' },
};

const dayColors: Record<EventDay, string> = {
  Thursday: 'bg-blue-600',
  Friday: 'bg-purple-600',
  Saturday: 'bg-amber-600',
};

// Map date strings to EventDay labels for checklist lookup
const dateToEventDay: Record<string, EventDay> = {
  '2026-02-06': 'Thursday',
  '2026-02-07': 'Friday',
  '2026-02-08': 'Saturday',
};

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
    checklist,
    toggleChecklistItem,
    removeChecklistItem,
    getChecklistByDay,
    getChecklistProgress,
  } = useAppStore();

  const [selectedDate, setSelectedDate] = useState(EVENT_DATES[0] as string);
  const [mounted, setMounted] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<ChecklistCategory>>(
    new Set(['setup', 'player', 'content', 'teardown'])
  );
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    setMounted(true);
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

  // Checklist items for the selected day
  const eventDay = dateToEventDay[selectedDate] || 'Thursday';
  const dayItems = useMemo(() => {
    const items = getChecklistByDay(eventDay);
    const grouped: Record<ChecklistCategory, typeof items> = {
      setup: [],
      player: [],
      content: [],
      teardown: [],
    };
    items.forEach((item) => grouped[item.category].push(item));
    return grouped;
  }, [checklist, eventDay, getChecklistByDay]);

  const checklistProgress = getChecklistProgress(eventDay);

  const toggleCategory = (category: ChecklistCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

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

  const getPriorityColor = (priority?: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-amber-400';
      case 'low': return 'text-green-400';
      default: return 'text-zinc-400';
    }
  };

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
                <div
                  key={arrival.playerId}
                  className={cn(
                    'bg-[#1A1A1A] rounded-xl border overflow-hidden transition-all',
                    isHere ? 'border-[#22c55e]' : isDone ? 'border-[#2A2A2A] opacity-60' : 'border-[#2A2A2A]'
                  )}
                >
                  <div className="p-4 flex items-center gap-3">
                    {/* Player Photo */}
                    <div className="w-10 h-10 rounded-full bg-[#2A2A2A] flex items-center justify-center text-sm font-bold text-white overflow-hidden flex-shrink-0">
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
                      <Link
                        href={`/prizm/players/${player.id}`}
                        className={cn(
                          'font-semibold text-white hover:text-[#FFD100] transition-colors truncate block',
                          largeText ? 'text-base' : 'text-sm'
                        )}
                      >
                        {player.name}
                      </Link>
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
                          <a
                            href={`tel:${arrival.prCall.callIn}`}
                            className="text-[#8B5CF6] text-xs font-mono hover:underline flex-shrink-0"
                          >
                            {arrival.prCall.callIn}
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ======================== */}
      {/* PRODUCTION CHECKLIST     */}
      {/* ======================== */}
      <div className="px-4 pb-4">
        <h2 className={cn('font-semibold text-white mb-3 flex items-center gap-2', largeText ? 'text-xl' : 'text-lg')}>
          <CheckSquare className="w-5 h-5 text-green-500" />
          Production Checklist
          <span className={cn('ml-auto font-normal text-[#9CA3AF]', largeText ? 'text-sm' : 'text-xs')}>
            {checklistProgress.completed}/{checklistProgress.total}
          </span>
        </h2>

        {/* Checklist progress bar */}
        <div className="bg-[#1A1A1A] rounded-lg p-3 mb-3 border border-[#2A2A2A]">
          <div className="h-2 bg-[#2A2A2A] rounded-full overflow-hidden">
            <div
              className={cn('h-full transition-all duration-300', dayColors[eventDay])}
              style={{ width: `${checklistProgress.percentage}%` }}
            />
          </div>
        </div>

        {/* Checklist Categories */}
        <div className="space-y-3">
          {CHECKLIST_CATEGORIES.map((category) => {
            const config = categoryConfig[category];
            const Icon = config.icon;
            const items = dayItems[category];
            const isExpanded = expandedCategories.has(category);
            const completedCat = items.filter((i) => i.completed).length;

            // Hide empty teardown on non-Saturday
            if (items.length === 0 && category === 'teardown' && eventDay !== 'Saturday') {
              return null;
            }

            return (
              <div key={category} className="bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] overflow-hidden">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-4 hover:bg-[#2A2A2A]/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(config.color, 'p-2 rounded-lg')}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-white">{config.label}</div>
                      <div className="text-xs text-[#6B7280]">
                        {completedCat}/{items.length} completed
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {items.length > 0 && (
                      <div className="h-2 w-16 bg-[#2A2A2A] rounded-full overflow-hidden">
                        <div
                          className={cn('h-full transition-all duration-300', config.color)}
                          style={{ width: items.length > 0 ? `${(completedCat / items.length) * 100}%` : '0%' }}
                        />
                      </div>
                    )}
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-[#6B7280]" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-[#6B7280]" />
                    )}
                  </div>
                </button>

                {/* Category Items */}
                {isExpanded && items.length > 0 && (
                  <div className="border-t border-[#2A2A2A]">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 p-4 border-b border-[#2A2A2A] last:border-b-0"
                      >
                        <button
                          onClick={() => toggleChecklistItem(item.id)}
                          className="mt-0.5 flex-shrink-0"
                        >
                          {item.completed ? (
                            <CheckSquare className="w-5 h-5 text-green-500" />
                          ) : (
                            <Square className="w-5 h-5 text-[#6B7280] hover:text-[#9CA3AF]" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className={cn('font-medium', item.completed ? 'text-[#6B7280] line-through' : 'text-white')}>
                            {item.title}
                          </div>
                          {item.description && (
                            <div className="text-sm text-[#6B7280] mt-0.5">{item.description}</div>
                          )}
                          {item.priority && (
                            <span className={cn('text-xs', getPriorityColor(item.priority))}>
                              {item.priority}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {isExpanded && items.length === 0 && (
                  <div className="p-4 text-center text-[#6B7280] text-sm border-t border-[#2A2A2A]">
                    No {config.label.toLowerCase()} tasks for {eventDay}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
