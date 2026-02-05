'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import { useAppStore } from '../store';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { ClipMarker, ClipCategory, ClipStatus, MediaType } from '../types/database';
import { StationId } from '../types';
import { getPlayerById, players } from '../data/players';
import { stations } from '../data/stations';
import {
  Video,
  Camera,
  Mic,
  Star,
  StarOff,
  Tag,
  X,
  Plus,
  Check,
  Trash2,
  Filter,
  Clock,
  User,
  Film,
  RefreshCw,
  Wifi,
  WifiOff,
  ChevronDown,
  ChevronUp,
  Clapperboard,
  Sparkles,
  MessageSquare,
  Laugh,
  Share2,
  Play,
  Archive,
  Eye,
  Download,
  Keyboard,
} from 'lucide-react';
import { cn } from '../lib/utils';

// Category configuration with icons and colors
const CATEGORY_CONFIG: Record<ClipCategory, { label: string; icon: typeof Video; color: string }> = {
  highlight: { label: 'Highlight', icon: Sparkles, color: '#FFD100' },
  interview: { label: 'Interview', icon: MessageSquare, color: '#3B82F6' },
  broll: { label: 'B-Roll', icon: Film, color: '#8B5CF6' },
  reaction: { label: 'Reaction', icon: Laugh, color: '#F59E0B' },
  signing: { label: 'Signing', icon: User, color: '#22C55E' },
  pack_rip: { label: 'Pack Rip', icon: Play, color: '#EF4444' },
  general: { label: 'General', icon: Video, color: '#9CA3AF' },
  blooper: { label: 'Blooper', icon: Laugh, color: '#EC4899' },
  social: { label: 'Social', icon: Share2, color: '#06B6D4' },
};

const STATUS_CONFIG: Record<ClipStatus, { label: string; color: string; icon: typeof Eye }> = {
  marked: { label: 'Marked', color: '#3B82F6', icon: Clapperboard },
  reviewed: { label: 'Reviewed', color: '#F59E0B', icon: Eye },
  exported: { label: 'Exported', color: '#22C55E', icon: Download },
  archived: { label: 'Archived', color: '#6B7280', icon: Archive },
};

const MEDIA_CONFIG: Record<MediaType, { label: string; icon: typeof Video }> = {
  video: { label: 'Video', icon: Video },
  photo: { label: 'Photo', icon: Camera },
  audio: { label: 'Audio', icon: Mic },
};

