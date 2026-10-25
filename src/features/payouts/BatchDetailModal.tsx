'use client';

import React, { useState } from 'react';
import { PayrollBatch, AuditEvent } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { formatLosslessAmount } from '@/lib/utils/currency';

interface BatchDetailModalProps {
  batch: PayrollBatch | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export function BatchDetailModal({
  batch,
  isOpen,
  onClose,
  onRefresh,
}: BatchDetailModalProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'items' | 'audit' | 'ai'>('items');

  if (!isOpen || !batch) return null;

  const loadAuditTrail = async () => {
    try {
      const res = await fetch(`/api/batches/${batch.id}`);
      const data = await res.json();
      if (data.success && data.data?.auditTrail) {
        setAuditEvents(data.data.auditTrail);
      }
    } catch {
      // Ignored
    }
  };

  const handleValidate = async () => {
    setLoadingAction('validate');
    setActionError(null);
    try {
      const res = await fetch(`/api/batches/${batch.id}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actorId: 'employer_admin_demo' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Validation failed');
      }
      onRefresh();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Validation failed');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleApprove = async () => {
    setLoadingAction('approve');
    setActionError(null);
    try {
      const res = await fetch(`/api/batches/${batch.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approverId: 'executive_approver_demo' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Approval failed');
      }
      onRefresh();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Approval failed');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleExecute = async () => {
    setLoadingAction('execute');
    setActionError(null);
    try {
      const res = await fetch(`/api/batches/${batch.id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idempotencyKey: `EXEC-${batch.id}-${Date.now()}`,
          actorId: 'employer_admin_demo',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Execution failed');
      }
      onRefresh();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Execution failed');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleAskAI = async () => {
    setLoadingAction('ai');
    setActionError(null);
    setActiveTab('ai');
    try {
      const res = await fetch(`/api/batches/${batch.id}/ai-summary`);
      const data = await res.json();
      if (data.success && data.data) {
        setAiSummary(data.data.summary);
      }
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'AI analysis failed');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-slate-900">{batch.title}</h2>
              <StatusBadge status={batch.status} />
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              ID: {batch.id} • Key: {batch.idempotencyKey}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-lg"
          >
            ✕
          </button>
        </div>

        {/* Action Error Banner */}
        {actionError && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
            {actionError}
          </div>
        )}

        {/* Quick Stats Banner */}
        <div className="mx-6 mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 block">Total Amount:</span>
            <span className="font-bold text-slate-900 font-mono">
              {formatLosslessAmount(batch.sourceAmountTotal, batch.asset)}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Recipients:</span>
            <span className="font-bold text-slate-900">{batch.items.length} persons</span>
          </div>
          <div>
            <span className="text-slate-500 block">Adapter:</span>
            <span className="font-bold text-amber-700 uppercase">
              {batch.provider} (Sandbox)
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Approved By:</span>
            <span className="font-bold text-slate-900">
              {batch.approvedBy ? `${batch.approvedBy}` : 'Pending'}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 mt-4 border-b border-slate-200 flex items-center gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('items')}
            className={`pb-2 border-b-2 transition ${
              activeTab === 'items'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Recipient Items ({batch.items.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('audit');
              loadAuditTrail();
            }}
            className={`pb-2 border-b-2 transition ${
              activeTab === 'audit'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Audit Trail
          </button>
          <button
            onClick={() => {
              setActiveTab('ai');
              if (!aiSummary) handleAskAI();
            }}
            className={`pb-2 border-b-2 transition ${
              activeTab === 'ai'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            🤖 AI Advisor (Gemini)
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'items' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Recipient</th>
                    <th className="p-2.5">Account / Phone</th>
                    <th className="p-2.5">Bank</th>
                    <th className="p-2.5">Amount</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Provider Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {batch.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-medium text-slate-900">{item.recipientName}</td>
                      <td className="p-2.5 font-mono text-slate-700">{item.recipientReference}</td>
                      <td className="p-2.5 text-slate-600">{item.bankCode || 'N/A'}</td>
                      <td className="p-2.5 font-mono font-semibold text-slate-900">
                        {formatLosslessAmount(item.amount, item.asset)}
                      </td>
                      <td className="p-2.5">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="p-2.5 font-mono text-[11px] text-slate-500">
                        {item.providerReference || 'Pending submission'}
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
                <p className="text-xs text-slate-500 italic">
                  Click to reload audit trail or no audit events yet.
                </p>
              ) : (
                auditEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-indigo-700">{ev.eventType}</span>
                      <span className="text-slate-400 font-mono">
                        {new Date(ev.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-600">
                      Actor: <span className="font-mono text-slate-800">{ev.actorId}</span>
                      {ev.fromStatus && ev.toStatus && (
                        <span>
                          {' '}
                          | State transition:{' '}
                          <span className="font-semibold">{ev.fromStatus}</span> →{' '}
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
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg text-xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">Gemini Assistant Summary</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                  Read-Only Advisory Mode
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                {aiSummary || 'Loading AI summary...'}
              </p>
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-amber-900 text-[11px]">
                ℹ️ <strong>System Boundary:</strong> AI services can never approve or execute payouts.
                All monetary transfers require human sign-off via strict role policies.
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {batch.status === 'DRAFT' && (
              <button
                onClick={handleValidate}
                disabled={loadingAction === 'validate'}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition disabled:opacity-50"
              >
                {loadingAction === 'validate' ? 'Validating...' : 'Validate Batch (Step 1)'}
              </button>
            )}

            {batch.status === 'VALIDATED' && (
              <button
                onClick={handleApprove}
                disabled={loadingAction === 'approve'}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition disabled:opacity-50"
              >
                {loadingAction === 'approve' ? 'Approving...' : 'Approve Batch (Step 2)'}
              </button>
            )}

            {batch.status === 'APPROVED' && (
              <button
                onClick={handleExecute}
                disabled={loadingAction === 'execute'}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition disabled:opacity-50"
              >
                {loadingAction === 'execute'
                  ? 'Dispatching Payout...'
                  : '🚀 Execute Payout via 9Pay Testnet Adapter'}
              </button>
            )}

            {batch.status === 'COMPLETED' && (
              <span className="text-xs text-green-700 font-semibold px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                ✅ Batch Fully Completed
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
