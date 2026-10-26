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
} from 'lucide-react';

const AVATAR_COLORS = [
  'from-emerald-400 to-teal-600',
  'from-indigo-400 to-purple-600',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-pink-600',
  'from-sky-400 to-blue-600',
];

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
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Danh bạ Nhân sự & Freelancer Việt Nam
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Quản lý hồ sơ nhận thanh toán, tài khoản ngân hàng NAPAS 24/7 và ví 9Pay của các cộng sự.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-600/30 transition hover:shadow-md hover:-translate-y-0.5 self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>+ Thêm nhân sự mới</span>
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft space-y-1">
            <span className="text-xs font-bold text-slate-500 block">
              Tổng số nhân sự
            </span>
            <span className="text-2xl font-black text-slate-900">{recipients.length} Người</span>
            <span className="text-xs text-indigo-600 font-semibold block">Đội ngũ tại Việt Nam</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft space-y-1">
            <span className="text-xs font-bold text-slate-500 block">
              Đã xác thực tài khoản
            </span>
            <span className="text-2xl font-black text-emerald-600">
              {recipients.filter((r) => r.isVerified).length} / {recipients.length}
            </span>
            <span className="text-xs text-emerald-700 font-semibold block">Sẵn sàng nhận lương</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft space-y-1">
            <span className="text-xs font-bold text-slate-500 block">
              Ngân hàng & Ví hỗ trợ
            </span>
            <span className="text-sm font-extrabold text-slate-900 block mt-1">
              VCB, MB, TCB, ACB, 9Pay
            </span>
            <span className="text-xs text-slate-400 block">Chuyển tiền liên ngân hàng 24/7</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft space-y-1">
            <span className="text-xs font-bold text-slate-500 block">
              Kiểm soát kép (SEC-804)
            </span>
            <span className="text-sm font-extrabold text-indigo-700 block mt-1">
              Bảo vệ 100% đợt chi
            </span>
            <span className="text-xs text-slate-400 block">Ghi nhận sổ cái bất biến</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-soft flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên nhân sự, số tài khoản, hoặc vị trí công việc..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <span className="text-xs text-slate-500 font-bold whitespace-nowrap">
              Lọc theo ngân hàng:
            </span>
            <select
              value={bankFilter}
              onChange={(e) => setBankFilter(e.target.value)}
              className="text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 font-semibold focus:outline-none"
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
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F6] text-slate-500 font-bold border-b border-slate-200/80 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-4 px-5">Họ tên nhân sự</th>
                  <th className="py-4 px-5">Vị trí & Email</th>
                  <th className="py-4 px-5">Kênh ngân hàng</th>
                  <th className="py-4 px-5">Số tài khoản / SĐT</th>
                  <th className="py-4 px-5">Xác thực NAPAS</th>
                  <th className="py-4 px-5 text-right">Tổng tiền đã nhận</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r, i) => {
                  const gradient = AVATAR_COLORS[i % AVATAR_COLORS.length];
                  return (
                    <tr key={r.id} className="hover:bg-indigo-50/20 transition">
                      <td className="py-4 px-5 font-bold text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${gradient} text-white flex items-center justify-center font-bold text-xs shadow-xs`}>
                            {r.name.slice(0, 1).toUpperCase()}
                          </div>
                          <span className="text-sm">{r.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="text-slate-800 font-semibold">{r.role}</div>
                        <div className="text-[11px] text-slate-400">{r.email || '—'}</div>
                      </td>
                      <td className="py-4 px-5">
                        <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                          {r.bankCode}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-mono font-semibold text-slate-700">
                        {r.accountNumber}
                      </td>
                      <td className="py-4 px-5">
                        {r.isVerified ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            <BadgeCheck size={14} className="text-emerald-600" />
                            <span>Đã xác minh</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                            <span>Chờ kiểm tra</span>
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right font-bold text-slate-900 tabular-nums text-sm">
                        {formatLosslessAmount(r.totalPaidVND, 'VND')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Add Beneficiary */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-soft-lg w-full max-w-lg p-6 sm:p-7 space-y-5 border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Thêm Nhân sự Thụ hưởng Mới</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Lưu thông tin tài khoản ngân hàng để chi trả nhanh</p>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddRecipient} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Họ và tên đầy đủ (trên thẻ ngân hàng) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Đoàn Văn Hậu"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Vị trí công việc</label>
                    <input
                      type="text"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Email liên hệ</label>
                    <input
                      type="email"
                      placeholder="nhansu@congty.vn"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Ngân hàng thụ hưởng *
                    </label>
                    <select
                      value={newBankCode}
                      onChange={(e) => setNewBankCode(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-semibold text-slate-800"
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
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Số TK / SĐT Ví *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="9704... hoặc 0912..."
                      value={newAccountNumber}
                      onChange={(e) => setNewAccountNumber(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                  >
                    Huỷ bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm transition disabled:opacity-50"
                  >
                    {formLoading ? 'Đang lưu...' : 'Lưu vào Danh bạ'}
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