export default function ClipsPage() {
  const {
    largeText,
    clips,
    setClips,
    addClip,
    updateClip,
    deleteClip,
    quickMarkCategory,
    setQuickMarkCategory,
    setClipModalOpen,
  } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedClip, setExpandedClip] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<ClipCategory | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<ClipStatus | 'all'>('all');
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  // Form state
  const [category, setCategory] = useState<ClipCategory>('general');
  const [mediaType, setMediaType] = useState<MediaType>('video');
  const [playerId, setPlayerId] = useState('');
  const [stationId, setStationId] = useState<StationId | ''>('');
  const [notes, setNotes] = useState('');
  const [timecode, setTimecode] = useState('');
  const [camera, setCamera] = useState('');
  const [crewMember, setCrewMember] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [rating, setRating] = useState<number>(0);

  // Load clips from Supabase
  const loadClips = useCallback(async () => {
    const supabase = getSupabase();

    if (supabase && isOnline) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
          .from('clip_markers')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(100);

        if (error) throw error;

        if (data) {
          setClips(data as ClipMarker[]);
        }
      } catch (err) {
        console.error('Error loading clips from Supabase:', err);
      }
    }
  }, [isOnline, setClips]);

  // Sync to Supabase when adding locally
  const syncAddToSupabase = useCallback(async (clipData: Partial<ClipMarker>) => {
    const supabase = getSupabase();
    if (supabase && isOnline) {
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
        // Reload to get server ID
        await loadClips();
      } catch (err) {
        console.error('Error syncing add to Supabase:', err);
      }
    }
  }, [isOnline, loadClips]);

  // Sync update to Supabase
  const syncUpdateToSupabase = useCallback(async (id: string, updates: Partial<ClipMarker>) => {
    const supabase = getSupabase();
    if (supabase && isOnline) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('clip_markers')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id);
      } catch (err) {
        console.error('Error syncing update to Supabase:', err);
      }
    }
  }, [isOnline]);

  // Sync delete to Supabase
  const syncDeleteToSupabase = useCallback(async (id: string) => {
    const supabase = getSupabase();
    if (supabase && isOnline) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('clip_markers').delete().eq('id', id);
      } catch (err) {
        console.error('Error syncing delete to Supabase:', err);
      }
    }
  }, [isOnline]);

  // Wrapper for updateClip that syncs to Supabase
  const handleUpdateClip = (id: string, updates: Partial<ClipMarker>) => {
    updateClip(id, updates);
    syncUpdateToSupabase(id, updates);
  };

  // Wrapper for deleteClip that syncs to Supabase
  const handleDeleteClip = (id: string) => {
    deleteClip(id);
    syncDeleteToSupabase(id);
  };

  // Quick mark - one tap to mark a clip
  const quickMark = () => {
    const clipData = { category: quickMarkCategory };
    addClip(clipData);
    syncAddToSupabase(clipData);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const clipData = {
      category,
      media_type: mediaType,
      player_id: playerId || null,
      station_id: stationId || null,
      notes: notes || null,
      timecode: timecode || null,
      camera: camera || null,
      crew_member: crewMember || null,
      tags,
      rating: rating || null,
    };

    addClip(clipData);
    syncAddToSupabase(clipData);

    // Reset form
    setNotes('');
    setTimecode('');
    setCamera('');
    setCrewMember('');
    setTags([]);
    setTagInput('');
    setRating(0);
    setPlayerId('');
    setStationId('');
    setShowAddForm(false);
  };

  // Add tag
  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  // Manual sync
  const syncClips = async () => {
    if (!isOnline) return;
    setIsSyncing(true);
    await loadClips();
    setIsSyncing(false);
  };

  // Subscribe to realtime updates
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !isOnline) return;

    const channel = supabase
      .channel('clip-markers-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clip_markers' },
        () => {
          loadClips();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOnline, loadClips]);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initial load
  useEffect(() => {
    setMounted(true);
    loadClips();
  }, [loadClips]);

  // Filter clips
  const filteredClips = clips.filter((clip) => {
    if (filterCategory !== 'all' && clip.category !== filterCategory) return false;
    if (filterStatus !== 'all' && clip.status !== filterStatus) return false;
    return true;
  });

  // Stats
  const todayCount = clips.filter((c) => {
    const clipDate = new Date(c.timestamp).toDateString();
    return clipDate === new Date().toDateString();
  }).length;

  const highlightCount = clips.filter((c) => c.category === 'highlight').length;

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#9CA3AF]">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Clip Marker" showTimer={false} />

      {/* Connection Status & Stats */}
      <div className="px-4 py-3 bg-[#1A1A1A] border-b border-[#2A2A2A] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {isSupabaseConfigured() ? (
              isOnline ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-yellow-500" />
              )
            ) : (
              <WifiOff className="w-4 h-4 text-gray-500" />
            )}
            <span className={cn('text-white', largeText ? 'text-base' : 'text-sm')}>
              {todayCount} today
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FFD100]" />
            <span className={cn('text-[#FFD100]', largeText ? 'text-base' : 'text-sm')}>
              {highlightCount} highlights
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowKeyboardHelp(true)}
            className="p-2 text-[#9CA3AF] hover:text-white"
            title="Keyboard shortcuts"
          >
            <Keyboard className="w-4 h-4" />
          </button>
          <button
            onClick={syncClips}
            disabled={isSyncing || !isOnline}
            className="p-2 text-[#9CA3AF] hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={cn('w-4 h-4', isSyncing && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Quick Mark Section */}
      <div className="px-4 py-4 bg-[#0D0D0D] border-b border-[#2A2A2A]">
        <div className="flex items-center gap-3">
          <button
            onClick={quickMark}
            className="flex-1 py-4 bg-[#FFD100] text-black font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Clapperboard className="w-6 h-6" />
            <span className={largeText ? 'text-xl' : 'text-lg'}>MARK CLIP</span>
          </button>
          <select
            value={quickMarkCategory}
            onChange={(e) => setQuickMarkCategory(e.target.value as ClipCategory)}
            className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-4 text-white"
          >
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>
        </div>
        <p className="text-center text-[#6B7280] text-xs mt-2">
          Quick mark with selected category
        </p>
      </div>

      {/* Filters */}
      <div className="px-4 py-3 bg-[#0D0D0D] border-b border-[#2A2A2A] flex items-center gap-2 overflow-x-auto">
        <Filter className="w-4 h-4 text-[#9CA3AF] flex-shrink-0" />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as ClipCategory | 'all')}
          className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-1.5 text-white text-sm"
        >
          <option value="all">All Categories</option>
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>
              {config.label}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as ClipStatus | 'all')}
          className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-1.5 text-white text-sm"
        >
          <option value="all">All Status</option>
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>
              {config.label}
            </option>
          ))}
        </select>
        <span className="ml-auto text-[#6B7280] text-xs whitespace-nowrap">
          {filteredClips.length} clips
        </span>
      </div>

      {/* Clips List */}
      <div className="p-4 space-y-3 pb-40">
        {filteredClips.length === 0 ? (
          <div className="text-center py-12 text-[#9CA3AF]">
            <Clapperboard className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className={largeText ? 'text-base' : 'text-sm'}>
              {clips.length === 0 ? 'No clips marked yet' : 'No clips match filters'}
            </p>
            <p className="text-xs text-[#6B7280] mt-1">Tap MARK CLIP to get started</p>
          </div>
        ) : (
          filteredClips.map((clip) => {
            const categoryConfig = CATEGORY_CONFIG[clip.category];
            const statusConfig = STATUS_CONFIG[clip.status];
            const mediaConfig = MEDIA_CONFIG[clip.media_type];
            const CategoryIcon = categoryConfig.icon;
            const MediaIcon = mediaConfig.icon;
            const player = clip.player_id ? getPlayerById(clip.player_id) : null;
            const station = clip.station_id
              ? stations.find((s) => s.id === clip.station_id)
              : null;
            const isExpanded = expandedClip === clip.id;

            return (
              <div
                key={clip.id}
                className={cn(
                  'bg-[#1A1A1A] rounded-xl border overflow-hidden transition-all',
                  clip.status === 'archived' ? 'border-[#2A2A2A] opacity-60' : 'border-[#2A2A2A]',
                  clip.category === 'highlight' && 'border-[#FFD100]/50'
                )}
              >
                {/* Clip Header */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedClip(isExpanded ? null : clip.id)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${categoryConfig.color}20` }}
                    >
                      <CategoryIcon
                        className="w-5 h-5"
                        style={{ color: categoryConfig.color }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn('font-medium', largeText ? 'text-base' : 'text-sm')}
                          style={{ color: categoryConfig.color }}
                        >
                          {categoryConfig.label}
                        </span>
                        <MediaIcon className="w-3 h-3 text-[#6B7280]" />
                        {clip.rating && (
                          <div className="flex items-center">
                            {[...Array(clip.rating)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-3 h-3 fill-[#FFD100] text-[#FFD100]"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      {clip.notes && (
                        <p className={cn('text-white mt-1', largeText ? 'text-sm' : 'text-xs')}>
                          {clip.notes}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span
                          className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{
                            backgroundColor: `${statusConfig.color}20`,
                            color: statusConfig.color,
                          }}
                        >
                          {statusConfig.label}
                        </span>
                        {clip.timecode && (
                          <span className="text-[#9CA3AF] text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {clip.timecode}
                          </span>
                        )}
                        {station && (
                          <span className="text-[#9CA3AF] text-xs">
                            {station.icon} {station.name}
                          </span>
                        )}
                        {player && (
                          <span className="text-[#9CA3AF] text-xs">• {player.name}</span>
                        )}
                      </div>
                      {clip.tags.length > 0 && (
                        <div className="flex items-center gap-1 mt-2 flex-wrap">
                          {clip.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-[#2A2A2A] rounded text-xs text-[#9CA3AF]"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[#6B7280] text-xs">
                        {formatDate(clip.timestamp)}
                      </span>
                      <span className="text-[#9CA3AF] text-xs font-mono">
                        {formatTime(clip.timestamp)}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[#6B7280] mt-1" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#6B7280] mt-1" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Actions */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-[#2A2A2A]">
                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-[#9CA3AF]">Rating:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleUpdateClip(clip.id, { rating: star })}
                          className="p-1"
                        >
                          {clip.rating && star <= clip.rating ? (
                            <Star className="w-5 h-5 fill-[#FFD100] text-[#FFD100]" />
                          ) : (
                            <StarOff className="w-5 h-5 text-[#4A4A4A]" />
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Status Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {clip.status !== 'reviewed' && (
                        <button
                          onClick={() => handleUpdateClip(clip.id, { status: 'reviewed' })}
                          className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm hover:bg-yellow-500/30"
                        >
                          <Eye className="w-4 h-4" />
                          Reviewed
                        </button>
                      )}
                      {clip.status !== 'exported' && (
                        <button
                          onClick={() => handleUpdateClip(clip.id, { status: 'exported' })}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30"
                        >
                          <Download className="w-4 h-4" />
                          Exported
                        </button>
                      )}
                      {clip.status !== 'archived' && (
                        <button
                          onClick={() => handleUpdateClip(clip.id, { status: 'archived' })}
                          className="flex items-center gap-1 px-3 py-1.5 bg-gray-500/20 text-gray-400 rounded-lg text-sm hover:bg-gray-500/30"
                        >
                          <Archive className="w-4 h-4" />
                          Archive
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteClip(clip.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 ml-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Clip FAB */}
      <button
        onClick={() => setShowAddForm(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-[#3B82F6] rounded-full flex items-center justify-center shadow-lg hover:bg-[#3B82F6]/90 transition-colors z-30"
      >
        <Plus className="w-6 h-6 text-white" />
      </button>

      {/* Keyboard Shortcuts Help Modal */}
      {showKeyboardHelp && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] rounded-xl max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A]">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Keyboard className="w-5 h-5" />
                Keyboard Shortcuts
              </h2>
              <button
                onClick={() => setShowKeyboardHelp(false)}
                className="p-2 text-[#9CA3AF] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-xs text-[#6B7280] mb-4">
                Use these shortcuts from any page to quickly mark clips
              </p>
              <div className="flex items-center justify-between py-2 border-b border-[#2A2A2A]">
                <span className="text-white text-sm">Quick mark clip</span>
                <div className="flex items-center gap-1">
                  <kbd className="bg-[#2A2A2A] px-2 py-1 rounded text-xs text-[#9CA3AF]">Ctrl</kbd>
                  <span className="text-[#6B7280]">+</span>
                  <kbd className="bg-[#2A2A2A] px-2 py-1 rounded text-xs text-[#9CA3AF]">M</kbd>
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#2A2A2A]">
                <span className="text-white text-sm">Open detailed form</span>
                <div className="flex items-center gap-1">
                  <kbd className="bg-[#2A2A2A] px-2 py-1 rounded text-xs text-[#9CA3AF]">Ctrl</kbd>
                  <span className="text-[#6B7280]">+</span>
                  <kbd className="bg-[#2A2A2A] px-2 py-1 rounded text-xs text-[#9CA3AF]">Shift</kbd>
                  <span className="text-[#6B7280]">+</span>
                  <kbd className="bg-[#2A2A2A] px-2 py-1 rounded text-xs text-[#9CA3AF]">M</kbd>
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-white text-sm">Select category (when picker open)</span>
                <div className="flex items-center gap-1">
                  <kbd className="bg-[#2A2A2A] px-2 py-1 rounded text-xs text-[#9CA3AF]">1</kbd>
                  <span className="text-[#6B7280]">-</span>
                  <kbd className="bg-[#2A2A2A] px-2 py-1 rounded text-xs text-[#9CA3AF]">9</kbd>
                </div>
              </div>
              <div className="mt-4 p-3 bg-[#FFD100]/10 rounded-lg border border-[#FFD100]/30">
                <p className="text-[#FFD100] text-xs">
                  The floating clip button is available on every page. Click it to mark clips instantly!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Clip Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-[#1A1A1A] w-full sm:max-w-lg sm:rounded-xl rounded-t-xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-[#1A1A1A] border-b border-[#2A2A2A] p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Add Detailed Clip</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-2 text-[#9CA3AF] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Category */}
              <div>
                <label className="block text-sm text-[#9CA3AF] mb-2">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setCategory(key as ClipCategory)}
                        className={cn(
                          'p-2 rounded-lg border text-sm flex flex-col items-center gap-1 transition-all',
                          category === key
                            ? 'border-[#FFD100] bg-[#FFD100]/10'
                            : 'border-[#2A2A2A] hover:border-[#3A3A3A]'
                        )}
                      >
                        <Icon className="w-4 h-4" style={{ color: config.color }} />
                        <span className="text-white text-xs">{config.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Media Type */}
              <div>
                <label className="block text-sm text-[#9CA3AF] mb-2">Media Type</label>
                <div className="flex gap-2">
                  {Object.entries(MEDIA_CONFIG).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setMediaType(key as MediaType)}
                        className={cn(
                          'flex-1 py-2 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2',
                          mediaType === key
                            ? 'border-[#FFD100] bg-[#FFD100]/10 text-white'
                            : 'border-[#2A2A2A] text-[#9CA3AF] hover:border-[#3A3A3A]'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm text-[#9CA3AF] mb-1">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe the clip..."
                  rows={2}
                  className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white placeholder-[#6B7280] focus:border-[#FFD100] focus:outline-none"
                />
              </div>

              {/* Timecode & Camera */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-[#9CA3AF] mb-1">Timecode</label>
                  <input
                    type="text"
                    value={timecode}
                    onChange={(e) => setTimecode(e.target.value)}
                    placeholder="01:23:45:12"
                    className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white placeholder-[#6B7280] focus:border-[#FFD100] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#9CA3AF] mb-1">Camera</label>
                  <input
                    type="text"
                    value={camera}
                    onChange={(e) => setCamera(e.target.value)}
                    placeholder="Camera A"
                    className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white placeholder-[#6B7280] focus:border-[#FFD100] focus:outline-none"
                  />
                </div>
              </div>

              {/* Station & Player */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-[#9CA3AF] mb-1">Station</label>
                  <select
                    value={stationId}
                    onChange={(e) => setStationId(e.target.value as StationId | '')}
                    className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm"
                  >
                    <option value="">None</option>
                    {stations.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.icon} {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#9CA3AF] mb-1">Player</label>
                  <select
                    value={playerId}
                    onChange={(e) => setPlayerId(e.target.value)}
                    className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm"
                  >
                    <option value="">None</option>
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Crew Member */}
              <div>
                <label className="block text-sm text-[#9CA3AF] mb-1">Crew Member</label>
                <input
                  type="text"
                  value={crewMember}
                  onChange={(e) => setCrewMember(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white placeholder-[#6B7280] focus:border-[#FFD100] focus:outline-none"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm text-[#9CA3AF] mb-1">Tags</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add tag..."
                    className="flex-1 bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white placeholder-[#6B7280] focus:border-[#FFD100] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-2 bg-[#2A2A2A] text-white rounded-lg hover:bg-[#3A3A3A]"
                  >
                    <Tag className="w-4 h-4" />
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-[#2A2A2A] rounded text-sm text-white flex items-center gap-1"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => setTags(tags.filter((t) => t !== tag))}
                          className="text-[#6B7280] hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm text-[#9CA3AF] mb-2">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(rating === star ? 0 : star)}
                      className="p-1"
                    >
                      {star <= rating ? (
                        <Star className="w-6 h-6 fill-[#FFD100] text-[#FFD100]" />
                      ) : (
                        <StarOff className="w-6 h-6 text-[#4A4A4A]" />
                      )}
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="text-[#9CA3AF] text-sm ml-2">{rating} star{rating !== 1 ? 's' : ''}</span>
                  )}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 bg-[#FFD100] text-black font-semibold rounded-lg hover:bg-[#FFD100]/90 transition-colors"
              >
                <Check className="w-5 h-5 inline mr-2" />
                Add Clip Marker
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
