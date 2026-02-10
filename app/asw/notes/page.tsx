'use client';

import { useState, useMemo } from 'react';
import {
  MessageSquare,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  Filter,
} from 'lucide-react';
import { useASWStore } from '../store';
import { players } from '../data/players';
import { STATION_CONFIG } from '../lib/constants';
import type { NoteCategory, NotePriority, NoteStatus, ASWStationId } from '../types';

const categoryConfig: Record<NoteCategory, { label: string; color: string; bgColor: string }> = {
  general: { label: 'General', color: 'text-zinc-400', bgColor: 'bg-zinc-700' },
  technical: { label: 'Technical', color: 'text-blue-400', bgColor: 'bg-blue-900/50' },
  scheduling: { label: 'Scheduling', color: 'text-purple-400', bgColor: 'bg-purple-900/50' },
  talent: { label: 'Talent', color: 'text-amber-400', bgColor: 'bg-amber-900/50' },
  media: { label: 'Media', color: 'text-cyan-400', bgColor: 'bg-cyan-900/50' },
  urgent: { label: 'Urgent', color: 'text-red-400', bgColor: 'bg-red-900/50' },
};

const priorityConfig: Record<NotePriority, { label: string; color: string }> = {
  low: { label: 'Low', color: 'text-zinc-400' },
  medium: { label: 'Medium', color: 'text-amber-400' },
  high: { label: 'High', color: 'text-red-400' },
};

const statusConfig: Record<NoteStatus, { label: string; icon: typeof Clock; color: string }> = {
  open: { label: 'Open', icon: Clock, color: 'text-amber-400' },
  'in-progress': { label: 'In Progress', icon: Clock, color: 'text-blue-400' },
  resolved: { label: 'Resolved', icon: CheckCircle2, color: 'text-green-400' },
};

const stations = Object.values(STATION_CONFIG);

