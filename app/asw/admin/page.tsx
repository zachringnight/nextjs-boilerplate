'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { players } from '../data/players';
import { ArrowLeft, Save, X, Pencil, Settings, RotateCcw } from 'lucide-react';
import { ASW_TIER_STYLES } from '../lib/constants';

interface PlayerOverride {
  scheduledTime?: string | null;
  day?: 1 | 2;
  tier?: number;
  signingOnly?: boolean;
  exclusive?: boolean;
  notes?: string[];
}

const STORAGE_KEY = 'asw-admin-overrides';

function loadOverrides(): Record<string, PlayerOverride> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveOverrides(overrides: Record<string, PlayerOverride>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  } catch {
    // localStorage full
  }
}

const TIER_OPTIONS = [1, 1.5, 2, 2.5, 3, 3.5, 4];

export default function AdminPage() {
  const [overrides, setOverrides] = useState<Record<string, PlayerOverride>>({});
  const [activeDay, setActiveDay] = useState<1 | 2>(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Form state
  const [formTime, setFormTime] = useState('');
  const [formDay, setFormDay] = useState<1 | 2>(1);
  const [formTier, setFormTier] = useState<number | undefined>(undefined);
  const [formSigningOnly, setFormSigningOnly] = useState(false);
  const [formExclusive, setFormExclusive] = useState(false);
  const [formNote, setFormNote] = useState('');

  // Load overrides from localStorage
  useEffect(() => {
    setOverrides(loadOverrides());
  }, []);

  const dayPlayers = useMemo(() => {
    return players.filter((p) => {
      const override = overrides[p.id];
      const day = override?.day ?? p.day;
      return day === activeDay;
    });
  }, [activeDay, overrides]);

  const getEffectivePlayer = (playerId: string) => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return null;
    const override = overrides[playerId];
    if (!override) return player;
    return {
      ...player,
      scheduledTime: override.scheduledTime !== undefined ? override.scheduledTime : player.scheduledTime,
      day: override.day ?? player.day,
      tier: override.tier !== undefined ? override.tier : player.tier,
      signingOnly: override.signingOnly !== undefined ? override.signingOnly : player.signingOnly,
      exclusive: override.exclusive !== undefined ? override.exclusive : player.exclusive,
      notes: override.notes ?? player.notes,
    };
  };

  const startEdit = (playerId: string) => {
    const effective = getEffectivePlayer(playerId);
    if (!effective) return;
    setFormTime(effective.scheduledTime || '');
    setFormDay(effective.day);
    setFormTier(effective.tier);
    setFormSigningOnly(effective.signingOnly || false);
    setFormExclusive(effective.exclusive || false);
    setFormNote('');
    setEditingId(playerId);
  };

  const handleSave = () => {
    if (!editingId) return;
    const player = players.find((p) => p.id === editingId);
    if (!player) return;

    const existingOverride = overrides[editingId] || {};
    const existingNotes = existingOverride.notes ?? player.notes;

    const newOverride: PlayerOverride = {
      scheduledTime: formTime || null,
      day: formDay,
      tier: formTier,
      signingOnly: formSigningOnly,
      exclusive: formExclusive,
      notes: formNote ? [...existingNotes, formNote] : existingNotes,
    };

    const newOverrides = { ...overrides, [editingId]: newOverride };
    setOverrides(newOverrides);
    saveOverrides(newOverrides);
    setEditingId(null);
  };

  const handleReset = () => {
    setOverrides({});
    saveOverrides({});
    setShowResetConfirm(false);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] pb-24">
      {/* Admin Header */}
      <div className="sticky top-0 z-40 bg-[#0D0D0D]/95 backdrop-blur-sm border-b border-[#2A2A2A] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/asw" className="flex items-center gap-2 text-[#9CA3AF] hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-2">
              <Settings size={20} className="text-[#FFD100]" />
              <h1 className="text-lg font-bold text-white">Admin</h1>
            </div>
          </div>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2A2A2A] text-[#9CA3AF] rounded-lg text-sm hover:bg-[#3A3A3A] hover:text-white transition-colors"
          >
            <RotateCcw size={14} />
            Reset All
          </button>
        </div>
      </div>

      {/* Day Tabs */}
      <div className="flex border-b border-[#2A2A2A]">
        {([1, 2] as const).map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`flex-1 py-3 px-4 text-center transition-colors ${
              activeDay === day
                ? 'text-[#FFD100] border-b-2 border-[#FFD100] bg-[#FFD100]/5'
                : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            <div className="font-semibold">Day {day}</div>
            <div className="text-xs opacity-75">{day === 1 ? 'Friday, Feb 13' : 'Saturday, Feb 14'}</div>
          </button>
        ))}
      </div>

      {/* Player List */}
      <div className="p-4 space-y-3">
        {dayPlayers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#9CA3AF]">No players for Day {activeDay}</p>
          </div>
        ) : (
          dayPlayers.map((basePlayer) => {
            const effective = getEffectivePlayer(basePlayer.id);
            if (!effective) return null;
            const isEditing = editingId === basePlayer.id;
            const hasOverride = !!overrides[basePlayer.id];
            const tierStyle = effective.tier ? ASW_TIER_STYLES[effective.tier] : null;

            if (isEditing) {
              return (
                <div key={basePlayer.id} className="bg-[#1A1A1A] rounded-xl border border-[#FFD100] p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white">{effective.name}</h3>
                    <button onClick={() => setEditingId(null)} className="text-[#9CA3AF] hover:text-white">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#9CA3AF] text-sm mb-1">Scheduled Time</label>
                      <input
                        type="text"
                        value={formTime}
                        onChange={(e) => setFormTime(e.target.value)}
                        placeholder="e.g. 12:00 PM"
                        className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[#9CA3AF] text-sm mb-1">Day</label>
                      <select
                        value={formDay}
                        onChange={(e) => setFormDay(Number(e.target.value) as 1 | 2)}
                        className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-white text-sm"
                      >
                        <option value={1}>Day 1 (Friday)</option>
                        <option value={2}>Day 2 (Saturday)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[#9CA3AF] text-sm mb-1">Tier</label>
                      <select
                        value={formTier || ''}
                        onChange={(e) => setFormTier(e.target.value ? Number(e.target.value) : undefined)}
                        className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-white text-sm"
                      >
                        <option value="">No tier</option>
                        {TIER_OPTIONS.map((t) => (
                          <option key={t} value={t}>Tier {t}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-3 justify-center">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formSigningOnly}
                          onChange={(e) => setFormSigningOnly(e.target.checked)}
                          className="w-4 h-4 rounded bg-[#2A2A2A] border-[#3A3A3A] accent-[#FFD100]"
                        />
                        <span className="text-sm text-white">Signing Only</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formExclusive}
                          onChange={(e) => setFormExclusive(e.target.checked)}
                          className="w-4 h-4 rounded bg-[#2A2A2A] border-[#3A3A3A] accent-[#FFD100]"
                        />
                        <span className="text-sm text-white">Exclusive</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#9CA3AF] text-sm mb-1">Add Note</label>
                    <input
                      type="text"
                      value={formNote}
                      onChange={(e) => setFormNote(e.target.value)}
                      placeholder="Add a note..."
                      className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-white text-sm"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-4 py-2 bg-[#22c55e] text-black rounded-lg font-medium text-sm"
                    >
                      <Save size={16} />
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#2A2A2A] text-white rounded-lg text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={basePlayer.id}
                className={`flex items-center gap-3 p-3 rounded-xl border ${
                  hasOverride
                    ? 'bg-[#1A1A1A] border-[#FFD100]/30'
                    : 'bg-[#1A1A1A] border-[#2A2A2A]'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white truncate">{effective.name}</p>
                    {tierStyle && (
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${tierStyle.bg} ${tierStyle.text}`}>
                        {tierStyle.label}
                      </span>
                    )}
                    {effective.exclusive && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-[#FFD100]/20 text-[#FFD100]">EXCL</span>
                    )}
                    {effective.signingOnly && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-violet-500/20 text-violet-400">SIGNING</span>
                    )}
                    {hasOverride && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-[#FFD100]/20 text-[#FFD100]">EDITED</span>
                    )}
                  </div>
                  <p className="text-sm text-[#9CA3AF] truncate">
                    {effective.team} &bull; {effective.scheduledTime || 'TBD'}
                  </p>
                </div>
                <button
                  onClick={() => startEdit(basePlayer.id)}
                  className="px-3 py-1.5 bg-[#2A2A2A] text-white rounded-lg text-sm hover:bg-[#3A3A3A] flex items-center gap-1.5"
                >
                  <Pencil size={14} />
                  Edit
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Reset Confirmation */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowResetConfirm(false)}>
          <div className="bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] p-6 w-full max-w-sm text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-[#EF4444]/20 flex items-center justify-center mx-auto mb-4">
              <RotateCcw size={24} className="text-[#EF4444]" />
            </div>
            <h3 className="font-semibold text-white mb-2 text-lg">Reset All Edits?</h3>
            <p className="text-[#9CA3AF] text-sm mb-6">This will clear all admin overrides and restore original player data.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 bg-[#2A2A2A] text-white rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
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
