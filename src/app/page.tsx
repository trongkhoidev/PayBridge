'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { StatusBadge } from '@/components/StatusBadge';
import { PayrollBatch } from '@/types';
import { formatLosslessAmount, sumAmounts } from '@/lib/utils/currency';
import { CreateBatchModal } from '@/features/payouts/CreateBatchModal';
import {
  PlusCircle,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Building,
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<PayrollBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [demoSimulating, setDemoSimulating] = useState(false);

  const fetchBatches = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/batches');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setBatches(data.data);
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  // Compute Total Disbursed safely using lossless BigInt
  const completedBatches = batches.filter((b) => b.status === 'COMPLETED');
  let totalDisbursedVND = '0';
  try {
    if (completedBatches.length > 0) {
      totalDisbursedVND = sumAmounts(completedBatches.map((b) => b.sourceAmountTotal));
    }
  } catch {
    totalDisbursedVND = '0';
  }

  const pendingApprovalCount = batches.filter((b) => b.status === 'VALIDATED').length;
  const draftCount = batches.filter((b) => b.status === 'DRAFT').length;

  // Filter batches by tab
  const filteredBatches = batches.filter((b) => {
    if (filterStatus === 'ALL') return true;
    return b.status === filterStatus;
  });

  // Instant 1-Click Demo Simulator: creates, validates, approves & executes a 3-recipient batch
  const handleRunFullDemoFlow = async () => {
    setDemoSimulating(true);
    try {
      // 1. Create
      const createRes = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Demo Sprint 42 Payout (Auto-Run ${new Date().toLocaleTimeString()})`,
          employerId: 'emp_acme_vn',
          asset: 'VND',
          items: [
            {
              recipientName: 'Nguyen Van A',
              recipientReference: '9704050012345678',
              bankCode: 'VCB',
              amount: '15000000',
              asset: 'VND',
            },
            {
              recipientName: 'Tran Thi B',
              recipientReference: '9704220087654321',
              bankCode: 'MB',
              amount: '22000000',
              asset: 'VND',
            },
            {
              recipientName: 'Le Hoang C',
              recipientReference: '0912345678',
              bankCode: '9PAY_WALLET',
              amount: '8500000',
              asset: 'VND',
            },
          ],
        }),
      });
      const createData = await createRes.json();
      const newId = createData.data.id;

      // 2. Validate
      await fetch(`/api/batches/${newId}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actorId: 'admin_compliance_demo' }),
      });

      // 3. Approve
      await fetch(`/api/batches/${newId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approverId: 'executive_cfo_signoff' }),
      });

      // 4. Execute
      await fetch(`/api/batches/${newId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idempotencyKey: `DEMO-EXEC-${newId}`,
          actorId: 'admin_treasury_ops',
        }),
      });

      await fetchBatches();
      router.push(`/batches/${newId}`);
    } finally {
      setDemoSimulating(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Executive Welcome & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Payroll Batches Command Center
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Prepare, audit, dual-approve, and disburse batched payouts to Vietnamese contractors.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fetchBatches()}
              className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm transition"
              title="Refresh"
            >
              <RefreshCw size={15} />
            </button>

            <button
              onClick={handleRunFullDemoFlow}
              disabled={demoSimulating}
              className="px-3.5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles size={14} className="text-amber-500" />
              <span>
                {demoSimulating ? 'Simulating 4-step Flow...' : '⚡ Instant 3-Person Demo'}
              </span>
            </button>

            <a
              href="/batches/new"
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/30 transition flex items-center gap-1.5"
            >
              <PlusCircle size={15} />
              <span>Create Payout Batch</span>
            </a>
          </div>
        </div>

        {/* Executive KPI Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Total Disbursed */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Settled</span>
              <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 size={14} />
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-black font-mono text-slate-900 tracking-tight">
              {formatLosslessAmount(totalDisbursedVND, 'VND')}
            </p>
            <p className="text-[10px] text-emerald-600 font-semibold">
              {completedBatches.length} batch(es) completed
            </p>
          </div>

          {/* Pending Approval */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Pending Approval</span>
              <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <Clock size={14} />
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {pendingApprovalCount}
            </p>
            <p className="text-[10px] text-amber-700 font-medium">
              Requires dual-control sign-off
            </p>
          </div>

          {/* Draft Batches */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Drafts in Prep</span>
              <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <TrendingUp size={14} />
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {draftCount}
            </p>
            <p className="text-[10px] text-blue-600 font-medium">Pre-validation stage</p>
          </div>

          {/* Adapter SLA */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Settlement Rail</span>
              <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <ShieldCheck size={14} />
              </span>
            </div>
            <p className="text-sm font-black text-slate-900 tracking-tight uppercase mt-1">
              9Pay Testnet (Chi Hộ)
            </p>
            <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              <span>Simulator 100% Operational</span>
            </p>
          </div>
        </div>

        {/* Filter Navigation & Batches View */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Status Tabs Header */}
          <div className="border-b border-slate-200/80 px-6 flex items-center gap-6 overflow-x-auto text-xs font-semibold">
            {[
              { id: 'ALL', label: `All Batches (${batches.length})` },
              { id: 'DRAFT', label: `Draft (${draftCount})` },
              { id: 'VALIDATED', label: `Validated (${pendingApprovalCount})` },
              {
                id: 'APPROVED',
                label: `Approved (${batches.filter((b) => b.status === 'APPROVED').length})`,
              },
              { id: 'COMPLETED', label: `Completed (${completedBatches.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`py-3.5 border-b-2 transition whitespace-nowrap ${
                  filterStatus === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Batches Table or Empty State */}
          {loading && batches.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              Loading batches from repository...
            </div>
          ) : filteredBatches.length === 0 ? (
            <div className="p-12 text-center max-w-md mx-auto space-y-4">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-xl">
                💸
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {filterStatus === 'ALL'
                    ? 'No Payroll Batches Found'
                    : `No Batches in "${filterStatus}" State`}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Start by creating a new contractor payout batch or run the instant 3-recipient
                  demo simulation.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleRunFullDemoFlow}
                  className="px-3.5 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Sparkles size={14} className="text-amber-500" />
                  <span>Run 3-Person Demo</span>
                </button>
                <a
                  href="/batches/new"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition"
                >
                  + Create New Batch
                </a>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-4">Batch Title & Reference</th>
                    <th className="p-4">Beneficiaries</th>
                    <th className="p-4">Batch Lossless Total</th>
                    <th className="p-4">Disbursement Rail</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Created Date</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBatches.map((b) => (
                    <tr
                      key={b.id}
                      onClick={() => router.push(`/batches/${b.id}`)}
                      className="hover:bg-slate-50/80 transition cursor-pointer group"
                    >
                      <td className="p-4 font-bold text-slate-900">
                        <div className="group-hover:text-indigo-600 transition">{b.title}</div>
                        <div className="text-[11px] font-mono text-slate-400 font-normal">
                          {b.id}
                        </div>
                      </td>
                      <td className="p-4 text-slate-600 font-medium">
                        {b.items.length} recipient(s)
                      </td>
                      <td className="p-4 font-mono font-extrabold text-slate-900 text-[13px]">
                        {formatLosslessAmount(b.sourceAmountTotal, b.asset)}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded text-[10px] uppercase">
                          {b.provider}
                        </span>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="p-4 font-mono text-[11px] text-slate-500">
                        {new Date(b.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:text-indigo-700 bg-indigo-50 group-hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition">
                          <span>Command Center</span>
                          <ArrowRight size={13} />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
