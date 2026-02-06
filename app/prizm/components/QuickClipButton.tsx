'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAppStore } from '../store';
import { ClipCategory, ClipPriority } from '../types/database';
import { StationId } from '../types';
import { stations as stationData, getStationById } from '../data/stations';
import { players as playerData } from '../data/players';
import { formatDate, isCurrentSlot } from '../lib/time';
import {
  Clapperboard,
  ChevronUp,
  X,
  Check,
  Clock,
  Zap,
  Film,
  Eye,
  Flag,
  Settings,
} from 'lucide-react';
import { cn, hapticFeedback } from '../lib/utils';
import { CATEGORY_CONFIG, PRIORITY_CONFIG } from '../lib/clip-constants';
import { syncClipInsert } from '../lib/clip-sync';

// Map station IDs to likely clip categories
const STATION_CATEGORY_MAP: Partial<Record<StationId, ClipCategory>> = {
  ledWall: 'highlight',
  signing: 'signing',
  packRip: 'pack_rip',
  prCall: 'interview',
  kidReporter: 'interview',
  deacon: 'interview',
};

interface ActiveStationInfo {
  stationId: StationId;
  stationName: string;
  stationIcon: string;
  stationColor: string;
  playerId: string;
  playerName: string;
  startTime: string;
  endTime: string;
}

