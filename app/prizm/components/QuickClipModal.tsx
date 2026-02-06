'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { ClipCategory, ClipPriority, MediaType } from '../types/database';
import { players, getPlayerById } from '../data/players';
import { stations, getStationById } from '../data/stations';
import { StationId } from '../types';
import {
  X,
  Check,
  Star,
  StarOff,
  Tag,
  Flag,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { CATEGORY_CONFIG, MEDIA_CONFIG, PRIORITY_CONFIG } from '../lib/clip-constants';
import { syncClipInsert, syncClipUpdate } from '../lib/clip-sync';

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
    setQuickMarkCategory,
    clipDefaults,
    largeText,
  } = useAppStore();

  const editingClip = editingClipId ? clips.find(c => c.id === editingClipId) : null;
  const isEditMode = !!editingClip;

  // Form state
  const [category, setCategory] = useState<ClipCategory>(quickMarkCategory);
  const [mediaType, setMediaType] = useState<MediaType>(clipDefaults.media_type || 'video');
  const [playerId, setPlayerId] = useState('');
  const [stationId, setStationId] = useState<StationId | ''>('');
  const [notes, setNotes] = useState('');
  const [timecode, setTimecode] = useState('');
  const [timecodeIn, setTimecodeIn] = useState('');
  const [timecodeOut, setTimecodeOut] = useState('');
  const [camera, setCamera] = useState(clipDefaults.camera || '');
  const [crewMember, setCrewMember] = useState(clipDefaults.crew_member || '');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [priority, setPriority] = useState<ClipPriority>('normal');
  const [flagged, setFlagged] = useState(false);
  const [showTimecodeRange, setShowTimecodeRange] = useState(false);
  const [clipName, setClipName] = useState('');

  // Auto-generate clip name when player or station changes (only in add mode)
  /* eslint-disable react-hooks/set-state-in-effect -- intentional: derive clip name and populate form from external data */
  useEffect(() => {
    if (isEditMode) return;
    const player = playerId ? getPlayerById(playerId) : null;
    const station = stationId ? getStationById(stationId) : null;
    if (player && station) setClipName(`${player.name} @ ${station.name}`);
    else if (player) setClipName(player.name);
    else if (station) setClipName(station.name);
    else setClipName('');
  }, [playerId, stationId, isEditMode]);

  // Populate form when editing an existing clip or when modal opens for add
  useEffect(() => {
    if (clipModalOpen) {
      if (editingClip) {
        // Edit mode: populate from existing clip
        setCategory(editingClip.category);
        setMediaType(editingClip.media_type);
        setPlayerId(editingClip.player_id || '');
        setStationId((editingClip.station_id as StationId) || '');
        setNotes(editingClip.notes || '');
        setTimecode(editingClip.timecode || '');
        setTimecodeIn(editingClip.timecode_in || '');
        setTimecodeOut(editingClip.timecode_out || '');
        setCamera(editingClip.camera || '');
        setCrewMember(editingClip.crew_member || '');
        setTags([...editingClip.tags]);
        setTagInput('');
        setRating(editingClip.rating || 0);
        setPriority(editingClip.priority || 'normal');
        setFlagged(editingClip.flagged);
        setShowTimecodeRange(!!(editingClip.timecode_in || editingClip.timecode_out));
        setClipName(editingClip.name || '');
      } else {
        // Add mode: use defaults
        setCategory(quickMarkCategory);
        setCamera(clipDefaults.camera || '');
        setCrewMember(clipDefaults.crew_member || '');
        setMediaType(clipDefaults.media_type || 'video');
      }
    }
  }, [clipModalOpen, editingClip, quickMarkCategory, clipDefaults]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const clipData = {
      name: clipName || null,
      category,
      media_type: mediaType,
      player_id: playerId || null,
      station_id: stationId || null,
      notes: notes || null,
      timecode: timecode || null,
      timecode_in: timecodeIn || null,
      timecode_out: timecodeOut || null,
      camera: camera || null,
      crew_member: crewMember || null,
      tags,
      rating: rating || null,
      priority,
      flagged,
    };

    if (isEditMode && editingClipId) {
      updateClip(editingClipId, clipData);
      syncClipUpdate(editingClipId, clipData);
    } else {
      addClip(clipData);
      syncClipInsert(clipData);
      setQuickMarkCategory(category);
    }

    // Reset form
    resetForm();
    setClipModalOpen(false);
  };

  const resetForm = () => {
    setNotes('');
    setTimecode('');
    setTimecodeIn('');
    setTimecodeOut('');
    setCamera(clipDefaults.camera || '');
    setCrewMember(clipDefaults.crew_member || '');
    setTags([]);
    setTagInput('');
    setRating(0);
    setPriority('normal');
    setFlagged(false);
    setShowTimecodeRange(false);
    setPlayerId('');
    setStationId('');
    setClipName('');
    setEditingClipId(null);
  };

  // Add tag
  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && clipModalOpen) {
        setClipModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [clipModalOpen, setClipModalOpen]);

  if (!clipModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-[#1A1A1A] w-full sm:max-w-lg sm:rounded-xl rounded-t-xl max-h-[90vh] flex flex-col">
        <div className="flex-shrink-0 bg-[#1A1A1A] border-b border-[#2A2A2A] p-4 flex items-center justify-between sm:rounded-t-xl rounded-t-xl">
          <h2 className={cn('font-semibold text-white', largeText ? 'text-xl' : 'text-lg')}>
            {isEditMode ? 'Edit Clip' : 'Add Clip Marker'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFlagged(!flagged)}
              className={cn(
                'p-2 rounded-lg transition-all',
                flagged
                  ? 'text-[#FFD100] bg-[#FFD100]/10'
                  : 'text-[#6B7280] hover:text-[#FFD100] hover:bg-[#2A2A2A]'
              )}
              title={flagged ? 'Remove flag' : 'Flag this clip'}
            >
              <Flag className={cn('w-5 h-5', flagged && 'fill-[#FFD100]')} />
            </button>
            <button
              onClick={() => setClipModalOpen(false)}
              className="p-2 text-[#9CA3AF] hover:text-white rounded-lg hover:bg-[#2A2A2A]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
          <div className="p-4 space-y-4 overflow-auto flex-1 min-h-0">
          {/* Priority */}
          <div>
            <label className={cn('block text-[#9CA3AF] mb-2', largeText ? 'text-base' : 'text-sm')}>
              Priority
            </label>
            <div className="flex gap-2">
              {(Object.entries(PRIORITY_CONFIG) as [ClipPriority, typeof PRIORITY_CONFIG[ClipPriority]][]).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPriority(key)}
                    className={cn(
                      'flex-1 py-2 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-1.5',
                      priority === key
                        ? 'border-current bg-opacity-10'
                        : 'border-[#2A2A2A] text-[#6B7280] hover:border-[#3A3A3A]'
                    )}
                    style={{
                      color: priority === key ? config.color : undefined,
                      backgroundColor: priority === key ? `${config.color}15` : undefined,
                      borderColor: priority === key ? config.color : undefined,
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className={cn('block text-[#9CA3AF] mb-2', largeText ? 'text-base' : 'text-sm')}>
              Category
            </label>
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
            <label className={cn('block text-[#9CA3AF] mb-2', largeText ? 'text-base' : 'text-sm')}>
              Media Type
            </label>
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
            <label className={cn('block text-[#9CA3AF] mb-1', largeText ? 'text-base' : 'text-sm')}>
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the clip..."
              rows={2}
              className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white placeholder-[#6B7280] focus:border-[#FFD100] focus:outline-none"
            />
          </div>

          {/* Timecode */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={cn('text-[#9CA3AF]', largeText ? 'text-base' : 'text-sm')}>
                Timecode
              </label>
              <button
                type="button"
                onClick={() => setShowTimecodeRange(!showTimecodeRange)}
                className="text-[10px] text-[#FFD100] hover:text-[#FFD100]/80"
              >
                {showTimecodeRange ? 'Single timecode' : 'Use In/Out range'}
              </button>
            </div>
            {showTimecodeRange ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[#6B7280] uppercase tracking-wider block mb-1">In</label>
                  <input
                    type="text"
                    value={timecodeIn}
                    onChange={(e) => setTimecodeIn(e.target.value)}
                    placeholder="01:23:45:12"
                    className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white placeholder-[#6B7280] focus:border-[#FFD100] focus:outline-none font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#6B7280] uppercase tracking-wider block mb-1">Out</label>
                  <input
                    type="text"
                    value={timecodeOut}
                    onChange={(e) => setTimecodeOut(e.target.value)}
                    placeholder="01:24:30:00"
                    className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white placeholder-[#6B7280] focus:border-[#FFD100] focus:outline-none font-mono text-sm"
                  />
                </div>
              </div>
            ) : (
              <input
                type="text"
                value={timecode}
                onChange={(e) => setTimecode(e.target.value)}
                placeholder="01:23:45:12"
                className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white placeholder-[#6B7280] focus:border-[#FFD100] focus:outline-none font-mono"
              />
            )}
          </div>

          {/* Camera */}
          <div>
            <label className={cn('block text-[#9CA3AF] mb-1', largeText ? 'text-base' : 'text-sm')}>
              Camera
            </label>
            <input
              type="text"
              value={camera}
              onChange={(e) => setCamera(e.target.value)}
              placeholder="Camera A"
              className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white placeholder-[#6B7280] focus:border-[#FFD100] focus:outline-none"
            />
          </div>

          {/* Station & Player */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={cn('block text-[#9CA3AF] mb-1', largeText ? 'text-base' : 'text-sm')}>
                Station
              </label>
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
              <label className={cn('block text-[#9CA3AF] mb-1', largeText ? 'text-base' : 'text-sm')}>
                Player
              </label>
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

          {/* Clip Name */}
          <div>
            <label className={cn('block text-[#9CA3AF] mb-1', largeText ? 'text-base' : 'text-sm')}>
              Clip Name
            </label>
            <input
              type="text"
              value={clipName}
              onChange={(e) => setClipName(e.target.value)}
              placeholder="Auto-generated from player & station"
              className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm placeholder-[#6B7280] focus:border-[#FFD100] focus:outline-none"
            />
            {clipName && (playerId || stationId) && !isEditMode && (
              <p className="text-[10px] text-[#6B7280] mt-1">Auto-filled from player/station. Edit to customize.</p>
            )}
          </div>

          {/* Crew Member */}
          <div>
            <label className={cn('block text-[#9CA3AF] mb-1', largeText ? 'text-base' : 'text-sm')}>
              Crew Member
            </label>
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
            <label className={cn('block text-[#9CA3AF] mb-1', largeText ? 'text-base' : 'text-sm')}>
              Tags
            </label>
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
            <label className={cn('block text-[#9CA3AF] mb-2', largeText ? 'text-base' : 'text-sm')}>
              Rating
            </label>
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
                <span className="text-[#9CA3AF] text-sm ml-2">
                  {rating} star{rating !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          </div>

          {/* Sticky footer with action buttons */}
          <div className="flex-shrink-0 border-t border-[#2A2A2A] p-4 bg-[#1A1A1A] flex gap-3">
            <button
              type="button"
              onClick={() => { resetForm(); setClipModalOpen(false); }}
              className="flex-1 py-3 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 border border-[#2A2A2A] text-[#9CA3AF] hover:text-white hover:border-[#3A3A3A] bg-transparent"
            >
              <X className="w-5 h-5" />
              Cancel
            </button>
            <button
              type="submit"
              className={cn(
                'flex-[2] py-3 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2',
                priority === 'urgent'
                  ? 'bg-[#EF4444] text-white hover:bg-[#EF4444]/90'
                  : isEditMode
                    ? 'bg-[#3B82F6] text-white hover:bg-[#3B82F6]/90'
                    : 'bg-[#FFD100] text-black hover:bg-[#FFD100]/90'
              )}
            >
              <Check className="w-5 h-5" />
              {isEditMode
                ? 'Save Changes'
                : flagged
                  ? 'Add Flagged Clip'
                  : 'Add Clip Marker'}
              {priority !== 'normal' && (
                <span className="text-xs opacity-80 ml-1">({PRIORITY_CONFIG[priority].label})</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
