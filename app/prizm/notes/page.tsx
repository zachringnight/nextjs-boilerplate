'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useAppStore } from '../store';
import { Note, NoteCategory, NotePriority, NoteStatus, StationId } from '../types';
import { getPlayerById, players } from '../data/players';
import { stations } from '../data/stations';
import {
  Plus,
  Check,
  Trash2,
  AlertTriangle,
  Clock,
  Tag,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Zap,
  Wrench,
  Calendar,
  Star,
  Megaphone,
} from 'lucide-react';
import { cn } from '../lib/utils';

const CATEGORY_CONFIG: Record<NoteCategory, { label: string; icon: typeof Tag; color: string }> = {
  general: { label: 'General', icon: MessageSquare, color: '#9CA3AF' },
  technical: { label: 'Technical', icon: Wrench, color: '#3B82F6' },
  scheduling: { label: 'Scheduling', icon: Calendar, color: '#F59E0B' },
  vip: { label: 'VIP', icon: Star, color: '#FFD100' },
  media: { label: 'Media', icon: Megaphone, color: '#8B5CF6' },
  urgent: { label: 'Urgent', icon: Zap, color: '#EF4444' },
};

const PRIORITY_CONFIG: Record<NotePriority, { label: string; color: string }> = {
  low: { label: 'Low', color: '#6B7280' },
  medium: { label: 'Medium', color: '#F59E0B' },
  high: { label: 'High', color: '#EF4444' },
};

const STATUS_CONFIG: Record<NoteStatus, { label: string; color: string }> = {
  open: { label: 'Open', color: '#3B82F6' },
  'in-progress': { label: 'In Progress', color: '#F59E0B' },
  resolved: { label: 'Resolved', color: '#22C55E' },
};

