import type { Player } from '../../data/players';
import PlayerAvatar from './PlayerAvatar';
import { AlertTriangle, Languages, ChevronRight } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
  onClick: () => void;
}

const dayColors = {
  1: 'border-blue-500/30 hover:border-blue-500/50',
  2: 'border-violet-500/30 hover:border-violet-500/50',
};

const dayBadgeColors = {
  1: 'bg-blue-500/20 text-blue-400',
  2: 'bg-violet-500/20 text-violet-400',
};

export default function PlayerCard({ player, onClick }: PlayerCardProps) {
  return (
    <button
      onClick={onClick}
      className={`group w-full bg-[#141414] border ${dayColors[player.day]} rounded-xl p-4 text-left transition-all duration-200 hover:bg-[#1a1a1a] hover:shadow-lg hover:shadow-black/20 active:scale-[0.98]`}
    >
      <div className="flex gap-4">
        {/* Photo */}
        <PlayerAvatar player={player} size="lg" />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-lg truncate group-hover:text-[#FFD100] transition-colors">{player.firstName} {player.lastName}</h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-2xl">{player.flag}</span>
              <ChevronRight size={16} className="text-gray-600 group-hover:text-[#FFD100] transition-all duration-200 group-hover:translate-x-0.5" />
            </div>
          </div>

          {player.pronunciation && (
            <p className="text-xs text-gray-500 italic mb-1">{player.pronunciation}</p>
          )}

          <p className="text-sm text-gray-400 mb-2">{player.position} • {player.team}</p>

          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${dayBadgeColors[player.day]}`}>
              Day {player.day}
            </span>
            <span className="text-xs text-gray-500">{player.scheduledTime}</span>

            {/* Status badges */}
            {player.embargoed && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-500/20 text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                EMBARGO
              </span>
            )}
            {player.translatorNeeded && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-500/20 text-amber-400 flex items-center gap-1">
                <Languages className="w-3 h-3" />
                Translator
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick bio preview */}
      <p className="text-sm text-gray-500 mt-3 line-clamp-2 group-hover:text-gray-400 transition-colors">
        {player.bio[0]}
      </p>
    </button>
  );
}
