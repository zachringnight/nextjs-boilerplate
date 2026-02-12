'use client';

import { useState, useMemo, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useMounted } from '../hooks/useMounted';
import { useASWStore } from '../store';
import { ASWClipCategory, ASWClipPriority } from '../types/clips';
import { ASW_CATEGORY_CONFIG, ASW_PRIORITY_CONFIG } from '../lib/clip-constants';
import { syncASWClipInsert, syncASWClipDelete } from '../lib/clip-sync';
import {
  Clapperboard,
  ChevronUp,
  X,
  Check,
  Zap,
  Pencil,
  Trash2,
  Flag,
} from 'lucide-react';

export default function QuickClipButton() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ category: string } | null>(null);
  const mounted = useMounted();
  const [activeView, setActiveView] = useState<'categories' | 'recent'>('categories');
  const [quickPriority, setQuickPriority] = useState<ASWClipPriority>('normal');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const {
    clips,
    quickMarkCategory,
    clipDefaults,
    setQuickMarkCategory,
    addClip,
    deleteClip,
    setClipModalOpen,
    setEditingClipId,
    getTodayClipCount,
    getFlaggedCount,
  } = useASWStore();

  const isClipsPage = pathname === '/asw/clips';

  const todayCount = useMemo(() => getTodayClipCount(), [clips]);
  const flaggedCount = useMemo(() => getFlaggedCount(), [clips]);

  const recentClips = useMemo(() => clips.slice(0, 5), [clips]);

  const handleQuickMark = useCallback(async (category: ASWClipCategory) => {
    const now = new Date();
    const clip = {
      id: `clip-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: now.toISOString(),
      category,
      tags: [],
      media_type: clipDefaults.media_type || ('video' as const),
      camera: clipDefaults.camera || null,
      crew_member: clipDefaults.crew_member || null,
      status: 'marked' as const,
      priority: quickPriority,
      flagged: false,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    addClip(clip);
    syncASWClipInsert(clip);

    const config = ASW_CATEGORY_CONFIG[category];
    setSuccessInfo({ category: config.label });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1500);
    setQuickMarkCategory(category);
  }, [clipDefaults, quickPriority, addClip, setSuccessInfo, setShowSuccess, setQuickMarkCategory]);

  if (!mounted || isClipsPage) return null;

  const handleDeleteClip = async (clipId: string) => {
    deleteClip(clipId);
    syncASWClipDelete(clipId);
    setDeleteConfirmId(null);
  };

  const openEditModal = (clipId: string) => {
    setEditingClipId(clipId);
    setClipModalOpen(true);
    setExpanded(false);
  };

  const openAddModal = () => {
    setEditingClipId(null);
    setClipModalOpen(true);
    setExpanded(false);
  };

  // Success flash overlay
  if (showSuccess && successInfo) {
    return (
      <div className="fixed bottom-24 right-4 z-50 animate-[fadeIn_0.2s_ease-out]">
        <div className="flex items-center gap-2 bg-[#22C55E] text-black rounded-full px-4 py-3 shadow-lg">
          <Check className="w-5 h-5" />
          <span className="font-medium text-sm">{successInfo.category} Marked</span>
        </div>
      </div>
    );
  }

  // Collapsed FAB
  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="fixed bottom-24 right-4 z-50 w-14 h-14 bg-[#FFD100] text-black rounded-full shadow-lg flex items-center justify-center hover:bg-[#FFD100]/90 active:scale-95 transition-all"
      >
        <Clapperboard className="w-6 h-6" />
        {todayCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#3B82F6] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {todayCount}
          </span>
        )}
      </button>
    );
  }

  // Expanded panel
  return (
    <div className="fixed bottom-24 right-4 z-50 w-80 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A2A2A]">
          <div className="flex items-center gap-2">
            <Clapperboard className="w-5 h-5 text-[#FFD100]" />
            <span className="font-semibold text-white text-sm">Quick Clip</span>
            <span className="text-xs text-[#9CA3AF]">({todayCount} today)</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={openAddModal}
              className="p-1.5 text-[#9CA3AF] hover:text-white hover:bg-[#2A2A2A] rounded-lg transition-colors"
              title="Full editor"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => setExpanded(false)}
              className="p-1.5 text-[#9CA3AF] hover:text-white hover:bg-[#2A2A2A] rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex border-b border-[#2A2A2A]">
          {(['categories', 'recent'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                activeView === view
                  ? 'text-[#FFD100] border-b-2 border-[#FFD100]'
                  : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              {view === 'categories' ? 'Categories' : `Recent (${recentClips.length})`}
            </button>
          ))}
        </div>

        {/* Priority Quick Select */}
        <div className="flex items-center gap-1 px-3 py-2 border-b border-[#2A2A2A]">
          <span className="text-[10px] text-[#9CA3AF] mr-1">Priority:</span>
          {(Object.entries(ASW_PRIORITY_CONFIG) as [ASWClipPriority, typeof ASW_PRIORITY_CONFIG[ASWClipPriority]][]).map(
            ([key, config]) => (
              <button
                key={key}
                onClick={() => setQuickPriority(key)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  quickPriority === key
                    ? 'text-black'
                    : 'text-[#9CA3AF] hover:text-white bg-[#2A2A2A]'
                }`}
                style={quickPriority === key ? { backgroundColor: config.color } : undefined}
              >
                {config.label}
              </button>
            )
          )}
        </div>

        {/* Content */}
        <div className="max-h-64 overflow-y-auto">
          {activeView === 'categories' ? (
            <div className="grid grid-cols-2 gap-1.5 p-3">
              {(Object.entries(ASW_CATEGORY_CONFIG) as [ASWClipCategory, typeof ASW_CATEGORY_CONFIG[ASWClipCategory]][]).map(
                ([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => handleQuickMark(key)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#2A2A2A] hover:bg-[#3A3A3A] transition-colors text-left"
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" style={{ color: config.color }} />
                      <span className="text-xs text-white font-medium">{config.label}</span>
                    </button>
                  );
                }
              )}
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {recentClips.length === 0 ? (
                <p className="text-center text-[#9CA3AF] text-xs py-4">No clips yet</p>
              ) : (
                recentClips.map((clip) => {
                  const config = ASW_CATEGORY_CONFIG[clip.category];
                  const Icon = config.icon;
                  const time = new Date(clip.timestamp).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  });

                  return (
                    <div
                      key={clip.id}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#2A2A2A] transition-colors group"
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" style={{ color: config.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white truncate">{clip.name || config.label}</p>
                        <p className="text-[10px] text-[#9CA3AF]">{time}</p>
                      </div>
                      {clip.flagged && <Flag className="w-3 h-3 text-[#EF4444]" />}
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(clip.id)}
                          className="p-1 text-[#9CA3AF] hover:text-white rounded"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        {deleteConfirmId === clip.id ? (
                          <button
                            onClick={() => handleDeleteClip(clip.id)}
                            className="p-1 text-[#EF4444] hover:text-[#EF4444] rounded"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(clip.id)}
                            className="p-1 text-[#9CA3AF] hover:text-[#EF4444] rounded"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
