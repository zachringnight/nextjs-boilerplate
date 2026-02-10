'use client';

import { cn } from '../lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('animate-pulse bg-[#2A2A2A] rounded', className)} />
  );
}

export function StationCardSkeleton() {
  return (
    <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
      <div className="p-3 border-b border-[#2A2A2A]">
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
        <div className="pt-2 border-t border-[#2A2A2A]">
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </div>
  );
}

export function PlayerRowSkeleton() {
  return (
    <div className="bg-[#141414] rounded-2xl border border-[#2A2A2A] p-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Skeleton className="w-14 h-14 rounded-xl" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function PlayerListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <PlayerRowSkeleton key={i} />
      ))}
    </div>
  );
}

export function ScheduleRowSkeleton() {
  return (
    <div className="bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] p-4 flex items-center gap-4">
      <div className="w-20">
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="flex items-center gap-3 flex-1">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  );
}

export function ScheduleListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <ScheduleRowSkeleton key={i} />
      ))}
    </div>
  );
}

export function HeaderSkeleton() {
  return (
    <div className="sticky top-0 z-40 bg-[#0D0D0D] border-b border-[#2A2A2A] px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function PageSkeleton({ type = 'live' }: { type?: 'live' | 'schedule' | 'players' }) {
  return (
    <div>
      <HeaderSkeleton />
      <div className="px-4 py-3 bg-[#1A1A1A] border-b border-[#2A2A2A]">
        <div className="flex justify-between mb-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
      <div className="p-4">
        {type === 'live' && (
          <>
            <Skeleton className="h-6 w-28 mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StationCardSkeleton />
              <StationCardSkeleton />
            </div>
          </>
        )}
        {type === 'schedule' && (
          <>
            <div className="flex gap-2 mb-4">
              <Skeleton className="h-10 w-24 rounded-lg" />
              <Skeleton className="h-10 w-24 rounded-lg" />
              <Skeleton className="h-10 w-24 rounded-lg" />
            </div>
            <ScheduleListSkeleton />
          </>
        )}
        {type === 'players' && (
          <>
            <div className="space-y-3 mb-4">
              <Skeleton className="h-11 w-full rounded-xl" />
              <div className="flex gap-2">
                <Skeleton className="h-7 w-14 rounded-full" />
                <Skeleton className="h-7 w-14 rounded-full" />
                <Skeleton className="h-7 w-14 rounded-full" />
                <Skeleton className="h-7 w-20 rounded-full" />
              </div>
            </div>
            <PlayerListSkeleton />
          </>
        )}
      </div>
    </div>
  );
}

export default Skeleton;
