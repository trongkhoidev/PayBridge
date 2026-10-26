'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { RecipientRecord } from '@/lib/repositories/recipient-repository';
import { formatLosslessAmount } from '@/lib/utils/currency';
import {
  Users,
  Search,
  Plus,
  ShieldCheck,
  Building,
  CreditCard,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react';

export default function RecipientsPage() {
  const [recipients, setRecipients] = useState<RecipientRecord[]>([]);
  const [search, setSearch] = useState('');
  const [bankFilter, setBankFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // New recipient form state
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Software Engineer');
  const [newEmail, setNewEmail] = useState('');
  const [newBankCode, setNewBankCode] = useState('VCB');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchRecipients = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/recipients');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setRecipients(data.data);
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipients();
  }, []);

  const handleAddRecipient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await fetch('/api/recipients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          role: newRole,
          email: newEmail,
          bankCode: newBankCode,
          accountNumber: newAccountNumber,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        setNewName('');
        setNewAccountNumber('');
        fetchRecipients();
      }
    } finally {
      setFormLoading(false);
    }
  };

  const filtered = recipients.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.accountNumber.includes(search) ||
      r.role.toLowerCase().includes(search.toLowerCase());
    const matchesBank = bankFilter === 'ALL' || r.bankCode === bankFilter;
    return matchesSearch && matchesBank;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Contractor & Beneficiary Vault
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified Vietnamese contractors, freelancers, and staff bank routing profiles.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Plus size={15} />
            <span>Add Beneficiary</span>
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">
              Active Beneficiaries
            </span>
            <span className="text-2xl font-black text-slate-900">{recipients.length}</span>
            <span className="text-[10px] text-slate-400 block mt-1">Contractors in VN</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">
              Bank Verification
            </span>
            <span className="text-2xl font-black text-emerald-600">
              {recipients.filter((r) => r.isVerified).length} / {recipients.length}
            </span>
            <span className="text-[10px] text-emerald-700 block mt-1">Pre-flight Verified</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">
              Supported Banking Rails
            </span>
            <span className="text-sm font-bold text-slate-900 block mt-1">
              VCB, MB, TCB, ACB, 9Pay
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">NAPAS / 9Pay Chi Hộ</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">
              Dual-Control Audit
            </span>
            <span className="text-sm font-bold text-indigo-700 block mt-1">
              Enforced on all Payouts
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">Immutable Logged</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by contractor name, account number, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">
              Bank Rail:
            </span>
            <select
              value={bankFilter}
              onChange={(e) => setBankFilter(e.target.value)}
              className="text-xs px-2.5 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 font-medium focus:outline-none"
            >
              <option value="ALL">All Banks</option>
              <option value="VCB">Vietcombank (VCB)</option>
              <option value="MB">MB Bank (MB)</option>
              <option value="TCB">Techcombank (TCB)</option>
              <option value="ACB">ACB</option>
              <option value="9PAY_WALLET">9Pay E-Wallet</option>
            </select>
          </div>
        </div>

        {/* Recipients Table */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-4">Contractor</th>
                  <th className="p-4">Role & Email</th>
                  <th className="p-4">Bank Rail</th>
                  <th className="p-4">Account / Wallet</th>
                  <th className="p-4">Verification</th>
                  <th className="p-4 text-right">Lifetime Disbursed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[11px]">
                          {r.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span>{r.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-800 font-medium">{r.role}</div>
                      <div className="text-[11px] text-slate-400">{r.email || '—'}</div>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {r.bankCode}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-semibold text-slate-700">
                      {r.accountNumber}
                    </td>
                    <td className="p-4">
                      {r.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 size={12} />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          <span>Pending</span>
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right font-mono font-bold text-slate-900">
                      {formatLosslessAmount(r.totalPaidVND, 'VND')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Add Beneficiary */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="text-base font-bold text-slate-900">Add New Beneficiary</h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddRecipient} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Beneficiary Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Doan Van Hau"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Role</label>
                    <input
                      type="text"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="beneficiary@domain.vn"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Bank Routing *
                    </label>
                    <select
                      value={newBankCode}
                      onChange={(e) => setNewBankCode(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                    >
                      <option value="VCB">Vietcombank (VCB)</option>
                      <option value="MB">MB Bank (MB)</option>
                      <option value="TCB">Techcombank (TCB)</option>
                      <option value="ACB">ACB</option>
                      <option value="9PAY_WALLET">9Pay E-Wallet</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Account / Phone *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="9704..."
                      value={newAccountNumber}
                      onChange={(e) => setNewAccountNumber(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-sm disabled:opacity-50"
                  >
                    {formLoading ? 'Saving...' : 'Register Beneficiary'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
