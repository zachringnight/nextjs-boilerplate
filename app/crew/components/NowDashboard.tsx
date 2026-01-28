'use client';

import { useState, useEffect } from 'react';
import { players } from '../../data/players';
import type { Player } from '../../data/players';
import PlayerAvatar from './PlayerAvatar';
import { Clock, Zap, ChevronRight, Volume2, AlertTriangle, Languages } from 'lucide-react';

function parseTime(timeStr: string): { hours: number; minutes: number } {
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return { hours: 0, minutes: 0 };

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return { hours, minutes };
}

function isCurrentPlayer(player: Player, currentTime: Date): boolean {
  const { hours, minutes } = parseTime(player.scheduledTime);
  const slotStart = hours * 60 + minutes;
  const slotEnd = slotStart + 15;

  const pstString = currentTime.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
  const pstDate = new Date(pstString);
  const currentMinutes = pstDate.getHours() * 60 + pstDate.getMinutes();

  return currentMinutes >= slotStart && currentMinutes < slotEnd;
}

function getTimeRemaining(player: Player, currentTime: Date): { minutes: number; seconds: number } {
  const { hours, minutes } = parseTime(player.scheduledTime);
  const slotEnd = (hours * 60 + minutes + 15) * 60;

  const pstString = currentTime.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
  const pstDate = new Date(pstString);
  const now = pstDate.getHours() * 60 * 60 + pstDate.getMinutes() * 60 + pstDate.getSeconds();

  const remaining = Math.max(0, slotEnd - now);
  return {
    minutes: Math.floor(remaining / 60),
    seconds: remaining % 60,
  };
}

function getNextPlayer(currentTime: Date): Player | null {
  const pstString = currentTime.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
  const pstDate = new Date(pstString);
  const currentMinutes = pstDate.getHours() * 60 + pstDate.getMinutes();

  for (const player of players) {
    const { hours, minutes } = parseTime(player.scheduledTime);
    const slotStart = hours * 60 + minutes;
    if (slotStart > currentMinutes) {
      return player;
    }
  }
  return null;
}

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
            {player.embargoed && (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                <AlertTriangle className="w-3 h-3" />
                EMBARGO
              </span>
            )}
            {player.translatorNeeded && (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
                <Languages className="w-3 h-3" />
                Translator
              </span>
            )}
          </div>
          <p className="text-3xl font-black text-amber-400">{player.firstName}</p>
          <p className="text-2xl text-white">{player.lastName}</p>
          {player.pronunciation && (
            <div className="flex items-center gap-1 text-gray-400 text-sm mt-1">
              <Volume2 className="w-4 h-4" />
              <span className="italic">{player.pronunciation}</span>
            </div>
          )}
          <p className="text-gray-400 mt-2">{player.position} • {player.team}</p>
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

function NextPlayerCard({ player, onPlayerClick }: { player: Player; onPlayerClick: (name: string) => void }) {
  return (
    <button
      onClick={() => onPlayerClick(player.firstName)}
      className="w-full bg-[#141414] border border-blue-500/30 rounded-xl p-4 text-left hover:border-blue-500/50 transition-all"
    >
      <div className="flex items-center gap-3">
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
      </div>
    </button>
  );
}

interface NowDashboardProps {
  onPlayerClick: (firstName: string) => void;
}

