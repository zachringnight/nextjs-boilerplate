'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Header from '../components/Header';
import { useAppStore } from '../store';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { ClipMarker, ClipCategory, ClipStatus, ClipPriority, ClipSortField, ClipSortDirection } from '../types/database';
import { getPlayerById } from '../data/players';
import { stations } from '../data/stations';
import {
  Star,
  StarOff,
  X,
  Plus,
  Trash2,
  Filter,
  Clock,
  RefreshCw,
  Wifi,
  WifiOff,
  ChevronDown,
  ChevronUp,
  Clapperboard,
  Sparkles,
  Archive,
  Eye,
  Download,
  Keyboard,
  Search,
  AlertTriangle,
  Flag,
  Copy,
  ArrowUpDown,
  FileDown,
  CheckSquare,
  Square,
  BarChart3,
  Edit3,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { CATEGORY_CONFIG, STATUS_CONFIG, MEDIA_CONFIG, PRIORITY_CONFIG, PRIORITY_SORT_ORDER } from '../lib/clip-constants';
import { syncClipInsert, syncClipUpdate, syncClipDelete, syncBulkClipUpdate, syncBulkClipDelete } from '../lib/clip-sync';

export default function ClipsPage() {
  const {
    largeText,
    clips,
    setClips,
    addClip,
    updateClip,
    deleteClip,
    duplicateClip,
    bulkUpdateClips,
    bulkDeleteClips,
    toggleClipSelection,
    selectAllClips,
    clearClipSelection,
    selectedClipIds,
    quickMarkCategory,
    setQuickMarkCategory,
    setClipModalOpen,
    clipSortField,
    clipSortDirection,
    setClipSort,
    toggleClipFlag,
    getClipAnalytics,
  } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [expandedClip, setExpandedClip] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<ClipCategory | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<ClipStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<ClipPriority | 'all'>('all');
  const [filterFlagged, setFilterFlagged] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [editNotesValue, setEditNotesValue] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectMode, setSelectMode] = useState(false);

  // Load clips from Supabase
  const loadClips = useCallback(async () => {
    const supabase = getSupabase();

    if (supabase && isOnline) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
          .from('clip_markers')
          .select('*')
          .order('timestamp', { ascending: false });

        if (error) throw error;

        if (data) {
          setClips(data as ClipMarker[]);
        }
      } catch (err) {
        console.error('Error loading clips from Supabase:', err);
      }
    }
  }, [isOnline, setClips]);

  // Wrapper for updateClip that syncs to Supabase
  const handleUpdateClip = (id: string, updates: Partial<ClipMarker>) => {
    updateClip(id, updates);
    syncClipUpdate(id, updates);
  };

  // Wrapper for deleteClip that syncs to Supabase (with confirmation)
  const handleDeleteClip = (id: string) => {
    deleteClip(id);
    syncClipDelete(id);
    setDeleteConfirmId(null);
    setExpandedClip(null);
  };

  // Quick mark - one tap to mark a clip
  const quickMark = () => {
    const clipData = { category: quickMarkCategory };
    addClip(clipData);
    syncClipInsert(clipData);
  };

  // Duplicate clip
  const handleDuplicate = (id: string) => {
    const newClip = duplicateClip(id);
    if (newClip) {
      syncClipInsert(newClip);
    }
  };

  // Toggle flag with sync
  const handleToggleFlag = (id: string) => {
    const clip = clips.find(c => c.id === id);
    toggleClipFlag(id);
    syncClipUpdate(id, { flagged: !clip?.flagged });
  };

  // Inline notes editing
  const startEditNotes = (clip: ClipMarker) => {
    setEditingNotesId(clip.id);
    setEditNotesValue(clip.notes || '');
  };

  const saveEditNotes = () => {
    if (editingNotesId) {
      handleUpdateClip(editingNotesId, { notes: editNotesValue || null });
      setEditingNotesId(null);
      setEditNotesValue('');
    }
  };

  // Bulk operations
  const handleBulkStatusChange = (status: ClipStatus) => {
    bulkUpdateClips(selectedClipIds, { status });
    syncBulkClipUpdate(selectedClipIds, { status });
    clearClipSelection();
    setSelectMode(false);
  };

  const handleBulkPriorityChange = (priority: ClipPriority) => {
    bulkUpdateClips(selectedClipIds, { priority });
    syncBulkClipUpdate(selectedClipIds, { priority });
    clearClipSelection();
    setSelectMode(false);
  };

  const handleBulkDelete = () => {
    bulkDeleteClips(selectedClipIds);
    syncBulkClipDelete(selectedClipIds);
    setBulkDeleteConfirm(false);
    setSelectMode(false);
  };

  const handleBulkFlag = () => {
    bulkUpdateClips(selectedClipIds, { flagged: true });
    syncBulkClipUpdate(selectedClipIds, { flagged: true });
    clearClipSelection();
    setSelectMode(false);
  };

  // Export to CSV
  const exportCSV = () => {
    const headers = ['Timestamp', 'Category', 'Priority', 'Status', 'Player', 'Station', 'Notes', 'Rating', 'Tags', 'Timecode', 'Timecode In', 'Timecode Out', 'Camera', 'Crew Member', 'Media Type', 'Flagged'];
    const rows = filteredClips.map(clip => {
      const player = clip.player_id ? getPlayerById(clip.player_id) : null;
      const station = clip.station_id ? stations.find(s => s.id === clip.station_id) : null;
      return [
        clip.timestamp,
        CATEGORY_CONFIG[clip.category]?.label || clip.category,
        (clip.priority || 'normal'),
        STATUS_CONFIG[clip.status]?.label || clip.status,
        player?.name || '',
        station?.name || '',
        (clip.notes || '').replace(/"/g, '""'),
        clip.rating || '',
        clip.tags.join('; '),
        clip.timecode || '',
        clip.timecode_in || '',
        clip.timecode_out || '',
        clip.camera || '',
        clip.crew_member || '',
        clip.media_type,
        clip.flagged ? 'Yes' : 'No',
      ].map(v => `"${v}"`).join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `clips-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
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

  // Sort function
  const sortClips = useCallback((clipsToSort: ClipMarker[]) => {
    const dir = clipSortDirection === 'asc' ? 1 : -1;

    return [...clipsToSort].sort((a, b) => {
      // Flagged clips always come first
      if (a.flagged && !b.flagged) return -1;
      if (!a.flagged && b.flagged) return 1;

      switch (clipSortField) {
        case 'timestamp':
          return dir * (new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        case 'rating':
          return dir * ((a.rating || 0) - (b.rating || 0));
        case 'category':
          return dir * a.category.localeCompare(b.category);
        case 'priority':
          return dir * (PRIORITY_SORT_ORDER[a.priority || 'normal'] - PRIORITY_SORT_ORDER[b.priority || 'normal']);
        case 'status':
          return dir * a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
  }, [clipSortField, clipSortDirection]);

  // Filter + search + sort clips
  const filteredClips = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    const filtered = clips.filter((clip) => {
      if (filterCategory !== 'all' && clip.category !== filterCategory) return false;
      if (filterStatus !== 'all' && clip.status !== filterStatus) return false;
      if (filterPriority !== 'all' && (clip.priority || 'normal') !== filterPriority) return false;
      if (filterFlagged && !clip.flagged) return false;

      if (query) {
        const player = clip.player_id ? getPlayerById(clip.player_id) : null;
        const station = clip.station_id
          ? stations.find((s) => s.id === clip.station_id)
          : null;
        const categoryLabel = CATEGORY_CONFIG[clip.category]?.label || '';

        const searchable = [
          clip.notes,
          player?.name,
          station?.name,
          categoryLabel,
          clip.crew_member,
          clip.timecode,
          clip.camera,
          ...clip.tags,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!searchable.includes(query)) return false;
      }

      return true;
    });

    return sortClips(filtered);
  }, [clips, filterCategory, filterStatus, filterPriority, filterFlagged, searchQuery, sortClips]);

  // Toggle sort
  const toggleSort = (field: ClipSortField) => {
    if (clipSortField === field) {
      setClipSort(field, clipSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setClipSort(field, field === 'timestamp' ? 'desc' : 'asc');
    }
  };

  // Stats
  const todayCount = clips.filter((c) => {
    const clipDate = new Date(c.timestamp).toDateString();
    return clipDate === new Date().toDateString();
  }).length;

  const highlightCount = clips.filter((c) => c.category === 'highlight').length;
  const flaggedCount = clips.filter((c) => c.flagged).length;

  // Analytics
  const analytics = useMemo(() => getClipAnalytics(), [clips, getClipAnalytics]);

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
          {flaggedCount > 0 && (
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-[#FFD100]" />
              <span className={cn('text-[#FFD100]', largeText ? 'text-base' : 'text-sm')}>
                {flaggedCount} flagged
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className={cn('p-2 hover:text-white', showAnalytics ? 'text-[#FFD100]' : 'text-[#9CA3AF]')}
            title="Analytics"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
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

      {/* Analytics Panel */}
      {showAnalytics && (
        <div className="px-4 py-3 bg-[#0D0D0D] border-b border-[#2A2A2A] clip-analytics-enter">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            <div className="bg-[#1A1A1A] rounded-lg p-3 border border-[#2A2A2A]">
              <div className="text-[10px] text-[#6B7280] uppercase tracking-wider">Total</div>
              <div className="text-2xl font-bold text-white">{clips.length}</div>
            </div>
            <div className="bg-[#1A1A1A] rounded-lg p-3 border border-[#2A2A2A]">
              <div className="text-[10px] text-[#6B7280] uppercase tracking-wider">Today</div>
              <div className="text-2xl font-bold text-[#3B82F6]">{analytics.totalToday}</div>
            </div>
            <div className="bg-[#1A1A1A] rounded-lg p-3 border border-[#2A2A2A]">
              <div className="text-[10px] text-[#6B7280] uppercase tracking-wider">Avg Rating</div>
              <div className="text-2xl font-bold text-[#FFD100]">
                {analytics.avgRating > 0 ? `${analytics.avgRating}` : '—'}
              </div>
            </div>
            <div className="bg-[#1A1A1A] rounded-lg p-3 border border-[#2A2A2A]">
              <div className="text-[10px] text-[#6B7280] uppercase tracking-wider">Flagged</div>
              <div className="text-2xl font-bold text-[#FFD100]">{analytics.totalFlagged}</div>
            </div>
          </div>

          {/* Category breakdown */}
          <div className="mb-2">
            <div className="text-[10px] text-[#6B7280] uppercase tracking-wider mb-1.5">By Category</div>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(analytics.byCategory).map(([cat, count]) => {
                const config = CATEGORY_CONFIG[cat as ClipCategory];
                return (
                  <span key={cat} className="px-2 py-1 rounded text-xs flex items-center gap-1" style={{ backgroundColor: `${config?.color || '#666'}20`, color: config?.color || '#666' }}>
                    {config?.label || cat}: {count}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Priority breakdown */}
          {Object.keys(analytics.byPriority).length > 0 && (
            <div className="mb-2">
              <div className="text-[10px] text-[#6B7280] uppercase tracking-wider mb-1.5">By Priority</div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(analytics.byPriority).map(([pri, count]) => {
                  const config = PRIORITY_CONFIG[pri as ClipPriority];
                  return (
                    <span key={pri} className="px-2 py-1 rounded text-xs flex items-center gap-1" style={{ backgroundColor: `${config?.color || '#666'}20`, color: config?.color || '#666' }}>
                      {config?.label || pri}: {count}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Crew breakdown */}
          {Object.keys(analytics.byCrewMember).length > 0 && (
            <div>
              <div className="text-[10px] text-[#6B7280] uppercase tracking-wider mb-1.5">By Crew</div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(analytics.byCrewMember).map(([crew, count]) => (
                  <span key={crew} className="px-2 py-1 rounded text-xs bg-[#2A2A2A] text-[#9CA3AF]">
                    {crew}: {count}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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

      {/* Search Bar */}
      <div className="px-4 py-2 bg-[#0D0D0D] border-b border-[#2A2A2A]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clips by player, notes, tags..."
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg pl-9 pr-8 py-2 text-white text-sm placeholder-[#6B7280] focus:border-[#FFD100] focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#6B7280] hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filters & Sort */}
      <div className="px-4 py-3 bg-[#0D0D0D] border-b border-[#2A2A2A]">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
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
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as ClipPriority | 'all')}
            className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-1.5 text-white text-sm"
          >
            <option value="all">All Priority</option>
            {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setFilterFlagged(!filterFlagged)}
            className={cn(
              'px-3 py-1.5 rounded-lg border text-sm flex items-center gap-1 flex-shrink-0 transition-all',
              filterFlagged
                ? 'border-[#FFD100] bg-[#FFD100]/10 text-[#FFD100]'
                : 'border-[#2A2A2A] text-[#6B7280] hover:text-white'
            )}
          >
            <Flag className={cn('w-3 h-3', filterFlagged && 'fill-[#FFD100]')} />
            Flagged
          </button>
        </div>

        {/* Sort & Actions Bar */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#2A2A2A]/50">
          <div className="flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#6B7280]" />
            {(['timestamp', 'rating', 'priority', 'category'] as ClipSortField[]).map(field => (
              <button
                key={field}
                onClick={() => toggleSort(field)}
                className={cn(
                  'px-2 py-0.5 rounded text-[10px] font-medium transition-all',
                  clipSortField === field
                    ? 'bg-[#FFD100]/15 text-[#FFD100]'
                    : 'text-[#6B7280] hover:text-white'
                )}
              >
                {field === 'timestamp' ? 'Time' : field.charAt(0).toUpperCase() + field.slice(1)}
                {clipSortField === field && (
                  <span className="ml-0.5">{clipSortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[#6B7280] text-xs whitespace-nowrap mr-1">
              {filteredClips.length} clip{filteredClips.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={() => {
                if (selectMode) {
                  clearClipSelection();
                  setSelectMode(false);
                } else {
                  setSelectMode(true);
                }
              }}
              className={cn(
                'p-1.5 rounded transition-all',
                selectMode ? 'bg-[#3B82F6]/20 text-[#3B82F6]' : 'text-[#6B7280] hover:text-white'
              )}
              title="Select mode"
            >
              <CheckSquare className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={exportCSV}
              className="p-1.5 text-[#6B7280] hover:text-white rounded transition-all"
              title="Export CSV"
            >
              <FileDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectMode && selectedClipIds.length > 0 && (
        <div className="px-4 py-2 bg-[#3B82F6]/10 border-b border-[#3B82F6]/30 flex items-center gap-2 overflow-x-auto clip-bulk-bar-enter">
          <span className="text-[#3B82F6] text-sm font-medium whitespace-nowrap">
            {selectedClipIds.length} selected
          </span>
          <button
            onClick={() => selectAllClips(filteredClips.map(c => c.id))}
            className="px-2 py-1 text-[10px] text-[#3B82F6] hover:bg-[#3B82F6]/20 rounded"
          >
            Select All
          </button>
          <div className="flex-1" />
          <button
            onClick={handleBulkFlag}
            className="px-2.5 py-1 bg-[#FFD100]/20 text-[#FFD100] rounded text-xs flex items-center gap-1 hover:bg-[#FFD100]/30"
          >
            <Flag className="w-3 h-3" />
            Flag
          </button>
          <select
            onChange={(e) => {
              if (e.target.value) handleBulkStatusChange(e.target.value as ClipStatus);
              e.target.value = '';
            }}
            className="bg-[#1A1A1A] border border-[#2A2A2A] rounded px-2 py-1 text-white text-xs"
            defaultValue=""
          >
            <option value="" disabled>Status...</option>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
          <select
            onChange={(e) => {
              if (e.target.value) handleBulkPriorityChange(e.target.value as ClipPriority);
              e.target.value = '';
            }}
            className="bg-[#1A1A1A] border border-[#2A2A2A] rounded px-2 py-1 text-white text-xs"
            defaultValue=""
          >
            <option value="" disabled>Priority...</option>
            {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
          {bulkDeleteConfirm ? (
            <div className="flex items-center gap-1 bg-red-500/10 border border-red-500/30 rounded px-2 py-1">
              <span className="text-red-400 text-xs">Delete {selectedClipIds.length}?</span>
              <button onClick={handleBulkDelete} className="px-1.5 py-0.5 bg-red-500 text-white rounded text-[10px]">Yes</button>
              <button onClick={() => setBulkDeleteConfirm(false)} className="px-1.5 py-0.5 bg-[#2A2A2A] text-[#9CA3AF] rounded text-[10px]">No</button>
            </div>
          ) : (
            <button
              onClick={() => setBulkDeleteConfirm(true)}
              className="px-2.5 py-1 bg-red-500/20 text-red-400 rounded text-xs flex items-center gap-1 hover:bg-red-500/30"
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </button>
          )}
        </div>
      )}

      {/* Clips List */}
      <div className="p-4 space-y-3 pb-40">
        {filteredClips.length === 0 ? (
          <div className="text-center py-12 text-[#9CA3AF]">
            <Clapperboard className="w-12 h-12 mx-auto mb-3 opacity-50" />
            {clips.length === 0 ? (
              <>
                <p className={cn('font-medium text-white', largeText ? 'text-lg' : 'text-base')}>
                  No clips marked yet
                </p>
                <p className="text-sm text-[#6B7280] mt-2 max-w-xs mx-auto">
                  Tap <strong className="text-[#FFD100]">MARK CLIP</strong> above for a quick mark, or use the <strong className="text-[#3B82F6]">+</strong> button for a detailed clip with notes, tags, and ratings.
                </p>
                <div className="mt-4 p-3 bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] inline-block">
                  <p className="text-xs text-[#9CA3AF]">
                    <kbd className="bg-[#2A2A2A] px-1.5 py-0.5 rounded text-[10px]">Ctrl</kbd>+<kbd className="bg-[#2A2A2A] px-1.5 py-0.5 rounded text-[10px]">M</kbd> quick mark from any page
                  </p>
                </div>
              </>
            ) : (
              <>
                <p className={largeText ? 'text-base' : 'text-sm'}>
                  No clips match your filters
                </p>
                <button
                  onClick={() => {
                    setFilterCategory('all');
                    setFilterStatus('all');
                    setFilterPriority('all');
                    setFilterFlagged(false);
                    setSearchQuery('');
                  }}
                  className="mt-3 text-sm text-[#FFD100] hover:text-[#FFD100]/80"
                >
                  Clear all filters
                </button>
              </>
            )}
          </div>
        ) : (
          filteredClips.map((clip) => {
            const categoryConfig = CATEGORY_CONFIG[clip.category];
            const statusConfig = STATUS_CONFIG[clip.status];
            const mediaConfig = MEDIA_CONFIG[clip.media_type];
            const priorityConfig = PRIORITY_CONFIG[clip.priority || 'normal'];
            const CategoryIcon = categoryConfig.icon;
            const MediaIcon = mediaConfig.icon;
            const PriorityIcon = priorityConfig.icon;
            const player = clip.player_id ? getPlayerById(clip.player_id) : null;
            const station = clip.station_id
              ? stations.find((s) => s.id === clip.station_id)
              : null;
            const isExpanded = expandedClip === clip.id;
            const isSelected = selectedClipIds.includes(clip.id);

            return (
              <div
                key={clip.id}
                className={cn(
                  'bg-[#1A1A1A] rounded-xl border overflow-hidden transition-all',
                  clip.status === 'archived' ? 'border-[#2A2A2A] opacity-60' : 'border-[#2A2A2A]',
                  clip.category === 'highlight' && 'border-[#FFD100]/50',
                  clip.flagged && 'border-[#FFD100]/40 bg-[#FFD100]/[0.02]',
                  clip.priority === 'urgent' && 'border-[#EF4444]/50',
                  isSelected && 'ring-2 ring-[#3B82F6]'
                )}
              >
                {/* Clip Header */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => {
                    if (selectMode) {
                      toggleClipSelection(clip.id);
                    } else {
                      setExpandedClip(isExpanded ? null : clip.id);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Select checkbox */}
                    {selectMode && (
                      <div className="flex items-center pt-1">
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-[#3B82F6]" />
                        ) : (
                          <Square className="w-5 h-5 text-[#4A4A4A]" />
                        )}
                      </div>
                    )}

                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 relative"
                      style={{ backgroundColor: `${categoryConfig.color}20` }}
                    >
                      <CategoryIcon
                        className="w-5 h-5"
                        style={{ color: categoryConfig.color }}
                      />
                      {clip.flagged && (
                        <Flag className="w-3 h-3 text-[#FFD100] fill-[#FFD100] absolute -top-1 -right-1" />
                      )}
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
                        {clip.priority && clip.priority !== 'normal' && (
                          <span
                            className="px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-0.5"
                            style={{
                              backgroundColor: `${priorityConfig.color}20`,
                              color: priorityConfig.color,
                            }}
                          >
                            <PriorityIcon className="w-3 h-3" />
                            {priorityConfig.label}
                          </span>
                        )}
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
                      {/* Inline notes display / edit */}
                      {editingNotesId === clip.id ? (
                        <div className="mt-1 flex gap-1">
                          <input
                            type="text"
                            value={editNotesValue}
                            onChange={(e) => setEditNotesValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEditNotes();
                              if (e.key === 'Escape') setEditingNotesId(null);
                            }}
                            className="flex-1 bg-[#0D0D0D] border border-[#FFD100]/50 rounded px-2 py-1 text-white text-xs focus:outline-none"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button
                            onClick={(e) => { e.stopPropagation(); saveEditNotes(); }}
                            className="px-2 py-1 bg-[#FFD100] text-black rounded text-xs font-medium"
                          >
                            Save
                          </button>
                        </div>
                      ) : clip.notes ? (
                        <p
                          className={cn('text-white mt-1 group/notes', largeText ? 'text-sm' : 'text-xs')}
                          onClick={(e) => {
                            if (!selectMode) {
                              e.stopPropagation();
                              startEditNotes(clip);
                            }
                          }}
                        >
                          {clip.notes}
                          <Edit3 className="w-3 h-3 text-[#6B7280] inline ml-1 opacity-0 group-hover/notes:opacity-100 transition-opacity" />
                        </p>
                      ) : null}
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
                        {(clip.timecode_in || clip.timecode_out) && (
                          <span className="text-[#9CA3AF] text-xs flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" />
                            {clip.timecode_in || '??'} → {clip.timecode_out || '??'}
                          </span>
                        )}
                        {station && (
                          <span className="text-[#9CA3AF] text-xs">
                            {station.icon} {station.name}
                          </span>
                        )}
                        {player && (
                          <span className="text-[#9CA3AF] text-xs">{player.name}</span>
                        )}
                        {clip.camera && (
                          <span className="text-[#6B7280] text-xs">{clip.camera}</span>
                        )}
                        {clip.crew_member && (
                          <span className="text-[#6B7280] text-xs">{clip.crew_member}</span>
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
                      {!selectMode && (
                        isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-[#6B7280] mt-1" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#6B7280] mt-1" />
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Actions */}
                {isExpanded && !selectMode && (
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

                    {/* Priority Selector */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-[#9CA3AF]">Priority:</span>
                      {(Object.entries(PRIORITY_CONFIG) as [ClipPriority, typeof PRIORITY_CONFIG[ClipPriority]][]).map(([key, config]) => {
                        const Icon = config.icon;
                        return (
                          <button
                            key={key}
                            onClick={() => handleUpdateClip(clip.id, { priority: key })}
                            className={cn(
                              'px-2 py-1 rounded text-xs flex items-center gap-1 transition-all',
                              (clip.priority || 'normal') === key
                                ? 'ring-1'
                                : 'opacity-50 hover:opacity-100'
                            )}
                            style={{
                              backgroundColor: (clip.priority || 'normal') === key ? `${config.color}20` : 'transparent',
                              color: config.color,
                            }}
                          >
                            <Icon className="w-3 h-3" />
                            {config.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Status Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Flag toggle */}
                      <button
                        onClick={() => handleToggleFlag(clip.id)}
                        className={cn(
                          'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all',
                          clip.flagged
                            ? 'bg-[#FFD100]/20 text-[#FFD100]'
                            : 'bg-[#2A2A2A] text-[#6B7280] hover:text-[#FFD100]'
                        )}
                      >
                        <Flag className={cn('w-4 h-4', clip.flagged && 'fill-[#FFD100]')} />
                        {clip.flagged ? 'Flagged' : 'Flag'}
                      </button>

                      {/* Duplicate */}
                      <button
                        onClick={() => handleDuplicate(clip.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#2A2A2A] text-[#9CA3AF] rounded-lg text-sm hover:bg-[#3A3A3A] hover:text-white"
                      >
                        <Copy className="w-4 h-4" />
                        Duplicate
                      </button>

                      {/* Edit notes inline */}
                      {!clip.notes && (
                        <button
                          onClick={() => startEditNotes(clip)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-[#2A2A2A] text-[#9CA3AF] rounded-lg text-sm hover:bg-[#3A3A3A] hover:text-white"
                        >
                          <Edit3 className="w-4 h-4" />
                          Add Note
                        </button>
                      )}

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
                      {deleteConfirmId === clip.id ? (
                        <div className="flex items-center gap-2 ml-auto bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-1.5">
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                          <span className="text-red-400 text-sm">Delete?</span>
                          <button
                            onClick={() => handleDeleteClip(clip.id)}
                            className="px-2 py-0.5 bg-red-500 text-white rounded text-xs font-medium hover:bg-red-600"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-0.5 bg-[#2A2A2A] text-[#9CA3AF] rounded text-xs hover:bg-[#3A3A3A]"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(clip.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 ml-auto"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      )}
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
        onClick={() => setClipModalOpen(true)}
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
                  The floating clip button is available on every page. Click it to mark clips instantly! Set your priority level and defaults from the expanded panel.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Overlay - closes on backdrop click */}
      {deleteConfirmId && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setDeleteConfirmId(null)}
        />
      )}
    </div>
  );
}
