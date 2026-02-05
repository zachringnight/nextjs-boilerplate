'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useAppStore } from '../store';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { ClipCategory } from '../types/database';
import {
  Clapperboard,
  ChevronUp,
  Sparkles,
  MessageSquare,
  Film,
  Laugh,
  User,
  Play,
  Video,
  Share2,
  X,
  Check,
} from 'lucide-react';
import { cn } from '../lib/utils';

// Category configuration
const CATEGORY_CONFIG: Record<ClipCategory, { label: string; icon: typeof Video; color: string; shortcut: string }> = {
  highlight: { label: 'Highlight', icon: Sparkles, color: '#FFD100', shortcut: 'H' },
  interview: { label: 'Interview', icon: MessageSquare, color: '#3B82F6', shortcut: 'I' },
  broll: { label: 'B-Roll', icon: Film, color: '#8B5CF6', shortcut: 'B' },
  reaction: { label: 'Reaction', icon: Laugh, color: '#F59E0B', shortcut: 'R' },
  signing: { label: 'Signing', icon: User, color: '#22C55E', shortcut: 'S' },
  pack_rip: { label: 'Pack Rip', icon: Play, color: '#EF4444', shortcut: 'P' },
  general: { label: 'General', icon: Video, color: '#9CA3AF', shortcut: 'G' },
  blooper: { label: 'Blooper', icon: Laugh, color: '#EC4899', shortcut: 'L' },
  social: { label: 'Social', icon: Share2, color: '#06B6D4', shortcut: 'O' },
};

