'use client';

import { useEffect, useState } from 'react';
import FormModal from './FormModal';
import {
  createNascarActivity,
  updateNascarActivity,
  createEuroleagueActivity,
  updateEuroleagueActivity,
} from '../lib/mutations';
import type { NascarActivity, EuroleagueActivity } from '../types';

interface EventFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  type: 'nascar' | 'euroleague';
  data?: NascarActivity | EuroleagueActivity | null;
}

function getInitialValues(
  type: EventFormProps['type'],
  data: EventFormProps['data']
) {
  const isNascar = type === 'nascar';
  const nascarData = isNascar ? (data as NascarActivity | null | undefined) : undefined;
  const euroData = !isNascar ? (data as EuroleagueActivity | null | undefined) : undefined;

  return {
    name: isNascar ? nascarData?.item ?? '' : euroData?.event_name ?? '',
    eventDate: data?.event_date ?? '',
    details: isNascar ? nascarData?.details ?? '' : euroData?.details ?? '',
    activationType: isNascar ? '' : euroData?.activation_type ?? '',
  };
}

export default function EventForm({ open, onClose, onSaved, type, data }: EventFormProps) {
  const isEdit = Boolean(data);
  const isNascar = type === 'nascar';
  const initialValues = getInitialValues(type, data);

  const [name, setName] = useState(initialValues.name);
  const [eventDate, setEventDate] = useState(initialValues.eventDate);
  const [details, setDetails] = useState(initialValues.details);
  const [activationType, setActivationType] = useState(initialValues.activationType);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const nextValues = getInitialValues(type, data);
    setName(nextValues.name);
    setEventDate(nextValues.eventDate);
    setDetails(nextValues.details);
    setActivationType(nextValues.activationType);
    setError(null);
  }, [open, type, data]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (isNascar) {
        const nascarData = {
          item: name.trim(),
          event_date: eventDate || null,
          details: details || null,
        };
        if (isEdit && data) {
          await updateNascarActivity(data.id, nascarData);
        } else {
          await createNascarActivity(nascarData);
        }
      } else {
        const euroData = {
          event_name: name.trim(),
          event_date: eventDate || null,
          activation_type: activationType || null,
          details: details || null,
        };
        if (isEdit && data) {
          await updateEuroleagueActivity(data.id, euroData);
        } else {
          await createEuroleagueActivity(euroData);
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

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={`${isEdit ? 'Edit' : 'Add'} ${isNascar ? 'NASCAR' : 'Euroleague'} Activity`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-[#9CA3AF] mb-1">
            {isNascar ? 'Item' : 'Event Name'} *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#FFD100] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Event Date</label>
          <input
            type={isNascar ? 'text' : 'date'}
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#FFD100] focus:outline-none"
            placeholder={isNascar ? 'Date (text format)' : ''}
          />
        </div>

        {!isNascar && (
          <div>
            <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Activation Type</label>
            <input
              type="text"
              value={activationType}
              onChange={(e) => setActivationType(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#FFD100] focus:outline-none"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Details</label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={3}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#FFD100] focus:outline-none resize-y"
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
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Activity'}
          </button>
        </div>
      </form>
    </FormModal>
  );
}
