'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useASWStore } from '../store';
import {
  Play,
  Pause,
  RotateCcw,
  Bell,
  BellOff,
  Timer,
  Clock,
  Plus,
  Minus,
  Volume2,
  VolumeX,
  ArrowLeft,
} from 'lucide-react';
import { cn, hapticFeedback } from '../lib/utils';
import { STATION_CONFIG } from '../lib/constants';

type TimerMode = 'countdown' | 'stopwatch';

interface PresetTimer {
  label: string;
  seconds: number;
  color: string;
}

const PRESET_TIMERS: PresetTimer[] = [
  { label: 'Tunnel (15m)', seconds: 15 * 60, color: '#22c55e' },
  { label: 'Product (15m)', seconds: 15 * 60, color: '#f59e0b' },
  { label: '5 Minutes', seconds: 5 * 60, color: '#FFD100' },
  { label: '10 Minutes', seconds: 10 * 60, color: '#FFD100' },
  { label: '20 Minutes', seconds: 20 * 60, color: '#3B82F6' },
  { label: '30 Minutes', seconds: 30 * 60, color: '#8B5CF6' },
];

export default function TimerPage() {
  const { largeText } = useASWStore();
  const [mode, setMode] = useState<TimerMode>('countdown');
  const [time, setTime] = useState(15 * 60);
  const [initialTime, setInitialTime] = useState(15 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [alertEnabled, setAlertEnabled] = useState(true);
  const [hasAlerted, setHasAlerted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const triggerAlert = useCallback(() => {
    hapticFeedback([300, 100, 300, 100, 300]);

    if (alertEnabled && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification('Timer Complete!', {
        body: mode === 'countdown' ? 'Countdown has finished' : 'Stopwatch alert',
        icon: '/prizm/icons/icon.svg',
      });
    }
  }, [alertEnabled, mode]);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => {
          if (mode === 'countdown') {
            if (prev <= 0) {
              setIsRunning(false);
              if (alertEnabled && !hasAlerted) {
                triggerAlert();
                setHasAlerted(true);
              }
              return 0;
            }
            if (prev === 60 && alertEnabled) {
              hapticFeedback([100, 50, 100]);
            }
            if (prev === 10 && alertEnabled) {
              hapticFeedback([200, 100, 200]);
            }
            return prev - 1;
          } else {
            return prev + 1;
          }
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, mode, alertEnabled, hasAlerted, triggerAlert]);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    if (!isRunning) setHasAlerted(false);
    setIsRunning(!isRunning);
    hapticFeedback(50);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setHasAlerted(false);
    if (mode === 'countdown') {
      setTime(initialTime);
    } else {
      setTime(0);
    }
    hapticFeedback(50);
  };

  const adjustTime = (delta: number) => {
    if (!isRunning) {
      const newTime = Math.max(0, time + delta);
      setTime(newTime);
      if (mode === 'countdown') setInitialTime(newTime);
      hapticFeedback(30);
    }
  };

  const setPresetTime = (seconds: number) => {
    if (!isRunning) {
      setTime(seconds);
      setInitialTime(seconds);
      setMode('countdown');
      setHasAlerted(false);
      hapticFeedback(50);
    }
  };

  const switchMode = (newMode: TimerMode) => {
    if (!isRunning) {
      setMode(newMode);
      setHasAlerted(false);
      if (newMode === 'stopwatch') {
        setTime(0);
      } else {
        setTime(initialTime);
      }
      hapticFeedback(50);
    }
  };

  const progress = mode === 'countdown' && initialTime > 0
    ? ((initialTime - time) / initialTime) * 100
    : 0;

  const isWarning = mode === 'countdown' && time <= 60 && time > 0;
  const isCritical = mode === 'countdown' && time <= 10 && time > 0;
  const isComplete = mode === 'countdown' && time === 0 && hasAlerted;

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-2 pb-4">
        <Link
          href="/asw"
          className="p-2 rounded-lg bg-[#1A1A1A] hover:bg-[#2A2A2A] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#9CA3AF]" />
        </Link>
        <h1 className={cn('font-bold text-white', largeText ? 'text-2xl' : 'text-xl')}>
          Timer
        </h1>
      </div>

      <div className="px-4 space-y-6">
        {/* Mode Toggle */}
        <div className="flex bg-[#1A1A1A] rounded-xl p-1 border border-[#2A2A2A]">
          <button
            onClick={() => switchMode('countdown')}
            disabled={isRunning}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors',
              mode === 'countdown'
                ? 'bg-[#FFD100] text-black'
                : 'text-[#9CA3AF] hover:text-white',
              isRunning && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Timer className="w-4 h-4" />
            Countdown
          </button>
          <button
            onClick={() => switchMode('stopwatch')}
            disabled={isRunning}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors',
              mode === 'stopwatch'
                ? 'bg-[#FFD100] text-black'
                : 'text-[#9CA3AF] hover:text-white',
              isRunning && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Clock className="w-4 h-4" />
            Stopwatch
          </button>
        </div>

        {/* Timer Display */}
        <div className="relative">
          {mode === 'countdown' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-64 h-64 -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  fill="none"
                  stroke="#2A2A2A"
                  strokeWidth="8"
                />
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  fill="none"
                  stroke={isComplete ? '#22c55e' : isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#FFD100'}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 120}
                  strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
                  className="transition-all duration-1000"
                />
              </svg>
            </div>
          )}

          <div className="flex flex-col items-center justify-center py-16">
            <div
              className={cn(
                'font-mono font-bold transition-colors',
                largeText ? 'text-7xl' : 'text-6xl',
                isComplete && 'text-[#22c55e]',
                isCritical && 'text-red-500 animate-pulse',
                isWarning && !isCritical && 'text-[#f59e0b]',
                !isWarning && !isCritical && !isComplete && 'text-white'
              )}
            >
              {formatTime(time)}
            </div>
            {mode === 'countdown' && isComplete && (
              <div className="text-[#22c55e] font-medium mt-2 animate-pulse">
                Time&apos;s up!
              </div>
            )}
          </div>
        </div>

        {/* Time Adjustment */}
        {!isRunning && mode === 'countdown' && (
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => adjustTime(-60)}
              className="w-12 h-12 rounded-full bg-[#2A2A2A] flex items-center justify-center text-white hover:bg-[#3A3A3A] transition-colors active:scale-95"
            >
              <Minus className="w-5 h-5" />
            </button>
            <span className="text-[#9CA3AF] text-sm w-20 text-center">
              ±1 min
            </span>
            <button
              onClick={() => adjustTime(60)}
              className="w-12 h-12 rounded-full bg-[#2A2A2A] flex items-center justify-center text-white hover:bg-[#3A3A3A] transition-colors active:scale-95"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={resetTimer}
            className="w-16 h-16 rounded-full bg-[#2A2A2A] flex items-center justify-center text-white hover:bg-[#3A3A3A] transition-colors active:scale-95"
          >
            <RotateCcw className="w-6 h-6" />
          </button>

          <button
            onClick={toggleTimer}
            className={cn(
              'w-24 h-24 rounded-full flex items-center justify-center transition-colors active:scale-95',
              isRunning
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-[#FFD100] hover:bg-[#FFD100]/90'
            )}
          >
            {isRunning ? (
              <Pause className="w-10 h-10 text-white" />
            ) : (
              <Play className="w-10 h-10 text-black ml-1" />
            )}
          </button>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center transition-colors active:scale-95',
                soundEnabled ? 'bg-[#FFD100]/20 text-[#FFD100]' : 'bg-[#2A2A2A] text-[#6B7280]'
              )}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setAlertEnabled(!alertEnabled)}
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center transition-colors active:scale-95',
                alertEnabled ? 'bg-[#FFD100]/20 text-[#FFD100]' : 'bg-[#2A2A2A] text-[#6B7280]'
              )}
            >
              {alertEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Preset Timers */}
        {mode === 'countdown' && !isRunning && (
          <div className="space-y-3">
            <h3 className={cn(
              'font-semibold text-white',
              largeText ? 'text-lg' : 'text-base'
            )}>
              Quick Presets
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_TIMERS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setPresetTime(preset.seconds)}
                  className={cn(
                    'p-3 rounded-lg border border-[#2A2A2A] text-left transition-all hover:border-[#FFD100]/50 active:scale-[0.98]',
                    time === preset.seconds && initialTime === preset.seconds
                      ? 'bg-[#FFD100]/10 border-[#FFD100]'
                      : 'bg-[#1A1A1A]'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: preset.color }}
                    />
                    <span className={cn(
                      'text-white font-medium',
                      largeText ? 'text-base' : 'text-sm'
                    )}>
                      {preset.label}
                    </span>
                  </div>
                  <div className={cn(
                    'text-[#9CA3AF] mt-1',
                    largeText ? 'text-sm' : 'text-xs'
                  )}>
                    {formatTime(preset.seconds)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Station-specific timers */}
        {mode === 'countdown' && !isRunning && (
          <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4">
            <h3 className={cn(
              'font-semibold text-white mb-3',
              largeText ? 'text-lg' : 'text-base'
            )}>
              Station Defaults
            </h3>
            <div className="flex flex-wrap gap-2">
              {(['tunnel', 'product'] as const).map((key) => {
                const config = STATION_CONFIG[key];
                return (
                  <button
                    key={key}
                    onClick={() => setPresetTime(15 * 60)}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg transition-colors hover:bg-[#2A2A2A] active:scale-[0.98]"
                    style={{ borderColor: config.color, borderWidth: 1 }}
                  >
                    <span className="text-lg">{config.emoji}</span>
                    <span className={cn(
                      'text-white font-medium',
                      largeText ? 'text-sm' : 'text-xs'
                    )}>
                      {config.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