export default function QuickClipButton() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const {
    clips,
    quickMarkCategory,
    setQuickMarkCategory,
    addClip,
    setClipModalOpen,
    getTodayClipCount,
  } = useAppStore();

  // Don't show on the clips page itself
  const isClipsPage = pathname === '/prizm/clips';

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync with Supabase when a clip is added
  const syncClipToSupabase = useCallback(async (clipData: Parameters<typeof addClip>[0]) => {
    const supabase = getSupabase();
    if (supabase && navigator.onLine) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('clip_markers').insert({
          timestamp: new Date().toISOString(),
          category: clipData.category || 'general',
          media_type: clipData.media_type || 'video',
          status: 'marked',
          tags: clipData.tags || [],
          notes: clipData.notes || null,
          player_id: clipData.player_id || null,
          station_id: clipData.station_id || null,
          timecode: clipData.timecode || null,
          camera: clipData.camera || null,
          crew_member: clipData.crew_member || null,
          rating: clipData.rating || null,
        });
      } catch (err) {
        console.error('Error syncing clip to Supabase:', err);
      }
    }
  }, []);

  // Quick mark - one tap to mark a clip
  const quickMark = useCallback(() => {
    const clipData = { category: quickMarkCategory };
    addClip(clipData);
    syncClipToSupabase(clipData);

    // Show success feedback
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1000);
    setExpanded(false);
  }, [quickMarkCategory, addClip, syncClipToSupabase]);

  // Mark with specific category
  const markWithCategory = useCallback((category: ClipCategory) => {
    const clipData = { category };
    addClip(clipData);
    syncClipToSupabase(clipData);
    setQuickMarkCategory(category);

    // Show success feedback
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1000);
    setExpanded(false);
  }, [addClip, syncClipToSupabase, setQuickMarkCategory]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Ctrl/Cmd + M to quick mark
      if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault();
        quickMark();
        return;
      }

      // Ctrl/Cmd + Shift + M to open detailed modal
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        setClipModalOpen(true);
        return;
      }

      // Number keys 1-9 for quick category selection when expanded
      if (expanded && e.key >= '1' && e.key <= '9') {
        const categories = Object.keys(CATEGORY_CONFIG) as ClipCategory[];
        const index = parseInt(e.key) - 1;
        if (index < categories.length) {
          markWithCategory(categories[index]);
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quickMark, markWithCategory, expanded, setClipModalOpen]);

  // Close on click outside
  useEffect(() => {
    if (!expanded) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.quick-clip-container')) {
        setExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expanded]);

  if (!mounted || isClipsPage) return null;

  const todayCount = getTodayClipCount();
  const CategoryIcon = CATEGORY_CONFIG[quickMarkCategory].icon;

  return (
    <div className="quick-clip-container fixed bottom-24 right-4 z-40">
      {/* Category Selector (Expanded) */}
      {expanded && (
        <div className="absolute bottom-16 right-0 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl shadow-2xl overflow-hidden mb-2 w-64">
          <div className="px-3 py-2 bg-[#0D0D0D] border-b border-[#2A2A2A] flex items-center justify-between">
            <span className="text-xs text-[#9CA3AF]">Select Category</span>
            <button
              onClick={() => setExpanded(false)}
              className="text-[#6B7280] hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-2 grid grid-cols-3 gap-1">
            {Object.entries(CATEGORY_CONFIG).map(([key, config], index) => {
              const Icon = config.icon;
              const isSelected = key === quickMarkCategory;
              return (
                <button
                  key={key}
                  onClick={() => markWithCategory(key as ClipCategory)}
                  className={cn(
                    'flex flex-col items-center justify-center p-2 rounded-lg transition-all',
                    isSelected
                      ? 'bg-[#FFD100]/20 ring-1 ring-[#FFD100]'
                      : 'hover:bg-[#2A2A2A]'
                  )}
                >
                  <Icon className="w-5 h-5" style={{ color: config.color }} />
                  <span className="text-[10px] text-white mt-1">{config.label}</span>
                  <span className="text-[8px] text-[#6B7280]">{index + 1}</span>
                </button>
              );
            })}
          </div>
          <div className="px-3 py-2 bg-[#0D0D0D] border-t border-[#2A2A2A]">
            <button
              onClick={() => {
                setExpanded(false);
                setClipModalOpen(true);
              }}
              className="w-full py-2 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white text-xs rounded-lg transition-colors"
            >
              + Add Detailed Clip
            </button>
          </div>
        </div>
      )}

      {/* Main Button Stack */}
      <div className="flex flex-col items-center gap-2">
        {/* Expand/Category Toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg',
            expanded
              ? 'bg-[#2A2A2A] text-white'
              : 'bg-[#1A1A1A] text-[#9CA3AF] hover:text-white border border-[#2A2A2A]'
          )}
        >
          <ChevronUp className={cn('w-5 h-5 transition-transform', expanded && 'rotate-180')} />
        </button>

        {/* Quick Mark Button */}
        <button
          onClick={quickMark}
          disabled={showSuccess}
          className={cn(
            'relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all',
            showSuccess
              ? 'bg-green-500 scale-110'
              : 'bg-[#FFD100] hover:bg-[#FFD100]/90 active:scale-95'
          )}
        >
          {showSuccess ? (
            <Check className="w-7 h-7 text-white" />
          ) : (
            <Clapperboard className="w-7 h-7 text-black" />
          )}

          {/* Category indicator */}
          {!showSuccess && (
            <div
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#0D0D0D]"
              style={{ backgroundColor: CATEGORY_CONFIG[quickMarkCategory].color }}
            >
              <CategoryIcon className="w-3 h-3 text-black" />
            </div>
          )}

          {/* Today's count badge */}
          {todayCount > 0 && !showSuccess && (
            <div className="absolute -bottom-1 -left-1 bg-[#3B82F6] text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 border-2 border-[#0D0D0D]">
              {todayCount > 99 ? '99+' : todayCount}
            </div>
          )}
        </button>
      </div>

      {/* Keyboard shortcut hint */}
      {mounted && (
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 -translate-x-full opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded px-2 py-1 text-[10px] text-[#6B7280] whitespace-nowrap">
            <kbd className="bg-[#2A2A2A] px-1 rounded">Ctrl</kbd>+<kbd className="bg-[#2A2A2A] px-1 rounded">M</kbd>
          </div>
        </div>
      )}
    </div>
  );
}
