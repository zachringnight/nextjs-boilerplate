'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useMounted } from '../hooks/useMounted';
import { usePathname } from 'next/navigation';
import { useASWStore } from '../store';
import type { ClipCategory, ClipPriority, ASWStationId } from '../types';
import { ASW_STATIONS } from '../types';
import { useSchedulePlayers } from '../data/schedule';
import { isCurrentPlayer, getEventDay } from '../lib/schedule-utils';
import {
  Clapperboard,
  ChevronUp,
  X,
  Check,
  Zap,
  Film,
  Settings,
  Pencil,
  Trash2,
  Flag,
} from 'lucide-react';
import { cn, hapticFeedback } from '../lib/utils';
import { CATEGORY_CONFIG, PRIORITY_CONFIG } from '../lib/clip-constants';
import { ACTIVE_PLAYER_UPDATE_INTERVAL } from '../lib/constants';
import { useAuthContext } from './AuthProvider';

// Map station IDs to likely clip categories
const STATION_CATEGORY_MAP: Partial<Record<ASWStationId, ClipCategory>> = {
  tunnel: 'interview',
  product: 'highlight',
};

export default function QuickClipButton() {
  const { players } = useSchedulePlayers();
  const { canEdit } = useAuthContext();
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ station?: string; player?: string; category: string; priority?: string } | null>(null);
  const mounted = useMounted();
  const [activeView, setActiveView] = useState<'stations' | 'categories' | 'defaults'>('stations');
  const [quickPriority, setQuickPriority] = useState<ClipPriority>('normal');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const {
    clips,
    quickMarkCategory,
    clipDefaults,
    setQuickMarkCategory,
    setClipDefaults,
    addClip,
    deleteClip,
    setClipModalOpen,
    setEditingClipId,
    getTodayClipCount,
    getFlaggedCount,
  } = useASWStore();

  const isClipsPage = pathname === '/asw/clips';
  const isLoginPage = pathname === '/asw/login';

  const [defaultCrew, setDefaultCrew] = useState(clipDefaults.crewMember);
  const [defaultCamera, setDefaultCamera] = useState(clipDefaults.camera);

  useEffect(() => {
    setDefaultCrew(clipDefaults.crewMember);
    setDefaultCamera(clipDefaults.camera);
  }, [clipDefaults]);

  // Track current time so active player updates as rotations change
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, ACTIVE_PLAYER_UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Get currently active player
  const activePlayer = useMemo(() => {
    const now = currentTime;
    const eventDay = getEventDay(now);
    if (!eventDay) return null;
    return players.find(p => isCurrentPlayer(p, now, eventDay)) || null;
  }, [currentTime, players]);

  // Recent clips (last 3)
  const recentClips = useMemo(() => {
    return clips.slice(0, 3).map(clip => {
      const cat = CATEGORY_CONFIG[clip.category];
      const time = new Date(clip.timestamp);
      return {
        id: clip.id,
        category: clip.category,
        categoryLabel: cat?.label || clip.category,
        categoryColor: cat?.color || '#9CA3AF',
        stationName: clip.stationId || undefined,
        playerName: clip.playerId ? players.find(p => p.id === clip.playerId)?.name : undefined,
        flagged: clip.flagged,
        priority: clip.priority,
        time: time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      };
    });
  }, [clips, players]);

  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const toastClearRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showFeedback = useCallback((info: { station?: string; player?: string; category: string; priority?: string }) => {
    clearTimeout(toastTimeoutRef.current);
    clearTimeout(toastClearRef.current);
    setSuccessInfo(info);
    setShowSuccess(true);
    hapticFeedback([50, 30, 50]);
    toastTimeoutRef.current = setTimeout(() => setShowSuccess(false), 1200);
    toastClearRef.current = setTimeout(() => setSuccessInfo(null), 2500);
  }, []);

  // Mark for a specific station
  const markStation = useCallback((stationId: ASWStationId) => {
    const station = ASW_STATIONS.find(s => s.id === stationId);
    const category = STATION_CATEGORY_MAP[stationId] || quickMarkCategory;

    const clipData = {
      category,
      stationId: stationId,
      playerId: activePlayer?.id || null,
      priority: quickPriority,
    };
    addClip(clipData);

    showFeedback({
      station: station?.name || stationId,
      player: activePlayer?.name,
      category: CATEGORY_CONFIG[category].label,
      priority: quickPriority !== 'normal' ? PRIORITY_CONFIG[quickPriority].label : undefined,
    });
    setExpanded(false);
  }, [quickMarkCategory, quickPriority, activePlayer, addClip, showFeedback]);

  // Quick mark - one tap
  const quickMark = useCallback(() => {
    const clipData = { category: quickMarkCategory, priority: quickPriority };
    addClip(clipData);

    showFeedback({
      category: CATEGORY_CONFIG[quickMarkCategory].label,
      priority: quickPriority !== 'normal' ? PRIORITY_CONFIG[quickPriority].label : undefined,
    });
    setExpanded(false);
  }, [quickMarkCategory, quickPriority, addClip, showFeedback]);

  // Mark with specific category
  const markWithCategory = useCallback((category: ClipCategory) => {
    const clipData = { category, priority: quickPriority };
    addClip(clipData);
    setQuickMarkCategory(category);

    showFeedback({
      category: CATEGORY_CONFIG[category].label,
      priority: quickPriority !== 'normal' ? PRIORITY_CONFIG[quickPriority].label : undefined,
    });
    setExpanded(false);
  }, [quickPriority, addClip, setQuickMarkCategory, showFeedback]);

  // Save defaults
  const saveDefaults = useCallback(() => {
    setClipDefaults({
      crewMember: defaultCrew.trim(),
      camera: defaultCamera.trim(),
    });
    hapticFeedback([30]);
  }, [defaultCrew, defaultCamera, setClipDefaults]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) return;

      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'm') {
        e.preventDefault();
        quickMark();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quickMark]);

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

  if (!mounted || isClipsPage || isLoginPage || !canEdit) return null;

  const todayCount = getTodayClipCount();
  const flaggedCount = getFlaggedCount();
  const CategoryIcon = CATEGORY_CONFIG[quickMarkCategory].icon;
  const PriorityIcon = PRIORITY_CONFIG[quickPriority].icon;

  return (
    <div className="quick-clip-container fixed bottom-24 right-4 z-40">
      {/* Success Toast */}
      {successInfo && (
        <div className={cn(
          'absolute bottom-20 right-0 bg-[#1A1A1A] border border-[#22C55E]/50 rounded-xl shadow-2xl px-4 py-3 min-w-[220px] pointer-events-none transition-all',
          showSuccess ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        )}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#22C55E]/20 flex items-center justify-center flex-shrink-0">
              <Check className="w-4 h-4 text-[#22C55E]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] text-[#22C55E] font-medium">
                Clip Marked
                {successInfo.priority && (
                  <span className="ml-1 text-[10px] opacity-80">({successInfo.priority})</span>
                )}
              </span>
              <span className="text-xs text-white truncate">
                {successInfo.station && `${successInfo.station}`}
                {successInfo.player && ` — ${successInfo.player}`}
                {!successInfo.station && successInfo.category}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Panel */}
      {expanded && (
        <div className="absolute bottom-16 right-0 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl shadow-2xl overflow-hidden mb-2 w-72 animate-appear">
          {/* Panel Header with Tabs */}
          <div className="bg-[#0D0D0D] border-b border-[#2A2A2A] px-3 py-2 flex items-center justify-between">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveView('stations')}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                  activeView === 'stations'
                    ? 'bg-[#FFD100]/15 text-[#FFD100]'
                    : 'text-[#6B7280] hover:text-white'
                )}
              >
                <Zap className="w-3 h-3 inline mr-1" />
                Stations
              </button>
              <button
                onClick={() => setActiveView('categories')}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                  activeView === 'categories'
                    ? 'bg-[#FFD100]/15 text-[#FFD100]'
                    : 'text-[#6B7280] hover:text-white'
                )}
              >
                <Film className="w-3 h-3 inline mr-1" />
                Category
              </button>
              <button
                onClick={() => setActiveView('defaults')}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                  activeView === 'defaults'
                    ? 'bg-[#FFD100]/15 text-[#FFD100]'
                    : 'text-[#6B7280] hover:text-white'
                )}
              >
                <Settings className="w-3 h-3 inline mr-1" />
                Defaults
              </button>
            </div>
            <button
              onClick={() => setExpanded(false)}
              className="text-[#6B7280] hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Priority Quick Selector */}
          <div className="px-3 py-2 border-b border-[#2A2A2A] flex items-center gap-1.5">
            <span className="text-[10px] text-[#6B7280] uppercase tracking-wider mr-1">Priority:</span>
            {(Object.entries(PRIORITY_CONFIG) as [ClipPriority, typeof PRIORITY_CONFIG[ClipPriority]][]).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <button
                  key={key}
                  onClick={() => setQuickPriority(key)}
                  className={cn(
                    'px-2 py-0.5 rounded text-[10px] font-medium transition-all flex items-center gap-1',
                    quickPriority === key
                      ? 'ring-1'
                      : 'opacity-50 hover:opacity-100'
                  )}
                  style={{
                    backgroundColor: quickPriority === key ? `${config.color}20` : 'transparent',
                    color: config.color,
                    boxShadow: quickPriority === key ? `0 0 0 1px ${config.color}` : undefined,
                  }}
                >
                  <Icon className="w-3 h-3" />
                  {config.label}
                </button>
              );
            })}
          </div>

          {/* Stations View */}
          {activeView === 'stations' && (
            <div className="p-2">
              <div className="grid grid-cols-2 gap-2">
                {ASW_STATIONS.map(station => (
                  <button
                    key={station.id}
                    onClick={() => markStation(station.id as ASWStationId)}
                    className="flex flex-col items-center justify-center p-4 rounded-lg hover:bg-[#2A2A2A] transition-all border border-[#2A2A2A]"
                    style={{ borderColor: `${station.color}40` }}
                  >
                    <span className="text-2xl mb-1">{station.icon}</span>
                    <span className="text-sm text-white font-medium">{station.name}</span>
                    {activePlayer && (
                      <span className="text-[10px] text-[#9CA3AF] mt-1 truncate max-w-full">
                        {activePlayer.firstName}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Categories View */}
          {activeView === 'categories' && (
            <div className="p-2">
              <div className="grid grid-cols-3 gap-1">
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
            </div>
          )}

          {/* Defaults View */}
          {activeView === 'defaults' && (
            <div className="p-3 space-y-3">
              <div>
                <label className="text-[10px] text-[#6B7280] uppercase tracking-wider block mb-1">Crew Member</label>
                <input
                  type="text"
                  value={defaultCrew}
                  onChange={(e) => setDefaultCrew(e.target.value)}
                  placeholder="Your name..."
                  className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg px-2.5 py-1.5 text-white text-xs placeholder-[#6B7280] focus:border-[#FFD100] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#6B7280] uppercase tracking-wider block mb-1">Camera</label>
                <input
                  type="text"
                  value={defaultCamera}
                  onChange={(e) => setDefaultCamera(e.target.value)}
                  placeholder="Camera A, iPhone..."
                  className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg px-2.5 py-1.5 text-white text-xs placeholder-[#6B7280] focus:border-[#FFD100] focus:outline-none"
                />
              </div>
              <button
                onClick={saveDefaults}
                className="w-full py-1.5 bg-[#FFD100] text-black text-xs font-semibold rounded-lg hover:bg-[#FFD100]/90 transition-colors flex items-center justify-center gap-1"
              >
                <Check className="w-3 h-3" />
                Save Defaults
              </button>
            </div>
          )}

          {/* Recent Clips */}
          {recentClips.length > 0 && (
            <div className="border-t border-[#2A2A2A] px-3 py-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">Recent</span>
                <div className="flex items-center gap-2">
                  {flaggedCount > 0 && (
                    <span className="text-[10px] text-[#FFD100] flex items-center gap-0.5">
                      <Flag className="w-2.5 h-2.5" />
                      {flaggedCount}
                    </span>
                  )}
                  <span className="text-[10px] text-[#4A4A4A]">{todayCount} today</span>
                </div>
              </div>
              <div className="space-y-1">
                {recentClips.map(clip => (
                  <div key={clip.id} className="flex items-center gap-2 text-[11px] group/clip">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: clip.categoryColor }} />
                    {clip.flagged && <Flag className="w-2.5 h-2.5 text-[#FFD100] flex-shrink-0" />}
                    <span className="text-[#9CA3AF] truncate flex-1">
                      {clip.playerName || clip.categoryLabel}
                    </span>
                    <span className="text-[#4A4A4A] flex-shrink-0 group-hover/clip:hidden">{clip.time}</span>
                    <div className="hidden group-hover/clip:flex items-center gap-0.5 flex-shrink-0">
                      {deleteConfirmId === clip.id ? (
                        <>
                          <span className="text-[10px] text-red-400 mr-0.5">Delete?</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteClip(clip.id);
                              setDeleteConfirmId(null);
                            }}
                            className="px-1.5 py-0.5 bg-red-500 text-white rounded text-[10px] hover:bg-red-600"
                          >
                            Yes
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmId(null);
                            }}
                            className="px-1.5 py-0.5 bg-[#2A2A2A] text-[#9CA3AF] rounded text-[10px] hover:bg-[#3A3A3A]"
                          >
                            No
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingClipId(clip.id);
                              setClipModalOpen(true);
                              setExpanded(false);
                            }}
                            className="p-1 text-[#6B7280] hover:text-[#FFD100] rounded transition-colors"
                            title="Edit clip"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmId(clip.id);
                            }}
                            className="p-1 text-[#6B7280] hover:text-red-400 rounded transition-colors"
                            title="Delete clip"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
              ? 'bg-[#22C55E] scale-110'
              : quickPriority === 'urgent'
                ? 'bg-[#EF4444] hover:bg-[#EF4444]/90 active:scale-95'
                : 'bg-[#FFD100] hover:bg-[#FFD100]/90 active:scale-95',
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

          {/* Priority indicator */}
          {!showSuccess && quickPriority !== 'normal' && (
            <div
              className="absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#0D0D0D]"
              style={{ backgroundColor: PRIORITY_CONFIG[quickPriority].color }}
            >
              <PriorityIcon className="w-3 h-3 text-white" />
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
