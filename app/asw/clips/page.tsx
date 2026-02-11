'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useASWStore } from '../store';
import {
  ArrowLeft,
  Clapperboard,
  Trash2,
  Flag,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { CATEGORY_CONFIG, PRIORITY_CONFIG } from '../lib/clip-constants';
import { players } from '../data/players';
import type { ClipCategory } from '../types';

export default function ClipsPage() {
  const { clips, deleteClip, toggleClipFlag, largeText } = useASWStore();
  const [filterCategory, setFilterCategory] = useState<ClipCategory | 'all'>('all');
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);

  const filteredClips = useMemo(() => {
    let result = clips;
    if (filterCategory !== 'all') {
      result = result.filter(c => c.category === filterCategory);
    }
    if (showFlaggedOnly) {
      result = result.filter(c => c.flagged);
    }
    return result;
  }, [clips, filterCategory, showFlaggedOnly]);

  const todayCount = clips.filter(
    c => new Date(c.timestamp).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-2 pb-4">
        <Link
          href="/asw"
          className="p-2 rounded-lg bg-[#1A1A1A] hover:bg-[#2A2A2A] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#9CA3AF]" />
        </Link>
        <div className="flex-1">
          <h1 className={cn('font-bold text-white', largeText ? 'text-2xl' : 'text-xl')}>
            Clip Markers
          </h1>
          <p className="text-xs text-[#9CA3AF]">{todayCount} clips today &bull; {clips.length} total</p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setFilterCategory('all')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
              filterCategory === 'all'
                ? 'bg-[#FFD100] text-black'
                : 'bg-[#1A1A1A] text-[#9CA3AF] hover:text-white'
            )}
          >
            All ({clips.length})
          </button>
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
            const count = clips.filter(c => c.category === key).length;
            if (count === 0) return null;
            return (
              <button
                key={key}
                onClick={() => setFilterCategory(key as ClipCategory)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                  filterCategory === key
                    ? 'text-black'
                    : 'bg-[#1A1A1A] text-[#9CA3AF] hover:text-white'
                )}
                style={filterCategory === key ? { backgroundColor: config.color } : undefined}
              >
                {config.label} ({count})
              </button>
            );
          })}
          <button
            onClick={() => setShowFlaggedOnly(!showFlaggedOnly)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1',
              showFlaggedOnly
                ? 'bg-[#FFD100]/20 text-[#FFD100]'
                : 'bg-[#1A1A1A] text-[#9CA3AF] hover:text-white'
            )}
          >
            <Flag className="w-3 h-3" />
            Flagged
          </button>
        </div>

        {/* Clip List */}
        {filteredClips.length === 0 ? (
          <div className="text-center py-16">
            <Clapperboard className="w-12 h-12 text-[#2A2A2A] mx-auto mb-3" />
            <p className="text-[#6B7280]">
              {clips.length === 0 ? 'No clips yet. Use the clip button to mark moments.' : 'No clips match this filter.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredClips.map(clip => {
              const catConfig = CATEGORY_CONFIG[clip.category];
              const prioConfig = PRIORITY_CONFIG[clip.priority];
              const CatIcon = catConfig.icon;
              const player = clip.player_id ? players.find(p => p.id === clip.player_id) : null;
              const time = new Date(clip.timestamp);

              return (
                <div
                  key={clip.id}
                  className={cn(
                    'bg-[#141414] border rounded-xl p-4 transition-all',
                    clip.flagged ? 'border-[#FFD100]/50' : 'border-[#2A2A2A]'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${catConfig.color}20` }}
                    >
                      <CatIcon className="w-5 h-5" style={{ color: catConfig.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-medium text-white">
                          {clip.name || catConfig.label}
                        </span>
                        {clip.priority !== 'normal' && (
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                            style={{ backgroundColor: `${prioConfig.color}20`, color: prioConfig.color }}
                          >
                            {prioConfig.label}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                        <span>{time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                        {player && <span>&bull; {player.name}</span>}
                        {clip.station_id && <span>&bull; {clip.station_id}</span>}
                      </div>
                      {clip.notes && (
                        <p className="text-xs text-[#9CA3AF] mt-1 line-clamp-2">{clip.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => toggleClipFlag(clip.id)}
                        className={cn(
                          'p-1.5 rounded-lg transition-colors',
                          clip.flagged
                            ? 'text-[#FFD100] bg-[#FFD100]/10'
                            : 'text-[#6B7280] hover:text-[#FFD100]'
                        )}
                      >
                        <Flag className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteClip(clip.id)}
                        className="p-1.5 rounded-lg text-[#6B7280] hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
