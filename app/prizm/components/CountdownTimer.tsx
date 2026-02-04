'use client';

import { useState, useEffect } from 'react';
import { getSecondsRemaining, formatCountdown } from '../lib/time';
import { useAppStore } from '../store';

interface CountdownTimerProps {
  date: string;
  endTime: string;
  className?: string;
}

export default function CountdownTimer({ date, endTime, className = '' }: CountdownTimerProps) {
  const { largeText } = useAppStore();
  const [seconds, setSeconds] = useState(() => getSecondsRemaining(date, endTime));

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(getSecondsRemaining(date, endTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [date, endTime]);

  const isLow = seconds > 0 && seconds < 300; // Less than 5 minutes
  const isExpired = seconds <= 0;

  return (
    <div
      className={`font-mono font-bold tabular-nums ${
        isExpired
          ? 'text-[#9CA3AF]'
          : isLow
          ? 'text-[#EF4444] animate-pulse'
          : 'text-white'
      } ${largeText ? 'text-2xl' : 'text-xl'} ${className}`}
    >
      {isExpired ? 'DONE' : formatCountdown(seconds)}
    </div>
  );
}
