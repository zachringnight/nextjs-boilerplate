'use client';

import { useState } from 'react';
import Image from 'next/image';
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
  lg: 'w-16 h-16 text-2xl',
  xl: 'w-28 h-28 text-4xl',
};

const sizePixels = {
  sm: 40,
  md: 56,
  lg: 64,
  xl: 112,
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
        <Image
          src={src}
          alt={name}
          width={sizePixels[size]}
          height={sizePixels[size]}
          sizes={`${sizePixels[size]}px`}
          className="w-full h-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="select-none">{initial}</span>
      )}
    </div>
  );
}
