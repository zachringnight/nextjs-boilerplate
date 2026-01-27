'use client';

import { X, Volume2 } from 'lucide-react';
import type { Player } from '../../data/players';
import { stationUniversalQuestions } from '../../data/players';
import PlayerAvatar from './PlayerAvatar';
import { stationConfig } from '../../components/StationIcon';

interface PlayerModalProps {
  player: Player;
  station: string | null;
  onClose: () => void;
  onStationChange: (station: string | null) => void;
  largeText?: boolean;
}

const stationOrder: Array<'field' | 'social' | 'vnr' | 'packRip'> = ['field', 'social', 'vnr', 'packRip'];

const groupColors = {
  1: 'bg-green-500/20 text-green-400 border-green-500/30',
  2: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  3: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
};

export default function PlayerModal({ player, station, onClose, onStationChange, largeText = false }: PlayerModalProps) {
  const activeStation = station || 'field';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative min-h-screen flex items-start justify-center p-4 pt-8">
        <div className="relative bg-[#0a0a0a] border border-[#2a2a2a] rounded-2xl w-full max-w-2xl overflow-hidden">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-[#1a1a1a] hover:bg-[#2a2a2a] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] p-6 pb-4">
            <div className="flex gap-5">
              <PlayerAvatar player={player} size="xl" />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-3xl">{player.flag}</span>
                  <span className={`text-xs px-2 py-1 rounded-full border ${groupColors[player.group as keyof typeof groupColors]}`}>
                    Group {player.group}
                  </span>
                </div>
                <h2 className="text-3xl font-black mb-1">
                  {player.firstName} {player.lastName}
                </h2>
                {player.pronunciation && (
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                    <Volume2 className="w-4 h-4" />
                    <span className="italic">{player.pronunciation}</span>
                  </div>
                )}
                <p className="text-gray-400">
                  {player.position} • {player.team}
                </p>
                <p className="text-sm text-gray-500 mt-1">{player.groupTime}</p>
              </div>
            </div>
          </div>

          {/* Bio & Talking Points */}
          <div className="px-6 py-4 border-b border-[#2a2a2a]">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-xs font-semibold text-gray-500 tracking-wide mb-2">BACKGROUND</h3>
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
                <h3 className="text-xs font-semibold text-amber-400 tracking-wide mb-2">TALKING POINTS</h3>
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
          </div>

          {/* Station Tabs */}
          <div className="px-6 pt-4 border-b border-[#2a2a2a]">
            <div className="flex gap-1 overflow-x-auto pb-4">
              {stationOrder.map((stationKey) => {
                const config = stationConfig[stationKey];
                const isActive = activeStation === stationKey;

                return (
                  <button
                    key={stationKey}
                    onClick={() => onStationChange(stationKey)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? `${config.bgColor} text-white`
                        : 'bg-[#141414] text-gray-400 hover:bg-[#1a1a1a]'
                    }`}
                  >
                    <span>{config.icon}</span>
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Questions */}
          <div className={`p-6 ${largeText ? 'py-8' : ''}`}>
            <div className="mb-4">
              <h3 className={`font-bold ${stationConfig[activeStation as keyof typeof stationConfig].textColor} ${largeText ? 'text-base' : 'text-sm'}`}>
                {stationUniversalQuestions[activeStation as keyof typeof stationUniversalQuestions].title}
              </h3>
              <p className="text-xs text-gray-500">
                {stationUniversalQuestions[activeStation as keyof typeof stationUniversalQuestions].subtitle}
              </p>
            </div>
            <ul className={largeText ? 'space-y-6' : 'space-y-4'}>
              {stationUniversalQuestions[activeStation as keyof typeof stationUniversalQuestions].questions.map((question, index) => {
                return (
                  <li key={index} className="flex items-start gap-4">
                    <span
                      className={`${largeText ? 'w-10 h-10 text-lg' : 'w-8 h-8 text-sm'} bg-amber-500 rounded-lg flex items-center justify-center font-bold text-black flex-shrink-0`}
                    >
                      {index + 1}
                    </span>
                    <span className={`text-gray-100 leading-relaxed ${largeText ? 'text-xl' : 'text-lg'}`}>{question}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Footer tip */}
          <div className="px-6 pb-6">
            <div className="bg-[#141414] border border-[#2a2a2a] rounded-lg p-3 text-xs text-gray-500">
              Flex questions based on athlete comfort. Use generic banks as backup.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
