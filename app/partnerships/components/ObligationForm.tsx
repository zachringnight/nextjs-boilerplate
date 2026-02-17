'use client';

import { useEffect, useState } from 'react';
import FormModal from './FormModal';
import { OBLIGATION_TYPES } from '../lib/constants';
import { createObligation, updateObligation } from '../lib/mutations';
import type { MarketingObligation } from '../types';

interface ObligationFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  contractId: number;
  obligation?: MarketingObligation | null;
}

export default function ObligationForm({ open, onClose, onSaved, contractId, obligation }: ObligationFormProps) {
  const isEdit = Boolean(obligation);
  const [obligationType, setObligationType] = useState(obligation?.obligation_type ?? '');
  const [quantityPerYear, setQuantityPerYear] = useState(obligation?.quantity_per_year?.toString() ?? '');
  const [quantityTotal, setQuantityTotal] = useState(obligation?.quantity_total?.toString() ?? '');
  const [platform, setPlatform] = useState(obligation?.platform ?? '');
  const [notes, setNotes] = useState(obligation?.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setObligationType(obligation?.obligation_type ?? '');
    setQuantityPerYear(obligation?.quantity_per_year?.toString() ?? '');
    setQuantityTotal(obligation?.quantity_total?.toString() ?? '');
    setPlatform(obligation?.platform ?? '');
    setNotes(obligation?.notes ?? '');
    setError(null);
  }, [open, obligation]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!obligationType) {
      setError('Obligation type is required');
      return;
    }

    setSaving(true);
    setError(null);

    const data = {
      contract_id: contractId,
      obligation_type: obligationType,
      quantity_per_year: quantityPerYear ? parseInt(quantityPerYear, 10) : null,
      quantity_total: quantityTotal ? parseInt(quantityTotal, 10) : null,
      platform: platform || null,
      notes: notes || null,
    };

    try {
      if (isEdit && obligation) {
        await updateObligation(obligation.id, data);
      } else {
        await createObligation(data);
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
    <FormModal open={open} onClose={onClose} title={isEdit ? 'Edit Obligation' : 'Add Obligation'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Type *</label>
          <select
            value={obligationType}
            onChange={(e) => setObligationType(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#FFD100] focus:outline-none"
          >
            <option value="">Select type</option>
            {OBLIGATION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Qty/Year</label>
            <input
              type="number"
              value={quantityPerYear}
              onChange={(e) => setQuantityPerYear(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#FFD100] focus:outline-none"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Qty Total</label>
            <input
              type="number"
              value={quantityTotal}
              onChange={(e) => setQuantityTotal(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#FFD100] focus:outline-none"
              min="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Platform</label>
          <input
            type="text"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#FFD100] focus:outline-none"
            placeholder="instagram, twitter, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
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
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Obligation'}
          </button>
        </div>
      </form>
    </FormModal>
  );
}
