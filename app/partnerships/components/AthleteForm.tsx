'use client';

import { useEffect, useState } from 'react';
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
  const [instagramHandle, setInstagramHandle] = useState(athlete?.instagram_handle ?? '');
  const [xHandle, setXHandle] = useState(athlete?.x_handle ?? '');
  const [teamCity, setTeamCity] = useState(athlete?.team_city ?? '');
  const [teamState, setTeamState] = useState(athlete?.team_state ?? '');
  const [hometownCity, setHometownCity] = useState(athlete?.hometown_city ?? '');
  const [hometownState, setHometownState] = useState(athlete?.hometown_state ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(athlete?.name ?? '');
    setSport(athlete?.sport ?? '');
    setLeague(athlete?.league ?? '');
    setTeam(athlete?.team ?? '');
    setInstagramHandle(athlete?.instagram_handle ?? '');
    setXHandle(athlete?.x_handle ?? '');
    setTeamCity(athlete?.team_city ?? '');
    setTeamState(athlete?.team_state ?? '');
    setHometownCity(athlete?.hometown_city ?? '');
    setHometownState(athlete?.hometown_state ?? '');
    setError(null);
  }, [open, athlete]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      name: name.trim(),
      sport: sport || null,
      league: league || null,
      team: team || null,
      instagram_handle: instagramHandle.trim() || null,
      x_handle: xHandle.trim() || null,
      team_city: teamCity.trim() || null,
      team_state: teamState.trim() || null,
      hometown_city: hometownCity.trim() || null,
      hometown_state: hometownState.trim() || null,
    };

    try {
      if (isEdit && athlete) {
        await updateAthlete(athlete.id, payload);
      } else {
        await createAthlete(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#FFD100] focus:outline-none";

  return (
    <FormModal open={open} onClose={onClose} title={isEdit ? 'Edit Athlete' : 'Add Athlete'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Name *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Full name" />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Sport</label>
          <select value={sport} onChange={(e) => setSport(e.target.value)} className={inputClass}>
            <option value="">Select sport</option>
            {SPORTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#9CA3AF] mb-1">League</label>
          <input type="text" value={league} onChange={(e) => setLeague(e.target.value)} className={inputClass} placeholder="NBA, NFL, NIL, etc." />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Team</label>
          <input type="text" value={team} onChange={(e) => setTeam(e.target.value)} className={inputClass} placeholder="Team or school" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Team City</label>
            <input type="text" value={teamCity} onChange={(e) => setTeamCity(e.target.value)} className={inputClass} placeholder="City" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Team State</label>
            <input type="text" value={teamState} onChange={(e) => setTeamState(e.target.value)} className={inputClass} placeholder="State" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Hometown City</label>
            <input type="text" value={hometownCity} onChange={(e) => setHometownCity(e.target.value)} className={inputClass} placeholder="City" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Hometown State</label>
            <input type="text" value={hometownState} onChange={(e) => setHometownState(e.target.value)} className={inputClass} placeholder="State" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Instagram</label>
            <input type="text" value={instagramHandle} onChange={(e) => setInstagramHandle(e.target.value)} className={inputClass} placeholder="handle (no @)" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#9CA3AF] mb-1">X / Twitter</label>
            <input type="text" value={xHandle} onChange={(e) => setXHandle(e.target.value)} className={inputClass} placeholder="handle (no @)" />
          </div>
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
