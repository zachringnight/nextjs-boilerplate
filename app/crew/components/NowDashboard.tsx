'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { players, day1Players, day2Players, playerCounts } from '../../data/players';
import type { Player } from '../../data/players';
import PlayerAvatar from './PlayerAvatar';
import DateTimeDisplay from '../../components/DateTimeDisplay';
import { StationGrid } from '../../components/StationInfoCard';
import { StatusBadge } from '../../components/StatusBadge';
import { ChevronRight, Volume2, Zap, Play, RotateCcw, Plus, Minus, Clock } from 'lucide-react';
import {
  getEventDay,
  isCurrentPlayer,
  getTimeRemaining as getScheduledTimeRemaining,
  getNextPlayer,
  getCompletedCount,
  getCurrentMinutesPST,
} from '../../lib/schedule-utils';
import { UPDATE_INTERVALS, DAY_STYLES, EVENT_DATES, EVENT_INFO, SLOT_DURATION_MINUTES } from '../../lib/constants';
import { useSessionTimer } from '../../lib/useSessionTimer';

function CurrentPlayerCard({ player, onPlayerClick }: { player: Player; onPlayerClick: (name: string) => void }) {
  return (
    <button
      onClick={() => onPlayerClick(player.firstName)}
      className="w-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/50 rounded-xl p-5 text-left hover:border-amber-500 transition-all"
    >
      <div className="flex items-center gap-4">
        <PlayerAvatar player={player} size="xl" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-3xl">{player.flag}</span>
            {player.embargoed && <StatusBadge type="embargo" />}
            {player.translatorNeeded && <StatusBadge type="translator" />}
          </div>
          <p className="text-3xl font-black text-amber-400">{player.firstName}</p>
          <p className="text-2xl text-white">{player.lastName}</p>
          {player.pronunciation && (
            <div className="flex items-center gap-1 text-gray-400 text-sm mt-1">
              <Volume2 className="w-4 h-4" />
              <span className="italic">{player.pronunciation}</span>
            </div>
          )}
          <p className="text-gray-400 mt-2">{player.position} - {player.team}</p>
        </div>
        <ChevronRight className="w-8 h-8 text-amber-500" />
      </div>
      <div className="mt-4 pt-4 border-t border-amber-500/30">
        <p className="text-xs text-gray-400 mb-1">KEY TALKING POINT:</p>
        <p className="text-base text-gray-200">{player.talkingPoints[0]}</p>
      </div>
    </button>
  );
}

interface NextPlayerCardProps {
  player: Player;
  onPlayerClick: (name: string) => void;
  onStartSession?: () => void;
  showStartButton?: boolean;
}

function NextPlayerCard({ player, onPlayerClick, onStartSession, showStartButton }: NextPlayerCardProps) {
  return (
    <div className="bg-[#141414] border border-blue-500/30 rounded-xl p-4">
      <button
        onClick={() => onPlayerClick(player.firstName)}
        className="w-full flex items-center gap-3 text-left hover:opacity-80 transition-opacity"
      >
        <PlayerAvatar player={player} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{player.flag}</span>
            <span className="text-xs text-blue-400 font-medium">UP NEXT</span>
          </div>
          <p className="font-bold truncate">{player.firstName} {player.lastName}</p>
          <p className="text-sm text-gray-400">{player.scheduledTime}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-600" />
      </button>
      {showStartButton && onStartSession && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStartSession();
          }}
          className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
        >
          <Play className="w-4 h-4" />
          Player Arrived - Start Timer
        </button>
      )}
    </div>
  );
}

function StatsGrid({ completedCount, remainingCount, totalCount }: { completedCount: number; remainingCount: number; totalCount: number }) {
  return (
    <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-green-400">{completedCount}</p>
          <p className="text-xs text-gray-500">Completed Today</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-amber-400">{remainingCount}</p>
          <p className="text-xs text-gray-500">Remaining</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-violet-400">{totalCount}</p>
          <p className="text-xs text-gray-500">Total Players</p>
        </div>
      </div>
    </div>
  );
}

