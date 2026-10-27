'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { sumAmounts, formatLosslessAmount } from '@/lib/utils/currency';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Building,
} from 'lucide-react';

interface RecipientRow {
  recipientName: string;
  recipientReference: string;
  bankCode: string;
  amount: string;
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

export default function NewBatchPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [title, setTitle] = useState('Đợt chi trả lương nhân sự kỹ thuật');
  const [asset] = useState('VND');
  const [memo, setMemo] = useState('Chi trả lương định kỳ hai tuần cho đội ngũ kỹ sư tại Việt Nam');
  const [recipients, setRecipients] = useState<RecipientRow[]>([
    { recipientName: '', recipientReference: '', bankCode: 'VCB', amount: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute live total safely with lossless BigInt
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

  const handleSubmit = async () => {
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

      router.push(`/batches/${data.data.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định');
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-black transition"
          >
            <ArrowLeft size={14} />
            <span>Quay lại Tổng quan</span>
          </a>

          <button
            type="button"
            onClick={handleLoadSample}
            className="text-xs bg-white text-zinc-700 hover:text-black border border-zinc-200 hover:bg-zinc-50 px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 shadow-vercel-sm transition"
          >
            <Sparkles size={13} className="text-zinc-500" />
            <span>Nạp mẫu 3 nhân sự</span>
          </button>
        </div>

        {/* Clean Vercel Stepper Indicator */}
        <div className="flex items-center justify-between text-xs font-medium border-b border-zinc-200 pb-3">
          {[
            { num: 1, label: '1. Thông tin đợt chi' },
            { num: 2, label: `2. Danh sách (${recipients.length} người)` },
            { num: 3, label: '3. Đối soát & Xác nhận' },
          ].map((item) => (
            <button
              key={item.num}
              onClick={() => setStep(item.num as 1 | 2 | 3)}
              className={`pb-1 transition ${
                step === item.num
                  ? 'text-black font-semibold border-b-2 border-black -mb-[13px]'
                  : 'text-zinc-400 hover:text-zinc-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
            <span className="font-semibold">Lỗi:</span> {error}
          </div>
        )}

        {/* Step 1: Specification */}
        {step === 1 && (
          <div className="bg-white rounded-lg border border-zinc-200 p-6 shadow-vercel-sm space-y-5">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">Thông tin cơ bản</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Điền tên đợt thanh toán và ghi chú đối soát nội bộ.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-zinc-700 mb-1">
                  Tên đợt chi trả *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Lương lập trình viên tháng 10"
                  className="w-full text-xs px-3 py-2 border border-zinc-200 rounded-md focus:outline-none focus:border-black bg-zinc-50/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-zinc-700 mb-1">
                    Đồng tiền & Cổng thanh toán
                  </label>
                  <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-md text-zinc-700 text-xs font-medium flex items-center gap-2">
                    <CreditCard size={14} className="text-zinc-500" />
                    <span>VND (qua cổng 9Pay & NAPAS 24/7)</span>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-zinc-700 mb-1">
                    Đơn vị chi trả (Doanh nghiệp)
                  </label>
                  <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-md text-zinc-700 text-xs font-medium flex items-center gap-2">
                    <Building size={14} className="text-zinc-500" />
                    <span>Acme Global Ltd (emp_acme_vn)</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-medium text-zinc-700 mb-1">
                  Ghi chú đối soát nội bộ
                </label>
                <textarea
                  rows={2}
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-zinc-200 rounded-md focus:outline-none focus:border-black bg-zinc-50/50"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 bg-black hover:bg-zinc-800 text-white rounded-md text-xs font-medium shadow-vercel-sm transition"
              >
                Tiếp tục đến danh sách người nhận →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Recipient Roster */}
        {step === 2 && (
          <div className="bg-white rounded-lg border border-zinc-200 p-6 shadow-vercel-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-zinc-900">Danh sách người nhận</h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Nhập họ tên, số tài khoản và số tiền cần chi trả.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddRecipient}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-md text-xs font-medium shadow-vercel-sm transition"
              >
                <Plus size={13} />
                <span>Thêm dòng</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {recipients.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-zinc-50/50 border border-zinc-200 rounded-md grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                >
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      required
                      placeholder="Họ và tên"
                      value={rec.recipientName}
                      onChange={(e) =>
                        handleUpdateRecipient(idx, 'recipientName', e.target.value)
                      }
                      className="w-full text-xs px-2.5 py-1.5 border border-zinc-200 rounded bg-white focus:outline-none focus:border-black"
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
                      className="w-full text-xs px-2.5 py-1.5 border border-zinc-200 rounded bg-white focus:outline-none focus:border-black font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <select
                      value={rec.bankCode}
                      onChange={(e) => handleUpdateRecipient(idx, 'bankCode', e.target.value)}
                      className="w-full text-xs px-2 py-1.5 border border-zinc-200 rounded bg-white focus:outline-none focus:border-black font-medium"
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
                      placeholder="Số tiền"
                      value={rec.amount}
                      onChange={(e) => handleUpdateRecipient(idx, 'amount', e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 border border-zinc-200 rounded bg-white focus:outline-none focus:border-black font-medium tabular-nums"
                    />
                  </div>

                  <div className="sm:col-span-1 flex justify-center">
                    {recipients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRecipient(idx)}
                        className="p-1 text-zinc-400 hover:text-red-600 rounded"
                        title="Xoá dòng"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Total Summary */}
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-md flex items-center justify-between text-xs">
              <span className="text-zinc-600">Tổng số tiền đợt chi ({recipients.length} người):</span>
              <span className="font-semibold text-zinc-950 text-sm tabular-nums">
                {formatLosslessAmount(liveTotal, asset)}
              </span>
            </div>

            <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-black"
              >
                ← Quay lại
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2 bg-black hover:bg-zinc-800 text-white rounded-md text-xs font-medium shadow-vercel-sm transition"
              >
                Đối soát & Xác nhận →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Pre-flight Audit */}
        {step === 3 && (
          <div className="bg-white rounded-lg border border-zinc-200 p-6 shadow-vercel-sm space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">Đối soát & Xác nhận</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Kiểm tra lại toàn bộ danh sách trước khi gửi lên hệ thống.
              </p>
            </div>

            {/* Review Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-md space-y-1">
                <span className="text-zinc-500 block">Tổng số tiền</span>
                <span className="text-base font-semibold text-zinc-950 block tabular-nums">
                  {formatLosslessAmount(liveTotal, asset)}
                </span>
              </div>
              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-md space-y-1">
                <span className="text-zinc-500 block">Số nhân sự</span>
                <span className="text-base font-semibold text-zinc-950 block">
                  {recipients.length} Người
                </span>
              </div>
              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-md space-y-1">
                <span className="text-zinc-500 block">Cổng thanh toán</span>
                <span className="text-xs font-mono font-medium text-zinc-700 block mt-1">
                  9Pay Sandbox Rail
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="border border-zinc-200 rounded-md overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-zinc-50 text-zinc-500 font-medium border-b border-zinc-200">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Người nhận</th>
                    <th className="py-2.5 px-3">Tài khoản</th>
                    <th className="py-2.5 px-3">Ngân hàng</th>
                    <th className="py-2.5 px-3 text-right">Số tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {recipients.map((r, i) => (
                    <tr key={i} className="hover:bg-zinc-50/50">
                      <td className="py-2.5 px-3 text-zinc-400 font-mono">{i + 1}</td>
                      <td className="py-2.5 px-3 font-medium text-zinc-900">{r.recipientName}</td>
                      <td className="py-2.5 px-3 font-mono text-zinc-600">{r.recipientReference}</td>
                      <td className="py-2.5 px-3 font-medium text-zinc-700">{r.bankCode}</td>
                      <td className="py-2.5 px-3 text-right font-medium text-zinc-950 tabular-nums">
                        {formatLosslessAmount(r.amount, asset)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-zinc-50 border border-zinc-200 text-zinc-600 text-xs rounded-md flex items-start gap-2">
              <ShieldCheck size={16} className="text-zinc-700 shrink-0 mt-0.5" />
              <span>
                <strong>Kiểm soát kép (SEC-804):</strong> Đợt chi sau khi tạo sẽ ở trạng thái Bản nháp (Draft). Hệ thống không tự ý trừ tiền cho đến khi CFO xác nhận ký duyệt.
              </span>
            </div>

            <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-black"
              >
                ← Chỉnh sửa
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-black hover:bg-zinc-800 text-white rounded-md text-xs font-medium shadow-vercel-sm transition disabled:opacity-50"
              >
                {loading ? 'Đang tạo...' : 'Xác nhận & Tạo đợt chi trả'}
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
