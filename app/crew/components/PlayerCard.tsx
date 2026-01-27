import type { Player } from '../../data/players';
import PlayerAvatar from './PlayerAvatar';

interface PlayerCardProps {
  player: Player;
  onClick: () => void;
}

const groupColors = {
  1: 'border-green-500/30 hover:border-green-500/50',
  2: 'border-amber-500/30 hover:border-amber-500/50',
  3: 'border-violet-500/30 hover:border-violet-500/50',
};

const groupBadgeColors = {
  1: 'bg-green-500/20 text-green-400',
  2: 'bg-amber-500/20 text-amber-400',
  3: 'bg-violet-500/20 text-violet-400',
};

export default function PlayerCard({ player, onClick }: PlayerCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full bg-[#141414] border ${groupColors[player.group as keyof typeof groupColors]} rounded-xl p-4 text-left transition-all hover:bg-[#1a1a1a] active:scale-[0.98]`}
    >
      <div className="flex gap-4">
        {/* Photo */}
        <PlayerAvatar player={player} size="lg" />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-lg truncate">{player.firstName} {player.lastName}</h3>
            <span className="text-2xl flex-shrink-0">{player.flag}</span>
          </div>

          {player.pronunciation && (
            <p className="text-xs text-gray-500 italic mb-1">{player.pronunciation}</p>
          )}

          <p className="text-sm text-gray-400 mb-2">{player.position} • {player.team}</p>

          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${groupBadgeColors[player.group as keyof typeof groupBadgeColors]}`}>
              Group {player.group}
            </span>
            <span className="text-xs text-gray-500">{player.groupTime}</span>
          </div>
        </div>
      </div>

      {/* Quick bio preview */}
      <p className="text-sm text-gray-500 mt-3 line-clamp-2">
        {player.bio[0]}
      </p>
    </button>
  );
}
