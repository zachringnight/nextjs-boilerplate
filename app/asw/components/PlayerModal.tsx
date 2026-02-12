'use client';

import { X, Volume2, AlertTriangle, Languages, Crown, PenLine, Star, Trophy } from 'lucide-react';
import type { Player } from '../types';
import PlayerAvatar from './PlayerAvatar';
import InterviewQuestions from './InterviewQuestions';
import { DAY_STYLES, STATION_CONFIG, ASW_TIER_STYLES } from '../lib/constants';

interface PlayerModalProps {
  player: Player;
  onClose: () => void;
  largeText?: boolean;
}

export default function PlayerModal({ player, onClose, largeText = false }: PlayerModalProps) {
  const dayStyle = DAY_STYLES[player.day];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-[backdropFade_0.2s_ease-out]" onClick={onClose} />
      <div className="relative min-h-screen flex items-start justify-center p-4 pt-8">
        <div className="relative bg-[#0a0a0a] border border-[#2a2a2a] rounded-2xl w-full max-w-2xl overflow-hidden animate-[slideUp_0.3s_ease-out]">
          {/* Close */}
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
                  <span className={`text-xs px-2 py-1 rounded-full border ${dayStyle.badge} ${dayStyle.border}`}>
                    Day {player.day}
                  </span>
                  {player.tier && ASW_TIER_STYLES[player.tier] && (
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${ASW_TIER_STYLES[player.tier].bg} ${ASW_TIER_STYLES[player.tier].text}`}>
                      {ASW_TIER_STYLES[player.tier].label}
                    </span>
                  )}
                  {player.league && (
                    <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-medium">
                      {player.league}
                    </span>
                  )}
                  {player.exclusive && (
                    <span className="text-xs px-2 py-1 rounded-full bg-[#FFD100]/20 text-[#FFD100] border border-[#FFD100]/30 flex items-center gap-1 font-medium">
                      <Crown className="w-3 h-3" />
                      EXCLUSIVE
                    </span>
                  )}
                  {player.signingOnly && (
                    <span className="text-xs px-2 py-1 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30 flex items-center gap-1 font-medium">
                      <PenLine className="w-3 h-3" />
                      SIGNING ONLY
                    </span>
                  )}
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
                  #{player.jerseyNumber} {player.position} &bull; {player.team}
                </p>
                <p className="text-sm text-gray-500 mt-1">{player.scheduledTime || 'TBD'}</p>
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
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-3 flex-1 min-w-[140px]">
                <div className={`w-10 h-10 ${STATION_CONFIG.tunnel.bgClass} rounded-lg flex items-center justify-center text-xl`}>
                  {STATION_CONFIG.tunnel.emoji}
                </div>
                <div>
                  <h3 className={`font-bold ${STATION_CONFIG.tunnel.textClass}`}>TUNNEL</h3>
                  <p className="text-xs text-gray-500">Walk-in + Interview</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-1 min-w-[140px]">
                <div className={`w-10 h-10 ${STATION_CONFIG.qa.bgClass} rounded-lg flex items-center justify-center text-xl`}>
                  {STATION_CONFIG.qa.emoji}
                </div>
                <div>
                  <h3 className={`font-bold ${STATION_CONFIG.qa.textClass}`}>Q&A</h3>
                  <p className="text-xs text-gray-500">Interview + Card Photography</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-1 min-w-[140px]">
                <div className={`w-10 h-10 ${STATION_CONFIG.signing.bgClass} rounded-lg flex items-center justify-center text-xl`}>
                  {STATION_CONFIG.signing.emoji}
                </div>
                <div>
                  <h3 className={`font-bold ${STATION_CONFIG.signing.textClass}`}>SIGNING</h3>
                  <p className="text-xs text-gray-500">Autograph Session</p>
                </div>
              </div>
            </div>
          </div>

          {/* Production Notes */}
          {(player.tier || player.tierReason || player.contentNotes) && (
            <div className="px-6 py-4 border-b border-[#2a2a2a]">
              <h3 className="text-xs font-semibold text-[#FFD100] tracking-wide mb-2">PRODUCTION NOTES</h3>
              {player.tier && ASW_TIER_STYLES[player.tier] && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-400">Tier:</span>
                  <span className={`px-2 py-0.5 rounded font-bold text-sm ${ASW_TIER_STYLES[player.tier].bg} ${ASW_TIER_STYLES[player.tier].text}`}>
                    {ASW_TIER_STYLES[player.tier].fullLabel}
                  </span>
                </div>
              )}
              {player.tierReason && (
                <p className="text-sm text-gray-400 mb-1"><strong className="text-gray-300">Reason:</strong> {player.tierReason}</p>
              )}
              {player.contentNotes && (
                <p className="text-sm text-gray-400"><strong className="text-gray-300">Content Plan:</strong> {player.contentNotes}</p>
              )}
            </div>
          )}

          {/* Interview Questions */}
          <div className={`p-6 ${largeText ? 'py-8' : ''}`}>
            <InterviewQuestions largeText={largeText} />
          </div>

          {/* Footer */}
          <div className="px-6 pb-6">
            <div className="bg-[#141414] border border-[#2a2a2a] rounded-lg p-3 text-xs text-gray-500">
              <strong className="text-gray-400">15 min per station.</strong> Flex questions based on athlete comfort. Signing station is autographs only (no interview).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
