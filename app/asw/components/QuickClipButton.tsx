'use client';

import { useState, useEffect, useCallback } from 'react';
import { useMounted } from '../hooks/useMounted';
import { useASWStore } from '../store';
import type { ClipCategory, ClipPriority } from '../types';
import { players } from '../data/players';
import { STATION_CONFIG } from '../lib/constants';
import {
  Clapperboard,
  ChevronUp,
  X,
  Clock,
  Zap,
  Settings,
} from 'lucide-react';
import { cn, hapticFeedback } from '../lib/utils';
import { CATEGORY_CONFIG, PRIORITY_CONFIG } from '../lib/clip-constants';

// Map ASW station IDs to likely clip categories
const STATION_CATEGORY_MAP: Record<string, ClipCategory> = {
  tunnel: 'tunnel_walk',
  product: 'product_shoot',
};

export default function QuickClipButton() {
  const [expanded, setExpanded] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ category: string; player?: string } | null>(null);
  const mounted = useMounted();
  const [activeView, setActiveView] = useState<'categories' | 'defaults'>('categories');
  const [quickPriority, setQuickPriority] = useState<ClipPriority>('normal');

  const {
    clips,
    quickMarkCategory,
    clipDefaults,
    setQuickMarkCategory,
    setClipDefaults,
    addClip,
    setClipModalOpen,
    getTodayClipCount,
    getFlaggedCount,
  } = useASWStore();

  const [defaultCrew, setDefaultCrew] = useState(clipDefaults.crew_member);
  const [defaultCamera, setDefaultCamera] = useState(clipDefaults.camera);

  useEffect(() => {
    setDefaultCrew(clipDefaults.crew_member);
    setDefaultCamera(clipDefaults.camera);
  }, [clipDefaults]);

  // Quick mark: instantly add a clip marker with the selected category
  const handleQuickMark = useCallback((category: ClipCategory, priority: ClipPriority = 'normal') => {
    const clipData = {
      category,
      media_type: clipDefaults.media_type || 'video' as const,
      camera: clipDefaults.camera || null,
      crew_member: clipDefaults.crew_member || null,
      priority,
      notes: null,
      tags: [],
      flagged: priority === 'urgent',
    };

    addClip(clipData);
    setQuickMarkCategory(category);
    hapticFeedback(50);

    setSuccessInfo({
      category: CATEGORY_CONFIG[category].label,
    });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  }, [clipDefaults, addClip, setQuickMarkCategory]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key.toUpperCase();
      const match = Object.entries(CATEGORY_CONFIG).find(([, config]) => config.shortcut === key);
      if (match) {
        e.preventDefault();
        handleQuickMark(match[0] as ClipCategory, quickPriority);
      }

      if (e.key === 'Escape' && expanded) {
        setExpanded(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleQuickMark, quickPriority, expanded]);

  if (!mounted) return null;

  const todayCount = getTodayClipCount();
  const flaggedCount = getFlaggedCount();

  return (
    <>
      {/* Success toast */}
      {showSuccess && successInfo && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-[#22C55E] text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center gap-2">
            <Clapperboard className="w-4 h-4" />
            Clip marked: {successInfo.category}
            {successInfo.player && ` — ${successInfo.player}`}
          </div>
        </div>
      )}

      {/* Expanded panel */}
      {expanded && (
        <div className="fixed bottom-20 left-0 right-0 z-[55] px-4 pb-2">
          <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] shadow-xl max-w-md mx-auto overflow-hidden">
            {/* Panel header */}
            <div className="flex items-center justify-between p-3 border-b border-[#2A2A2A]">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveView('categories')}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs font-medium transition-colors',
                    activeView === 'categories'
                      ? 'bg-[#FFD100] text-black'
                      : 'text-[#9CA3AF] hover:text-white'
                  )}
                >
                  Quick Mark
                </button>
                <button
                  onClick={() => setActiveView('defaults')}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1',
                    activeView === 'defaults'
                      ? 'bg-[#FFD100] text-black'
                      : 'text-[#9CA3AF] hover:text-white'
                  )}
                >
                  <Settings className="w-3 h-3" />
                  Defaults
                </button>
              </div>
              <button
                onClick={() => setExpanded(false)}
                className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-white hover:bg-[#2A2A2A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {activeView === 'categories' && (
              <div className="p-3 space-y-3">
                {/* Priority selector */}
                <div className="flex gap-1.5">
                  {(Object.entries(PRIORITY_CONFIG) as [ClipPriority, typeof PRIORITY_CONFIG[ClipPriority]][]).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => setQuickPriority(key)}
                        className={cn(
                          'flex-1 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center justify-center gap-1',
                          quickPriority === key
                            ? 'border-current'
                            : 'border-[#2A2A2A] text-[#6B7280] hover:border-[#3A3A3A]'
                        )}
                        style={{
                          color: quickPriority === key ? config.color : undefined,
                          backgroundColor: quickPriority === key ? `${config.color}15` : undefined,
                          borderColor: quickPriority === key ? config.color : undefined,
                        }}
                      >
                        <Icon className="w-3 h-3" />
                        {config.label}
                      </button>
                    );
                  })}
                </div>

                {/* Category grid */}
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => handleQuickMark(key as ClipCategory, quickPriority)}
                        className="p-2.5 rounded-lg border border-[#2A2A2A] hover:border-[#3A3A3A] active:scale-95 transition-all flex flex-col items-center gap-1"
                      >
                        <Icon className="w-5 h-5" style={{ color: config.color }} />
                        <span className="text-white text-[10px] font-medium">{config.label}</span>
                        <kbd className="text-[8px] text-[#6B7280] bg-[#0D0D0D] px-1 rounded">{config.shortcut}</kbd>
                      </button>
                    );
                  })}
                </div>

                {/* Open full modal */}
                <button
                  onClick={() => {
                    setExpanded(false);
                    setClipModalOpen(true);
                  }}
                  className="w-full py-2 text-sm text-[#FFD100] hover:bg-[#FFD100]/10 rounded-lg transition-colors font-medium"
                >
                  Open Full Clip Form
                </button>
              </div>
            )}

            {activeView === 'defaults' && (
              <div className="p-3 space-y-3">
                <div>
                  <label className="block text-[10px] text-[#6B7280] uppercase tracking-wider mb-1">Crew Member</label>
                  <input
                    type="text"
                    value={defaultCrew}
                    onChange={(e) => setDefaultCrew(e.target.value)}
                    onBlur={() => setClipDefaults({ ...clipDefaults, crew_member: defaultCrew })}
                    placeholder="Your name"
                    className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm placeholder-[#6B7280] focus:border-[#FFD100] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#6B7280] uppercase tracking-wider mb-1">Camera</label>
                  <input
                    type="text"
                    value={defaultCamera}
                    onChange={(e) => setDefaultCamera(e.target.value)}
                    onBlur={() => setClipDefaults({ ...clipDefaults, camera: defaultCamera })}
                    placeholder="Camera A"
                    className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm placeholder-[#6B7280] focus:border-[#FFD100] focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating action button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          'fixed z-[55] bottom-[76px] right-4 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all active:scale-90',
          expanded
            ? 'bg-[#2A2A2A] text-white rotate-45'
            : 'bg-[#FFD100] text-black hover:bg-[#FFD100]/90'
        )}
      >
        {expanded ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative">
            <Clapperboard className="w-6 h-6" />
            {todayCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#3B82F6] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {todayCount > 99 ? '99+' : todayCount}
              </span>
            )}
          </div>
        )}
      </button>
    </>
  );
}
