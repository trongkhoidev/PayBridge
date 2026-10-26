'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { sumAmounts, formatLosslessAmount } from '@/lib/utils/currency';
import {
  ArrowLeft,
  CheckCircle2,
  Plus,
  Trash2,
  Sparkles,
  ShieldCheck,
  Building,
  Users,
  CreditCard,
} from 'lucide-react';

interface RecipientRow {
  recipientName: string;
  recipientReference: string;
  bankCode: string;
  amount: string;
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

export default function NewBatchPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [title, setTitle] = useState('October 2026 Core Engineering Payroll');
  const [asset] = useState('VND');
  const [memo, setMemo] = useState('Bi-weekly sprint settlement for offshore contractors');
  const [recipients, setRecipients] = useState<RecipientRow[]>([
    { recipientName: '', recipientReference: '', bankCode: 'VCB', amount: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute live total safely with lossless BigInt
  let liveTotal = '0';
  let isTotalValid = true;
  try {
    const validAmounts = recipients
      .map((r) => r.amount.trim())
      .filter((a) => /^\d+$/.test(a));
    if (validAmounts.length > 0) {
      liveTotal = sumAmounts(validAmounts);
    }
  } catch {
    liveTotal = '0';
    isTotalValid = false;
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
    setTitle('Sprint 42 Offshore Contractor Batch');
    setRecipients(SAMPLE_RECIPIENTS);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        title,
        employerId: 'emp_acme_vn',
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

      router.push(`/batches/${data.data.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error during submission');
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Link & Header */}
        <div className="flex items-center justify-between">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowLeft size={14} />
            <span>Back to Batches Overview</span>
          </a>
          <button
            type="button"
            onClick={handleLoadSample}
            className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition"
          >
            <Sparkles size={14} />
            <span>⚡ Load 3 Sample Recipients</span>
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setStep(1)}
              className={`flex items-center gap-2 text-left p-2 rounded-lg transition ${
                step === 1
                  ? 'bg-indigo-50 border border-indigo-200 text-indigo-700'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                1
              </div>
              <div>
                <p className="text-xs font-bold">Specification</p>
                <p className="text-[10px] text-slate-400 hidden sm:block">Title & Rail</p>
              </div>
            </button>

            <button
              onClick={() => setStep(2)}
              className={`flex items-center gap-2 text-left p-2 rounded-lg transition ${
                step === 2
                  ? 'bg-indigo-50 border border-indigo-200 text-indigo-700'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                2
              </div>
              <div>
                <p className="text-xs font-bold">Recipient Roster</p>
                <p className="text-[10px] text-slate-400 hidden sm:block">{recipients.length} Beneficiaries</p>
              </div>
            </button>

            <button
              onClick={() => setStep(3)}
              className={`flex items-center gap-2 text-left p-2 rounded-lg transition ${
                step === 3
                  ? 'bg-indigo-50 border border-indigo-200 text-indigo-700'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === 3 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                3
              </div>
              <div>
                <p className="text-xs font-bold">Budget Audit</p>
                <p className="text-[10px] text-slate-400 hidden sm:block">Pre-flight Validation</p>
              </div>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}

        {/* Step 1: Specification */}
        {step === 1 && (
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">Step 1: Batch Specification</h2>
              <p className="text-xs text-slate-500">
                Define the payroll batch title, target settlement currency, and internal notes.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Batch Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. October 2026 Core Engineering Payroll"
                  className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Settlement Rail & Asset
                  </label>
                  <div className="flex items-center gap-2 p-2.5 bg-slate-100 border border-slate-300 rounded-lg text-slate-700 text-xs font-medium">
                    <CreditCard size={15} className="text-indigo-600" />
                    <span>Vietnamese Dong (VND via 9Pay Rail)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Originating Tenant
                  </label>
                  <div className="flex items-center gap-2 p-2.5 bg-slate-100 border border-slate-300 rounded-lg text-slate-700 text-xs font-medium">
                    <Building size={15} className="text-slate-500" />
                    <span>Acme Global Ltd (emp_acme_vn)</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Internal Memo / Audit Note
                </label>
                <textarea
                  rows={2}
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition"
              >
                Continue to Recipient Roster →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Recipient Roster */}
        {step === 2 && (
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Step 2: Recipient Roster</h2>
                <p className="text-xs text-slate-500">
                  Input contractor bank details and payout amounts. Every figure is handled with integer precision.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddRecipient}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-xs font-semibold transition"
              >
                <Plus size={14} />
                <span>Add Row</span>
              </button>
            </div>

            <div className="space-y-3">
              {recipients.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center hover:bg-slate-50 transition"
                >
                  <div className="sm:col-span-4">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                      Beneficiary Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Nguyen Van A"
                      value={rec.recipientName}
                      onChange={(e) =>
                        handleUpdateRecipient(idx, 'recipientName', e.target.value)
                      }
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                      Account / Wallet Phone
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="9704... or 0912..."
                      value={rec.recipientReference}
                      onChange={(e) =>
                        handleUpdateRecipient(idx, 'recipientReference', e.target.value)
                      }
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                      Routing Bank
                    </label>
                    <select
                      value={rec.bankCode}
                      onChange={(e) => handleUpdateRecipient(idx, 'bankCode', e.target.value)}
                      className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold text-slate-700"
                    >
                      <option value="VCB">Vietcombank (VCB)</option>
                      <option value="MB">MB Bank (MB)</option>
                      <option value="TCB">Techcombank (TCB)</option>
                      <option value="ACB">ACB</option>
                      <option value="9PAY_WALLET">9Pay E-Wallet</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                      Amount (VND)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="15000000"
                      value={rec.amount}
                      onChange={(e) => handleUpdateRecipient(idx, 'amount', e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-1 flex justify-center pt-3 sm:pt-0">
                    {recipients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRecipient(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                        title="Remove row"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Lossless Real-time Calculation Badge */}
            <div className="p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-indigo-900">Computed Roster Total:</p>
                <p className="text-[11px] text-indigo-600">{recipients.length} item(s) allocated</p>
              </div>
              <div className="text-right">
                <span className="text-base sm:text-lg font-black font-mono text-indigo-700">
                  {formatLosslessAmount(liveTotal, asset)}
                </span>
                <p className="text-[10px] text-indigo-500">Lossless BigInt arithmetic</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition"
              >
                Review & Pre-flight Audit →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Pre-flight Audit */}
        {step === 3 && (
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Step 3: Budget & Pre-Flight Audit</h2>
              <p className="text-xs text-slate-500">
                Confirm all figures before generating the immutable Draft batch.
              </p>
            </div>

            {/* Audit Checklist Box */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-xs text-slate-500 block mb-1">Batch Total</span>
                <span className="text-lg font-black font-mono text-slate-900">
                  {formatLosslessAmount(liveTotal, asset)}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-1">
                  ✓ Verified Lossless
                </span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-xs text-slate-500 block mb-1">Total Beneficiaries</span>
                <span className="text-lg font-black text-slate-900">{recipients.length} Persons</span>
                <span className="text-[10px] text-indigo-600 font-semibold block mt-1">
                  Vietnam Domestic Rail
                </span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-xs text-slate-500 block mb-1">Execution Provider</span>
                <span className="text-sm font-bold text-amber-700 uppercase block">
                  9Pay Testnet Adapter
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">Sandbox Simulation</span>
              </div>
            </div>

            {/* Review Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Beneficiary</th>
                    <th className="p-3">Routing Account</th>
                    <th className="p-3">Bank</th>
                    <th className="p-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recipients.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-3 text-slate-400 font-mono">{i + 1}</td>
                      <td className="p-3 font-semibold text-slate-800">{r.recipientName}</td>
                      <td className="p-3 font-mono text-slate-600">{r.recipientReference}</td>
                      <td className="p-3 font-semibold text-indigo-700">{r.bankCode}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">
                        {formatLosslessAmount(r.amount, asset)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200 text-amber-900 text-xs rounded-xl flex items-center gap-2">
              <ShieldCheck size={16} className="text-amber-600 shrink-0" />
              <span>
                <strong>Dual-Control Invariant:</strong> Creating this batch will register it in{' '}
                <code className="font-mono font-bold">DRAFT</code> status. It cannot be executed
                until an authorized Approver signs off.
              </span>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                ← Edit Roster
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-600/20 transition disabled:opacity-50"
              >
                {loading ? 'Creating Batch...' : 'Confirm & Register Draft Batch 🚀'}
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
