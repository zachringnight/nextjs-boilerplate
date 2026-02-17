'use client';

import { useState } from 'react';
import FormModal from './FormModal';
import { SPORTS } from '../lib/constants';
import { createAthlete, updateAthlete } from '../lib/mutations';
import type { Athlete } from '../types';

interface AthleteFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  athlete?: Athlete | null;
}

export default function AthleteForm({ open, onClose, onSaved, athlete }: AthleteFormProps) {
  const isEdit = Boolean(athlete);
  const [name, setName] = useState(athlete?.name ?? '');
  const [sport, setSport] = useState(athlete?.sport ?? '');
  const [league, setLeague] = useState(athlete?.league ?? '');
  const [team, setTeam] = useState(athlete?.team ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (isEdit && athlete) {
        await updateAthlete(athlete.id, {
          name: name.trim(),
          sport: sport || null,
          league: league || null,
          team: team || null,
        });
      } else {
        await createAthlete({
          name: name.trim(),
          sport: sport || null,
          league: league || null,
          team: team || null,
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <FormModal open={open} onClose={onClose} title={isEdit ? 'Edit Athlete' : 'Add Athlete'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#FFD100] focus:outline-none"
            placeholder="Full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Sport</label>
          <select
            value={sport}
            onChange={(e) => setSport(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#FFD100] focus:outline-none"
          >
            <option value="">Select sport</option>
            {SPORTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#9CA3AF] mb-1">League</label>
          <input
            type="text"
            value={league}
            onChange={(e) => setLeague(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#FFD100] focus:outline-none"
            placeholder="NBA, NFL, NIL, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Team</label>
          <input
            type="text"
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#FFD100] focus:outline-none"
            placeholder="Team or school"
          />
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#9CA3AF] hover:text-white bg-[#1A1A1A] rounded-lg transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-black bg-[#FFD100] rounded-lg hover:bg-[#FFD100]/90 transition-colors disabled:opacity-50"
            disabled={saving}
          >
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Athlete'}
          </button>
        </div>
      </form>
    </FormModal>
  );
}
