'use client';

import { useState, useEffect } from 'react';
import { stationConfig } from '../../components/StationIcon';
import { Clock, Zap } from 'lucide-react';

interface ScheduleGroup {
  name: string;
  time: string;
  players: string[];
  schedule: Array<{
    time: string;
    field: string;
    social: string;
    vnr: string;
    packRip: string;
  }>;
}

interface ScheduleViewProps {
  schedule: {
    group1: ScheduleGroup;
    group2: ScheduleGroup;
    group3: ScheduleGroup;
  };
  onPlayerClick: (firstName: string) => void;
}

const groupStyles = {
  1: {
    border: 'border-green-500/30',
    header: 'bg-green-500/10',
    badge: 'text-green-400',
  },
  2: {
    border: 'border-amber-500/30',
    header: 'bg-amber-500/10',
    badge: 'text-amber-400',
  },
  3: {
    border: 'border-violet-500/30',
    header: 'bg-violet-500/10',
    badge: 'text-violet-400',
  },
};

const timeSlots = {
  group1: [
    { slot: 1, time: '9:00 - 9:20', startHour: 9, startMin: 0, endHour: 9, endMin: 20 },
    { slot: 2, time: '9:20 - 9:40', startHour: 9, startMin: 20, endHour: 9, endMin: 40 },
    { slot: 3, time: '9:40 - 10:00', startHour: 9, startMin: 40, endHour: 10, endMin: 0 },
    { slot: 4, time: '10:00 - 10:20', startHour: 10, startMin: 0, endHour: 10, endMin: 20 },
  ],
  group2: [
    { slot: 1, time: '10:30 - 10:50', startHour: 10, startMin: 30, endHour: 10, endMin: 50 },
    { slot: 2, time: '10:50 - 11:10', startHour: 10, startMin: 50, endHour: 11, endMin: 10 },
    { slot: 3, time: '11:10 - 11:30', startHour: 11, startMin: 10, endHour: 11, endMin: 30 },
    { slot: 4, time: '11:30 - 11:50', startHour: 11, startMin: 30, endHour: 11, endMin: 50 },
  ],
  group3: [
    { slot: 1, time: '1:00 - 1:20', startHour: 13, startMin: 0, endHour: 13, endMin: 20 },
    { slot: 2, time: '1:20 - 1:40', startHour: 13, startMin: 20, endHour: 13, endMin: 40 },
    { slot: 3, time: '1:40 - 2:00', startHour: 13, startMin: 40, endHour: 14, endMin: 0 },
    { slot: 4, time: '2:00 - 2:20', startHour: 14, startMin: 0, endHour: 14, endMin: 20 },
  ],
};

function isCurrentSlot(slot: { startHour: number; startMin: number; endHour: number; endMin: number }, currentTime: Date): boolean {
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const slotStart = slot.startHour * 60 + slot.startMin;
  const slotEnd = slot.endHour * 60 + slot.endMin;
  return currentMinutes >= slotStart && currentMinutes < slotEnd;
}

function isUpcomingSlot(slot: { startHour: number; startMin: number }, currentTime: Date): boolean {
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const slotStart = slot.startHour * 60 + slot.startMin;
  return slotStart > currentMinutes && slotStart <= currentMinutes + 30; // Within next 30 min
}

