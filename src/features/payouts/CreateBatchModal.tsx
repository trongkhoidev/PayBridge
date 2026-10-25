'use client';

import React, { useState } from 'react';
import { sumAmounts, formatLosslessAmount } from '@/lib/utils/currency';

interface RecipientRow {
  recipientName: string;
  recipientReference: string;
  bankCode: string;
  amount: string;
}

interface CreateBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBatchCreated: () => void;
}

const SAMPLE_RECIPIENTS: RecipientRow[] = [
  {
    recipientName: 'Nguyen Van A',
    recipientReference: '9704050012345678',
    bankCode: 'VCB',
    amount: '15000000',
  },
  {
    recipientName: 'Tran Thi B',
    recipientReference: '9704220087654321',
    bankCode: 'MB',
    amount: '22000000',
  },
  {
    recipientName: 'Le Hoang C',
    recipientReference: '0912345678',
    bankCode: '9PAY_WALLET',
    amount: '8500000',
  },
];

export function CreateBatchModal({ isOpen, onClose, onBatchCreated }: CreateBatchModalProps) {
  const [title, setTitle] = useState('October 2026 Engineering Payroll');
  const [asset] = useState('VND');
  const [recipients, setRecipients] = useState<RecipientRow[]>([
    { recipientName: '', recipientReference: '', bankCode: 'VCB', amount: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Compute live total safely
  let liveTotal = '0';
  try {
    const validAmounts = recipients
      .map((r) => r.amount.trim())
      .filter((a) => /^\d+$/.test(a));
    if (validAmounts.length > 0) {
      liveTotal = sumAmounts(validAmounts);
    }
  } catch {
    liveTotal = 'Error in amounts';
  }

  const handleAddRecipient = () => {
    setRecipients([
      ...recipients,
      { recipientName: '', recipientReference: '', bankCode: 'VCB', amount: '' },
    ]);
  };

  const handleRemoveRecipient = (index: number) => {
    if (recipients.length <= 1) return;
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const handleUpdateRecipient = (
    index: number,
    field: keyof RecipientRow,
    value: string
  ) => {
    const updated = [...recipients];
    updated[index][field] = value;
    setRecipients(updated);
  };

  const handleLoadSample = () => {
    setTitle('Engineering Freelance Batch (Oct 2026)');
    setRecipients(SAMPLE_RECIPIENTS);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        title,
        employerId: 'employer_acme_vn',
        asset,
        items: recipients.map((r) => ({
          recipientName: r.recipientName.trim(),
          recipientReference: r.recipientReference.trim(),
          bankCode: r.bankCode.trim() || undefined,
          amount: r.amount.trim(),
          asset,
        })),
      };

      const res = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create payout batch');
      }

      onBatchCreated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown creation error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Create Payout Batch</h2>
            <p className="text-xs text-slate-500">
              Input recipient details. Totals are computed using lossless decimal precision.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLoadSample}
            className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg font-medium transition"
          >
            ⚡ Load 3 Sample Recipients
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Batch Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. October 2026 Developer Payout"
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Settlement Asset
              </label>
              <input
                type="text"
                disabled
                value={asset}
                className="w-full text-sm px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-600 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700">
                Recipients List ({recipients.length})
              </label>
              <button
                type="button"
                onClick={handleAddRecipient}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                + Add Recipient
              </button>
            </div>

            <div className="space-y-3">
              {recipients.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                >
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      required
                      placeholder="Full Name (e.g. Nguyen Van A)"
                      value={rec.recipientName}
                      onChange={(e) =>
                        handleUpdateRecipient(idx, 'recipientName', e.target.value)
                      }
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      required
                      placeholder="Account / Phone No"
                      value={rec.recipientReference}
                      onChange={(e) =>
                        handleUpdateRecipient(idx, 'recipientReference', e.target.value)
                      }
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Bank (VCB/MB)"
                      value={rec.bankCode}
                      onChange={(e) =>
                        handleUpdateRecipient(idx, 'bankCode', e.target.value)
                      }
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      required
                      placeholder="Amount (VND)"
                      value={rec.amount}
                      onChange={(e) =>
                        handleUpdateRecipient(idx, 'amount', e.target.value)
                      }
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                  <div className="sm:col-span-1 text-center">
                    {recipients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRecipient(idx)}
                        className="text-rose-500 hover:text-rose-700 text-xs font-bold"
                        title="Remove recipient"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lossless Summary Box */}
          <div className="bg-indigo-50/70 border border-indigo-200 rounded-lg p-3 flex items-center justify-between">
            <span className="text-xs font-medium text-indigo-900">Computed Batch Total:</span>
            <span className="text-sm font-bold text-indigo-700 font-mono">
              {formatLosslessAmount(liveTotal, asset)}
            </span>
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Draft Batch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
