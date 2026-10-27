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
  Coins,
  BadgeCheck,
  X,
} from 'lucide-react';

export default function RecipientsPage() {
  const [recipients, setRecipients] = useState<RecipientRecord[]>([]);
  const [search, setSearch] = useState('');
  const [bankFilter, setBankFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // New recipient form state
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Lập trình viên Senior');
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
            <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900 tracking-tight">
              Danh bạ Nhân sự & Freelancer
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Quản lý hồ sơ nhận thanh toán, tài khoản ngân hàng NAPAS 24/7 và ví 9Pay của các cộng sự.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-black hover:bg-zinc-800 text-white rounded-md text-xs font-medium transition shadow-sm self-start sm:self-auto"
          >
            <Plus size={14} />
            <span>Thêm nhân sự mới</span>
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-lg border border-zinc-200 space-y-1">
            <span className="text-xs text-zinc-500 block">Tổng số nhân sự</span>
            <span className="text-2xl font-semibold text-zinc-900 tracking-tight">{recipients.length} Người</span>
            <span className="text-xs text-zinc-500 block font-mono">Đội ngũ tại Việt Nam</span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-zinc-200 space-y-1">
            <span className="text-xs text-zinc-500 block">Đã xác thực tài khoản</span>
            <span className="text-2xl font-semibold text-emerald-600 tracking-tight">
              {recipients.filter((r) => r.isVerified).length} / {recipients.length}
            </span>
            <span className="text-xs text-emerald-600 block">Sẵn sàng nhận thanh toán</span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-zinc-200 space-y-1">
            <span className="text-xs text-zinc-500 block">Ngân hàng & Ví hỗ trợ</span>
            <span className="text-sm font-semibold text-zinc-900 block mt-1">
              VCB, MB, TCB, ACB, 9Pay
            </span>
            <span className="text-xs text-zinc-400 block font-mono">Chuyển mạch NAPAS 24/7</span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-zinc-200 space-y-1">
            <span className="text-xs text-zinc-500 block">Kiểm soát kép (SEC-804)</span>
            <span className="text-sm font-semibold text-zinc-900 block mt-1">
              Bảo vệ 100% đợt chi
            </span>
            <span className="text-xs text-zinc-400 block font-mono">Ghi nhận sổ cái bất biến</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-lg border border-zinc-200 p-3 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên nhân sự, số tài khoản, hoặc vị trí..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 border border-zinc-200 rounded-md focus:outline-none focus:border-black font-normal placeholder:text-zinc-400 transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-zinc-500 whitespace-nowrap">Lọc theo ngân hàng:</span>
            <select
              value={bankFilter}
              onChange={(e) => setBankFilter(e.target.value)}
              className="text-xs px-2.5 py-2 border border-zinc-200 rounded-md bg-white text-zinc-800 font-medium focus:outline-none focus:border-black transition"
            >
              <option value="ALL">Tất cả ngân hàng</option>
              <option value="VCB">Vietcombank</option>
              <option value="MB">MB Bank</option>
              <option value="TCB">Techcombank</option>
              <option value="ACB">ACB</option>
              <option value="9PAY_WALLET">Ví điện tử 9Pay</option>
            </select>
          </div>
        </div>

        {/* Recipients Table */}
        <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-zinc-500 font-medium border-b border-zinc-200 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Họ tên nhân sự</th>
                  <th className="py-3 px-4">Vị trí & Email</th>
                  <th className="py-3 px-4">Kênh ngân hàng</th>
                  <th className="py-3 px-4">Số tài khoản / SĐT</th>
                  <th className="py-3 px-4">Trạng thái xác thực</th>
                  <th className="py-3 px-4 text-right">Tổng tiền đã nhận</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-50/80 transition">
                    <td className="py-3.5 px-4 font-medium text-zinc-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-800 flex items-center justify-center font-medium text-xs">
                          {r.name.slice(0, 1).toUpperCase()}
                        </div>
                        <span className="text-xs font-semibold">{r.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-zinc-800 font-medium">{r.role}</div>
                      <div className="text-[11px] text-zinc-400 font-mono">{r.email || '—'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs font-medium text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                        {r.bankCode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-700">
                      {r.accountNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      {r.isVerified ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Đã xác minh</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                          <span>Chờ kiểm tra</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-zinc-900 tabular-nums">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 space-y-4 border border-zinc-200 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">Thêm Nhân sự Thụ hưởng Mới</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Lưu thông tin tài khoản ngân hàng để chi trả nhanh</p>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="w-7 h-7 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 flex items-center justify-center transition"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleAddRecipient} className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-zinc-700 mb-1">
                    Họ và tên đầy đủ (trên tài khoản ngân hàng) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Đoàn Văn Hậu"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-zinc-200 rounded-md focus:outline-none focus:border-black font-normal transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-zinc-700 mb-1">Vị trí công việc</label>
                    <input
                      type="text"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-zinc-200 rounded-md focus:outline-none focus:border-black font-normal transition"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-zinc-700 mb-1">Email liên hệ</label>
                    <input
                      type="email"
                      placeholder="nhansu@congty.vn"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-zinc-200 rounded-md focus:outline-none focus:border-black font-normal transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-zinc-700 mb-1">
                      Ngân hàng thụ hưởng *
                    </label>
                    <select
                      value={newBankCode}
                      onChange={(e) => setNewBankCode(e.target.value)}
                      className="w-full text-xs px-2.5 py-2 border border-zinc-200 rounded-md focus:outline-none focus:border-black bg-white font-medium text-zinc-800 transition"
                    >
                      <option value="VCB">Vietcombank</option>
                      <option value="MB">MB Bank</option>
                      <option value="TCB">Techcombank</option>
                      <option value="ACB">ACB</option>
                      <option value="VPB">VPBank</option>
                      <option value="9PAY_WALLET">Ví điện tử 9Pay</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-zinc-700 mb-1">
                      Số TK / SĐT Ví *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="9704... hoặc 0912..."
                      value={newAccountNumber}
                      onChange={(e) => setNewAccountNumber(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-zinc-200 rounded-md focus:outline-none focus:border-black font-mono transition"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-3.5 py-1.5 text-zinc-600 hover:bg-zinc-100 rounded-md font-medium text-xs transition"
                  >
                    Huỷ bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-4 py-1.5 bg-black hover:bg-zinc-800 text-white rounded-md font-medium text-xs shadow-sm transition disabled:opacity-50"
                  >
                    {formLoading ? 'Đang lưu...' : 'Lưu nhân sự'}
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
