'use client';

import { useState, useMemo } from 'react';
import {
  Video,
  Camera,
  Sparkles,
  Users,
  AlertTriangle,
  Check,
  Plus,
  Trash2,
  Filter,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '../store';
import {
  ContentMode,
  ContentPlatform,
  CONTENT_MODES,
  CONTENT_PLATFORMS,
} from '../types';
import { players } from '../data/players';

// Content mode icons and colors
const modeConfig: Record<ContentMode, { icon: typeof Video; color: string }> = {
  'Player Spotlight': { icon: Users, color: 'bg-purple-500' },
  'Pack Reveal/Hit': { icon: Sparkles, color: 'bg-amber-500' },
  'Signing Session': { icon: Camera, color: 'bg-blue-500' },
  'Legend Tribute': { icon: Users, color: 'bg-yellow-500' },
  'Event Promo': { icon: Video, color: 'bg-green-500' },
  'Behind the Scenes': { icon: Camera, color: 'bg-pink-500' },
  'Day Recap': { icon: Video, color: 'bg-indigo-500' },
  'Media Moment': { icon: Camera, color: 'bg-cyan-500' },
  'Product Drop': { icon: Sparkles, color: 'bg-orange-500' },
  'Card Break Hype': { icon: Video, color: 'bg-red-500' },
};

// Platform colors
const platformColors: Record<ContentPlatform, string> = {
  Instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
  TikTok: 'bg-black',
  'Twitter/X': 'bg-zinc-700',
  YouTube: 'bg-red-600',
  Facebook: 'bg-blue-600',
  Internal: 'bg-zinc-600',
};

export default function ContentTrackingPage() {
  const {
    contentTracking,
    trackContent,
    removeContentTracking,
    hasUsedMode,
    getUnusedModes,
    getContentForPlayer,
  } = useAppStore();

  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [selectedMode, setSelectedMode] = useState<ContentMode | ''>('');
  const [selectedPlatform, setSelectedPlatform] = useState<ContentPlatform | ''>('');
  const [notes, setNotes] = useState('');
  const [filterPlayer, setFilterPlayer] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(new Set());

  // Players with content gaps (unused modes)
  const playersWithGaps = useMemo(() => {
    return players
      .map((player) => ({
        player,
        unusedModes: getUnusedModes(player.id),
        usedCount: getContentForPlayer(player.id).length,
      }))
      .filter((p) => p.unusedModes.length > 0)
      .sort((a, b) => b.unusedModes.length - a.unusedModes.length);
  }, [contentTracking, getUnusedModes, getContentForPlayer]);

  // Filtered content
  const filteredContent = useMemo(() => {
    if (filterPlayer === 'all') return contentTracking;
    return contentTracking.filter((c) => c.playerId === filterPlayer);
  }, [contentTracking, filterPlayer]);

  const handleAddContent = () => {
    if (!selectedPlayer || !selectedMode || !selectedPlatform) return;

    trackContent(selectedPlayer, selectedMode, selectedPlatform, notes || undefined);

    // Reset form
    setSelectedMode('');
    setSelectedPlatform('');
    setNotes('');
    setShowAddForm(false);
  };

  const togglePlayerExpanded = (playerId: string) => {
    setExpandedPlayers((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) {
        next.delete(playerId);
      } else {
        next.add(playerId);
      }
      return next;
    });
  };

  const getPlayerName = (playerId: string) => {
    return players.find((p) => p.id === playerId)?.name || playerId;
  };

  return (
    <div className="min-h-screen bg-zinc-950 pb-24">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Video className="w-6 h-6 text-purple-500" />
          Content Tracking
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Track content modes used for each player
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-2 p-4">
        <div className="bg-zinc-900 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-white">{contentTracking.length}</div>
          <div className="text-xs text-zinc-400">Total Content</div>
        </div>
        <div className="bg-zinc-900 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-500">
            {players.filter((p) => getUnusedModes(p.id).length === 0).length}
          </div>
          <div className="text-xs text-zinc-400">Full Coverage</div>
        </div>
        <div className="bg-zinc-900 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-amber-500">{playersWithGaps.length}</div>
          <div className="text-xs text-zinc-400">With Gaps</div>
        </div>
      </div>

      {/* Add Content Button */}
      <div className="px-4 mb-4">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Track New Content
        </button>
      </div>

      {/* Add Content Form */}
      {showAddForm && (
        <div className="mx-4 mb-4 bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-4">
          <h3 className="font-medium text-white">Track Content</h3>

          {/* Player Select */}
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Player</label>
            <select
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
            >
              <option value="">Select player...</option>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name} - {player.team}
                </option>
              ))}
            </select>
          </div>

          {/* Mode Select */}
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Content Mode</label>
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value as ContentMode)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
            >
              <option value="">Select mode...</option>
              {CONTENT_MODES.map((mode) => (
                <option
                  key={mode}
                  value={mode}
                  disabled={selectedPlayer ? hasUsedMode(selectedPlayer, mode) : false}
                >
                  {mode}
                  {selectedPlayer && hasUsedMode(selectedPlayer, mode) ? ' (used)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Platform Select */}
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Platform</label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value as ContentPlatform)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
            >
              <option value="">Select platform...</option>
              {CONTENT_PLATFORMS.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Notes (optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-2">
            <button
              onClick={handleAddContent}
              disabled={!selectedPlayer || !selectedMode || !selectedPlatform}
              className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition-colors"
            >
              Add Content
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

      {/* Coverage Gaps Section */}
      {playersWithGaps.length > 0 && (
        <div className="px-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="font-medium text-white">Coverage Gaps</h2>
          </div>
          <div className="space-y-2">
            {playersWithGaps.slice(0, 5).map(({ player, unusedModes, usedCount }) => (
              <div
                key={player.id}
                className="bg-zinc-900 border border-amber-900/50 rounded-lg p-3"
              >
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => togglePlayerExpanded(player.id)}
                >
                  <div>
                    <div className="font-medium text-white">{player.name}</div>
                    <div className="text-xs text-zinc-400">
                      {usedCount}/{CONTENT_MODES.length} modes used
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-amber-900/50 text-amber-400 px-2 py-0.5 rounded">
                      {unusedModes.length} missing
                    </span>
                    {expandedPlayers.has(player.id) ? (
                      <ChevronDown className="w-4 h-4 text-zinc-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-zinc-500" />
                    )}
                  </div>
                </div>
                {expandedPlayers.has(player.id) && (
                  <div className="mt-3 pt-3 border-t border-zinc-800">
                    <div className="text-xs text-zinc-400 mb-2">Missing modes:</div>
                    <div className="flex flex-wrap gap-1">
                      {unusedModes.map((mode) => {
                        const config = modeConfig[mode];
                        return (
                          <span
                            key={mode}
                            className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded flex items-center gap-1"
                          >
                            {mode}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content History */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium text-white">Content History</h2>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-500" />
            <select
              value={filterPlayer}
              onChange={(e) => setFilterPlayer(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-sm text-white"
            >
              <option value="all">All Players</option>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredContent.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            No content tracked yet. Start by adding content above.
          </div>
        ) : (
          <div className="space-y-2">
            {filteredContent.map((content) => {
              const config = modeConfig[content.mode];
              const Icon = config.icon;
              return (
                <div
                  key={content.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg p-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`${config.color} p-2 rounded-lg`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-white">
                          {getPlayerName(content.playerId)}
                        </div>
                        <div className="text-sm text-zinc-400">{content.mode}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-xs text-white px-2 py-0.5 rounded ${
                              platformColors[content.platform]
                            }`}
                          >
                            {content.platform}
                          </span>
                          <span className="text-xs text-zinc-500">
                            {new Date(content.usedAt).toLocaleDateString()}
                          </span>
                        </div>
                        {content.notes && (
                          <div className="text-xs text-zinc-500 mt-1">{content.notes}</div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeContentTracking(content.id)}
                      className="text-zinc-600 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
