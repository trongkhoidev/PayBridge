'use client';

import React, { useState } from 'react';
import { sumAmounts, formatLosslessAmount } from '@/lib/utils/currency';
import { Sparkles, X, Plus, Trash2, Coins, CreditCard } from 'lucide-react';

interface RecipientRow {
  recipientName: string;
  recipientReference: string;
  bankCode: string;
  amount: string;
}

interface CreateBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBatchCreated: () => void;
}

const SAMPLE_RECIPIENTS: RecipientRow[] = [
  {
    recipientName: 'Nguyễn Văn An',
    recipientReference: '9704050012345678',
    bankCode: 'VCB',
    amount: '15000000',
  },
  {
    recipientName: 'Trần Thị Mai',
    recipientReference: '9704220087654321',
    bankCode: 'MB',
    amount: '22000000',
  },
  {
    recipientName: 'Lê Hoàng Long',
    recipientReference: '0912345678',
    bankCode: '9PAY_WALLET',
    amount: '8500000',
  },
];

export function CreateBatchModal({ isOpen, onClose, onBatchCreated }: CreateBatchModalProps) {
  const [title, setTitle] = useState('Đợt chi trả lương nhân sự');
  const [asset] = useState('VND');
  const [recipients, setRecipients] = useState<RecipientRow[]>([
    { recipientName: '', recipientReference: '', bankCode: 'VCB', amount: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Compute live total safely
  let liveTotal = '0';
  try {
    const validAmounts = recipients
      .map((r) => r.amount.trim())
      .filter((a) => /^\d+$/.test(a));
    if (validAmounts.length > 0) {
      liveTotal = sumAmounts(validAmounts);
    }
  } catch {
    liveTotal = '0';
  }

  const handleAddRecipient = () => {
    setRecipients([
      ...recipients,
      { recipientName: '', recipientReference: '', bankCode: 'VCB', amount: '' },
    ]);
  };

  const handleRemoveRecipient = (index: number) => {
    if (recipients.length <= 1) return;
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const handleUpdateRecipient = (
    index: number,
    field: keyof RecipientRow,
    value: string
  ) => {
    const updated = [...recipients];
    updated[index][field] = value;
    setRecipients(updated);
  };

  const handleLoadSample = () => {
    setTitle('Đợt chi trả Sprint 42 (Mẫu 3 nhân sự)');
    setRecipients(SAMPLE_RECIPIENTS);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        title,
        employerId: 'emp_acme_vn',
        asset,
        items: recipients.map((r) => ({
          recipientName: r.recipientName.trim(),
          recipientReference: r.recipientReference.trim(),
          bankCode: r.bankCode.trim() || undefined,
          amount: r.amount.trim(),
          asset,
        })),
      };

      const res = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Không thể tạo đợt chi trả');
      }

      onBatchCreated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-soft-lg w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 via-white to-amber-50/30">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Tạo Nhanh Đợt Chi trả</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Nhập danh sách nhân sự nhận tiền. Số tiền được tính toán nguyên vẹn, không làm tròn sai số.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadSample}
              className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles size={13} className="text-amber-500" />
              <span>Nạp mẫu 3 người</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tên đợt chi trả *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Lương lập trình viên tháng 10"
                className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Đồng tiền giải ngân
              </label>
              <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold text-xs flex items-center gap-2">
                <CreditCard size={15} className="text-indigo-600" />
                <span>VND (qua 9Pay)</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold text-slate-700">
                Danh sách người nhận ({recipients.length} người)
              </label>
              <button
                type="button"
                onClick={handleAddRecipient}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
              >
                <Plus size={14} />
                <span>Thêm dòng</span>
              </button>
            </div>

            <div className="space-y-3">
              {recipients.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-[#FAF9F6] border border-slate-200/90 rounded-2xl grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center hover:bg-indigo-50/20 transition"
                >
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      required
                      placeholder="Họ và tên người nhận"
                      value={rec.recipientName}
                      onChange={(e) =>
                        handleUpdateRecipient(idx, 'recipientName', e.target.value)
                      }
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      required
                      placeholder="Số tài khoản / SĐT ví"
                      value={rec.recipientReference}
                      onChange={(e) =>
                        handleUpdateRecipient(idx, 'recipientReference', e.target.value)
                      }
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <select
                      value={rec.bankCode}
                      onChange={(e) =>
                        handleUpdateRecipient(idx, 'bankCode', e.target.value)
                      }
                      className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-800"
                    >
                      <option value="VCB">VCB</option>
                      <option value="MB">MB Bank</option>
                      <option value="TCB">TCB</option>
                      <option value="ACB">ACB</option>
                      <option value="9PAY_WALLET">Ví 9Pay</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      required
                      placeholder="Số tiền (VND)"
                      value={rec.amount}
                      onChange={(e) =>
                        handleUpdateRecipient(idx, 'amount', e.target.value)
                      }
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900 tabular-nums"
                    />
                  </div>
                  <div className="sm:col-span-1 text-center">
                    {recipients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRecipient(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                        title="Xoá dòng"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lossless Summary Box */}
          <div className="bg-gradient-to-r from-indigo-50/80 via-white to-indigo-50/40 border border-indigo-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
            <span className="text-xs font-bold text-indigo-950">Tổng số tiền đợt chi:</span>
            <span className="text-base font-extrabold text-indigo-700 tabular-nums">
              {formatLosslessAmount(liveTotal, asset)}
            </span>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Huỷ bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-600/30 transition disabled:opacity-50"
            >
              {loading ? 'Đang tạo...' : 'Tạo đợt chi trả bản nháp 🚀'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
