'use client';

import { useState, useEffect } from 'react';
import { players, rotationSchedule, stationUniversalQuestions } from '../../data/players';
import { stationConfig } from '../../components/StationIcon';
import PlayerAvatar from './PlayerAvatar';
import { ChevronDown, ChevronUp, Volume2, Clock, Zap } from 'lucide-react';

type StationType = 'field' | 'social' | 'vnr' | 'packRip';

// Get current time in PST
function getPSTTime(date: Date): { hours: number; minutes: number; seconds: number } {
  const pstString = date.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
  const pstDate = new Date(pstString);
  return {
    hours: pstDate.getHours(),
    minutes: pstDate.getMinutes(),
    seconds: pstDate.getSeconds(),
  };
}

interface StationToolViewProps {
  initialStation?: StationType;
  largeText?: boolean;
}

interface TimeSlotInfo {
  group: string;
  groupNumber: number;
  time: string;
  timeDisplay: string;
  playerName: string;
  startHour: number;
  startMin: number;
  endHour: number;
  endMin: number;
}

function isCurrentSlot(slot: TimeSlotInfo, currentTime: Date): boolean {
  const pst = getPSTTime(currentTime);
  const currentMinutes = pst.hours * 60 + pst.minutes;
  const slotStart = slot.startHour * 60 + slot.startMin;
  const slotEnd = slot.endHour * 60 + slot.endMin;
  return currentMinutes >= slotStart && currentMinutes < slotEnd;
}

function isUpcomingSlot(slot: TimeSlotInfo, currentTime: Date): boolean {
  const pst = getPSTTime(currentTime);
  const currentMinutes = pst.hours * 60 + pst.minutes;
  const slotStart = slot.startHour * 60 + slot.startMin;
  return slotStart > currentMinutes && slotStart <= currentMinutes + 30;
}

function getStationSchedule(station: StationType): TimeSlotInfo[] {
  const schedule: TimeSlotInfo[] = [];

  // Group 1
  const group1Times = [
    { timeDisplay: '9:00 to 9:20', startHour: 9, startMin: 0, endHour: 9, endMin: 20 },
    { timeDisplay: '9:20 to 9:40', startHour: 9, startMin: 20, endHour: 9, endMin: 40 },
    { timeDisplay: '9:40 to 10:00', startHour: 9, startMin: 40, endHour: 10, endMin: 0 },
    { timeDisplay: '10:00 to 10:20', startHour: 10, startMin: 0, endHour: 10, endMin: 20 },
  ];
  rotationSchedule.group1.schedule.forEach((slot, index) => {
    schedule.push({
      group: 'Group 1',
      groupNumber: 1,
      time: slot.time,
      playerName: slot[station],
      ...group1Times[index],
    });
  });

  // Group 2
  const group2Times = [
    { timeDisplay: '10:30 to 10:50', startHour: 10, startMin: 30, endHour: 10, endMin: 50 },
    { timeDisplay: '10:50 to 11:10', startHour: 10, startMin: 50, endHour: 11, endMin: 10 },
    { timeDisplay: '11:10 to 11:30', startHour: 11, startMin: 10, endHour: 11, endMin: 30 },
    { timeDisplay: '11:30 to 11:50', startHour: 11, startMin: 30, endHour: 11, endMin: 50 },
  ];
  rotationSchedule.group2.schedule.forEach((slot, index) => {
    schedule.push({
      group: 'Group 2',
      groupNumber: 2,
      time: slot.time,
      playerName: slot[station],
      ...group2Times[index],
    });
  });

  // Group 3
  const group3Times = [
    { timeDisplay: '1:00 to 1:20', startHour: 13, startMin: 0, endHour: 13, endMin: 20 },
    { timeDisplay: '1:20 to 1:40', startHour: 13, startMin: 20, endHour: 13, endMin: 40 },
    { timeDisplay: '1:40 to 2:00', startHour: 13, startMin: 40, endHour: 14, endMin: 0 },
    { timeDisplay: '2:00 to 2:20', startHour: 14, startMin: 0, endHour: 14, endMin: 20 },
  ];
  rotationSchedule.group3.schedule.forEach((slot, index) => {
    schedule.push({
      group: 'Group 3',
      groupNumber: 3,
      time: slot.time,
      playerName: slot[station],
      ...group3Times[index],
    });
  });

  return schedule;
}

