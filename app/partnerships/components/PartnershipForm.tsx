'use client';

import { useState } from 'react';
import FormModal from './FormModal';
import {
  createTeamPartnership,
  updateTeamPartnership,
  createPartnerPartnership,
  updatePartnerPartnership,
} from '../lib/mutations';
import type { TeamPartnership, PartnerPartnership } from '../types';

interface PartnershipFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  type: 'team' | 'partner';
  data?: TeamPartnership | PartnerPartnership | null;
}

export default function PartnershipForm({ open, onClose, onSaved, type, data }: PartnershipFormProps) {
  const isEdit = Boolean(data);
  const isTeam = type === 'team';

  const [name, setName] = useState(
    isTeam ? (data as TeamPartnership)?.team_name ?? '' : (data as PartnerPartnership)?.partner_name ?? ''
  );
  const [league, setLeague] = useState(isTeam ? (data as TeamPartnership)?.league ?? '' : '');
  const [assetType, setAssetType] = useState(data?.asset_type ?? '');
  const [details, setDetails] = useState(data?.details ?? '');
  const [activationDate, setActivationDate] = useState(data?.activation_date ?? '');
  const [status, setStatus] = useState(data?.status ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !assetType.trim()) {
      setError('Name and asset type are required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (isTeam) {
        const teamData = {
          team_name: name.trim(),
          league: league || null,
          asset_type: assetType.trim(),
          details: details || null,
          activation_date: activationDate || null,
          status: status || null,
        };
        if (isEdit && data) {
          await updateTeamPartnership(data.id, teamData);
        } else {
          await createTeamPartnership(teamData);
        }
      } else {
        const partnerData = {
          partner_name: name.trim(),
          asset_type: assetType.trim(),
          details: details || null,
          activation_date: activationDate || null,
          status: status || null,
        };
        if (isEdit && data) {
          await updatePartnerPartnership(data.id, partnerData);
        } else {
          await createPartnerPartnership(partnerData);
        }
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  const title = `${isEdit ? 'Edit' : 'Add'} ${isTeam ? 'Team' : 'Partner'} Partnership`;

  return (
    <FormModal open={open} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-[#9CA3AF] mb-1">
            {isTeam ? 'Team Name' : 'Partner Name'} *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#FFD100] focus:outline-none"
          />
        </div>

        {isTeam && (
          <div>
            <label className="block text-sm font-medium text-[#9CA3AF] mb-1">League</label>
            <input
              type="text"
              value={league}
              onChange={(e) => setLeague(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#FFD100] focus:outline-none"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Asset Type *</label>
          <input
            type="text"
            value={assetType}
            onChange={(e) => setAssetType(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#FFD100] focus:outline-none"
            placeholder="e.g. Trading Card Rights"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Details</label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={3}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#FFD100] focus:outline-none resize-y"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Activation Date</label>
            <input
              type="date"
              value={activationDate}
              onChange={(e) => setActivationDate(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#FFD100] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Status</label>
            <input
              type="text"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#FFD100] focus:outline-none"
              placeholder="Active, Pending, etc."
            />
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
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Partnership'}
          </button>
        </div>
      </form>
    </FormModal>
  );
}