export default function QuickClipButton() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ station?: string; player?: string; category: string; priority?: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeView, setActiveView] = useState<'stations' | 'categories' | 'defaults'>('stations');
  const [quickPriority, setQuickPriority] = useState<ClipPriority>('normal');
  const {
    clips,
    schedule,
    quickMarkCategory,
    clipDefaults,
    setQuickMarkCategory,
    setClipDefaults,
    addClip,
    setClipModalOpen,
    getTodayClipCount,
    getFlaggedCount,
  } = useAppStore();

  // Don't show on the clips page itself
  const isClipsPage = pathname === '/prizm/clips';

  // Tick counter that increments every 30s to refresh active-station checks
  const [tick, setTick] = useState(0);

  // Local state for defaults form
  const [defaultCrew, setDefaultCrew] = useState(clipDefaults.crew_member);
  const [defaultCamera, setDefaultCamera] = useState(clipDefaults.camera);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setTick(t => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  // Sync local defaults when store changes
  useEffect(() => {
    setDefaultCrew(clipDefaults.crew_member);
    setDefaultCamera(clipDefaults.camera);
  }, [clipDefaults]);

  // Get currently active stations from the live schedule
  const activeStations = useMemo((): ActiveStationInfo[] => {
    // `tick` is listed so the memo recalculates as time passes
    void tick;
    const now = new Date();
    const today = formatDate(now);

    return schedule
      .filter(slot =>
        slot.date === today &&
        slot.station !== 'free' &&
        slot.status !== 'cancelled' &&
        isCurrentSlot(slot.date, slot.startTime, slot.endTime)
      )
      .map(slot => {
        const station = getStationById(slot.station);
        const player = playerData.find(p => p.id === slot.playerId);
        return {
          stationId: slot.station,
          stationName: station?.name || slot.station,
          stationIcon: station?.icon || '',
          stationColor: station?.color || '#6b7280',
          playerId: slot.playerId,
          playerName: player?.name || slot.playerId,
          startTime: slot.startTime,
          endTime: slot.endTime,
        };
      });
  }, [schedule, tick]);

  // Get recent clips (last 3)
  const recentClips = useMemo(() => {
    return clips.slice(0, 3).map(clip => {
      const station = clip.station_id ? getStationById(clip.station_id as StationId) : null;
      const player = clip.player_id ? playerData.find(p => p.id === clip.player_id) : null;
      const cat = CATEGORY_CONFIG[clip.category];
      const time = new Date(clip.timestamp);
      return {
        id: clip.id,
        category: clip.category,
        categoryLabel: cat?.label || clip.category,
        categoryColor: cat?.color || '#9CA3AF',
        stationName: station?.name,
        stationIcon: station?.icon,
        playerName: player?.name,
        flagged: clip.flagged,
        priority: clip.priority,
        time: time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      };
    });
  }, [clips]);

  // Toast timeout ref for cleanup on rapid-fire marking
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const toastClearRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Show success feedback (clears previous timeouts on rapid marking)
  const showFeedback = useCallback((info: { station?: string; player?: string; category: string; priority?: string }) => {
    clearTimeout(toastTimeoutRef.current);
    clearTimeout(toastClearRef.current);
    setSuccessInfo(info);
    setShowSuccess(true);
    hapticFeedback([50, 30, 50]);
    toastTimeoutRef.current = setTimeout(() => setShowSuccess(false), 1200);
    toastClearRef.current = setTimeout(() => setSuccessInfo(null), 2500);
  }, []);

  // Quick mark for a specific active station (auto-fills player + station + category)
  const markStation = useCallback((stationInfo: ActiveStationInfo) => {
    const category = STATION_CATEGORY_MAP[stationInfo.stationId] || quickMarkCategory;
    const clipData = {
      category,
      station_id: stationInfo.stationId,
      player_id: stationInfo.playerId,
      priority: quickPriority,
    };
    addClip(clipData);
    syncClipInsert(clipData);

    showFeedback({
      station: stationInfo.stationName,
      player: stationInfo.playerName,
      category: CATEGORY_CONFIG[category].label,
      priority: quickPriority !== 'normal' ? PRIORITY_CONFIG[quickPriority].label : undefined,
    });
    setExpanded(false);
  }, [quickMarkCategory, quickPriority, addClip, showFeedback]);

  // Quick mark - one tap to mark a clip (uses current category)
  const quickMark = useCallback(() => {
    const clipData = { category: quickMarkCategory, priority: quickPriority };
    addClip(clipData);
    syncClipInsert(clipData);

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
    syncClipInsert(clipData);
    setQuickMarkCategory(category);

    showFeedback({
      category: CATEGORY_CONFIG[category].label,
      priority: quickPriority !== 'normal' ? PRIORITY_CONFIG[quickPriority].label : undefined,
    });
    setExpanded(false);
  }, [quickPriority, addClip, setQuickMarkCategory, showFeedback]);

  // Mark a specific station from the "all stations" grid (not necessarily live)
  const markStationById = useCallback((stationId: StationId) => {
    const station = getStationById(stationId);
    const category = STATION_CATEGORY_MAP[stationId] || quickMarkCategory;

    // Check if there's a live player at this station
    const liveStation = activeStations.find(s => s.stationId === stationId);

    const clipData = {
      category,
      station_id: stationId,
      player_id: liveStation?.playerId || null,
      priority: quickPriority,
    };
    addClip(clipData);
    syncClipInsert(clipData);

    showFeedback({
      station: station?.name || stationId,
      player: liveStation?.playerName,
      category: CATEGORY_CONFIG[category].label,
      priority: quickPriority !== 'normal' ? PRIORITY_CONFIG[quickPriority].label : undefined,
    });
    setExpanded(false);
  }, [quickMarkCategory, quickPriority, activeStations, addClip, showFeedback]);

  // Save defaults
  const saveDefaults = useCallback(() => {
    setClipDefaults({
      crew_member: defaultCrew.trim(),
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
      ) {
        return;
      }

      // Ctrl/Cmd + M to quick mark
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'm') {
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
      if (expanded && activeView === 'categories' && e.key >= '1' && e.key <= '9') {
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
  }, [quickMark, markWithCategory, expanded, activeView, setClipModalOpen]);

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
  const flaggedCount = getFlaggedCount();
  const CategoryIcon = CATEGORY_CONFIG[quickMarkCategory].icon;
  const hasLiveStations = activeStations.length > 0;
  const PriorityIcon = PRIORITY_CONFIG[quickPriority].icon;

  return (
    <div className="quick-clip-container fixed bottom-24 right-4 z-40">
      {/* Success Toast */}
      {successInfo && (
        <div className={cn(
          'quick-clip-toast absolute bottom-20 right-0 bg-[#1A1A1A] border border-[#22C55E]/50 rounded-xl shadow-2xl px-4 py-3 min-w-[220px] pointer-events-none',
          showSuccess ? 'quick-clip-toast-enter' : 'quick-clip-toast-exit'
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
        <div className="quick-clip-panel absolute bottom-16 right-0 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl shadow-2xl overflow-hidden mb-2 w-72">
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
              {/* Live Stations */}
              {hasLiveStations && (
                <div className="mb-2">
                  <div className="px-2 py-1 flex items-center gap-1.5">
                    <span className="quick-clip-live-dot" />
                    <span className="text-[10px] font-semibold text-[#22C55E] uppercase tracking-wider">Live Now</span>
                  </div>
                  <div className="space-y-1">
                    {activeStations.map(station => (
                      <button
                        key={`${station.stationId}-${station.playerId}`}
                        onClick={() => markStation(station)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#2A2A2A] transition-all group"
                        style={{ borderLeft: `3px solid ${station.stationColor}` }}
                      >
                        <span className="text-lg">{station.stationIcon}</span>
                        <div className="flex-1 text-left min-w-0">
                          <div className="text-sm text-white font-medium truncate">{station.playerName}</div>
                          <div className="text-[11px] text-[#6B7280] flex items-center gap-1">
                            <span>{station.stationName}</span>
                            <span className="text-[#4A4A4A]">·</span>
                            <Clock className="w-3 h-3" />
                            <span>{station.startTime}–{station.endTime}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-[#FFD100] bg-[#FFD100]/10 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          MARK
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* All Stations Grid */}
              <div>
                {hasLiveStations && (
                  <div className="px-2 py-1">
                    <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">All Stations</span>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-1">
                  {stationData.filter(s => s.id !== 'free').map(station => {
                    const isLive = activeStations.some(a => a.stationId === station.id);
                    return (
                      <button
                        key={station.id}
                        onClick={() => markStationById(station.id)}
                        className={cn(
                          'flex flex-col items-center justify-center p-2 rounded-lg transition-all relative',
                          isLive
                            ? 'bg-[#FFD100]/5 ring-1 ring-[#FFD100]/30'
                            : 'hover:bg-[#2A2A2A]'
                        )}
                      >
                        <span className="text-lg">{station.icon}</span>
                        <span className="text-[10px] text-white mt-0.5">{station.name.replace(' Station', '').replace(' / Buffer', '')}</span>
                        {isLive && (
                          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#22C55E] quick-clip-live-dot" />
                        )}
                      </button>
                    );
                  })}
                </div>
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
              <p className="text-[9px] text-[#6B7280] text-center">
                These auto-fill when creating clips
              </p>
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
                  <div key={clip.id} className="flex items-center gap-2 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: clip.categoryColor }} />
                    {clip.flagged && <Flag className="w-2.5 h-2.5 text-[#FFD100] flex-shrink-0" />}
                    {clip.priority === 'urgent' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] flex-shrink-0 animate-pulse" />
                    )}
                    <span className="text-[#9CA3AF] truncate flex-1">
                      {clip.stationIcon && <span className="mr-1">{clip.stationIcon}</span>}
                      {clip.playerName || clip.categoryLabel}
                    </span>
                    <span className="text-[#4A4A4A] flex-shrink-0">{clip.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="border-t border-[#2A2A2A] px-3 py-2 flex gap-2">
            <button
              onClick={() => {
                setExpanded(false);
                setClipModalOpen(true);
              }}
              className="flex-1 py-2 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              Detailed Clip
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
            'quick-clip-fab relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all',
            showSuccess
              ? 'bg-[#22C55E] scale-110'
              : quickPriority === 'urgent'
                ? 'bg-[#EF4444] hover:bg-[#EF4444]/90 active:scale-95'
                : 'bg-[#FFD100] hover:bg-[#FFD100]/90 active:scale-95',
            hasLiveStations && !showSuccess && 'quick-clip-fab-live'
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

          {/* Live indicator ring */}
          {hasLiveStations && !showSuccess && !expanded && (
            <span className="quick-clip-pulse-ring" />
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