export default function NowDashboard({ onPlayerClick }: NowDashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentPlayer = players.find(p => isCurrentPlayer(p, currentTime));
  const nextPlayer = getNextPlayer(currentTime);

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'America/Los_Angeles',
  });

  const pstString = currentTime.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
  const pstDate = new Date(pstString);
  const currentHour = pstDate.getHours();
  const currentMin = pstDate.getMinutes();

  const isDay1 = pstDate.getDate() === 28;
  const isDay2 = pstDate.getDate() === 29;
  const dayPlayers = isDay1 ? players.filter(p => p.day === 1) : isDay2 ? players.filter(p => p.day === 2) : [];

  if (!currentPlayer) {
    if (currentHour < 9 || (currentHour === 9 && currentMin < 35)) {
      return (
        <div className="space-y-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🌅</div>
            <h2 className="text-2xl font-bold mb-2">Good Morning!</h2>
            <p className="text-gray-500 mb-4">
              {isDay1 ? 'Day 1 starts at 10:05 AM' : isDay2 ? 'Day 2 starts at 9:35 AM' : 'Shoot starts soon'}
            </p>
            <div className="inline-flex items-center gap-2 bg-[#141414] px-4 py-2 rounded-lg">
              <Clock className="w-5 h-5 text-amber-400" />
              <span className="font-mono text-2xl">{formattedTime}</span>
            </div>
          </div>
          {nextPlayer && (
            <div className="max-w-md mx-auto">
              <p className="text-sm text-gray-500 mb-2">FIRST UP TODAY:</p>
              <NextPlayerCard player={nextPlayer} onPlayerClick={onPlayerClick} />
            </div>
          )}
        </div>
      );
    }

    if (currentHour >= 20) {
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

    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold mb-2">Break</h2>
          <p className="text-gray-500 mb-4">Next player coming up</p>
          <div className="inline-flex items-center gap-2 bg-[#141414] px-4 py-2 rounded-lg">
            <Clock className="w-5 h-5 text-amber-400" />
            <span className="font-mono text-2xl">{formattedTime}</span>
          </div>
        </div>
        {nextPlayer && (
          <div className="max-w-md mx-auto">
            <p className="text-sm text-gray-500 mb-2">UP NEXT:</p>
            <NextPlayerCard player={nextPlayer} onPlayerClick={onPlayerClick} />
          </div>
        )}
      </div>
    );
  }

  const timeRemaining = getTimeRemaining(currentPlayer, currentTime);
  const completedCount = dayPlayers.filter(p => {
    const { hours, minutes } = parseTime(p.scheduledTime);
    const slotEnd = hours * 60 + minutes + 15;
    const currentMinutes = currentHour * 60 + currentMin;
    return slotEnd <= currentMinutes;
  }).length;

  const dayColors = {
    1: 'text-blue-400',
    2: 'text-violet-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-400" />
            Live Now
          </h2>
          <p className="text-sm text-gray-500">Current player at Panini station</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-amber-400">
            <Clock className="w-4 h-4" />
            <span className="font-mono font-bold text-lg">{formattedTime}</span>
          </div>
          <p className="text-xs text-gray-500">PT (Los Angeles)</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-amber-400 font-medium">TIME REMAINING</p>
            <p className={`text-sm ${dayColors[currentPlayer.day]}`}>
              Day {currentPlayer.day} • {currentPlayer.scheduledTime}
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

      <div>
        <p className="text-sm text-amber-400 font-medium mb-2 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          NOW AT STATION
        </p>
        <CurrentPlayerCard player={currentPlayer} onPlayerClick={onPlayerClick} />
      </div>

      {nextPlayer && (
        <div>
          <p className="text-sm text-gray-500 mb-2">UP NEXT:</p>
          <NextPlayerCard player={nextPlayer} onPlayerClick={onPlayerClick} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#141414] border border-green-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-xl">
              🚶
            </div>
            <div>
              <h3 className="font-bold text-green-400">TUNNEL</h3>
              <p className="text-xs text-gray-500">Walk-in + Interview</p>
            </div>
          </div>
        </div>
        <div className="bg-[#141414] border border-amber-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center text-xl">
              📸
            </div>
            <div>
              <h3 className="font-bold text-amber-400">PRODUCT</h3>
              <p className="text-xs text-gray-500">Card Photography</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-400">{completedCount}</p>
            <p className="text-xs text-gray-500">Completed Today</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-400">{dayPlayers.length - completedCount - 1}</p>
            <p className="text-xs text-gray-500">Remaining</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-violet-400">{players.length}</p>
            <p className="text-xs text-gray-500">Total Players</p>
          </div>
        </div>
      </div>
    </div>
  );
}
