'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { StatusBadge } from '@/components/StatusBadge';
import { PayrollBatch } from '@/types';
import { formatLosslessAmount } from '@/lib/utils/currency';
import { CreateBatchModal } from '@/features/payouts/CreateBatchModal';
import { BatchDetailModal } from '@/features/payouts/BatchDetailModal';

export default function DashboardPage() {
  const [batches, setBatches] = useState<PayrollBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<PayrollBatch | null>(null);

  const fetchBatches = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/batches');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setBatches(data.data);
        // If a batch is open in detail modal, update it
        if (selectedBatch) {
          const fresh = data.data.find((b: PayrollBatch) => b.id === selectedBatch.id);
          if (fresh) setSelectedBatch(fresh);
        }
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  }, [selectedBatch]);

  useEffect(() => {
    fetchBatches();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Summary & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Payroll Batches
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Prepare, validate, approve, and execute batch payouts for Vietnam-based contractors.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchBatches()}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm transition"
            >
              🔄 Refresh
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition flex items-center gap-2"
            >
              <span>+</span>
              <span>Create Payout Batch</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        {loading && batches.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <p className="text-xs text-slate-500">Loading payroll batches...</p>
          </div>
        ) : batches.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center max-w-lg mx-auto my-12">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
              💸
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              No Payout Batches Yet
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Get started by creating your first contractor payroll batch. You can add multiple recipients
              and review calculations before approval.
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
            >
              + Create First Payout Batch
            </button>
          </div>
        ) : (
          /* Batches Table */
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-4">Batch Title</th>
                    <th className="p-4">Recipients</th>
                    <th className="p-4">Total Amount</th>
                    <th className="p-4">Adapter</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Created At</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {batches.map((batch) => (
                    <tr
                      key={batch.id}
                      className="hover:bg-slate-50 transition cursor-pointer"
                      onClick={() => setSelectedBatch(batch)}
                    >
                      <td className="p-4 font-semibold text-slate-900">
                        <div>{batch.title}</div>
                        <div className="text-[11px] font-mono text-slate-400 font-normal">
                          {batch.id}
                        </div>
                      </td>
                      <td className="p-4 text-slate-600">
                        {batch.items.length} recipient(s)
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-900">
                        {formatLosslessAmount(batch.sourceAmountTotal, batch.asset)}
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-amber-800 uppercase text-[11px]">
                          {batch.provider} (testnet)
                        </span>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={batch.status} />
                      </td>
                      <td className="p-4 text-slate-500 text-[11px]">
                        {new Date(batch.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBatch(batch);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                        >
                          View / Manage →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <CreateBatchModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onBatchCreated={fetchBatches}
      />

      <BatchDetailModal
        batch={selectedBatch}
        isOpen={Boolean(selectedBatch)}
        onClose={() => setSelectedBatch(null)}
        onRefresh={fetchBatches}
      />
    </div>
  );
}
