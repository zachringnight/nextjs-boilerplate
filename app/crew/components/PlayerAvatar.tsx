import type { Player } from '../../data/players';

interface PlayerAvatarProps {
  player: Player;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'w-10 h-10 text-sm',
  md: 'w-14 h-14 text-lg',
  lg: 'w-20 h-20 text-2xl',
  xl: 'w-32 h-32 text-4xl',
};

const positionColors: Record<string, string> = {
  'Forward': 'from-red-500 to-orange-500',
  'Midfielder': 'from-blue-500 to-cyan-500',
  'Defender': 'from-green-500 to-emerald-500',
  'Center Back': 'from-green-500 to-emerald-500',
  'Goalkeeper': 'from-amber-500 to-yellow-500',
};

export default function PlayerAvatar({ player, size = 'md' }: PlayerAvatarProps) {
  const initials = `${player.firstName[0]}${player.lastName[0]}`;
  const gradient = positionColors[player.position] || 'from-gray-500 to-gray-600';

  return (
    <div
      className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-white flex-shrink-0 shadow-lg`}
    >
      {initials}
    </div>
  );
}
