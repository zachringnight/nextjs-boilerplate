'use client';

import { useState, useMemo } from 'react';
import {
  FileBox,
  Camera,
  Video,
  Share2,
  FileText,
  MoreHorizontal,
  Plus,
  Trash2,
  Filter,
  Clock,
  CheckCircle2,
  Send,
  Circle,
  RotateCcw,
} from 'lucide-react';
import { useAppStore } from '../store';
import {
  DeliverableType,
  DeliverableStatus,
  EventDay,
  DELIVERABLE_TYPES,
  DELIVERABLE_STATUSES,
  EVENT_DAYS,
} from '../types';
import { players } from '../data/players';

// Type config
const typeConfig: Record<DeliverableType, { icon: typeof Camera; color: string; label: string }> = {
  photo: { icon: Camera, color: 'bg-blue-500', label: 'Photo' },
  video: { icon: Video, color: 'bg-red-500', label: 'Video' },
  social: { icon: Share2, color: 'bg-purple-500', label: 'Social' },
  document: { icon: FileText, color: 'bg-amber-500', label: 'Document' },
  other: { icon: MoreHorizontal, color: 'bg-zinc-500', label: 'Other' },
};

// Status config
const statusConfig: Record<DeliverableStatus, { icon: typeof Circle; color: string; bgColor: string; label: string }> = {
  pending: { icon: Circle, color: 'text-zinc-400', bgColor: 'bg-zinc-700', label: 'Pending' },
  'in-progress': { icon: Clock, color: 'text-amber-400', bgColor: 'bg-amber-900/50', label: 'In Progress' },
  completed: { icon: CheckCircle2, color: 'text-green-400', bgColor: 'bg-green-900/50', label: 'Completed' },
  delivered: { icon: Send, color: 'text-blue-400', bgColor: 'bg-blue-900/50', label: 'Delivered' },
};

// Day colors
const dayColors: Record<EventDay, string> = {
  Thursday: 'bg-blue-600',
  Friday: 'bg-purple-600',
  Saturday: 'bg-amber-600',
};