interface TimerControlsProps {
  playerId: string;
  timeRemaining: { minutes: number; seconds: number };
  isManualSession: boolean;
  onAdjust: (minutes: number) => void;
  onReset: () => void;
  scheduledTime: string;
  day: 1 | 2;
}

function TimerControls({ playerId, timeRemaining, isManualSession, onAdjust, onReset, scheduledTime, day }: TimerControlsProps) {
  const dayColorClass = DAY_STYLES[day].text;

  return (
    <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-amber-400 font-medium">TIME REMAINING</p>
            {isManualSession && (
              <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">
                Manual
              </span>
            )}
          </div>
          <p className={`text-sm ${dayColorClass}`}>
            Day {day} - {scheduledTime}
          </p>
        </div>
        <div className="text-right">
          <div className={`font-mono text-4xl font-bold ${timeRemaining.minutes < 5 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
            {String(timeRemaining.minutes).padStart(2, '0')}:{String(timeRemaining.seconds).padStart(2, '0')}
          </div>
          <p className="text-xs text-gray-500">minutes remaining</p>
        </div>
      </div>

      {/* Timer adjustment controls */}
      <div className="flex items-center justify-between pt-3 border-t border-amber-500/20">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Adjust:</span>
          <button
            onClick={() => onAdjust(-1)}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0a0a0a] hover:bg-[#1a1a1a] text-gray-400 hover:text-white transition-colors"
            title="Subtract 1 minute"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => onAdjust(1)}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0a0a0a] hover:bg-[#1a1a1a] text-gray-400 hover:text-white transition-colors"
            title="Add 1 minute"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => onAdjust(-5)}
            className="px-2 h-8 rounded-lg bg-[#0a0a0a] hover:bg-[#1a1a1a] text-gray-400 hover:text-white text-xs transition-colors"
            title="Subtract 5 minutes"
          >
            -5m
          </button>
          <button
            onClick={() => onAdjust(5)}
            className="px-2 h-8 rounded-lg bg-[#0a0a0a] hover:bg-[#1a1a1a] text-gray-400 hover:text-white text-xs transition-colors"
            title="Add 5 minutes"
          >
            +5m
          </button>
        </div>
        {isManualSession && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs transition-colors"
            title="Reset to scheduled time"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
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
  const sessionTimer = useSessionTimer();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, UPDATE_INTERVALS.realtime);
    return () => clearInterval(interval);
  }, []);

  // Memoize computed values
  const eventDay = useMemo(() => getEventDay(currentTime), [currentTime]);

  const dayPlayers = useMemo(() => {
    if (eventDay === 1) return day1Players;
    if (eventDay === 2) return day2Players;
    return [];
  }, [eventDay]);

  // Get player with active manual session
  const manualActivePlayer = useMemo(() => {
    for (const player of players) {
      if (sessionTimer.isPlayerActive(player.id)) {
        return player;
      }
    }
    return null;
  }, [sessionTimer, currentTime]); // eslint-disable-line react-hooks/exhaustive-deps

  // Get scheduled current player (based on time slots)
  const scheduledCurrentPlayer = useMemo(
    () => players.find(p => isCurrentPlayer(p, currentTime, eventDay)),
    [currentTime, eventDay]
  );

  // The active player is either manual or scheduled
  const activePlayer = manualActivePlayer || scheduledCurrentPlayer;

  const nextPlayer = useMemo(
    () => getNextPlayer(players, currentTime, eventDay),
    [currentTime, eventDay]
  );

  const currentMinutes = useMemo(
    () => getCurrentMinutesPST(currentTime),
    [currentTime]
  );

  const currentHour = Math.floor(currentMinutes / 60);
  const currentMin = currentMinutes % 60;

  // Handle starting a manual session for a player
  const handleStartSession = useCallback((playerId: string) => {
    sessionTimer.startSession(playerId, SLOT_DURATION_MINUTES);
  }, [sessionTimer]);

  // Handle adjusting time (negative = arrived late, adds time; positive = subtract time)
  const handleAdjustTime = useCallback((playerId: string, offsetMinutes: number) => {
    const session = sessionTimer.getSession(playerId);
    if (session) {
      // Adjust existing session
      sessionTimer.adjustSession(playerId, -offsetMinutes); // Negative because we're adjusting start time backwards
    } else {
      // Create a session with adjusted start time
      sessionTimer.startSession(playerId, SLOT_DURATION_MINUTES);
      // Then adjust it
      setTimeout(() => {
        sessionTimer.adjustSession(playerId, -offsetMinutes);
      }, 0);
    }
  }, [sessionTimer]);

  // Handle resetting to scheduled time
  const handleResetSession = useCallback((playerId: string) => {
    sessionTimer.clearSession(playerId);
  }, [sessionTimer]);

  // Get time remaining - either from manual session or scheduled
  const getActiveTimeRemaining = useCallback((player: Player) => {
    const manualTime = sessionTimer.getTimeRemaining(player.id);
    if (manualTime) return manualTime;
    return getScheduledTimeRemaining(player, currentTime);
  }, [sessionTimer, currentTime]);

  // Check if player has manual session
  const hasManualSession = useCallback((playerId: string) => {
    return sessionTimer.getSession(playerId) !== null;
  }, [sessionTimer]);

  // Not on an event day - show shoot info with schedule
  if (eventDay === null) {
    const day1Date = new Date(EVENT_DATES.day1.year, EVENT_DATES.day1.month, EVENT_DATES.day1.day);
    const now = new Date(currentTime.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
    const isBeforeEvent = now < day1Date;
    const firstPlayer = day1Players[0];

    return (
      <div className="space-y-6">
        <DateTimeDisplay currentTime={currentTime} />

        {/* Shoot status banner */}
        <div className={`rounded-xl p-4 ${isBeforeEvent ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-green-500/10 border border-green-500/30'}`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{isBeforeEvent ? '\uD83D\uDCC5' : '\u2705'}</span>
            <div>
              <p className={`font-bold ${isBeforeEvent ? 'text-blue-400' : 'text-green-400'}`}>
                {isBeforeEvent ? 'Shoot Coming Up' : 'Shoot Complete'}
              </p>
              <p className="text-sm text-gray-400">{EVENT_INFO.dateDisplay} at {EVENT_INFO.location}</p>
            </div>
          </div>
        </div>

        {/* Schedule overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`bg-[#141414] ${DAY_STYLES[1].border} border rounded-xl p-4`}>
            <p className={`text-xs ${DAY_STYLES[1].text} font-medium mb-2`}>DAY 1</p>
            <p className="font-bold text-white">{DAY_STYLES[1].dateDisplay}</p>
            <p className="text-sm text-gray-400">{playerCounts.day1} players</p>
            <p className="text-xs text-gray-500 mt-1">10:05 AM start</p>
          </div>
          <div className={`bg-[#141414] ${DAY_STYLES[2].border} border rounded-xl p-4`}>
            <p className={`text-xs ${DAY_STYLES[2].text} font-medium mb-2`}>DAY 2</p>
            <p className="font-bold text-white">{DAY_STYLES[2].dateDisplay}</p>
            <p className="text-sm text-gray-400">{playerCounts.day2} players</p>
            <p className="text-xs text-gray-500 mt-1">9:35 AM start</p>
          </div>
        </div>

        {/* First player preview */}
        {firstPlayer && (
          <div>
            <p className="text-sm text-gray-500 mb-2">FIRST UP (DAY 1):</p>
            <NextPlayerCard player={firstPlayer} onPlayerClick={onPlayerClick} />
          </div>
        )}

        {/* Station info */}
        <StationGrid />

        {/* Stats */}
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-white">{playerCounts.total}</p>
              <p className="text-xs text-gray-500">Total Players</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">2</p>
              <p className="text-xs text-gray-500">Stations</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">2</p>
              <p className="text-xs text-gray-500">Shoot Days</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Before shoot starts for the day
  if (!activePlayer) {
    if (currentHour < 9 || (currentHour === 9 && currentMin < 35)) {
      return (
        <div className="space-y-6">
          <DateTimeDisplay currentTime={currentTime} />
          <div className="text-center py-12">
            <div className="text-6xl mb-4">{'\uD83C\uDF05'}</div>
            <h2 className="text-2xl font-bold mb-2">Good Morning!</h2>
            <p className="text-gray-500 mb-4">
              {eventDay === 1 ? 'Day 1 starts at 10:05 AM' : 'Day 2 starts at 9:35 AM'}
            </p>
          </div>
          {nextPlayer && (
            <div className="max-w-md mx-auto">
              <p className="text-sm text-gray-500 mb-2">FIRST UP TODAY:</p>
              <NextPlayerCard
                player={nextPlayer}
                onPlayerClick={onPlayerClick}
                showStartButton
                onStartSession={() => handleStartSession(nextPlayer.id)}
              />
            </div>
          )}
        </div>
      );
    }

    // After shoot ends
    if (currentHour >= 20) {
      return (
        <div className="space-y-6">
          <DateTimeDisplay currentTime={currentTime} />
          <div className="text-center py-12">
            <div className="text-6xl mb-4">{'\uD83C\uDF89'}</div>
            <h2 className="text-2xl font-bold mb-2">That's a Wrap!</h2>
            <p className="text-gray-500 mb-4">Great work today, team!</p>
          </div>
        </div>
      );
    }

    // Break between players
    return (
      <div className="space-y-6">
        <DateTimeDisplay currentTime={currentTime} />
        <div className="text-center py-12">
          <div className="text-6xl mb-4">{'\u23F3'}</div>
          <h2 className="text-2xl font-bold mb-2">Break</h2>
          <p className="text-gray-500 mb-4">Next player coming up</p>
        </div>
        {nextPlayer && (
          <div className="max-w-md mx-auto">
            <p className="text-sm text-gray-500 mb-2">UP NEXT:</p>
            <NextPlayerCard
              player={nextPlayer}
              onPlayerClick={onPlayerClick}
              showStartButton
              onStartSession={() => handleStartSession(nextPlayer.id)}
            />
          </div>
        )}
      </div>
    );
  }

  // Active player - main view
  const timeRemaining = getActiveTimeRemaining(activePlayer);
  const completedCount = getCompletedCount(dayPlayers, currentTime);
  const isManual = hasManualSession(activePlayer.id);

  return (
    <div className="space-y-6">
      <DateTimeDisplay currentTime={currentTime} />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-400" />
            Live Now
          </h2>
          <p className="text-sm text-gray-500">Current player at Panini station</p>
        </div>
      </div>

      <TimerControls
        playerId={activePlayer.id}
        timeRemaining={timeRemaining}
        isManualSession={isManual}
        onAdjust={(minutes) => handleAdjustTime(activePlayer.id, minutes)}
        onReset={() => handleResetSession(activePlayer.id)}
        scheduledTime={activePlayer.scheduledTime}
        day={activePlayer.day}
      />

      <div>
        <p className="text-sm text-amber-400 font-medium mb-2 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          NOW AT STATION
        </p>
        <CurrentPlayerCard player={activePlayer} onPlayerClick={onPlayerClick} />
      </div>

      {nextPlayer && nextPlayer.id !== activePlayer.id && (
        <div>
          <p className="text-sm text-gray-500 mb-2">UP NEXT:</p>
          <NextPlayerCard
            player={nextPlayer}
            onPlayerClick={onPlayerClick}
            showStartButton
            onStartSession={() => {
              // Clear current session and start new one
              if (isManual) {
                handleResetSession(activePlayer.id);
              }
              handleStartSession(nextPlayer.id);
            }}
          />
        </div>
      )}

      <StationGrid />

      <StatsGrid
        completedCount={completedCount}
        remainingCount={dayPlayers.length - completedCount - 1}
        totalCount={playerCounts.total}
      />
    </div>
  );
}
