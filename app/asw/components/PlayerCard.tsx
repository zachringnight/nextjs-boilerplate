import type { Player } from '../types';
import PlayerAvatar from './PlayerAvatar';
import { DAY_STYLES, STATUS_COLORS, ASW_TIER_STYLES } from '../lib/constants';
import { AlertTriangle, Languages, ChevronRight, Crown, PenLine } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
  onClick: () => void;
}

export default function PlayerCard({ player, onClick }: PlayerCardProps) {
  const dayStyle = DAY_STYLES[player.day];
  const tierStyle = player.tier ? ASW_TIER_STYLES[player.tier] : null;

  return (
    <button
      onClick={onClick}
      className={`group w-full bg-[#141414] border ${dayStyle.border} rounded-xl p-4 text-left transition-all duration-200 hover:bg-[#1a1a1a] hover:shadow-lg hover:shadow-black/20 active:scale-[0.98]`}
    >
      <div className="flex gap-4">
        <PlayerAvatar player={player} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <h3 className="font-bold text-lg truncate group-hover:text-[#FFD100] transition-colors">
                {player.firstName} {player.lastName}
              </h3>
              {tierStyle && (
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${tierStyle.bg} ${tierStyle.text}`}>
                  {tierStyle.label}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-2xl">{player.flag}</span>
              <ChevronRight size={16} className="text-gray-600 group-hover:text-[#FFD100] transition-all duration-200 group-hover:translate-x-0.5" />
            </div>
          </div>

          {player.pronunciation && (
            <p className="text-xs text-gray-500 italic mb-1">{player.pronunciation}</p>
          )}

          <p className="text-sm text-gray-400 mb-2">
            #{player.jerseyNumber} {player.position} &bull; {player.team}
          </p>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${dayStyle.badge}`}>
              Day {player.day}
            </span>
            <span className="text-xs text-gray-500">{player.scheduledTime || 'TBD'}</span>

            {player.league && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-cyan-500/20 text-cyan-400">
                {player.league}
              </span>
            )}
            {player.exclusive && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-[#FFD100]/20 text-[#FFD100] flex items-center gap-0.5">
                <Crown className="w-2.5 h-2.5" />
                EXCL
              </span>
            )}
            {player.signingOnly && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-violet-500/20 text-violet-400 flex items-center gap-0.5">
                <PenLine className="w-2.5 h-2.5" />
                SIGNING
              </span>
            )}
            {player.embargoed && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS.embargoed.bg} ${STATUS_COLORS.embargoed.text} flex items-center gap-1`}>
                <AlertTriangle className="w-3 h-3" />
                EMBARGO
              </span>
            )}
            {player.translatorNeeded && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS.translator.bg} ${STATUS_COLORS.translator.text} flex items-center gap-1`}>
                <Languages className="w-3 h-3" />
                Translator
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-500 mt-3 line-clamp-2 group-hover:text-gray-400 transition-colors">
        {player.bio[0]}
      </p>
    </button>
  );
}
