'use client';

import { useState, useEffect } from 'react';
import { useASWStore } from '../store';
import type { ASWClipCategory, ASWClipPriority, ASWMediaType } from '../types/clips';
import { players, getPlayerById } from '../data/players';
import { ASW_CATEGORY_CONFIG, ASW_MEDIA_CONFIG, ASW_PRIORITY_CONFIG } from '../lib/clip-constants';
import { syncASWClipInsert, syncASWClipUpdate } from '../lib/clip-sync';
import { X, Check, Star, StarOff, Flag } from 'lucide-react';

const STATION_OPTIONS = [
  { id: 'tunnel', name: 'Tunnel' },
  { id: 'qa', name: 'Q&A' },
  { id: 'signing', name: 'Signing' },
];

export default function QuickClipModal() {
  const {
    clipModalOpen,
    setClipModalOpen,
    addClip,
    updateClip,
    clips,
    editingClipId,
    setEditingClipId,
    quickMarkCategory,
    clipDefaults,
  } = useASWStore();

  const editingClip = editingClipId ? clips.find((c) => c.id === editingClipId) : null;
  const isEditMode = !!editingClip;

  // Form state
  const [category, setCategory] = useState<ASWClipCategory>(quickMarkCategory);
  const [mediaType, setMediaType] = useState<ASWMediaType>(clipDefaults.media_type || 'video');
  const [playerId, setPlayerId] = useState('');
  const [stationId, setStationId] = useState('');
  const [notes, setNotes] = useState('');
  const [timecode, setTimecode] = useState('');
  const [camera, setCamera] = useState(clipDefaults.camera || '');
  const [crewMember, setCrewMember] = useState(clipDefaults.crew_member || '');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [priority, setPriority] = useState<ASWClipPriority>('normal');
  const [flagged, setFlagged] = useState(false);
  const [clipName, setClipName] = useState('');

  // Auto-generate clip name
  useEffect(() => {
    if (isEditMode) return;
    const player = playerId ? getPlayerById(playerId) : null;
    const station = stationId ? STATION_OPTIONS.find((s) => s.id === stationId) : null;
    if (player && station) setClipName(`${player.name} @ ${station.name}`);
    else if (player) setClipName(player.name);
    else if (station) setClipName(station.name);
    else setClipName('');
  }, [playerId, stationId, isEditMode]);

  // Populate form on open
  useEffect(() => {
    if (clipModalOpen) {
      if (editingClip) {
        setCategory(editingClip.category);
        setMediaType(editingClip.media_type);
        setPlayerId(editingClip.player_id || '');
        setStationId(editingClip.station_id || '');
        setNotes(editingClip.notes || '');
        setTimecode(editingClip.timecode || '');
        setCamera(editingClip.camera || '');
        setCrewMember(editingClip.crew_member || '');
        setTags([...editingClip.tags]);
        setTagInput('');
        setRating(editingClip.rating || 0);
        setPriority(editingClip.priority || 'normal');
        setFlagged(editingClip.flagged);
        setClipName(editingClip.name || '');
      } else {
        setCategory(quickMarkCategory);
        setCamera(clipDefaults.camera || '');
        setCrewMember(clipDefaults.crew_member || '');
        setMediaType(clipDefaults.media_type || 'video');
        setPlayerId('');
        setStationId('');
        setNotes('');
        setTimecode('');
        setTags([]);
        setTagInput('');
        setRating(0);
        setPriority('normal');
        setFlagged(false);
        setClipName('');
      }
    }
  }, [clipModalOpen, editingClip, quickMarkCategory, clipDefaults]);

  if (!clipModalOpen) return null;

  const handleClose = () => {
    setClipModalOpen(false);
    setEditingClipId(null);
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async () => {
    const now = new Date().toISOString();

    if (isEditMode && editingClip) {
      const updates = {
        name: clipName || null,
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
        priority,
        flagged,
        updated_at: now,
      };
      updateClip(editingClip.id, updates);
      syncASWClipUpdate(editingClip.id, updates);
    } else {
      const clip = {
        id: `clip-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: clipName || null,
        timestamp: now,
        timecode: timecode || null,
        player_id: playerId || null,
        station_id: stationId || null,
        category,
        tags,
        notes: notes || null,
        rating: rating || null,
        media_type: mediaType,
        camera: camera || null,
        crew_member: crewMember || null,
        status: 'marked' as const,
        priority,
        flagged,
        created_at: now,
        updated_at: now,
      };
      addClip(clip);
      syncASWClipInsert(clip);
    }

    handleClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 flex items-end sm:items-center justify-center" onClick={handleClose}>
      <div
        className="bg-[#1A1A1A] w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl border border-[#2A2A2A] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#1A1A1A] border-b border-[#2A2A2A] px-4 py-3 flex items-center justify-between z-10">
          <h2 className="font-semibold text-white">{isEditMode ? 'Edit Clip' : 'New Clip'}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFlagged(!flagged)}
              className={`p-1.5 rounded-lg transition-colors ${flagged ? 'text-[#EF4444] bg-[#EF4444]/20' : 'text-[#9CA3AF] hover:text-white'}`}
            >
              <Flag className="w-4 h-4" />
            </button>
            <button onClick={handleClose} className="p-1.5 text-[#9CA3AF] hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Clip Name */}
          <div>
            <label className="block text-[#9CA3AF] text-sm mb-1">Clip Name</label>
            <input
              type="text"
              value={clipName}
              onChange={(e) => setClipName(e.target.value)}
              placeholder="Auto-generated from player + station"
              className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-[#9CA3AF] text-sm mb-1">Category</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(Object.entries(ASW_CATEGORY_CONFIG) as [ASWClipCategory, typeof ASW_CATEGORY_CONFIG[ASWClipCategory]][]).map(
                ([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setCategory(key)}
                      className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg border text-center transition-colors ${
                        category === key
                          ? 'border-[#FFD100] bg-[#FFD100]/10'
                          : 'border-[#2A2A2A] bg-[#2A2A2A] hover:border-[#3A3A3A]'
                      }`}
                    >
                      <Icon className="w-4 h-4" style={{ color: config.color }} />
                      <span className="text-[10px] text-white">{config.label}</span>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Player + Station */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#9CA3AF] text-sm mb-1">Player</label>
              <select
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
                className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="">None</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[#9CA3AF] text-sm mb-1">Station</label>
              <select
                value={stationId}
                onChange={(e) => setStationId(e.target.value)}
                className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="">None</option>
                {STATION_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority + Media Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#9CA3AF] text-sm mb-1">Priority</label>
              <div className="flex gap-1">
                {(Object.entries(ASW_PRIORITY_CONFIG) as [ASWClipPriority, typeof ASW_PRIORITY_CONFIG[ASWClipPriority]][]).map(
                  ([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setPriority(key)}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                        priority === key ? 'text-black' : 'text-[#9CA3AF] bg-[#2A2A2A]'
                      }`}
                      style={priority === key ? { backgroundColor: config.color } : undefined}
                    >
                      {config.label}
                    </button>
                  )
                )}
              </div>
            </div>
            <div>
              <label className="block text-[#9CA3AF] text-sm mb-1">Media</label>
              <div className="flex gap-1">
                {(Object.entries(ASW_MEDIA_CONFIG) as [ASWMediaType, typeof ASW_MEDIA_CONFIG[ASWMediaType]][]).map(
                  ([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => setMediaType(key)}
                        className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                          mediaType === key
                            ? 'bg-[#FFD100] text-black'
                            : 'text-[#9CA3AF] bg-[#2A2A2A] hover:text-white'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        {config.label}
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          </div>

          {/* Timecode + Camera */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#9CA3AF] text-sm mb-1">Timecode</label>
              <input
                type="text"
                value={timecode}
                onChange={(e) => setTimecode(e.target.value)}
                placeholder="01:23:45"
                className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-white text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-[#9CA3AF] text-sm mb-1">Camera</label>
              <input
                type="text"
                value={camera}
                onChange={(e) => setCamera(e.target.value)}
                placeholder="Camera A"
                className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
          </div>

          {/* Crew Member */}
          <div>
            <label className="block text-[#9CA3AF] text-sm mb-1">Crew Member</label>
            <input
              type="text"
              value={crewMember}
              onChange={(e) => setCrewMember(e.target.value)}
              placeholder="Who marked this clip?"
              className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[#9CA3AF] text-sm mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Clip notes..."
              rows={2}
              className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-white text-sm resize-none"
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-[#9CA3AF] text-sm mb-1">Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(rating === star ? 0 : star)}
                  className="p-0.5 transition-colors"
                >
                  {star <= rating ? (
                    <Star className="w-6 h-6 text-[#FFD100] fill-[#FFD100]" />
                  ) : (
                    <StarOff className="w-6 h-6 text-[#4B5563]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-[#9CA3AF] text-sm mb-1">Tags</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add tag..."
                className="flex-1 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-white text-sm"
              />
              <button
                onClick={addTag}
                className="px-3 py-2 bg-[#2A2A2A] text-white rounded-lg text-sm hover:bg-[#3A3A3A]"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-2 py-0.5 bg-[#2A2A2A] text-white text-xs rounded-full"
                  >
                    {tag}
                    <button onClick={() => removeTag(tag)} className="text-[#9CA3AF] hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="sticky bottom-0 bg-[#1A1A1A] border-t border-[#2A2A2A] px-4 py-3 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 py-2.5 bg-[#2A2A2A] text-white rounded-lg font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2.5 bg-[#FFD100] text-black rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            {isEditMode ? 'Update' : 'Save Clip'}
          </button>
        </div>
      </div>
    </div>
  );
}
