'use client';

import { useState, useEffect } from 'react';
import { players, rotationSchedule } from '../../data/players';
import { stationConfig } from '../../components/StationIcon';
import PlayerAvatar from './PlayerAvatar';
import { Clock, Zap, ChevronRight, Volume2 } from 'lucide-react';

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

interface TimeSlotData {
  startHour: number;
  startMin: number;
  endHour: number;
  endMin: number;
}

const allTimeSlots: Array<TimeSlotData & { group: number }> = [
  // Group 1
  { startHour: 9, startMin: 0, endHour: 9, endMin: 20, group: 1 },
  { startHour: 9, startMin: 20, endHour: 9, endMin: 40, group: 1 },
  { startHour: 9, startMin: 40, endHour: 10, endMin: 0, group: 1 },
  { startHour: 10, startMin: 0, endHour: 10, endMin: 20, group: 1 },
  // Group 2
  { startHour: 10, startMin: 30, endHour: 10, endMin: 50, group: 2 },
  { startHour: 10, startMin: 50, endHour: 11, endMin: 10, group: 2 },
  { startHour: 11, startMin: 10, endHour: 11, endMin: 30, group: 2 },
  { startHour: 11, startMin: 30, endHour: 11, endMin: 50, group: 2 },
  // Group 3
  { startHour: 13, startMin: 0, endHour: 13, endMin: 20, group: 3 },
  { startHour: 13, startMin: 20, endHour: 13, endMin: 40, group: 3 },
  { startHour: 13, startMin: 40, endHour: 14, endMin: 0, group: 3 },
  { startHour: 14, startMin: 0, endHour: 14, endMin: 20, group: 3 },
];

function getCurrentSlotInfo(currentTime: Date): { slot: TimeSlotData & { group: number }; index: number } | null {
  const pst = getPSTTime(currentTime);
  const currentMinutes = pst.hours * 60 + pst.minutes;

  for (let i = 0; i < allTimeSlots.length; i++) {
    const slot = allTimeSlots[i];
    const slotStart = slot.startHour * 60 + slot.startMin;
    const slotEnd = slot.endHour * 60 + slot.endMin;
    if (currentMinutes >= slotStart && currentMinutes < slotEnd) {
      return { slot, index: i };
    }
  }
  return null;
}

function getTimeRemaining(slot: TimeSlotData, currentTime: Date): { minutes: number; seconds: number } {
  const pst = getPSTTime(currentTime);
  const now = pst.hours * 60 * 60 + pst.minutes * 60 + pst.seconds;
  const end = slot.endHour * 60 * 60 + slot.endMin * 60;
  const remaining = Math.max(0, end - now);
  return {
    minutes: Math.floor(remaining / 60),
    seconds: remaining % 60,
  };
}

function getCurrentStationAssignments(group: number, slotIndex: number): Record<StationType, string> {
  const scheduleKey = `group${group}` as 'group1' | 'group2' | 'group3';
  const groupSchedule = rotationSchedule[scheduleKey];

  // Calculate which slot within the group (0-3)
  const groupStartIndex = (group - 1) * 4;
  const localSlotIndex = slotIndex - groupStartIndex;

  if (localSlotIndex >= 0 && localSlotIndex < groupSchedule.schedule.length) {
    const slot = groupSchedule.schedule[localSlotIndex];
    return {
      field: slot.field,
      social: slot.social,
      vnr: slot.vnr,
      packRip: slot.packRip,
    };
  }

  return { field: 'BREAK', social: 'BREAK', vnr: 'BREAK', packRip: 'BREAK' };
}

