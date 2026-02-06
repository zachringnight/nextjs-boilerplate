'use client';

import { Suspense, useState, useEffect } from 'react';
import { useMounted } from '../hooks/useMounted';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '../components/Header';
import PlayerPhoto from '../components/PlayerPhoto';
import { useAppStore } from '../store';
import { stations, getStationById } from '../data/stations';
import { getScheduleForStation } from '../data/schedule';
import { getPlayerById } from '../data/players';
import { isCurrentSlot, isPastSlot } from '../lib/time';
import { StationId } from '../types';
import { ChevronDown, ChevronUp, Expand, Minimize, ExternalLink } from 'lucide-react';

function StationsContent() {
  const searchParams = useSearchParams();
  const initialStation = (searchParams.get('station') as StationId) || 'signing';
  const { schedule, selectedStation, setSelectedStation, selectedDay, largeText } = useAppStore();
  const [expandedSlots, setExpandedSlots] = useState<Set<string>>(new Set());
  const [expandAll, setExpandAll] = useState(false);
  const mounted = useMounted();

  useEffect(() => {
    if (initialStation && stations.some(s => s.id === initialStation)) {
      setSelectedStation(initialStation);
    }
  }, [initialStation, setSelectedStation]);

  const station = getStationById(selectedStation);
  const stationSchedule = getScheduleForStation(schedule, selectedStation, selectedDay);
  const isQuestionStation = selectedStation === 'signing' || selectedStation === 'packRip';

  const getPlayerQuestions = (stationId: StationId, playerId: string) => {
    const player = getPlayerById(playerId);
    if (!player) return [];
    if (stationId === 'signing') {
      return player.questions?.signing ?? [];
    }
    if (stationId === 'packRip') {
      return player.questions?.packRip ?? [];
    }
    return [];
  };

  const toggleSlot = (slotId: string) => {
    setExpandedSlots(prev => {
      const next = new Set(prev);
      if (next.has(slotId)) {
        next.delete(slotId);
      } else {
        next.add(slotId);
      }
      return next;
    });
  };

  const toggleExpandAll = () => {
    if (expandAll) {
      setExpandedSlots(new Set());
    } else {
      setExpandedSlots(new Set(stationSchedule.map(s => s.id)));
    }
    setExpandAll(!expandAll);
  };

  // Auto-expand current slot
  useEffect(() => {
    const currentSlot = stationSchedule.find(slot =>
      isCurrentSlot(slot.date, slot.startTime, slot.endTime)
    );
    if (currentSlot) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: auto-expand current time slot
      setExpandedSlots(prev => new Set([...prev, currentSlot.id]));
    }
  }, [stationSchedule]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#9CA3AF]">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Station Tool" />

      {/* Station Tabs */}
      <div className="sticky top-[73px] z-30 bg-[#0D0D0D] border-b border-[#2A2A2A] overflow-x-auto">
        <div className="flex min-w-max">
          {stations.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedStation(s.id)}
              className={`flex-1 min-w-[80px] py-3 px-3 text-center transition-colors ${
                selectedStation === s.id
                  ? 'border-b-2 bg-opacity-10'
                  : 'text-[#9CA3AF] hover:text-white'
              } ${largeText ? 'text-base' : 'text-sm'}`}
              style={{
                borderColor: selectedStation === s.id ? s.color : 'transparent',
                color: selectedStation === s.id ? s.color : undefined,
                backgroundColor: selectedStation === s.id ? s.color + '10' : undefined
              }}
            >
              <div className="text-xl">{s.icon}</div>
              <div className="font-medium truncate">{s.name.replace(' Station', '').replace(' / Buffer', '')}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Expand All Toggle */}
      <div className="px-4 py-2 flex justify-end border-b border-[#2A2A2A]">
        <button
          onClick={toggleExpandAll}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1A1A1A] hover:bg-[#2A2A2A] transition-colors ${
            largeText ? 'text-base' : 'text-sm'
          }`}
        >
          {expandAll ? <Minimize size={16} /> : <Expand size={16} />}
          {expandAll ? 'Collapse All' : 'Expand All'}
        </button>
      </div>

      {/* Station Schedule */}
      <div className="p-4 space-y-3">
        {stationSchedule.length === 0 ? (
          <div className="text-center py-12">
            <p className={`text-[#9CA3AF] ${largeText ? 'text-lg' : 'text-base'}`}>
              No scheduled players for this station today
            </p>
          </div>
        ) : (
          stationSchedule.map((slot) => {
            const player = getPlayerById(slot.playerId);
            if (!player) return null;

            const isCurrent = isCurrentSlot(slot.date, slot.startTime, slot.endTime);
            const isPast = isPastSlot(slot.date, slot.endTime);
            const isExpanded = expandedSlots.has(slot.id);
            const playerQuestions = isQuestionStation
              ? getPlayerQuestions(selectedStation, player.id)
              : [];

            return (
              <div
                key={slot.id}
                className={`rounded-xl border overflow-hidden transition-all ${
                  isCurrent
                    ? 'border-[#22c55e] bg-[#22c55e]/5'
                    : isPast
                    ? 'border-[#2A2A2A] bg-[#1A1A1A]/50 opacity-60'
                    : 'border-[#2A2A2A] bg-[#1A1A1A]'
                }`}
              >
                {/* Player Row */}
                <button
                  onClick={() => toggleSlot(slot.id)}
                  className="w-full flex items-center gap-3 p-4"
                >
                  {/* Time */}
                  <div className={`w-20 flex-shrink-0 text-left ${largeText ? 'text-base' : 'text-sm'}`}>
                    <span className="font-mono text-white">{slot.startTime}</span>
                    <span className="text-[#9CA3AF]"> - </span>
                    <span className="font-mono text-white">{slot.endTime}</span>
                  </div>

                  <PlayerPhoto src={player.photo} name={player.name} size="lg" />

                  {/* Player Info */}
                  <div className="flex-1 text-left">
                    <p className={`font-semibold text-white ${largeText ? 'text-lg' : 'text-base'}`}>
                      {player.name}
                    </p>
                    <p className={`text-[#9CA3AF] ${largeText ? 'text-base' : 'text-sm'}`}>
                      {player.team} • {player.position}
                    </p>
                  </div>

                  {/* Status + Expand */}
                  <div className="flex items-center gap-2">
                    {isCurrent && (
                      <span className="px-2 py-1 rounded-full bg-[#22c55e] text-black text-xs font-bold animate-pulse">
                        NOW
                      </span>
                    )}
                    {isPast && (
                      <span className="text-[#22c55e] text-lg">✓</span>
                    )}
                    {!isCurrent && !isPast && (
                      <span className="px-2 py-1 rounded-full bg-[#2A2A2A] text-[#9CA3AF] text-xs">
                        Upcoming
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp size={20} className="text-[#9CA3AF]" />
                    ) : (
                      <ChevronDown size={20} className="text-[#9CA3AF]" />
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-[#2A2A2A] pt-4 space-y-4">
                    {/* PR Call Info */}
                    {slot.prCallInfo && (
                      <div className="p-3 rounded-lg bg-[#8b5cf6]/10 border border-[#8b5cf6]/30">
                        <h4 className={`font-semibold text-[#8b5cf6] mb-2 ${largeText ? 'text-base' : 'text-sm'}`}>
                          📞 Media Contact
                        </h4>
                        <div className={`space-y-1 ${largeText ? 'text-base' : 'text-sm'}`}>
                          <p className="text-white font-medium">{slot.prCallInfo.outlet}</p>
                          {slot.prCallInfo.contact && (
                            <p className="text-[#9CA3AF]">Contact: {slot.prCallInfo.contact}</p>
                          )}
                          {slot.prCallInfo.callIn && (
                            <p className="text-white font-mono">Call-in: {slot.prCallInfo.callIn}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {slot.notes && (
                      <div className={`text-[#9CA3AF] italic ${largeText ? 'text-base' : 'text-sm'}`}>
                        Note: {slot.notes}
                      </div>
                    )}

                    {/* Bio */}
                    <div>
                      <h4 className={`font-semibold text-[#FFD100] mb-2 ${largeText ? 'text-base' : 'text-sm'}`}>
                        Bio
                      </h4>
                      <p className={`text-[#9CA3AF] ${largeText ? 'text-base' : 'text-sm'}`}>
                        {player.bio}
                      </p>
                    </div>

                    {/* Station Questions */}
                    {station && isQuestionStation && (
                      <div>
                        <h4 className={`font-semibold mb-2 ${largeText ? 'text-base' : 'text-sm'}`} style={{ color: station.color }}>
                          {station.icon} Talking Points
                        </h4>
                        <ul className={`space-y-2 ${largeText ? 'text-base' : 'text-sm'}`}>
                          {(playerQuestions.length > 0
                            ? playerQuestions.map(q => q.text)
                            : station.questions
                          ).map((q, i) => (
                            <li key={i} className="flex items-start gap-2 text-white">
                              <span className="text-[#FFD100]">•</span>
                              {q}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Notable Cards */}
                    {player.cardHistory.length > 0 && (
                      <div>
                        <h4 className={`font-semibold text-[#FFD100] mb-2 ${largeText ? 'text-base' : 'text-sm'}`}>
                          Notable Prizm Cards
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {player.cardHistory.slice(0, 3).map((card, i) => (
                            <span
                              key={i}
                              className={`px-2 py-1 rounded-lg bg-[#2A2A2A] text-white ${largeText ? 'text-sm' : 'text-xs'}`}
                            >
                              {card}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* View Profile Link */}
                    <Link
                      href={`/prizm/players/${player.id}`}
                      className="flex items-center gap-2 text-[#FFD100] hover:text-[#FFE44D] transition-colors text-sm font-medium pt-2"
                    >
                      <ExternalLink size={14} />
                      View Full Player Profile
                    </Link>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function StationsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#9CA3AF]">Loading...</div>
      </div>
    }>
      <StationsContent />
    </Suspense>
  );
}
