'use client';

import React, { useState } from 'react';
import { ShieldCheck, Key, AlertTriangle, CheckCircle2, Lock, X } from 'lucide-react';
import { formatLosslessAmount } from '@/lib/utils/currency';
import { PayrollBatch } from '@/types';

interface DualControlSignoffModalProps {
  batch: PayrollBatch;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DualControlSignoffModal({
  batch,
  isOpen,
  onClose,
  onConfirm,
}: DualControlSignoffModalProps) {
  const [approverName, setApproverName] = useState('Executive Approver (CFO / Treasury)');
  const [securityPin, setSecurityPin] = useState('889922');
  const [attestationChecked, setAttestationChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attestationChecked) return;
    setIsSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-lg text-slate-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Dual-Control Executive Sign-Off
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Mandate Policy SEC-804 • Quorum 1 of 1
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {/* Policy Alert Card */}
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200/90 space-y-1">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <AlertTriangle size={15} />
              <span>Cryptographic Authorization Mandate</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-200/80">
              In accordance with financial separation of duties, this batch requires explicit dual-control authorization before funds can be routed to the 9Pay NAPAS 24/7 switch.
            </p>
          </div>

          {/* Batch Summary Review Box */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Payroll Batch Title:</span>
              <span className="font-bold text-white text-right max-w-[240px] truncate">
                {batch.title}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Total Settlement Budget:</span>
              <span className="font-bold font-mono text-emerald-400 text-sm">
                {formatLosslessAmount(batch.sourceAmountTotal, batch.asset)}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Allocated Beneficiaries:</span>
              <span className="font-bold text-white">{batch.items.length} Vietnamese Contractors</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Disbursement Rail:</span>
              <span className="font-mono text-xs uppercase text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                {batch.provider} (Chi Hộ Testnet)
              </span>
            </div>
          </div>

          {/* Approver Credential Fields */}
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Authorized Signer Identity
              </label>
              <input
                type="text"
                required
                value={approverName}
                onChange={(e) => setApproverName(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Security Passkey / FIDO2 Attestation PIN
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={securityPin}
                  onChange={(e) => setSecurityPin(e.target.value)}
                  className="w-full text-xs pl-3 pr-9 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono tracking-widest"
                />
                <Key
                  size={15}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Attestation Checkbox */}
          <label className="flex items-start gap-2.5 p-3 bg-slate-800/40 border border-slate-700/40 rounded-xl cursor-pointer hover:bg-slate-800/60 transition">
            <input
              type="checkbox"
              required
              checked={attestationChecked}
              onChange={(e) => setAttestationChecked(e.target.checked)}
              className="mt-0.5 rounded border-slate-600 bg-slate-700 text-indigo-600 focus:ring-0"
            />
            <span className="text-[11px] text-slate-300 leading-snug">
              I certify that all {batch.items.length} beneficiary bank accounts and exact amounts have been verified against contractor work orders and approved for settlement release.
            </span>
          </label>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-slate-400 hover:text-white rounded-lg transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!attestationChecked || isSubmitting}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/40 transition disabled:opacity-40 flex items-center gap-2"
            >
              <Lock size={14} />
              <span>{isSubmitting ? 'Signing Certificate...' : 'Sign & Release Batch (FIDO2)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