function StationCard({
  station,
  playerName,
  onPlayerClick
}: {
  station: StationType;
  playerName: string;
  onPlayerClick: (name: string) => void;
}) {
  const config = stationConfig[station];
  const isBreak = playerName === 'BREAK';
  const player = !isBreak ? players.find(p => `${p.firstName} ${p.lastName}` === playerName) : null;
  const displayName = station === 'packRip' ? 'PACK RIP' : station.toUpperCase();

  return (
    <div className={`bg-[#141414] border ${config.borderColor} rounded-xl overflow-hidden`}>
      {/* Station Header */}
      <div className={`${config.bgColor} px-4 py-2 flex items-center gap-2`}>
        <span className="text-white text-lg">{config.icon}</span>
        <span className="text-white font-bold text-sm">{displayName}</span>
      </div>

      {/* Player Info */}
      <div className="p-4">
        {isBreak ? (
          <div className="flex items-center justify-center py-6 text-gray-500">
            <Clock className="w-5 h-5 mr-2" />
            <span className="text-lg">Break</span>
          </div>
        ) : player ? (
          <button
            onClick={() => onPlayerClick(player.firstName)}
            className="w-full text-left hover:bg-[#1a1a1a] -m-2 p-2 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <PlayerAvatar player={player} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{player.flag}</span>
                </div>
                <p className="text-xl font-bold truncate">{player.firstName}</p>
                <p className="text-lg text-gray-400 truncate">{player.lastName}</p>
                {player.pronunciation && (
                  <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                    <Volume2 className="w-3 h-3" />
                    <span className="italic">{player.pronunciation}</span>
                  </div>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </div>
            <div className="mt-3 pt-3 border-t border-[#2a2a2a]">
              <p className="text-xs text-gray-500 mb-1">KEY POINT:</p>
              <p className="text-sm text-gray-300 line-clamp-2">{player.talkingPoints[0]}</p>
            </div>
          </button>
        ) : (
          <div className="py-6 text-center text-gray-500">
            Player not found
          </div>
        )}
      </div>
    </div>
  );
}

interface NowDashboardProps {
  onPlayerClick: (firstName: string) => void;
}

export default function NowDashboard({ onPlayerClick }: NowDashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second for countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentSlotInfo = getCurrentSlotInfo(currentTime);
  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'America/Los_Angeles',
  });

  // Not during active hours
  if (!currentSlotInfo) {
    const pst = getPSTTime(currentTime);
    const currentHour = pst.hours;
    const currentMin = pst.minutes;

    // Before first group
    if (currentHour < 9 || (currentHour === 9 && currentMin < 0)) {
      return (
        <div className="space-y-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🌅</div>
            <h2 className="text-2xl font-bold mb-2">Good Morning!</h2>
            <p className="text-gray-500 mb-4">Shoot starts at 9:00 AM</p>
            <div className="inline-flex items-center gap-2 bg-[#141414] px-4 py-2 rounded-lg">
              <Clock className="w-5 h-5 text-amber-400" />
              <span className="font-mono text-2xl">{formattedTime}</span>
            </div>
          </div>
        </div>
      );
    }

    // Between groups (lunch break 12:00-1:00)
    if (currentHour >= 12 && currentHour < 13) {
      return (
        <div className="space-y-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <h2 className="text-2xl font-bold mb-2">Lunch Break</h2>
            <p className="text-gray-500 mb-4">Group 3 starts at 1:00 PM</p>
            <div className="inline-flex items-center gap-2 bg-[#141414] px-4 py-2 rounded-lg">
              <Clock className="w-5 h-5 text-amber-400" />
              <span className="font-mono text-2xl">{formattedTime}</span>
            </div>
          </div>
        </div>
      );
    }

    // After shoot
    if (currentHour >= 14 && currentMin >= 20) {
      return (
        <div className="space-y-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">That's a Wrap!</h2>
            <p className="text-gray-500 mb-4">Great work today, team!</p>
            <div className="inline-flex items-center gap-2 bg-[#141414] px-4 py-2 rounded-lg">
              <Clock className="w-5 h-5 text-amber-400" />
              <span className="font-mono text-2xl">{formattedTime}</span>
            </div>
          </div>
        </div>
      );
    }

    // Between group transitions (10:20-10:30 or 11:50-13:00)
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold mb-2">Transition</h2>
          <p className="text-gray-500 mb-4">Next group starting soon</p>
          <div className="inline-flex items-center gap-2 bg-[#141414] px-4 py-2 rounded-lg">
            <Clock className="w-5 h-5 text-amber-400" />
            <span className="font-mono text-2xl">{formattedTime}</span>
          </div>
        </div>
      </div>
    );
  }

  const { slot, index } = currentSlotInfo;
  const timeRemaining = getTimeRemaining(slot, currentTime);
  const assignments = getCurrentStationAssignments(slot.group, index);

  const groupColors = {
    1: 'text-green-400',
    2: 'text-amber-400',
    3: 'text-violet-400',
  };

  return (
    <div className="space-y-6">
      {/* Header with Time */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-400" />
            Live Now
          </h2>
          <p className="text-sm text-gray-500">Who's at each station right now</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-amber-400">
            <Clock className="w-4 h-4" />
            <span className="font-mono font-bold text-lg">{formattedTime}</span>
          </div>
        </div>
      </div>

      {/* Countdown Timer */}
      <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-amber-400 font-medium">TIME REMAINING IN SLOT</p>
            <p className={`text-sm ${groupColors[slot.group as keyof typeof groupColors]}`}>
              Group {slot.group} • Slot {(index % 4) + 1} of 4
            </p>
          </div>
          <div className="text-right">
            <div className={`font-mono text-4xl font-bold ${timeRemaining.minutes < 5 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
              {String(timeRemaining.minutes).padStart(2, '0')}:{String(timeRemaining.seconds).padStart(2, '0')}
            </div>
            <p className="text-xs text-gray-500">minutes remaining</p>
          </div>
        </div>
      </div>

      {/* Station Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(['field', 'social', 'vnr', 'packRip'] as StationType[]).map((station) => (
          <StationCard
            key={station}
            station={station}
            playerName={assignments[station]}
            onPlayerClick={onPlayerClick}
          />
        ))}
      </div>

      {/* Quick Stats */}
      <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-400">{index + 1}</p>
            <p className="text-xs text-gray-500">Slots Complete</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-400">{12 - index - 1}</p>
            <p className="text-xs text-gray-500">Slots Remaining</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-violet-400">11</p>
            <p className="text-xs text-gray-500">Total Players</p>
          </div>
        </div>
      </div>
    </div>
  );
}