function PlayerSlotCard({
  slot,
  station,
  isExpanded,
  onToggle,
  currentTime,
}: {
  slot: TimeSlotInfo;
  station: StationType;
  isExpanded: boolean;
  onToggle: () => void;
  currentTime: Date;
}) {
  const isBreak = slot.playerName === 'BREAK';
  const player = !isBreak ? players.find(p =>
    `${p.firstName} ${p.lastName}` === slot.playerName
  ) : null;

  const isCurrent = isCurrentSlot(slot, currentTime);
  const isUpcoming = !isCurrent && isUpcomingSlot(slot, currentTime);

  const groupColors = {
    1: 'border-green-500/30 bg-green-500/5',
    2: 'border-amber-500/30 bg-amber-500/5',
    3: 'border-violet-500/30 bg-violet-500/5',
  };

  const groupBadgeColors = {
    1: 'bg-green-500/20 text-green-400',
    2: 'bg-amber-500/20 text-amber-400',
    3: 'bg-violet-500/20 text-violet-400',
  };

  if (isBreak) {
    return (
      <div className={`bg-[#141414] border rounded-xl p-4 ${isCurrent ? 'border-amber-500/50 bg-amber-500/5' : 'border-[#2a2a2a] opacity-50'}`}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-[#0a0a0a] flex items-center justify-center text-gray-600">
            <Clock className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {isCurrent && (
                <span className="flex items-center gap-1 text-amber-400 text-xs font-bold animate-pulse">
                  <Zap className="w-3 h-3" />
                  NOW
                </span>
              )}
              <span className={`text-xs px-2 py-0.5 rounded ${groupBadgeColors[slot.groupNumber as keyof typeof groupBadgeColors]}`}>
                {slot.group}
              </span>
            </div>
            <p className={`text-lg font-mono ${isCurrent ? 'text-amber-400' : 'text-gray-500'}`}>{slot.timeDisplay}</p>
            <p className="text-sm text-gray-600 italic">Break</p>
          </div>
        </div>
      </div>
    );
  }

  if (!player) return null;

  const stationQuestions = player.questions.find(q => q.station === station);
  const config = stationConfig[station];

  return (
    <div className={`bg-[#141414] border rounded-xl overflow-hidden transition-all ${
      isCurrent
        ? 'border-amber-500 ring-2 ring-amber-500/30 shadow-lg shadow-amber-500/10'
        : isUpcoming
        ? 'border-blue-500/50'
        : groupColors[slot.groupNumber as keyof typeof groupColors]
    }`}>
      {/* Header - always visible */}
      <button
        onClick={onToggle}
        className={`w-full p-4 flex items-center gap-4 transition-colors text-left ${
          isCurrent ? 'bg-amber-500/10' : 'hover:bg-[#1a1a1a]'
        }`}
      >
        <PlayerAvatar player={player} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isCurrent && (
              <span className="flex items-center gap-1 bg-amber-500 text-black px-2 py-0.5 rounded text-xs font-bold animate-pulse">
                <Zap className="w-3 h-3" />
                NOW
              </span>
            )}
            {isUpcoming && (
              <span className="flex items-center gap-1 bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-xs">
                <Clock className="w-3 h-3" />
                NEXT
              </span>
            )}
            <span className={`text-xs px-2 py-0.5 rounded ${groupBadgeColors[slot.groupNumber as keyof typeof groupBadgeColors]}`}>
              {slot.group}
            </span>
            <span className="text-xl">{player.flag}</span>
          </div>
          <p className={`text-lg font-bold truncate ${isCurrent ? 'text-amber-400' : ''}`}>
            {player.firstName} {player.lastName}
          </p>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span className={`font-mono ${isCurrent ? 'text-amber-400 font-bold' : ''}`}>{slot.timeDisplay}</span>
            <span>•</span>
            <span>{player.position}</span>
            <span>•</span>
            <span>{player.team}</span>
          </div>
        </div>
        <div className="flex-shrink-0">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-[#2a2a2a]">
          {/* Pronunciation */}
          {player.pronunciation && (
            <div className="px-4 py-3 bg-[#0a0a0a] border-b border-[#2a2a2a]">
              <div className="flex items-center gap-2 text-gray-400">
                <Volume2 className="w-4 h-4" />
                <span className="text-sm italic">{player.pronunciation}</span>
              </div>
            </div>
          )}

          {/* Bio & Talking Points */}
          <div className="p-4 grid md:grid-cols-2 gap-4 border-b border-[#2a2a2a]">
            <div>
              <h4 className="text-xs font-semibold text-gray-500 tracking-wide mb-2">BACKGROUND</h4>
              <ul className="space-y-1.5">
                {player.bio.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="w-1 h-1 bg-gray-600 rounded-full mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-amber-400 tracking-wide mb-2">TALKING POINTS</h4>
              <ul className="space-y-1.5">
                {player.talkingPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="w-1 h-1 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Station Questions */}
          <div className="p-4">
            {/* Station Title & Subtitle */}
            <div className="mb-4">
              <h4 className={`text-sm font-bold ${config.textColor} flex items-center gap-2`}>
                <span className={`w-6 h-6 ${config.bgColor} rounded flex items-center justify-center text-white text-xs`}>
                  {config.icon}
                </span>
                {stationUniversalQuestions[station].title}
              </h4>
              <p className="text-xs text-gray-500 ml-8">{stationUniversalQuestions[station].subtitle}</p>
            </div>

            {/* Universal Questions */}
            <ul className="space-y-4">
              {stationUniversalQuestions[station].questions.map((question, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span
                    className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-sm font-bold text-black flex-shrink-0"
                  >
                    {index + 1}
                  </span>
                  <span className="text-gray-100 leading-relaxed text-lg">{question}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StationToolView({ initialStation = 'field', largeText = false }: StationToolViewProps) {
  const [activeStation, setActiveStation] = useState<StationType>(initialStation);
  const [expandedSlots, setExpandedSlots] = useState<Set<string>>(new Set());
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const stationSchedule = getStationSchedule(activeStation);
  const config = stationConfig[activeStation];

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Los_Angeles',
  });

  const toggleSlot = (slotKey: string) => {
    const newExpanded = new Set(expandedSlots);
    if (newExpanded.has(slotKey)) {
      newExpanded.delete(slotKey);
    } else {
      newExpanded.add(slotKey);
    }
    setExpandedSlots(newExpanded);
  };

  const expandAll = () => {
    const allKeys = stationSchedule
      .map((_, i) => `slot-${i}`)
      .filter((_, i) => stationSchedule[i].playerName !== 'BREAK');
    setExpandedSlots(new Set(allKeys));
  };

  const collapseAll = () => {
    setExpandedSlots(new Set());
  };

  const playerCount = stationSchedule.filter(s => s.playerName !== 'BREAK').length;

  // Find current slot index
  const currentSlotIndex = stationSchedule.findIndex(slot => isCurrentSlot(slot, currentTime));

  // Auto-expand current player on mount/station change
  useEffect(() => {
    if (currentSlotIndex >= 0 && stationSchedule[currentSlotIndex].playerName !== 'BREAK') {
      setExpandedSlots(new Set([`slot-${currentSlotIndex}`]));
    }
  }, [activeStation]); // eslint-disable-line react-hooks/exhaustive-deps

  const jumpToNow = () => {
    if (currentSlotIndex >= 0) {
      setExpandedSlots(new Set([`slot-${currentSlotIndex}`]));
      // Scroll to the element
      const element = document.getElementById(`slot-${currentSlotIndex}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <span className={`w-8 h-8 ${config.bgColor} rounded-lg flex items-center justify-center text-white`}>
              {config.icon}
            </span>
            Station Tool
          </h2>
          <p className="text-sm text-gray-500 mt-1">View all players coming to your station with questions and background</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-amber-400">
            <Clock className="w-4 h-4" />
            <span className="font-mono font-bold">{formattedTime}</span>
          </div>
          <p className="text-xs text-gray-500">Current time</p>
        </div>
      </div>

      {/* Station Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['field', 'social', 'vnr', 'packRip'] as StationType[]).map((station) => {
          const cfg = stationConfig[station];
          const isActive = activeStation === station;
          const displayName = station === 'packRip' ? 'PACK RIP' : station.toUpperCase();

          return (
            <button
              key={station}
              onClick={() => setActiveStation(station)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? `${cfg.bgColor} text-white shadow-lg`
                  : 'bg-[#141414] text-gray-400 hover:bg-[#1a1a1a]'
              }`}
            >
              <span className="text-lg">{cfg.icon}</span>
              {displayName}
            </button>
          );
        })}
      </div>

      {/* Station Info Bar */}
      <div className={`bg-[#141414] border ${config.borderColor} rounded-xl p-4 flex items-center justify-between`}>
        <div>
          <h3 className={`font-bold ${config.textColor} flex items-center gap-2`}>
            <span>{config.icon}</span>
            {activeStation === 'packRip' ? 'PACK RIP' : activeStation.toUpperCase()} STATION
          </h3>
          <p className="text-sm text-gray-500">{playerCount} players today • 20 min each</p>
        </div>
        <div className="flex gap-2">
          {currentSlotIndex >= 0 && (
            <button
              onClick={jumpToNow}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
            >
              <Zap className="w-3 h-3" />
              Jump to Now
            </button>
          )}
          <button
            onClick={expandAll}
            className="text-xs px-3 py-1.5 rounded-lg bg-[#0a0a0a] text-gray-400 hover:text-white transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="text-xs px-3 py-1.5 rounded-lg bg-[#0a0a0a] text-gray-400 hover:text-white transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Player Timeline */}
      <div className="space-y-3">
        {stationSchedule.map((slot, index) => (
          <div key={`slot-${index}`} id={`slot-${index}`}>
            <PlayerSlotCard
              slot={slot}
              station={activeStation}
              isExpanded={expandedSlots.has(`slot-${index}`)}
              onToggle={() => toggleSlot(`slot-${index}`)}
              currentTime={currentTime}
            />
          </div>
        ))}
      </div>

      {/* Footer tip */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 text-sm text-gray-500">
        <strong className="text-gray-400">Tip:</strong> Tap any player card to expand their full profile, background, and interview questions for this station.
      </div>
    </div>
  );
}
