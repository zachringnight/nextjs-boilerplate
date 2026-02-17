'use client';

import { useEffect, useState } from 'react';
import FormModal from './FormModal';
import { createContract, updateContract } from '../lib/mutations';
import type { AthleteContract } from '../types';

interface ContractFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  athleteId: number;
  contract?: AthleteContract | null;
}

export default function ContractForm({ open, onClose, onSaved, athleteId, contract }: ContractFormProps) {
  const isEdit = Boolean(contract);
  const [dealType, setDealType] = useState<string>(contract?.deal_type ?? 'exclusive');
  const [exclusivityScope, setExclusivityScope] = useState(contract?.exclusivity_scope ?? '');
  const [contractStart, setContractStart] = useState(contract?.contract_start ?? '');
  const [contractEnd, setContractEnd] = useState(contract?.contract_end ?? '');
  const [contractEndNote, setContractEndNote] = useState(contract?.contract_end_note ?? '');
  const [rawMarketingSpecs, setRawMarketingSpecs] = useState(contract?.raw_marketing_specs ?? '');
  const [rawCompletedMarketing, setRawCompletedMarketing] = useState(contract?.raw_completed_marketing ?? '');
  const [specialNotes, setSpecialNotes] = useState(contract?.special_notes ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDealType(contract?.deal_type ?? 'exclusive');
    setExclusivityScope(contract?.exclusivity_scope ?? '');
    setContractStart(contract?.contract_start ?? '');
    setContractEnd(contract?.contract_end ?? '');
    setContractEndNote(contract?.contract_end_note ?? '');
    setRawMarketingSpecs(contract?.raw_marketing_specs ?? '');
    setRawCompletedMarketing(contract?.raw_completed_marketing ?? '');
    setSpecialNotes(contract?.special_notes ?? '');
    setError(null);
  }, [open, contract]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const data = {
      athlete_id: athleteId,
      deal_type: dealType as 'exclusive' | 'non_exclusive',
      exclusivity_scope: exclusivityScope || null,
      contract_start: contractStart || null,
      contract_end: contractEnd || null,
      contract_end_note: contractEndNote || null,
      raw_marketing_specs: rawMarketingSpecs || null,
      raw_completed_marketing: rawCompletedMarketing || null,
      special_notes: specialNotes || null,
    };

    try {
      if (isEdit && contract) {
        await updateContract(contract.id, data);
      } else {
        await createContract(data);
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
    <FormModal open={open} onClose={onClose} title={isEdit ? 'Edit Contract' : 'Add Contract'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Deal Type</label>
          <select
            value={dealType}
            onChange={(e) => setDealType(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#FFD100] focus:outline-none"
          >
            <option value="exclusive">Exclusive</option>
            <option value="non_exclusive">Non-Exclusive</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Exclusivity Scope</label>
          <select
            value={exclusivityScope}
            onChange={(e) => setExclusivityScope(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#FFD100] focus:outline-none"
          >
            <option value="">None</option>
            <option value="cards_and_memorabilia">Cards & Memorabilia</option>
            <option value="cards_only">Cards Only</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Start Date</label>
            <input
              type="date"
              value={contractStart}
              onChange={(e) => setContractStart(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#FFD100] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#9CA3AF] mb-1">End Date</label>
            <input
              type="date"
              value={contractEnd}
              onChange={(e) => setContractEnd(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#FFD100] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#9CA3AF] mb-1">End Date Note</label>
          <input
            type="text"
            value={contractEndNote}
            onChange={(e) => setContractEndNote(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#FFD100] focus:outline-none"
            placeholder="e.g. until turns pro"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Marketing Specs</label>
          <textarea
            value={rawMarketingSpecs}
            onChange={(e) => setRawMarketingSpecs(e.target.value)}
            rows={3}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#FFD100] focus:outline-none resize-y"
            placeholder="Original contract language"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Completed Marketing</label>
          <textarea
            value={rawCompletedMarketing}
            onChange={(e) => setRawCompletedMarketing(e.target.value)}
            rows={2}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#FFD100] focus:outline-none resize-y"
            placeholder="Completion notes"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Special Notes</label>
          <input
            type="text"
            value={specialNotes}
            onChange={(e) => setSpecialNotes(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#FFD100] focus:outline-none"
            placeholder="e.g. NO ANNOUNCEMENT"
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
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Contract'}
          </button>
        </div>
      </form>
    </FormModal>
  );
}
