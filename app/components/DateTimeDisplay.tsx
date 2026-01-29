'use client';

import { Calendar } from 'lucide-react';
import { formatDate, formatTime, getEventDay } from '../lib/schedule-utils';
import { DAY_STYLES } from '../lib/constants';

interface DateTimeDisplayProps {
  currentTime: Date;
  showEventDay?: boolean;
}

export default function DateTimeDisplay({ currentTime, showEventDay = true }: DateTimeDisplayProps) {
  const eventDay = getEventDay(currentTime);
  const formattedDate = formatDate(currentTime);
  const formattedTime = formatTime(currentTime, true);

  return (
    <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-amber-400" />
          <div>
            <p className="font-medium text-white">{formattedDate}</p>
            <p className="text-xs text-gray-500">PT (Los Angeles)</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-2xl text-amber-400">{formattedTime}</p>
          {showEventDay && eventDay && (
            <p className={`text-xs font-medium ${DAY_STYLES[eventDay].text}`}>
              Day {eventDay} of Shoot
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
