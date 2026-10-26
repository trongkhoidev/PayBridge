'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { StatusBadge } from '@/components/StatusBadge';
import { PayrollBatch, AuditEvent } from '@/types';
import { formatLosslessAmount } from '@/lib/utils/currency';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Send,
  Building,
  UserCheck,
  Receipt,
} from 'lucide-react';

import { DualControlSignoffModal } from '@/components/modals/DualControlSignoffModal';
import { SettlementDispatchModal } from '@/components/modals/SettlementDispatchModal';
import { GeminiAdvisorDrawer } from '@/components/modals/GeminiAdvisorDrawer';

export default function BatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [batch, setBatch] = useState<PayrollBatch | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'roster' | 'audit' | 'ai'>('roster');
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  // Modals state
  const [signoffModalOpen, setSignoffModalOpen] = useState(false);
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);


  const fetchBatch = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/batches/${id}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Batch not found');
      }
      setBatch(data.data.batch);
      setAuditEvents(data.data.auditTrail || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch batch');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatch();
  }, [id]);

  const handleValidate = async () => {
    setActionLoading('validate');
    setError(null);
    try {
      const res = await fetch(`/api/batches/${id}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actorId: 'admin_compliance_officer' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      await fetchBatch();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Validation failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async () => {
    setActionLoading('approve');
    setError(null);
    try {
      const res = await fetch(`/api/batches/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approverId: 'executive_cfo_signoff' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      await fetchBatch();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Approval failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleExecute = async () => {
    setActionLoading('execute');
    setError(null);
    try {
      const res = await fetch(`/api/batches/${id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idempotencyKey: `EXEC-${batch?.id}-${Date.now()}`,
          actorId: 'admin_treasury_ops',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      await fetchBatch();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Execution failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLoadAI = async () => {
    setActionLoading('ai');
    setActiveTab('ai');
    try {
      const res = await fetch(`/api/batches/${id}/ai-summary`);
      const data = await res.json();
      if (data.success && data.data) {
        setAiSummary(data.data.summary);
      }
    } catch {
      // Ignored
    } finally {
      setActionLoading(null);
    }
  };

  if (loading && !batch) {
    return (
      <AppShell>
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-xs text-slate-500">Loading batch command center...</p>
        </div>
      </AppShell>
    );
  }

  if (error && !batch) {
    return (
      <AppShell>
        <div className="bg-white rounded-xl border border-rose-200 p-12 text-center max-w-lg mx-auto">
          <p className="text-sm font-bold text-rose-700 mb-2">Error Loading Batch</p>
          <p className="text-xs text-slate-500 mb-4">{error}</p>
          <a
            href="/"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
          >
            Back to Dashboard
          </a>
        </div>
      </AppShell>
    );
  }

  if (!batch) return null;

  // Lifecycle stage index
  const getStageIndex = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 0;
      case 'VALIDATED':
        return 1;
      case 'APPROVED':
        return 2;
      case 'PROCESSING':
        return 3;
      case 'COMPLETED':
        return 4;
      default:
        return 1;
    }
  };

  const currentStage = getStageIndex(batch.status);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Navigation Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition shadow-sm"
              title="Back"
            >
              <ArrowLeft size={16} />
            </a>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {batch.title}
                </h1>
                <StatusBadge status={batch.status} />
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Batch ID: {batch.id} • Idempotency: {batch.idempotencyKey}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchBatch}
              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <RefreshCw size={13} />
              <span>Refresh Status</span>
            </button>
            <button
              onClick={() => setAiDrawerOpen(true)}
              className="px-3.5 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Sparkles size={14} className="text-amber-500" />
              <span>AI Risk Review</span>
            </button>
          </div>

        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
            <AlertTriangle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* Lifecycle Progress Stepper */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
            Settlement Pipeline Workflow
          </div>
          <div className="grid grid-cols-4 gap-2 relative">
            {/* Step 1: Draft */}
            <div
              className={`p-3 rounded-xl border transition ${
                currentStage >= 0
                  ? 'bg-slate-50 border-slate-300 text-slate-900'
                  : 'bg-white border-slate-100 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold">
                  1
                </span>
                <span className="text-xs font-bold">Draft Batch</span>
              </div>
              <p className="text-[10px] text-slate-500">Roster & Amounts entered</p>
            </div>

            {/* Step 2: Validated */}
            <div
              className={`p-3 rounded-xl border transition ${
                currentStage >= 1
                  ? 'bg-blue-50/70 border-blue-200 text-blue-950'
                  : 'bg-white border-slate-100 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    currentStage >= 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  2
                </span>
                <span className="text-xs font-bold">Validated</span>
              </div>
              <p className="text-[10px] text-slate-500">Recipients & totals audited</p>
            </div>

            {/* Step 3: Approved */}
            <div
              className={`p-3 rounded-xl border transition ${
                currentStage >= 2
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : 'bg-white border-slate-100 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    currentStage >= 2
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  3
                </span>
                <span className="text-xs font-bold">Executive Approved</span>
              </div>
              <p className="text-[10px] text-slate-500">
                {batch.approvedBy ? `Signed by ${batch.approvedBy}` : 'Awaiting sign-off'}
              </p>
            </div>

            {/* Step 4: Dispatched / Completed */}
            <div
              className={`p-3 rounded-xl border transition ${
                currentStage >= 4
                  ? 'bg-green-100/70 border-green-300 text-green-950'
                  : 'bg-white border-slate-100 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    currentStage >= 4
                      ? 'bg-green-700 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  4
                </span>
                <span className="text-xs font-bold">9Pay Dispatched</span>
              </div>
              <p className="text-[10px] text-slate-500">Settlement completed</p>
            </div>
          </div>
        </div>

        {/* Financial KPI Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">
              Batch Lossless Total
            </span>
            <span className="text-xl font-extrabold font-mono text-slate-900 block">
              {formatLosslessAmount(batch.sourceAmountTotal, batch.asset)}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold block mt-1">
              Exact Integer Precision
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">
              Total Beneficiaries
            </span>
            <span className="text-xl font-extrabold text-slate-900 block">
              {batch.items.length} Contractors
            </span>
            <span className="text-[10px] text-slate-500 block mt-1">Vietnam Banking Rail</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">
              Target Adapter Rail
            </span>
            <span className="text-sm font-bold text-amber-700 uppercase block mt-1">
              {batch.provider} (Testnet)
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">Chi Hộ Simulator</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">
              Dual-Control Status
            </span>
            <span className="text-sm font-bold text-slate-900 block mt-1">
              {batch.status === 'APPROVED' || batch.status === 'COMPLETED'
                ? 'Authorized & Signed'
                : 'Pending Sign-off'}
            </span>
            <span className="text-[10px] text-slate-500 block mt-1">
              {batch.approvedBy || 'Dual-control required'}
            </span>
          </div>
        </div>

        {/* Dual-Control Action Center Box */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-xl p-5 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-amber-400" />
              <h3 className="text-sm font-bold tracking-tight">Dual-Control Action Center</h3>
            </div>
            <p className="text-xs text-slate-300 max-w-xl">
              {batch.status === 'DRAFT' &&
                'Step 1: Run pre-flight verification on contractor bank routing accounts.'}
              {batch.status === 'VALIDATED' &&
                'Step 2: Dual-control approval. An authorized finance officer must sign off prior to dispatch.'}
              {batch.status === 'APPROVED' &&
                'Step 3: Ready for execution. Dispatch payment batch to the 9Pay testnet chi hộ adapter.'}
              {batch.status === 'COMPLETED' &&
                'All payouts have been successfully settled and assigned provider reference IDs.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {batch.status === 'DRAFT' && (
              <button
                onClick={handleValidate}
                disabled={actionLoading === 'validate'}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-md transition disabled:opacity-50"
              >
                {actionLoading === 'validate'
                  ? 'Validating Accounts...'
                  : 'Validate Accounts (Step 1)'}
              </button>
            )}

            {batch.status === 'VALIDATED' && (
              <button
                onClick={() => setSignoffModalOpen(true)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md transition flex items-center gap-2"
              >
                <ShieldCheck size={15} />
                <span>Executive Sign-off (Step 2)</span>
              </button>
            )}

            {batch.status === 'APPROVED' && (
              <button
                onClick={() => setDispatchModalOpen(true)}
                className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-500/40 transition flex items-center gap-2"
              >
                <Send size={14} />
                <span>Execute 9Pay Payout (Step 3)</span>
              </button>
            )}


            {batch.status === 'COMPLETED' && (
              <div className="px-4 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>Settlement Complete</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs: Roster vs Audit Trail vs AI Advisor */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="border-b border-slate-200/80 px-6 flex items-center gap-6 text-xs font-bold">
            <button
              onClick={() => setActiveTab('roster')}
              className={`py-3.5 border-b-2 transition ${
                activeTab === 'roster'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Contractor Beneficiary Ledger ({batch.items.length})
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`py-3.5 border-b-2 transition ${
                activeTab === 'audit'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Audit Trail & Idempotency ({auditEvents.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('ai');
                if (!aiSummary) handleLoadAI();
              }}
              className={`py-3.5 border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'ai'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles size={14} className="text-amber-500" />
              <span>Gemini Risk Advisor</span>
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'roster' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Beneficiary</th>
                      <th className="p-3">Routing Account</th>
                      <th className="p-3">Bank Code</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Item Status</th>
                      <th className="p-3">9Pay Reference ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {batch.items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-900">
                          {item.recipientName}
                        </td>
                        <td className="p-3 font-mono text-slate-600">
                          {item.recipientReference}
                        </td>
                        <td className="p-3 font-bold text-indigo-700">
                          {item.bankCode || 'VCB'}
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-900">
                          {formatLosslessAmount(item.amount, item.asset)}
                        </td>
                        <td className="p-3">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-500">
                          {item.providerReference ? (
                            <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-semibold">
                              {item.providerReference}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Pending dispatch</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'audit' && (
              <div className="space-y-3">
                {auditEvents.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No audit records yet.</p>
                ) : (
                  auditEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-xl text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-700">{ev.eventType}</span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          {new Date(ev.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-600">
                        Authorized Actor:{' '}
                        <span className="font-mono font-semibold text-slate-800">
                          {ev.actorId}
                        </span>
                        {ev.fromStatus && ev.toStatus && (
                          <span>
                            {' '}
                            | State: <span className="font-semibold">{ev.fromStatus}</span> →{' '}
                            <span className="font-semibold">{ev.toStatus}</span>
                          </span>
                        )}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-500" />
                    <span className="font-bold text-slate-900 text-sm">
                      Gemini Advisory Analysis
                    </span>
                  </div>
                  <button
                    onClick={() => setAiDrawerOpen(true)}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold text-xs"
                  >
                    Open Full AI Intelligence Drawer →
                  </button>
                </div>

                <p className="text-slate-700 leading-relaxed font-medium">
                  {`Batch "${batch.title}" is currently in ${batch.status} state. Total budget of ${formatLosslessAmount(batch.sourceAmountTotal, batch.asset)} is properly structured across ${batch.items.length} recipient(s). All accounts are mapped to Vietnamese banking rails.`}
                </p>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px]">
                  🔒 <strong>Compliance Boundary:</strong> AI services cannot execute financial
                  settlements. Dual-control approval by designated officers is enforced at the
                  kernel layer.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Interactive Modals */}
        <DualControlSignoffModal
          batch={batch}
          isOpen={signoffModalOpen}
          onClose={() => setSignoffModalOpen(false)}
          onConfirm={handleApprove}
        />

        <SettlementDispatchModal
          batch={batch}
          isOpen={dispatchModalOpen}
          onClose={() => setDispatchModalOpen(false)}
          onExecute={handleExecute}
        />

        <GeminiAdvisorDrawer
          batch={batch}
          isOpen={aiDrawerOpen}
          onClose={() => setAiDrawerOpen(false)}
        />
      </div>
    </AppShell>
  );
}

