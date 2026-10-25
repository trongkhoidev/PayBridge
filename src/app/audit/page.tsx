'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import {
  ShieldCheck,
  Search,
  Clock,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Building,
  Key,
  FileText,
} from 'lucide-react';

interface AuditRow {
  id: string;
  batchId: string;
  batchTitle?: string;
  actorId: string;
  eventType: string;
  fromStatus?: string;
  toStatus?: string;
  metadataRedacted?: Record<string, unknown>;
  createdAt: string;
}

export default function AuditPage() {
  const [events, setEvents] = useState<AuditRow[]>([]);
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchAuditEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/audit');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setEvents(data.data);
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditEvents();
  }, []);

  const filtered = events.filter((ev) => {
    const matchesSearch =
      ev.batchId.toLowerCase().includes(search.toLowerCase()) ||
      ev.actorId.toLowerCase().includes(search.toLowerCase()) ||
      (ev.batchTitle && ev.batchTitle.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = eventFilter === 'ALL' || ev.eventType === eventFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Audit & Compliance Settlement Ledger
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Cryptographically timestamped, append-only records of every state transition, dual-control approval, and provider callback.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span>Immutable Append-Only Log</span>
            </span>
          </div>
        </div>

        {/* Security Invariants Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">
              Recorded Transitions
            </span>
            <span className="text-2xl font-black text-slate-900">{events.length}</span>
            <span className="text-[10px] text-slate-400 block mt-1">Lifecycle Events</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">
              Dual-Control Signatures
            </span>
            <span className="text-2xl font-black text-indigo-700">
              {events.filter((e) => e.eventType === 'BATCH_APPROVED').length}
            </span>
            <span className="text-[10px] text-indigo-600 block mt-1">
              Authorized Approver Checkpoints
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">
              PII / Secret Redaction
            </span>
            <span className="text-sm font-bold text-emerald-700 block mt-1">100% Redacted</span>
            <span className="text-[10px] text-slate-400 block mt-1">
              No private keys or credentials stored
            </span>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Filter by Actor ID, Batch Title, or Batch ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">
              Event Type:
            </span>
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="text-xs px-2.5 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 font-medium focus:outline-none"
            >
              <option value="ALL">All Events</option>
              <option value="BATCH_CREATED">BATCH_CREATED</option>
              <option value="BATCH_VALIDATED">BATCH_VALIDATED</option>
              <option value="BATCH_APPROVED">BATCH_APPROVED</option>
              <option value="BATCH_EXECUTION_STARTED">BATCH_EXECUTION_STARTED</option>
              <option value="BATCH_EXECUTION_COMPLETED">BATCH_EXECUTION_COMPLETED</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Event Type</th>
                  <th className="p-4">Batch</th>
                  <th className="p-4">Authorized Actor</th>
                  <th className="p-4">State Transition</th>
                  <th className="p-4">Redacted Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                      No audit events match the current filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-mono text-[11px] text-slate-500">
                        {new Date(ev.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className="font-mono font-bold text-[11px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                          {ev.eventType}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-slate-900">
                        <a
                          href={`/batches/${ev.batchId}`}
                          className="hover:text-indigo-600 hover:underline"
                        >
                          {ev.batchTitle || ev.batchId}
                        </a>
                      </td>
                      <td className="p-4 font-mono font-semibold text-slate-700">
                        {ev.actorId}
                      </td>
                      <td className="p-4">
                        {ev.fromStatus && ev.toStatus ? (
                          <span className="font-semibold text-slate-700">
                            {ev.fromStatus} →{' '}
                            <span className="text-emerald-700 font-bold">{ev.toStatus}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="p-4 font-mono text-[11px] text-slate-500 max-w-xs truncate">
                        {ev.metadataRedacted
                          ? JSON.stringify(ev.metadataRedacted)
                          : 'None'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