export default function NotesPage() {
  const {
    notes,
    addNote,
    updateNote,
    deleteNote,
    resolveNote,
    clearResolvedNotes,
    largeText,
  } = useASWStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<NoteCategory | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<NoteStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<NotePriority | 'all'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);

  // New note form state
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<NoteCategory>('general');
  const [newPriority, setNewPriority] = useState<NotePriority>('medium');
  const [newStation, setNewStation] = useState<ASWStationId | ''>('');
  const [newPlayer, setNewPlayer] = useState('');

  // Filtered notes
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      if (filterCategory !== 'all' && note.category !== filterCategory) return false;
      if (filterStatus !== 'all' && note.status !== filterStatus) return false;
      if (filterPriority !== 'all' && note.priority !== filterPriority) return false;
      return true;
    });
  }, [notes, filterCategory, filterStatus, filterPriority]);

  // Stats
  const stats = useMemo(() => ({
    open: notes.filter((n) => n.status === 'open').length,
    inProgress: notes.filter((n) => n.status === 'in-progress').length,
    resolved: notes.filter((n) => n.status === 'resolved').length,
    highPriority: notes.filter((n) => n.priority === 'high' && n.status !== 'resolved').length,
  }), [notes]);

  const handleAdd = () => {
    if (!newContent.trim()) return;
    addNote({
      content: newContent.trim(),
      category: newCategory,
      priority: newPriority,
      status: 'open',
      stationId: (newStation as ASWStationId) || undefined,
      playerId: newPlayer || undefined,
    });
    setNewContent('');
    setNewCategory('general');
    setNewPriority('medium');
    setNewStation('');
    setNewPlayer('');
    setShowAddForm(false);
  };

  const cycleStatus = (id: string, currentStatus: NoteStatus) => {
    const order: NoteStatus[] = ['open', 'in-progress', 'resolved'];
    const idx = order.indexOf(currentStatus);
    const next = order[(idx + 1) % order.length];
    if (next === 'resolved') {
      resolveNote(id);
    } else {
      updateNote(id, { status: next });
    }
  };

  const getPlayerName = (playerId?: string) => {
    if (!playerId) return null;
    return players.find((p) => p.id === playerId)?.name || null;
  };

  const getStationName = (stationId?: ASWStationId) => {
    if (!stationId) return null;
    return STATION_CONFIG[stationId]?.name || null;
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 pb-24">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`font-bold text-white flex items-center gap-2 ${largeText ? 'text-2xl' : 'text-xl'}`}>
              <MessageSquare className="w-6 h-6 text-blue-400" />
              Notes & Issues
            </h1>
            <p className={`text-zinc-400 mt-1 ${largeText ? 'text-base' : 'text-sm'}`}>
              Log and track production issues in real time
            </p>
          </div>
          {stats.resolved > 0 && (
            <button
              onClick={() => {
                if (confirm(`Clear ${stats.resolved} resolved notes?`)) {
                  clearResolvedNotes();
                }
              }}
              className="text-zinc-500 hover:text-red-400 text-xs px-3 py-1.5 bg-zinc-800 rounded-lg"
            >
              Clear Resolved ({stats.resolved})
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 p-4">
        <div className="bg-amber-900/20 rounded-lg p-3 text-center">
          <div className={`font-bold text-amber-400 ${largeText ? 'text-2xl' : 'text-xl'}`}>{stats.open}</div>
          <div className={`text-amber-500/80 ${largeText ? 'text-sm' : 'text-xs'}`}>Open</div>
        </div>
        <div className="bg-blue-900/20 rounded-lg p-3 text-center">
          <div className={`font-bold text-blue-400 ${largeText ? 'text-2xl' : 'text-xl'}`}>{stats.inProgress}</div>
          <div className={`text-blue-500/80 ${largeText ? 'text-sm' : 'text-xs'}`}>In Progress</div>
        </div>
        <div className="bg-green-900/20 rounded-lg p-3 text-center">
          <div className={`font-bold text-green-400 ${largeText ? 'text-2xl' : 'text-xl'}`}>{stats.resolved}</div>
          <div className={`text-green-500/80 ${largeText ? 'text-sm' : 'text-xs'}`}>Resolved</div>
        </div>
        <div className="bg-red-900/20 rounded-lg p-3 text-center">
          <div className={`font-bold text-red-400 ${largeText ? 'text-2xl' : 'text-xl'}`}>{stats.highPriority}</div>
          <div className={`text-red-500/80 ${largeText ? 'text-sm' : 'text-xs'}`}>High Priority</div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as NoteStatus | 'all')}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-sm text-white"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as NoteCategory | 'all')}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-sm text-white"
          >
            <option value="all">All Categories</option>
            {Object.entries(categoryConfig).map(([key, conf]) => (
              <option key={key} value={key}>{conf.label}</option>
            ))}
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as NotePriority | 'all')}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-sm text-white"
          >
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Add Note Button */}
      <div className="px-4 mb-4">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Log Issue / Note
        </button>
      </div>

      {/* Add Note Form */}
      {showAddForm && (
        <div className="mx-4 mb-4 bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
          <h3 className={`font-medium text-white ${largeText ? 'text-lg' : 'text-base'}`}>New Note</h3>

          <div>
            <label className="text-sm text-zinc-400 block mb-1">Description</label>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="What's the issue or note?"
              rows={3}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as NoteCategory)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
              >
                {Object.entries(categoryConfig).map(([key, conf]) => (
                  <option key={key} value={key}>{conf.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Priority</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as NotePriority)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Station (optional)</label>
              <select
                value={newStation}
                onChange={(e) => setNewStation(e.target.value as ASWStationId | '')}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="">No station</option>
                {stations.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Player (optional)</label>
              <select
                value={newPlayer}
                onChange={(e) => setNewPlayer(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="">No player</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={!newContent.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition-colors"
            >
              Add Note
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Notes List */}
      <div className="px-4 space-y-2">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>{notes.length === 0 ? 'No notes yet. Log an issue to get started.' : 'No notes match current filters.'}</p>
          </div>
        ) : (
          filteredNotes.map((note) => {
            const catConf = categoryConfig[note.category] || categoryConfig.general;
            const statusConf = statusConfig[note.status];
            const StatusIcon = statusConf.icon;
            const priConf = priorityConfig[note.priority];
            const playerName = getPlayerName(note.playerId);
            const stationName = getStationName(note.stationId);

            return (
              <div
                key={note.id}
                className={`bg-zinc-900 border rounded-xl p-4 ${
                  note.status === 'resolved' ? 'border-zinc-800 opacity-60' : 'border-zinc-800'
                } ${note.priority === 'high' && note.status !== 'resolved' ? 'border-l-4 border-l-red-500' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className={`text-white ${largeText ? 'text-lg' : 'text-base'} ${
                      note.status === 'resolved' ? 'line-through text-zinc-500' : ''
                    }`}>
                      {note.content}
                    </p>

                    {/* Meta badges */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <button
                        onClick={() => cycleStatus(note.id, note.status)}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${statusConf.color} bg-zinc-800 hover:bg-zinc-700`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statusConf.label}
                      </button>

                      <span className={`text-xs px-2 py-1 rounded ${catConf.bgColor} ${catConf.color}`}>
                        {catConf.label}
                      </span>

                      {note.priority === 'high' && (
                        <span className="text-xs px-2 py-1 rounded bg-red-900/50 text-red-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {priConf.label}
                        </span>
                      )}

                      {stationName && (
                        <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded">
                          {stationName}
                        </span>
                      )}

                      {playerName && (
                        <span className="text-xs bg-purple-900/50 text-purple-400 px-2 py-1 rounded">
                          {playerName}
                        </span>
                      )}
                    </div>

                    <p className={`text-zinc-600 mt-2 ${largeText ? 'text-sm' : 'text-xs'}`}>
                      {formatTime(note.createdAt)}
                      {note.resolvedAt && ` · Resolved ${formatTime(note.resolvedAt)}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {note.status !== 'resolved' && (
                      <button
                        onClick={() => resolveNote(note.id)}
                        className="text-zinc-600 hover:text-green-500 p-1.5 rounded hover:bg-zinc-800 transition-colors"
                        title="Resolve"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-zinc-600 hover:text-red-500 p-1.5 rounded hover:bg-zinc-800 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