export default function DeliverablesPage() {
  const {
    deliverables,
    updateDeliverableStatus,
    updateDeliverable,
    addDeliverable,
    removeDeliverable,
    resetDeliverables,
    getDeliverablesByDay,
    getDeliverablesByType,
    getDeliverablesByStatus,
    getDeliverablesProgress,
  } = useAppStore();

  const [selectedDay, setSelectedDay] = useState<EventDay | 'all'>('all');
  const [filterType, setFilterType] = useState<DeliverableType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<DeliverableStatus | 'all'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDeliverable, setNewDeliverable] = useState({
    title: '',
    description: '',
    type: 'photo' as DeliverableType,
    dueDay: 'Thursday' as EventDay,
    priority: 'medium' as 'low' | 'medium' | 'high',
    playerId: '',
  });

  const progress = getDeliverablesProgress();

  // Filtered deliverables
  const filteredDeliverables = useMemo(() => {
    let result = deliverables;

    if (selectedDay !== 'all') {
      result = result.filter((d) => d.dueDay === selectedDay);
    }
    if (filterType !== 'all') {
      result = result.filter((d) => d.type === filterType);
    }
    if (filterStatus !== 'all') {
      result = result.filter((d) => d.status === filterStatus);
    }

    return result;
  }, [deliverables, selectedDay, filterType, filterStatus]);

  const handleAddDeliverable = () => {
    if (!newDeliverable.title.trim()) return;

    addDeliverable({
      ...newDeliverable,
      status: 'pending',
      playerId: newDeliverable.playerId || undefined,
    });

    setNewDeliverable({
      title: '',
      description: '',
      type: 'photo',
      dueDay: 'Thursday',
      priority: 'medium',
      playerId: '',
    });
    setShowAddForm(false);
  };

  const cycleStatus = (id: string, currentStatus: DeliverableStatus) => {
    const statusOrder: DeliverableStatus[] = ['pending', 'in-progress', 'completed', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statusOrder.length;
    updateDeliverableStatus(id, statusOrder[nextIndex]);
  };

  const getPlayerName = (playerId?: string) => {
    if (!playerId) return null;
    return players.find((p) => p.id === playerId)?.name || null;
  };

  const getPriorityColor = (priority?: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return 'text-red-400 border-red-800';
      case 'medium':
        return 'text-amber-400 border-amber-800';
      case 'low':
        return 'text-green-400 border-green-800';
      default:
        return 'text-zinc-400 border-zinc-700';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 pb-24">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <FileBox className="w-6 h-6 text-amber-500" />
              Deliverables
            </h1>
            <p className="text-sm text-zinc-400 mt-1">Track photos, videos, and content deliverables</p>
          </div>
          <button
            onClick={resetDeliverables}
            className="text-zinc-500 hover:text-white p-2"
            title="Reset Deliverables"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-4 gap-2 p-4">
        <div className="bg-zinc-900 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-zinc-400">{progress.pending}</div>
          <div className="text-xs text-zinc-500">Pending</div>
        </div>
        <div className="bg-amber-900/30 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-amber-400">{progress.inProgress}</div>
          <div className="text-xs text-amber-500/80">In Progress</div>
        </div>
        <div className="bg-green-900/30 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-green-400">{progress.completed}</div>
          <div className="text-xs text-green-500/80">Completed</div>
        </div>
        <div className="bg-blue-900/30 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-blue-400">{progress.delivered}</div>
          <div className="text-xs text-blue-500/80">Delivered</div>
        </div>
      </div>

      {/* Day Tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedDay('all')}
            className={`py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
              selectedDay === 'all'
                ? 'bg-zinc-700 text-white'
                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            All Days
          </button>
          {EVENT_DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                selectedDay === day
                  ? `${dayColors[day]} text-white`
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-500" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as DeliverableType | 'all')}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-sm text-white"
          >
            <option value="all">All Types</option>
            {DELIVERABLE_TYPES.map((type) => (
              <option key={type} value={type}>
                {typeConfig[type].label}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as DeliverableStatus | 'all')}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-sm text-white"
          >
            <option value="all">All Statuses</option>
            {DELIVERABLE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {statusConfig[status].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Add Deliverable Button */}
      <div className="px-4 mb-4">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white py-3 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Deliverable
        </button>
      </div>

      {/* Add Deliverable Form */}
      {showAddForm && (
        <div className="mx-4 mb-4 bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-4">
          <h3 className="font-medium text-white">Add Deliverable</h3>

          <div>
            <label className="text-sm text-zinc-400 block mb-1">Title</label>
            <input
              type="text"
              value={newDeliverable.title}
              onChange={(e) => setNewDeliverable({ ...newDeliverable, title: e.target.value })}
              placeholder="Deliverable title..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400 block mb-1">Description (optional)</label>
            <input
              type="text"
              value={newDeliverable.description}
              onChange={(e) => setNewDeliverable({ ...newDeliverable, description: e.target.value })}
              placeholder="Description..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Type</label>
              <select
                value={newDeliverable.type}
                onChange={(e) =>
                  setNewDeliverable({ ...newDeliverable, type: e.target.value as DeliverableType })
                }
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
              >
                {DELIVERABLE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {typeConfig[type].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-zinc-400 block mb-1">Day</label>
              <select
                value={newDeliverable.dueDay}
                onChange={(e) =>
                  setNewDeliverable({ ...newDeliverable, dueDay: e.target.value as EventDay })
                }
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
              >
                {EVENT_DAYS.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Priority</label>
              <select
                value={newDeliverable.priority}
                onChange={(e) =>
                  setNewDeliverable({
                    ...newDeliverable,
                    priority: e.target.value as 'low' | 'medium' | 'high',
                  })
                }
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-zinc-400 block mb-1">Player (optional)</label>
              <select
                value={newDeliverable.playerId}
                onChange={(e) =>
                  setNewDeliverable({ ...newDeliverable, playerId: e.target.value })
                }
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="">No player</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAddDeliverable}
              disabled={!newDeliverable.title.trim()}
              className="flex-1 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition-colors"
            >
              Add Deliverable
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

      {/* Deliverables List */}
      <div className="px-4 space-y-2">
        {filteredDeliverables.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            No deliverables found with current filters.
          </div>
        ) : (
          filteredDeliverables.map((deliverable) => {
            const typeConf = typeConfig[deliverable.type];
            const statusConf = statusConfig[deliverable.status];
            const TypeIcon = typeConf.icon;
            const StatusIcon = statusConf.icon;
            const playerName = getPlayerName(deliverable.playerId);

            return (
              <div
                key={deliverable.id}
                className={`bg-zinc-900 border rounded-lg p-4 ${getPriorityColor(deliverable.priority).split(' ')[1]}`}
              >
                <div className="flex items-start gap-3">
                  {/* Type Icon */}
                  <div className={`${typeConf.color} p-2 rounded-lg flex-shrink-0`}>
                    <TypeIcon className="w-4 h-4 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-medium text-white">{deliverable.title}</div>
                        {deliverable.description && (
                          <div className="text-sm text-zinc-500 mt-0.5">
                            {deliverable.description}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeDeliverable(deliverable.id)}
                        className="text-zinc-600 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {/* Status Button */}
                      <button
                        onClick={() => cycleStatus(deliverable.id, deliverable.status)}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${statusConf.bgColor} ${statusConf.color}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statusConf.label}
                      </button>

                      {/* Type Badge */}
                      <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded">
                        {typeConf.label}
                      </span>

                      {/* Day Badge */}
                      <span className={`text-xs text-white px-2 py-1 rounded ${dayColors[deliverable.dueDay]}`}>
                        {deliverable.dueDay}
                      </span>

                      {/* Player Link */}
                      {playerName && (
                        <span className="text-xs bg-purple-900/50 text-purple-400 px-2 py-1 rounded">
                          {playerName}
                        </span>
                      )}

                      {/* Priority */}
                      {deliverable.priority && (
                        <span className={`text-xs ${getPriorityColor(deliverable.priority).split(' ')[0]}`}>
                          {deliverable.priority}
                        </span>
                      )}
                    </div>

                    {/* Timestamps */}
                    {(deliverable.completedAt || deliverable.deliveredAt) && (
                      <div className="text-xs text-zinc-600 mt-2">
                        {deliverable.completedAt && (
                          <span>Completed: {new Date(deliverable.completedAt).toLocaleString()}</span>
                        )}
                        {deliverable.deliveredAt && (
                          <span className="ml-2">
                            Delivered: {new Date(deliverable.deliveredAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    )}
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
