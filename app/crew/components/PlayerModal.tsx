'use client';

import { X, Volume2, AlertTriangle, Languages } from 'lucide-react';
import type { Player } from '../../data/players';
import { tunnelInterviewQuestions } from '../../data/players';
import PlayerAvatar from './PlayerAvatar';

interface PlayerModalProps {
  player: Player;
  onClose: () => void;
  largeText?: boolean;
}

const dayColors = {
  1: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  2: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
};

export default function PlayerModal({ player, onClose, largeText = false }: PlayerModalProps) {
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
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-3xl">{player.flag}</span>
                  <span className={`text-xs px-2 py-1 rounded-full border ${dayColors[player.day]}`}>
                    Day {player.day}
                  </span>
                  {player.embargoed && (
                    <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      EMBARGOED
                    </span>
                  )}
                  {player.translatorNeeded && (
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                      <Languages className="w-3 h-3" />
                      Translator
                    </span>
                  )}
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
                <p className="text-sm text-gray-500 mt-1">{player.scheduledTime}</p>
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

          {/* Station Info */}
          <div className="px-6 py-4 border-b border-[#2a2a2a] bg-[#0f0f0f]">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-xl">
                  🚶
                </div>
                <div>
                  <h3 className="font-bold text-green-400">TUNNEL STATION</h3>
                  <p className="text-xs text-gray-500">Walk-in/hero footage + interview</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center text-xl">
                  📸
                </div>
                <div>
                  <h3 className="font-bold text-amber-400">PRODUCT STATION</h3>
                  <p className="text-xs text-gray-500">Card photography (no interview)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interview Questions */}
          <div className={`p-6 ${largeText ? 'py-8' : ''}`}>
            <div className="mb-6">
              <h3 className={`font-bold text-green-400 flex items-center gap-2 ${largeText ? 'text-lg' : 'text-base'}`}>
                <span className="w-6 h-6 bg-green-500 rounded flex items-center justify-center text-white text-sm">
                  🚶
                </span>
                TUNNEL INTERVIEW QUESTIONS
              </h3>
              <p className="text-xs text-gray-500 ml-8">Partnership messaging + ad voiceover lines</p>
            </div>

            {/* Partnership Questions */}
            <div className="mb-6">
              <h4 className={`text-sm font-semibold text-gray-400 mb-3 ${largeText ? 'text-base' : ''}`}>
                {tunnelInterviewQuestions.partnership.title}
              </h4>
              <ul className={largeText ? 'space-y-5' : 'space-y-3'}>
                {tunnelInterviewQuestions.partnership.questions.map((question, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span
                      className={`${largeText ? 'w-8 h-8 text-sm' : 'w-6 h-6 text-xs'} bg-green-500 rounded-lg flex items-center justify-center font-bold text-white flex-shrink-0`}
                    >
                      {index + 1}
                    </span>
                    <span className={`text-gray-100 leading-relaxed ${largeText ? 'text-xl' : 'text-base'}`}>{question}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Ad VO Questions */}
            <div className="mb-6">
              <h4 className={`text-sm font-semibold text-gray-400 mb-3 ${largeText ? 'text-base' : ''}`}>
                {tunnelInterviewQuestions.adVO.title}
              </h4>
              <ul className={largeText ? 'space-y-5' : 'space-y-3'}>
                {tunnelInterviewQuestions.adVO.questions.map((question, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span
                      className={`${largeText ? 'w-8 h-8 text-sm' : 'w-6 h-6 text-xs'} bg-amber-500 rounded-lg flex items-center justify-center font-bold text-black flex-shrink-0`}
                    >
                      {index + 1}
                    </span>
                    <span className={`text-gray-100 leading-relaxed ${largeText ? 'text-xl' : 'text-base'}`}>{question}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hybrid Questions */}
            <div>
              <h4 className={`text-sm font-semibold text-gray-400 mb-3 ${largeText ? 'text-base' : ''}`}>
                {tunnelInterviewQuestions.hybrid.title}
              </h4>
              <ul className={largeText ? 'space-y-5' : 'space-y-3'}>
                {tunnelInterviewQuestions.hybrid.questions.map((question, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span
                      className={`${largeText ? 'w-8 h-8 text-sm' : 'w-6 h-6 text-xs'} bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white flex-shrink-0`}
                    >
                      {index + 1}
                    </span>
                    <span className={`text-gray-100 leading-relaxed ${largeText ? 'text-xl' : 'text-base'}`}>{question}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer tip */}
          <div className="px-6 pb-6">
            <div className="bg-[#141414] border border-[#2a2a2a] rounded-lg p-3 text-xs text-gray-500">
              <strong className="text-gray-400">15 min per station.</strong> Flex questions based on athlete comfort. Product station is visual only (no interview).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
