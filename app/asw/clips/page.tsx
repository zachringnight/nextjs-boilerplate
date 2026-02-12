'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useASWStore } from '../store';
import { getPlayerById } from '../data/players';
import type { ASWClipCategory, ASWClipStatus } from '../types/clips';
import { ASW_CATEGORY_CONFIG, ASW_STATUS_CONFIG, ASW_PRIORITY_CONFIG } from '../lib/clip-constants';
import { syncASWClipUpdate, syncASWClipDelete } from '../lib/clip-sync';
import {
  ArrowLeft,
  Film,
  Flag,
  Pencil,
  Trash2,
  Check,
  Star,
} from 'lucide-react';

const STATION_NAMES: Record<string, string> = {
  tunnel: 'Tunnel',
  qa: 'Q&A',
  signing: 'Signing',
};

export default function ClipsPage() {
  const {
    clips,
    deleteClip,
    updateClip,
    setEditingClipId,
    setClipModalOpen,
  } = useASWStore();

  const [filterCategory, setFilterCategory] = useState<ASWClipCategory | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<ASWClipStatus | 'all'>('all');
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredClips = useMemo(() => {
    return clips.filter((clip) => {
      if (filterCategory !== 'all' && clip.category !== filterCategory) return false;
      if (filterStatus !== 'all' && clip.status !== filterStatus) return false;
      if (showFlaggedOnly && !clip.flagged) return false;
      return true;
    });
  }, [clips, filterCategory, filterStatus, showFlaggedOnly]);

  const handleDeleteClip = (id: string) => {
    deleteClip(id);
    syncASWClipDelete(id);
    setDeleteConfirmId(null);
  };

  const handleStatusChange = (id: string, status: ASWClipStatus) => {
    updateClip(id, { status });
    syncASWClipUpdate(id, { status, updated_at: new Date().toISOString() });
  };

  const handleToggleFlag = (id: string, currentFlagged: boolean) => {
    updateClip(id, { flagged: !currentFlagged });
    syncASWClipUpdate(id, { flagged: !currentFlagged, updated_at: new Date().toISOString() });
  };

  const openEditModal = (clipId: string) => {
    setEditingClipId(clipId);
    setClipModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0D0D0D]/95 backdrop-blur-sm border-b border-[#2A2A2A] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/asw" className="text-[#9CA3AF] hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-2">
              <Film size={20} className="text-purple-400" />
              <h1 className="text-lg font-bold text-white">Clip Markers</h1>
              <span className="text-sm text-[#9CA3AF]">({clips.length})</span>
            </div>
          </div>
          <button
            onClick={() => setShowFlaggedOnly(!showFlaggedOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              showFlaggedOnly
                ? 'bg-[#EF4444]/20 text-[#EF4444]'
                : 'bg-[#2A2A2A] text-[#9CA3AF] hover:text-white'
            }`}
          >
            <Flag size={14} />
            Flagged
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-3 space-y-2 border-b border-[#2A2A2A]">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filterCategory === 'all' ? 'bg-[#FFD100] text-black' : 'bg-[#2A2A2A] text-[#9CA3AF]'
            }`}
          >
            All
          </button>
          {(Object.entries(ASW_CATEGORY_CONFIG) as [ASWClipCategory, typeof ASW_CATEGORY_CONFIG[ASWClipCategory]][]).map(
            ([key, config]) => (
              <button
                key={key}
                onClick={() => setFilterCategory(key)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  filterCategory === key ? 'text-black' : 'bg-[#2A2A2A] text-[#9CA3AF]'
                }`}
                style={filterCategory === key ? { backgroundColor: config.color } : undefined}
              >
                {config.label}
              </button>
            )
          )}
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filterStatus === 'all' ? 'bg-[#FFD100] text-black' : 'bg-[#2A2A2A] text-[#9CA3AF]'
            }`}
          >
            Any Status
          </button>
          {(Object.entries(ASW_STATUS_CONFIG) as [ASWClipStatus, typeof ASW_STATUS_CONFIG[ASWClipStatus]][]).map(
            ([key, config]) => (
              <button
                key={key}
                onClick={() => setFilterStatus(key)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  filterStatus === key ? 'text-black' : 'bg-[#2A2A2A] text-[#9CA3AF]'
                }`}
                style={filterStatus === key ? { backgroundColor: config.color } : undefined}
              >
                {config.label}
              </button>
            )
          )}
        </div>
      </div>

      {/* Clips List */}
      <div className="p-4 space-y-3">
        {filteredClips.length === 0 ? (
          <div className="text-center py-16">
            <Film className="w-12 h-12 text-[#4B5563] mx-auto mb-3" />
            <p className="text-[#9CA3AF]">
              {clips.length === 0 ? 'No clips yet. Use the clip button to start marking.' : 'No clips match your filters.'}
            </p>
          </div>
        ) : (
          filteredClips.map((clip) => {
            const catConfig = ASW_CATEGORY_CONFIG[clip.category];
            const priorityConfig = ASW_PRIORITY_CONFIG[clip.priority];
            const CatIcon = catConfig.icon;
            const player = clip.player_id ? getPlayerById(clip.player_id) : null;
            const stationName = clip.station_id ? STATION_NAMES[clip.station_id] : null;
            const time = new Date(clip.timestamp).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            });
            const date = new Date(clip.timestamp).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={clip.id}
                className={`bg-[#1A1A1A] rounded-xl border p-4 ${
                  clip.flagged ? 'border-[#EF4444]/50' : 'border-[#2A2A2A]'
                }`}
              >
                {/* Top row */}
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${catConfig.color}20` }}
                  >
                    <CatIcon className="w-5 h-5" style={{ color: catConfig.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-white text-sm truncate">
                        {clip.name || catConfig.label}
                      </p>
                      {clip.flagged && <Flag className="w-3 h-3 text-[#EF4444] flex-shrink-0" />}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#9CA3AF] flex-wrap">
                      <span>{date} {time}</span>
                      {player && <span className="text-white">{player.firstName} {player.lastName}</span>}
                      {stationName && <span className="text-[#FFD100]">{stationName}</span>}
                      {clip.timecode && <span className="font-mono">{clip.timecode}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleFlag(clip.id, clip.flagged)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        clip.flagged ? 'text-[#EF4444]' : 'text-[#4B5563] hover:text-[#EF4444]'
                      }`}
                    >
                      <Flag className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(clip.id)}
                      className="p-1.5 text-[#9CA3AF] hover:text-white rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    {deleteConfirmId === clip.id ? (
                      <button
                        onClick={() => handleDeleteClip(clip.id)}
                        className="p-1.5 text-[#EF4444] rounded-lg"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(clip.id)}
                        className="p-1.5 text-[#9CA3AF] hover:text-[#EF4444] rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {clip.notes && (
                  <p className="mt-2 text-xs text-[#9CA3AF] line-clamp-2">{clip.notes}</p>
                )}

                {/* Bottom badges row */}
                <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                  {/* Status selector */}
                  <div className="flex gap-0.5">
                    {(Object.entries(ASW_STATUS_CONFIG) as [ASWClipStatus, typeof ASW_STATUS_CONFIG[ASWClipStatus]][]).map(
                      ([key, config]) => (
                        <button
                          key={key}
                          onClick={() => handleStatusChange(clip.id, key)}
                          className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                            clip.status === key ? 'text-black' : 'text-[#6B7280] bg-[#2A2A2A]'
                          }`}
                          style={clip.status === key ? { backgroundColor: config.color } : undefined}
                        >
                          {config.label}
                        </button>
                      )
                    )}
                  </div>
                  {/* Priority badge */}
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-medium"
                    style={{ backgroundColor: `${priorityConfig.color}20`, color: priorityConfig.color }}
                  >
                    {priorityConfig.label}
                  </span>
                  {/* Rating */}
                  {clip.rating && clip.rating > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] text-[#FFD100]">
                      <Star className="w-3 h-3 fill-[#FFD100]" />
                      {clip.rating}
                    </span>
                  )}
                  {/* Tags */}
                  {clip.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-[#2A2A2A] text-[#9CA3AF] text-[10px] rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