function GroupSchedule({
  group,
  groupNumber,
  slots,
  onPlayerClick,
  currentTime,
}: {
  group: ScheduleGroup;
  groupNumber: 1 | 2 | 3;
  slots: { slot: number; time: string; startHour: number; startMin: number; endHour: number; endMin: number }[];
  onPlayerClick: (name: string) => void;
  currentTime: Date;
}) {
  const styles = groupStyles[groupNumber];

  const renderCell = (name: string) => {
    if (name === '—' || name === 'BREAK') {
      return (
        <span className="text-gray-600 text-sm italic">BREAK</span>
      );
    }
    // Extract first name for the click handler
    const firstName = name.split(' ')[0];
    return (
      <button
        onClick={() => onPlayerClick(firstName)}
        className="text-white hover:text-amber-400 transition-colors font-medium text-sm"
      >
        {name}
      </button>
    );
  };

  return (
    <div className={`bg-[#141414] border ${styles.border} rounded-xl overflow-hidden`}>
      {/* Header */}
      <div className={`${styles.header} px-4 py-3 border-b border-[#2a2a2a]`}>
        <div className="flex items-center justify-between">
          <h3 className={`font-bold ${styles.badge}`}>{group.name}</h3>
          <span className="text-sm text-gray-400">{group.time}</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {group.players.map((player) => (
            <span key={player} className="text-xs bg-[#0a0a0a] px-2 py-1 rounded text-gray-400">
              {player}
            </span>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a2a2a] bg-[#0a0a0a]">
              <th className="text-left py-3 px-4 text-gray-500 font-medium w-32">Time Slot</th>
              <th className="text-center py-3 px-3">
                <div className="flex items-center justify-center gap-2">
                  <span className={`w-5 h-5 ${stationConfig.field.bgColor} rounded flex items-center justify-center text-white text-xs`}>
                    {stationConfig.field.icon}
                  </span>
                  <span className={stationConfig.field.textColor}>Field</span>
                </div>
              </th>
              <th className="text-center py-3 px-3">
                <div className="flex items-center justify-center gap-2">
                  <span className={`w-5 h-5 ${stationConfig.social.bgColor} rounded flex items-center justify-center text-white text-xs`}>
                    {stationConfig.social.icon}
                  </span>
                  <span className={stationConfig.social.textColor}>Social</span>
                </div>
              </th>
              <th className="text-center py-3 px-3">
                <div className="flex items-center justify-center gap-2">
                  <span className={`w-5 h-5 ${stationConfig.vnr.bgColor} rounded flex items-center justify-center text-white text-xs`}>
                    {stationConfig.vnr.icon}
                  </span>
                  <span className={stationConfig.vnr.textColor}>VNR</span>
                </div>
              </th>
              <th className="text-center py-3 px-3">
                <div className="flex items-center justify-center gap-2">
                  <span className={`w-5 h-5 ${stationConfig.packRip.bgColor} rounded flex items-center justify-center text-white text-xs`}>
                    {stationConfig.packRip.icon}
                  </span>
                  <span className={stationConfig.packRip.textColor}>Pack Rip</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {group.schedule.map((row, index) => {
              const slot = slots[index];
              const isCurrent = isCurrentSlot(slot, currentTime);
              const isUpcoming = !isCurrent && isUpcomingSlot(slot, currentTime);

              return (
                <tr
                  key={index}
                  className={`border-b border-[#2a2a2a] last:border-0 transition-colors ${
                    isCurrent
                      ? 'bg-amber-500/10 border-l-2 border-l-amber-500'
                      : isUpcoming
                      ? 'bg-blue-500/5'
                      : 'hover:bg-[#1a1a1a]'
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {isCurrent && (
                        <span className="flex items-center gap-1 text-amber-400 text-xs font-bold animate-pulse">
                          <Zap className="w-3 h-3" />
                          NOW
                        </span>
                      )}
                      {isUpcoming && !isCurrent && (
                        <span className="flex items-center gap-1 text-blue-400 text-xs">
                          <Clock className="w-3 h-3" />
                          NEXT
                        </span>
                      )}
                    </div>
                    <div className="text-gray-500 text-xs mb-0.5">Slot {slot.slot}</div>
                    <div className={`font-mono text-xs ${isCurrent ? 'text-amber-400 font-bold' : 'text-gray-300'}`}>
                      {slot.time}
                    </div>
                  </td>
                  <td className="text-center py-3 px-3">{renderCell(row.field)}</td>
                  <td className="text-center py-3 px-3">{renderCell(row.social)}</td>
                  <td className="text-center py-3 px-3">{renderCell(row.vnr)}</td>
                  <td className="text-center py-3 px-3">{renderCell(row.packRip)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ScheduleView({ schedule, onPlayerClick }: ScheduleViewProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Rotation Schedule</h2>
          <p className="text-sm text-gray-500">20 min per station • Tap player name for profile</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-amber-400">
            <Clock className="w-4 h-4" />
            <span className="font-mono font-bold">{formattedTime}</span>
          </div>
          <p className="text-xs text-gray-500">Current time</p>
        </div>
      </div>

      <GroupSchedule
        group={schedule.group1}
        groupNumber={1}
        slots={timeSlots.group1}
        onPlayerClick={onPlayerClick}
        currentTime={currentTime}
      />
      <GroupSchedule
        group={schedule.group2}
        groupNumber={2}
        slots={timeSlots.group2}
        onPlayerClick={onPlayerClick}
        currentTime={currentTime}
      />
      <GroupSchedule
        group={schedule.group3}
        groupNumber={3}
        slots={timeSlots.group3}
        onPlayerClick={onPlayerClick}
        currentTime={currentTime}
      />

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 text-sm text-gray-500">
        <strong className="text-gray-400">Note:</strong> Signing station runs throughout the day.
        Athletes rotate through interview stations only.
      </div>
    </div>
  );
}
