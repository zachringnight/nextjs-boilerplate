'use client';

import { useState, useMemo } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Settings,
  Users,
  Video,
  Package,
  ChevronDown,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { useAppStore } from '../store';
import {
  ChecklistCategory,
  EventDay,
  CHECKLIST_CATEGORIES,
  EVENT_DAYS,
} from '../types';

// Category config
const categoryConfig: Record<
  ChecklistCategory,
  { icon: typeof Settings; color: string; label: string }
> = {
  setup: { icon: Settings, color: 'bg-blue-500', label: 'Setup' },
  player: { icon: Users, color: 'bg-purple-500', label: 'Player' },
  content: { icon: Video, color: 'bg-green-500', label: 'Content' },
  teardown: { icon: Package, color: 'bg-amber-500', label: 'Teardown' },
};

// Day colors
const dayColors: Record<EventDay, string> = {
  Thursday: 'bg-blue-600',
  Friday: 'bg-purple-600',
  Saturday: 'bg-amber-600',
};

export default function ChecklistPage() {
  const {
    checklist,
    toggleChecklistItem,
    updateChecklistItem,
    addChecklistItem,
    removeChecklistItem,
    resetChecklist,
    getChecklistByDay,
    getChecklistByCategory,
    getChecklistProgress,
  } = useAppStore();

  const [selectedDay, setSelectedDay] = useState<EventDay>('Thursday');
  const [expandedCategories, setExpandedCategories] = useState<Set<ChecklistCategory>>(
    new Set(['setup', 'player', 'content', 'teardown'])
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    category: 'setup' as ChecklistCategory,
    dueDay: 'Thursday' as EventDay,
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  // Get items for selected day grouped by category
  const dayItems = useMemo(() => {
    const items = getChecklistByDay(selectedDay);
    const grouped: Record<ChecklistCategory, typeof items> = {
      setup: [],
      player: [],
      content: [],
      teardown: [],
    };
    items.forEach((item) => {
      grouped[item.category].push(item);
    });
    return grouped;
  }, [checklist, selectedDay, getChecklistByDay]);

  // Overall and day progress
  const overallProgress = getChecklistProgress();
  const dayProgress = getChecklistProgress(selectedDay);

  const toggleCategory = (category: ChecklistCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handleAddItem = () => {
    if (!newItem.title.trim()) return;

    addChecklistItem({
      ...newItem,
      completed: false,
    });

    setNewItem({
      title: '',
      description: '',
      category: 'setup',
      dueDay: selectedDay,
      priority: 'medium',
    });
    setShowAddForm(false);
  };

  const getPriorityColor = (priority?: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return 'text-red-400';
      case 'medium':
        return 'text-amber-400';
      case 'low':
        return 'text-green-400';
      default:
        return 'text-zinc-400';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 pb-24">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-6 h-6 text-green-500" />
              Production Checklist
            </h1>
            <p className="text-sm text-zinc-400 mt-1">Track setup, player, and content tasks</p>
          </div>
          <button
            onClick={resetChecklist}
            className="text-zinc-500 hover:text-white p-2"
            title="Reset Checklist"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="p-4">
        <div className="bg-zinc-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Overall Progress</span>
            <span className="text-sm font-medium text-white">
              {overallProgress.completed}/{overallProgress.total} ({overallProgress.percentage}%)
            </span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${overallProgress.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Day Tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-2">
          {EVENT_DAYS.map((day) => {
            const progress = getChecklistProgress(day);
            const isSelected = day === selectedDay;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  isSelected
                    ? `${dayColors[day]} text-white`
                    : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                <div>{day}</div>
                <div className="text-xs opacity-80">
                  {progress.completed}/{progress.total}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Progress */}
      <div className="px-4 mb-4">
        <div className="bg-zinc-900 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">{selectedDay} Progress</span>
            <span className="text-sm font-medium text-white">
              {dayProgress.completed}/{dayProgress.total} ({dayProgress.percentage}%)
            </span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${dayColors[selectedDay]}`}
              style={{ width: `${dayProgress.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Add Task Button */}
      <div className="px-4 mb-4">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Task
        </button>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <div className="mx-4 mb-4 bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-4">
          <h3 className="font-medium text-white">Add New Task</h3>

          <div>
            <label className="text-sm text-zinc-400 block mb-1">Title</label>
            <input
              type="text"
              value={newItem.title}
              onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              placeholder="Task title..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400 block mb-1">Description (optional)</label>
            <input
              type="text"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              placeholder="Task description..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Category</label>
              <select
                value={newItem.category}
                onChange={(e) =>
                  setNewItem({ ...newItem, category: e.target.value as ChecklistCategory })
                }
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
              >
                {CHECKLIST_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {categoryConfig[cat].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-zinc-400 block mb-1">Day</label>
              <select
                value={newItem.dueDay}
                onChange={(e) => setNewItem({ ...newItem, dueDay: e.target.value as EventDay })}
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

          <div>
            <label className="text-sm text-zinc-400 block mb-1">Priority</label>
            <select
              value={newItem.priority}
              onChange={(e) =>
                setNewItem({ ...newItem, priority: e.target.value as 'low' | 'medium' | 'high' })
              }
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAddItem}
              disabled={!newItem.title.trim()}
              className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition-colors"
            >
              Add Task
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

      {/* Checklist by Category */}
      <div className="px-4 space-y-3">
        {CHECKLIST_CATEGORIES.map((category) => {
          const config = categoryConfig[category];
          const Icon = config.icon;
          const items = dayItems[category];
          const isExpanded = expandedCategories.has(category);
          const completedCount = items.filter((i) => i.completed).length;

          // Don't show empty categories for teardown on non-Saturday
          if (items.length === 0 && category === 'teardown' && selectedDay !== 'Saturday') {
            return null;
          }

          return (
            <div key={category} className="bg-zinc-900 rounded-lg overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`${config.color} p-2 rounded-lg`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-white">{config.label}</div>
                    <div className="text-xs text-zinc-400">
                      {completedCount}/{items.length} completed
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {items.length > 0 && (
                    <div className="h-2 w-16 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${config.color} transition-all duration-300`}
                        style={{
                          width: items.length > 0 ? `${(completedCount / items.length) * 100}%` : '0%',
                        }}
                      />
                    </div>
                  )}
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-zinc-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-zinc-500" />
                  )}
                </div>
              </button>

              {/* Category Items */}
              {isExpanded && items.length > 0 && (
                <div className="border-t border-zinc-800">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 p-4 border-b border-zinc-800 last:border-b-0"
                    >
                      <button
                        onClick={() => toggleChecklistItem(item.id)}
                        className="mt-0.5 flex-shrink-0"
                      >
                        {item.completed ? (
                          <CheckSquare className="w-5 h-5 text-green-500" />
                        ) : (
                          <Square className="w-5 h-5 text-zinc-500 hover:text-zinc-300" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`font-medium ${
                            item.completed ? 'text-zinc-500 line-through' : 'text-white'
                          }`}
                        >
                          {item.title}
                        </div>
                        {item.description && (
                          <div className="text-sm text-zinc-500 mt-0.5">{item.description}</div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {item.priority && (
                            <span className={`text-xs ${getPriorityColor(item.priority)}`}>
                              {item.priority}
                            </span>
                          )}
                          {item.completedAt && (
                            <span className="text-xs text-zinc-600">
                              Done {new Date(item.completedAt).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeChecklistItem(item.id)}
                        className="text-zinc-600 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {isExpanded && items.length === 0 && (
                <div className="p-4 text-center text-zinc-500 text-sm border-t border-zinc-800">
                  No {config.label.toLowerCase()} tasks for {selectedDay}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
