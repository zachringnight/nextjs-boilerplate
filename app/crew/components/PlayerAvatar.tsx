'use client';

import { useState } from 'react';
import Image from 'next/image';
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

const sizePixels = {
  sm: 40,
  md: 56,
  lg: 80,
  xl: 128,
};

const positionColors: Record<string, { gradient: string; bg: string }> = {
  'Forward': { gradient: 'from-red-500 to-orange-500', bg: 'f97316' },
  'Midfielder': { gradient: 'from-blue-500 to-cyan-500', bg: '3b82f6' },
  'Defender': { gradient: 'from-green-500 to-emerald-500', bg: '22c55e' },
  'Center Back': { gradient: 'from-green-500 to-emerald-500', bg: '22c55e' },
  'Goalkeeper': { gradient: 'from-amber-500 to-yellow-500', bg: 'f59e0b' },
};

export default function PlayerAvatar({ player, size = 'md' }: PlayerAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const initials = `${player.firstName[0]}${player.lastName[0]}`;
  const colors = positionColors[player.position] || { gradient: 'from-gray-500 to-gray-600', bg: '6b7280' };

  // If there's a local photo path, try to use it first
  const hasLocalPhoto = player.photo && !player.photo.includes('placeholder');

  if (hasLocalPhoto && !imageError) {
    return (
      <div className={`${sizeClasses[size]} rounded-xl overflow-hidden flex-shrink-0 shadow-lg bg-[#1a1a1a]`}>
        <Image
          src={player.photo}
          alt={`${player.firstName} ${player.lastName}`}
          width={sizePixels[size]}
          height={sizePixels[size]}
          sizes={`${sizePixels[size]}px`}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  // Use stylized placeholder with initials and position-based colors
  return (
    <div
      className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center font-bold text-white flex-shrink-0 shadow-lg relative overflow-hidden`}
    >
      {/* Background pattern for visual interest */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id={`pattern-${player.id}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="2" fill="white" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill={`url(#pattern-${player.id})`} />
        </svg>
      </div>
      <span className="relative z-10">{initials}</span>
    </div>
  );
}