export default function NotesPage() {
  const { notes, addNote, updateNote, deleteNote, resolveNote, clearResolvedNotes, largeText } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<NoteStatus | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<NoteCategory | 'all'>('all');
  const [expandedNote, setExpandedNote] = useState<string | null>(null);

  // Form state
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoteCategory>('general');
  const [priority, setPriority] = useState<NotePriority>('medium');
  const [stationId, setStationId] = useState<StationId | ''>('');
  const [playerId, setPlayerId] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    addNote({
      content: content.trim(),
      category,
      priority,
      status: 'open',
      stationId: stationId || undefined,
      playerId: playerId || undefined,
    });

    // Reset form
    setContent('');
    setCategory('general');
    setPriority('medium');
    setStationId('');
    setPlayerId('');
    setShowAddForm(false);
  };

  const filteredNotes = notes.filter((note) => {
    if (filterStatus !== 'all' && note.status !== filterStatus) return false;
    if (filterCategory !== 'all' && note.category !== filterCategory) return false;
    return true;
  });

  const openCount = notes.filter((n) => n.status === 'open').length;
  const urgentCount = notes.filter((n) => n.category === 'urgent' && n.status !== 'resolved').length;

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
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
      <Header title="Notes" showTimer={false} />

      {/* Stats Bar */}
      <div className="px-4 py-3 bg-[#1A1A1A] border-b border-[#2A2A2A] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-2 h-2 rounded-full',
              openCount > 0 ? 'bg-blue-500' : 'bg-gray-500'
            )} />
            <span className={cn('text-white', largeText ? 'text-base' : 'text-sm')}>
              {openCount} open
            </span>
          </div>
          {urgentCount > 0 && (
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className={cn('text-red-400', largeText ? 'text-base' : 'text-sm')}>
                {urgentCount} urgent
              </span>
            </div>
          )}
        </div>
        <span className={cn('text-[#9CA3AF]', largeText ? 'text-sm' : 'text-xs')}>
          {notes.length} total
        </span>
      </div>

      {/* Filters */}
      <div className="px-4 py-3 bg-[#0D0D0D] border-b border-[#2A2A2A] flex items-center gap-2 overflow-x-auto">
        <Filter className="w-4 h-4 text-[#9CA3AF] flex-shrink-0" />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as NoteStatus | 'all')}
          className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-1.5 text-white text-sm"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as NoteCategory | 'all')}
          className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-1.5 text-white text-sm"
        >
          <option value="all">All Categories</option>
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>
        {notes.some((n) => n.status === 'resolved') && (
          <button
            onClick={clearResolvedNotes}
            className="ml-auto text-[#9CA3AF] hover:text-white text-sm flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            Clear resolved
          </button>
        )}
      </div>

      {/* Notes List */}
      <div className="p-4 space-y-3">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12 text-[#9CA3AF]">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className={largeText ? 'text-base' : 'text-sm'}>
              {notes.length === 0 ? 'No notes yet' : 'No notes match filters'}
            </p>
          </div>
        ) : (
          filteredNotes.map((note) => {
            const categoryConfig = CATEGORY_CONFIG[note.category];
            const priorityConfig = PRIORITY_CONFIG[note.priority];
            const statusConfig = STATUS_CONFIG[note.status];
            const CategoryIcon = categoryConfig.icon;
            const player = note.playerId ? getPlayerById(note.playerId) : null;
            const station = note.stationId ? stations.find((s) => s.id === note.stationId) : null;
            const isExpanded = expandedNote === note.id;

            return (
              <div
                key={note.id}
                className={cn(
                  'bg-[#1A1A1A] rounded-xl border overflow-hidden transition-all',
                  note.status === 'resolved' ? 'border-[#2A2A2A] opacity-60' : 'border-[#2A2A2A]',
                  note.category === 'urgent' && note.status !== 'resolved' && 'border-red-500/50'
                )}
              >
                {/* Note Header */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedNote(isExpanded ? null : note.id)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${categoryConfig.color}20` }}
                    >
                      <CategoryIcon className="w-4 h-4" style={{ color: categoryConfig.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-white',
                        largeText ? 'text-base' : 'text-sm',
                        note.status === 'resolved' && 'line-through'
                      )}>
                        {note.content}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span
                          className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{ backgroundColor: `${statusConfig.color}20`, color: statusConfig.color }}
                        >
                          {statusConfig.label}
                        </span>
                        {note.priority === 'high' && (
                          <span
                            className="px-2 py-0.5 rounded text-xs font-medium"
                            style={{ backgroundColor: `${priorityConfig.color}20`, color: priorityConfig.color }}
                          >
                            High Priority
                          </span>
                        )}
                        {station && (
                          <span className="text-[#9CA3AF] text-xs">
                            {station.icon} {station.name}
                          </span>
                        )}
                        {player && (
                          <span className="text-[#9CA3AF] text-xs">
                            • {player.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#6B7280] text-xs">
                        {formatDate(note.createdAt)} {formatTime(note.createdAt)}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[#6B7280]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#6B7280]" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Actions */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-[#2A2A2A] flex items-center gap-2">
                    {note.status !== 'resolved' && (
                      <>
                        <button
                          onClick={() => resolveNote(note.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30"
                        >
                          <Check className="w-4 h-4" />
                          Resolve
                        </button>
                        {note.status === 'open' && (
                          <button
                            onClick={() => updateNote(note.id, { status: 'in-progress' })}
                            className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm hover:bg-yellow-500/30"
                          >
                            <Clock className="w-4 h-4" />
                            In Progress
                          </button>
                        )}
                      </>
                    )}
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 ml-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Note FAB */}
      <button
        onClick={() => setShowAddForm(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-[#FFD100] rounded-full flex items-center justify-center shadow-lg hover:bg-[#FFD100]/90 transition-colors z-30"
      >
        <Plus className="w-6 h-6 text-black" />
      </button>

      {/* Add Note Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-[#1A1A1A] w-full sm:max-w-lg sm:rounded-xl rounded-t-xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-[#1A1A1A] border-b border-[#2A2A2A] p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Add Note</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-2 text-[#9CA3AF] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Content */}
              <div>
                <label className="block text-sm text-[#9CA3AF] mb-1">Note</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's happening?"
                  rows={3}
                  className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white placeholder-[#6B7280] focus:border-[#FFD100] focus:outline-none"
                  autoFocus
                />
              </div>

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
                        onClick={() => setCategory(key as NoteCategory)}
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

              {/* Priority */}
              <div>
                <label className="block text-sm text-[#9CA3AF] mb-2">Priority</label>
                <div className="flex gap-2">
                  {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setPriority(key as NotePriority)}
                      className={cn(
                        'flex-1 py-2 rounded-lg border text-sm font-medium transition-all',
                        priority === key
                          ? 'border-[#FFD100] bg-[#FFD100]/10 text-white'
                          : 'border-[#2A2A2A] text-[#9CA3AF] hover:border-[#3A3A3A]'
                      )}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional: Station & Player */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-[#9CA3AF] mb-1">Station (optional)</label>
                  <select
                    value={stationId}
                    onChange={(e) => setStationId(e.target.value as StationId | '')}
                    className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm"
                  >
                    <option value="">None</option>
                    {stations.map((s) => (
                      <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#9CA3AF] mb-1">Player (optional)</label>
                  <select
                    value={playerId}
                    onChange={(e) => setPlayerId(e.target.value)}
                    className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm"
                  >
                    <option value="">None</option>
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!content.trim()}
                className="w-full py-3 bg-[#FFD100] text-black font-semibold rounded-lg hover:bg-[#FFD100]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Note
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
