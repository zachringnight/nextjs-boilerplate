'use client';

import { useEffect, useState } from 'react';
import FormModal from './FormModal';
import { createActivity, updateActivity } from '../lib/mutations';
import type { CompletedActivity } from '../types';

interface ActivityFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  contractId: number;
  activity?: CompletedActivity | null;
}

export default function ActivityForm({ open, onClose, onSaved, contractId, activity }: ActivityFormProps) {
  const isEdit = Boolean(activity);
  const [description, setDescription] = useState(activity?.activity_description ?? '');
  const [activityDate, setActivityDate] = useState(activity?.activity_date ?? '');
  const [activityYear, setActivityYear] = useState(activity?.activity_year?.toString() ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDescription(activity?.activity_description ?? '');
    setActivityDate(activity?.activity_date ?? '');
    setActivityYear(activity?.activity_year?.toString() ?? '');
    setError(null);
  }, [open, activity]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    setSaving(true);
    setError(null);

    const data = {
      contract_id: contractId,
      activity_description: description.trim(),
      activity_date: activityDate || null,
      activity_year: activityYear ? parseInt(activityYear, 10) : null,
    };

    try {
      if (isEdit && activity) {
        await updateActivity(activity.id, data);
      } else {
        await createActivity(data);
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
    <FormModal open={open} onClose={onClose} title={isEdit ? 'Edit Activity' : 'Add Activity'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Description *</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#FFD100] focus:outline-none"
            placeholder="e.g. 2024 Panini VIP Party Appearance"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Date</label>
            <input
              type="date"
              value={activityDate}
              onChange={(e) => setActivityDate(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#FFD100] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Year</label>
            <input
              type="number"
              value={activityYear}
              onChange={(e) => setActivityYear(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#FFD100] focus:outline-none"
              min="2020"
              max="2030"
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
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Activity'}
          </button>
        </div>
      </form>
    </FormModal>
  );
}
