'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import {
  Settings,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building,
  Key,
  Server,
  Cpu,
  Layers,
} from 'lucide-react';

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Payment Rails & Platform Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Adapter configurations, financial invariant policies, and cryptographic security rules.
          </p>
        </div>

        {/* Provider Adapter Grid */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Disbursement Providers & Settlement Rails
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 9Pay Adapter */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-black text-sm">
                  9P
                </div>
                <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-[10px] font-bold">
                  Testnet Chi Hộ
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">9Pay Vietnam</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Domestic interbank settlement (NAPAS 24/7 & 9Pay e-wallet).
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 text-[11px] space-y-1 text-slate-600 font-mono">
                <div>Base URL: sandbox.9pay.vn</div>
                <div>Status: Slot ready for official keys</div>
              </div>
            </div>

            {/* Mock Adapter */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-black text-sm">
                  SIM
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-bold">
                  Active (Demo)
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Mock Payout Simulator</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  High-fidelity deterministic simulator with idempotency deduplication.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 text-[11px] space-y-1 text-slate-600 font-mono">
                <div>Delay: 500ms</div>
                <div>Failure Rate: 0% (Demo mode)</div>
              </div>
            </div>

            {/* Stellar SEP-31 */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-3 opacity-75">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-black text-sm">
                  XLM
                </div>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-[10px] font-bold">
                  Future / Conditional
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Stellar SEP-31 Rail</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cross-border crypto-to-fiat anchor protocol.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 text-[11px] space-y-1 text-slate-600 font-mono">
                <div>Status: Out of MVP critical path</div>
                <div>Anchor: Pending partner</div>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Financial Invariants Checklist */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Financial Invariants & Security Architecture
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <CheckCircle2 size={15} />
                <span>Lossless Monetary Representation</span>
              </div>
              <p className="text-slate-600">
                Amounts are strictly computed using string-based integer math and <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200 font-bold">BigInt</code>. Floating-point numbers are forbidden at the core.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <CheckCircle2 size={15} />
                <span>Approval Invariant (BR-01 / FR-07)</span>
              </div>
              <p className="text-slate-600">
                Batches in <code className="font-mono font-bold">DRAFT</code> or <code className="font-mono font-bold">VALIDATED</code> status are strictly blocked from execution until explicitly signed by an Approver.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <CheckCircle2 size={15} />
                <span>Idempotency Deduplication (FR-12)</span>
              </div>
              <p className="text-slate-600">
                Network retries with identical keys safely return existing batches rather than duplicating transactions or disbursements.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <CheckCircle2 size={15} />
                <span>Zero Secrets in Git (NFR-01)</span>
              </div>
              <p className="text-slate-600">
                API credentials, private keys, and webhooks are kept solely in local environment variables. Sensitive data is redacted in audit logs.
              </p>
            </div>
          </div>
        </div>

        {/* AI Safety Boundary Card */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Cpu size={18} className="text-amber-500" />
            <h2 className="text-base font-bold text-slate-900">
              Gemini AI Advisor Protocol
            </h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            The Gemini integration operates strictly as an <strong>Advisory Service</strong>. It summarizes payroll allocations, evaluates tax thresholds, and detects anomalous batch quantities. By design, AI services have <strong>no direct access</strong> to transfer private keys, approver credentials, or payout dispatch APIs.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
