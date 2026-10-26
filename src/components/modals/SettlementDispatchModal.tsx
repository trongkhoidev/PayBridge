'use client';

import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, Loader2, ShieldCheck, ArrowRight, X, ExternalLink } from 'lucide-react';
import { PayrollBatch } from '@/types';
import { formatLosslessAmount } from '@/lib/utils/currency';

interface SettlementDispatchModalProps {
  batch: PayrollBatch;
  isOpen: boolean;
  onClose: () => void;
  onExecute: () => Promise<void>;
}

export function SettlementDispatchModal({
  batch,
  isOpen,
  onClose,
  onExecute,
}: SettlementDispatchModalProps) {
  const [dispatchPhase, setDispatchPhase] = useState<'IDLE' | 'PROCESSING' | 'COMPLETED' | 'ERROR'>('IDLE');
  const [activeStep, setActiveStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDispatchPhase('IDLE');
      setActiveStep(1);
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartDispatch = async () => {
    setDispatchPhase('PROCESSING');
    setActiveStep(1);

    // Simulate animated step progression
    setTimeout(() => setActiveStep(2), 500);
    setTimeout(() => setActiveStep(3), 1100);

    try {
      await onExecute();
      setActiveStep(4);
      setDispatchPhase('COMPLETED');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Disbursal failed');
      setDispatchPhase('ERROR');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-lg text-slate-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
              <Send size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                9Pay Testnet Payout Dispatcher
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Batch #{batch.id.slice(-8)} • {batch.items.length} Beneficiaries
              </p>
            </div>
          </div>
          {dispatchPhase !== 'PROCESSING' && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {dispatchPhase === 'IDLE' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Total Disbursement:</span>
                  <span className="font-bold font-mono text-white text-base">
                    {formatLosslessAmount(batch.sourceAmountTotal, batch.asset)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Settlement Switch:</span>
                  <span className="font-semibold text-amber-400 uppercase">
                    9Pay Sandbox Chi Hộ
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Executive Sign-Off:</span>
                  <span className="font-semibold text-emerald-400">
                    {batch.approvedBy || 'Approved by Executive'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-200 text-[11px] flex items-center gap-2">
                <ShieldCheck size={16} className="text-indigo-400 shrink-0" />
                <span>
                  All payouts are executed with unique idempotency keys to guarantee zero-risk of duplicate disbursements.
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-slate-400 hover:text-white rounded-lg transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStartDispatch}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-900/40 transition flex items-center gap-2"
                >
                  <Send size={14} />
                  <span>Execute Settlement Release</span>
                </button>
              </div>
            </div>
          )}

          {dispatchPhase === 'PROCESSING' && (
            <div className="py-6 space-y-6 text-center">
              <Loader2 size={36} className="animate-spin text-indigo-400 mx-auto" />
              <div>
                <h4 className="text-sm font-bold text-white mb-1">
                  Routing Batch via 9Pay Gateway...
                </h4>
                <p className="text-slate-400 text-[11px]">
                  Please wait while transactions are validated and assigned provider references.
                </p>
              </div>

              {/* Progress Steps */}
              <div className="space-y-2.5 max-w-sm mx-auto text-left">
                <div className={`p-2.5 rounded-lg flex items-center gap-2.5 border ${activeStep >= 1 ? 'bg-slate-800/80 border-slate-700 text-slate-200' : 'text-slate-500 border-transparent'}`}>
                  {activeStep > 1 ? <CheckCircle2 size={15} className="text-emerald-400" /> : <Loader2 size={15} className="animate-spin text-indigo-400" />}
                  <span className="text-[11px] font-medium">1. Verifying batch cryptographic signature & idempotency</span>
                </div>
                <div className={`p-2.5 rounded-lg flex items-center gap-2.5 border ${activeStep >= 2 ? 'bg-slate-800/80 border-slate-700 text-slate-200' : 'text-slate-500 border-transparent'}`}>
                  {activeStep > 2 ? <CheckCircle2 size={15} className="text-emerald-400" /> : activeStep === 2 ? <Loader2 size={15} className="animate-spin text-indigo-400" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-600" />}
                  <span className="text-[11px] font-medium">2. Handshaking with 9Pay Chi Hộ Sandbox endpoint</span>
                </div>
                <div className={`p-2.5 rounded-lg flex items-center gap-2.5 border ${activeStep >= 3 ? 'bg-slate-800/80 border-slate-700 text-slate-200' : 'text-slate-500 border-transparent'}`}>
                  {activeStep > 3 ? <CheckCircle2 size={15} className="text-emerald-400" /> : activeStep === 3 ? <Loader2 size={15} className="animate-spin text-indigo-400" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-600" />}
                  <span className="text-[11px] font-medium">3. Routing to Vietnamese NAPAS 24/7 bank endpoints</span>
                </div>
              </div>
            </div>
          )}

          {dispatchPhase === 'COMPLETED' && (
            <div className="py-4 space-y-5 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto text-2xl">
                ✓
              </div>
              <div>
                <h4 className="text-base font-black text-white">Settlement Dispatched Successfully!</h4>
                <p className="text-slate-400 text-xs mt-1">
                  All {batch.items.length} beneficiary payouts have been confirmed by the testnet adapter.
                </p>
              </div>

              <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl text-left text-[11px] space-y-1 font-mono text-slate-300">
                <div className="text-slate-400">Sample Provider Reference:</div>
                <div className="text-emerald-400 font-bold truncate">
                  MOCK-9PAY-TXN-{batch.id.slice(-8)}-001
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-md transition"
              >
                Close & View Beneficiary Ledger
              </button>
            </div>
          )}

          {dispatchPhase === 'ERROR' && (
            <div className="py-4 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
                <X size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Execution Error</h4>
                <p className="text-rose-400 text-xs mt-1">{errorMessage}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
