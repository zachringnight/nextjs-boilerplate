'use client';

// SECURITY NOTE: This admin page does not currently implement authentication.
// In a production environment, this page should be protected with proper
// authentication and authorization checks (e.g., middleware, session verification,
// or role-based access control) to prevent unauthorized schedule modifications.

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useAppStore } from '../store';
import { players, getPlayerById } from '../data/players';
import { getScheduleForDay, DAY_LABELS, EVENT_DATES } from '../data/schedule';
import { stations, getStationById, getShortStationName } from '../data/stations';
import { StationId, ScheduleSlot } from '../types';
import { RefreshCw, Plus, X, Save, Trash2, AlertTriangle } from 'lucide-react';

export default function AdminPage() {
  const {
    schedule,
    updateSlot,
    addSlot,
    removeSlot,
    resetSchedule,
    selectedDay,
    setSelectedDay,
    largeText
  } = useAppStore();

  const [mounted, setMounted] = useState(false);
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Form state for new/edit slot
  const [formData, setFormData] = useState({
    playerId: '',
    station: 'signing' as StationId,
    startTime: '10:00',
    endTime: '10:30'
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const daySchedule = getScheduleForDay(schedule, selectedDay);

  const handleSaveEdit = (slotId: string) => {
    updateSlot(slotId, {
      playerId: formData.playerId,
      station: formData.station,
      startTime: formData.startTime,
      endTime: formData.endTime
    });
    setEditingSlot(null);
  };

  const handleAddSlot = () => {
    const newSlot: ScheduleSlot = {
      id: `slot-${Date.now()}`,
      playerId: formData.playerId,
      date: selectedDay,
      startTime: formData.startTime,
      endTime: formData.endTime,
      station: formData.station,
      status: 'scheduled'
    };
    addSlot(newSlot);
    setShowAddModal(false);
    setFormData({
      playerId: '',
      station: 'signing',
      startTime: '10:00',
      endTime: '10:30'
    });
  };

  const handleCancelSlot = (slotId: string) => {
    updateSlot(slotId, { status: 'cancelled' });
  };

  const handleRestoreSlot = (slotId: string) => {
    updateSlot(slotId, { status: 'scheduled' });
  };

  const startEdit = (slot: ScheduleSlot) => {
    setFormData({
      playerId: slot.playerId,
      station: slot.station,
      startTime: slot.startTime,
      endTime: slot.endTime
    });
    setEditingSlot(slot.id);
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
      <Header title="Edit Schedule" showSearch={false} />

      {/* Day Tabs */}
      <div className="sticky top-[73px] z-30 bg-[#0D0D0D] border-b border-[#2A2A2A]">
        <div className="flex">
          {EVENT_DATES.map((date, index) => (
            <button
              key={date}
              onClick={() => setSelectedDay(date as typeof selectedDay)}
              className={`flex-1 py-3 px-4 text-center transition-colors ${
                selectedDay === date
                  ? 'text-[#FFD100] border-b-2 border-[#FFD100] bg-[#FFD100]/5'
                  : 'text-[#9CA3AF] hover:text-white'
              } ${largeText ? 'text-lg' : 'text-base'}`}
            >
              <div className="font-semibold">Day {index + 1}</div>
              <div className={`${largeText ? 'text-sm' : 'text-xs'} opacity-75`}>
                {DAY_LABELS[date]}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 flex gap-3 border-b border-[#2A2A2A]">
        <button
          onClick={() => setShowAddModal(true)}
          className={`flex items-center gap-2 px-4 py-2 bg-[#22c55e] text-black rounded-lg font-medium hover:bg-[#16a34a] transition-colors ${
            largeText ? 'text-base' : 'text-sm'
          }`}
        >
          <Plus size={18} />
          Add Slot
        </button>
        <button
          onClick={() => setShowResetConfirm(true)}
          className={`flex items-center gap-2 px-4 py-2 bg-[#2A2A2A] text-white rounded-lg font-medium hover:bg-[#3A3A3A] transition-colors ${
            largeText ? 'text-base' : 'text-sm'
          }`}
        >
          <RefreshCw size={18} />
          Reset All
        </button>
      </div>

      {/* Schedule List */}
      <div className="p-4 space-y-3">
        {daySchedule.length === 0 ? (
          <div className="text-center py-12">
            <p className={`text-[#9CA3AF] ${largeText ? 'text-lg' : 'text-base'}`}>
              No scheduled slots for this day
            </p>
          </div>
        ) : (
          daySchedule.map((slot) => {
            const player = getPlayerById(slot.playerId);
            const station = getStationById(slot.station);
            const isEditing = editingSlot === slot.id;
            const isCancelled = slot.status === 'cancelled';

            if (isEditing) {
              return (
                <div key={slot.id} className="bg-[#1A1A1A] rounded-xl border border-[#FFD100] p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-[#9CA3AF] mb-1 ${largeText ? 'text-base' : 'text-sm'}`}>
                        Player
                      </label>
                      <select
                        value={formData.playerId}
                        onChange={(e) => setFormData({ ...formData, playerId: e.target.value })}
                        className={`w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-white ${largeText ? 'text-base' : 'text-sm'}`}
                      >
                        {players.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-[#9CA3AF] mb-1 ${largeText ? 'text-base' : 'text-sm'}`}>
                        Station
                      </label>
                      <select
                        value={formData.station}
                        onChange={(e) => setFormData({ ...formData, station: e.target.value as StationId })}
                        className={`w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-white ${largeText ? 'text-base' : 'text-sm'}`}
                      >
                        {stations.map((s) => (
                          <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-[#9CA3AF] mb-1 ${largeText ? 'text-base' : 'text-sm'}`}>
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className={`w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-white ${largeText ? 'text-base' : 'text-sm'}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-[#9CA3AF] mb-1 ${largeText ? 'text-base' : 'text-sm'}`}>
                        End Time
                      </label>
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className={`w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-white ${largeText ? 'text-base' : 'text-sm'}`}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(slot.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#22c55e] text-black rounded-lg font-medium"
                    >
                      <Save size={16} />
                      Save
                    </button>
                    <button
                      onClick={() => setEditingSlot(null)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#2A2A2A] text-white rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={slot.id}
                className={`flex items-center gap-3 p-3 rounded-xl border ${
                  isCancelled
                    ? 'bg-[#1A1A1A]/50 border-[#EF4444]/30 opacity-60'
                    : 'bg-[#1A1A1A] border-[#2A2A2A]'
                }`}
              >
                <div className={`w-20 flex-shrink-0 font-mono ${largeText ? 'text-base' : 'text-sm'}`}>
                  <span className="text-white">{slot.startTime}</span>
                  <span className="text-[#9CA3AF]"> - </span>
                  <span className="text-white">{slot.endTime}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${isCancelled ? 'line-through text-[#9CA3AF]' : 'text-white'} ${largeText ? 'text-lg' : 'text-base'}`}>
                    {player?.name || 'Unknown'}
                  </p>
                  <p className={`truncate ${largeText ? 'text-base' : 'text-sm'}`} style={{ color: station?.color }}>
                    {station?.icon} {station?.name && getShortStationName(station.name)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {isCancelled ? (
                    <button
                      onClick={() => handleRestoreSlot(slot.id)}
                      className="px-3 py-1.5 bg-[#22c55e]/20 text-[#22c55e] rounded-lg text-sm font-medium"
                    >
                      Restore
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(slot)}
                        className="px-3 py-1.5 bg-[#2A2A2A] text-white rounded-lg text-sm hover:bg-[#3A3A3A]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleCancelSlot(slot.id)}
                        className="px-3 py-1.5 bg-[#EF4444]/20 text-[#EF4444] rounded-lg text-sm hover:bg-[#EF4444]/30"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => removeSlot(slot.id)}
                    className="p-1.5 text-[#9CA3AF] hover:text-[#EF4444]"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Slot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-semibold text-white ${largeText ? 'text-xl' : 'text-lg'}`}>
                Add New Slot
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#9CA3AF] hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-[#9CA3AF] mb-1 ${largeText ? 'text-base' : 'text-sm'}`}>
                  Player
                </label>
                <select
                  value={formData.playerId}
                  onChange={(e) => setFormData({ ...formData, playerId: e.target.value })}
                  className={`w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-white ${largeText ? 'text-base' : 'text-sm'}`}
                >
                  <option value="">Select a player...</option>
                  {players.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-[#9CA3AF] mb-1 ${largeText ? 'text-base' : 'text-sm'}`}>
                  Station
                </label>
                <select
                  value={formData.station}
                  onChange={(e) => setFormData({ ...formData, station: e.target.value as StationId })}
                  className={`w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-white ${largeText ? 'text-base' : 'text-sm'}`}
                >
                  {stations.map((s) => (
                    <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-[#9CA3AF] mb-1 ${largeText ? 'text-base' : 'text-sm'}`}>
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className={`w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-white ${largeText ? 'text-base' : 'text-sm'}`}
                  />
                </div>
                <div>
                  <label className={`block text-[#9CA3AF] mb-1 ${largeText ? 'text-base' : 'text-sm'}`}>
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className={`w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-white ${largeText ? 'text-base' : 'text-sm'}`}
                  />
                </div>
              </div>

              <button
                onClick={handleAddSlot}
                disabled={!formData.playerId}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  formData.playerId
                    ? 'bg-[#22c55e] text-black hover:bg-[#16a34a]'
                    : 'bg-[#2A2A2A] text-[#9CA3AF] cursor-not-allowed'
                } ${largeText ? 'text-lg' : 'text-base'}`}
              >
                Add Slot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowResetConfirm(false)}>
          <div className="bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] p-6 w-full max-w-sm text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-[#EF4444]/20 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} className="text-[#EF4444]" />
            </div>
            <h3 className={`font-semibold text-white mb-2 ${largeText ? 'text-xl' : 'text-lg'}`}>
              Reset Schedule?
            </h3>
            <p className={`text-[#9CA3AF] mb-6 ${largeText ? 'text-base' : 'text-sm'}`}>
              This will reset all schedule changes back to the original. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 bg-[#2A2A2A] text-white rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetSchedule();
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-2 bg-[#EF4444] text-white rounded-lg font-medium"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
