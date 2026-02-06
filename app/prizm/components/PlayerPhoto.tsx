'use client';

import { useState } from 'react';
import { cn } from '../lib/utils';

interface PlayerPhotoProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-10 h-10 text-sm',
  md: 'w-14 h-14 text-xl',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-28 h-28 text-4xl',
};

export default function PlayerPhoto({ src, name, size = 'md', className }: PlayerPhotoProps) {
  const [failed, setFailed] = useState(false);
  const initial = name.charAt(0);

  return (
    <div
      className={cn(
        'rounded-full bg-[#2A2A2A] flex items-center justify-center font-bold text-white overflow-hidden flex-shrink-0',
        sizeClasses[size],
        className
      )}
    >
      {src && !failed ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="select-none">{initial}</span>
      )}
    </div>
  );
}
