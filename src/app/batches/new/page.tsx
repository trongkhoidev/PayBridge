'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { sumAmounts, formatLosslessAmount } from '@/lib/utils/currency';
import {
  ArrowLeft,
  CheckCircle2,
  Plus,
  Trash2,
  Sparkles,
  ShieldCheck,
  Building,
  Users,
  CreditCard,
  HelpCircle,
  Coins,
  Send,
  Zap,
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
  const [title, setTitle] = useState('Đợt chi trả lương & thù lao tháng này');
  const [asset] = useState('VND');
  const [memo, setMemo] = useState('Chi trả lương định kỳ hai tuần cho đội ngũ kỹ sư tại Việt Nam');
  const [recipients, setRecipients] = useState<RecipientRow[]>([
    { recipientName: '', recipientReference: '', bankCode: 'VCB', amount: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute live total safely with lossless BigInt
  let liveTotal = '0';
  let isTotalValid = true;
  try {
    const validAmounts = recipients
      .map((r) => r.amount.trim())
      .filter((a) => /^\d+$/.test(a));
    if (validAmounts.length > 0) {
      liveTotal = sumAmounts(validAmounts);
    }
  } catch {
    liveTotal = '0';
    isTotalValid = false;
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Link & Header */}
        <div className="flex items-center justify-between">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition"
          >
            <ArrowLeft size={15} />
            <span>Quay lại trang danh sách đợt chi</span>
          </a>
          <button
            type="button"
            onClick={handleLoadSample}
            className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition shadow-xs"
          >
            <Sparkles size={14} className="text-amber-500" />
            <span>⚡ Nạp nhanh danh sách mẫu 3 nhân sự</span>
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-soft">
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setStep(1)}
              className={`flex items-center gap-3 text-left p-3 rounded-xl transition ${
                step === 1
                  ? 'bg-indigo-50 border border-indigo-200 text-indigo-800'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-extrabold ${
                  step === 1 ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
                }`}
              >
                1
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Thông tin đợt chi</p>
                <p className="text-[11px] text-slate-400 hidden sm:block">Tên đợt & cổng tiền tệ</p>
              </div>
            </button>

            <button
              onClick={() => setStep(2)}
              className={`flex items-center gap-3 text-left p-3 rounded-xl transition ${
                step === 2
                  ? 'bg-indigo-50 border border-indigo-200 text-indigo-800'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-extrabold ${
                  step === 2 ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
                }`}
              >
                2
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Danh sách người nhận</p>
                <p className="text-[11px] text-slate-400 hidden sm:block">{recipients.length} nhân sự thụ hưởng</p>
              </div>
            </button>

            <button
              onClick={() => setStep(3)}
              className={`flex items-center gap-3 text-left p-3 rounded-xl transition ${
                step === 3
                  ? 'bg-indigo-50 border border-indigo-200 text-indigo-800'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-extrabold ${
                  step === 3 ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
                }`}
              >
                3
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Đối soát & Xác nhận</p>
                <p className="text-[11px] text-slate-400 hidden sm:block">Kiểm tra tổng tiền chính xác</p>
              </div>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-2">
            <span className="font-bold">Lỗi:</span> {error}
          </div>
        )}

        {/* Step 1: Specification */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-soft space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Bước 1: Thiết lập Thông tin Đợt chi trả</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Điền tên đợt thanh toán, tiền tệ và ghi chú nội bộ để kế toán và CFO dễ dàng đối soát.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tên đợt chi trả *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Lương lập trình viên Sprint 42"
                  className="w-full text-sm px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Đồng tiền & Cổng giải ngân
                  </label>
                  <div className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-semibold">
                    <CreditCard size={16} className="text-indigo-600" />
                    <span>Việt Nam Đồng (VND qua cổng 9Pay & NAPAS 24/7)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Đơn vị chi trả (Doanh nghiệp)
                  </label>
                  <div className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-semibold">
                    <Building size={16} className="text-slate-500" />
                    <span>Acme Global Ltd (Mã: emp_acme_vn)</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Ghi chú nội bộ cho kế toán & duyệt chi
                </label>
                <textarea
                  rows={2}
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="Ghi chú đối soát hợp đồng hoặc nhiệm vụ hoàn thành..."
                  className="w-full text-xs px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>
            </div>

            <div className="pt-5 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm shadow-indigo-600/30 hover:shadow-md"
              >
                Tiếp tục đến danh sách người nhận →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Recipient Roster */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-soft space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Bước 2: Danh sách Người nhận Thù lao</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Nhập họ tên, số tài khoản ngân hàng hoặc số điện thoại ví 9Pay. Số tiền được tính toán nguyên vẹn, không làm tròn sai số.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddRecipient}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-xs font-bold transition shadow-xs self-start sm:self-auto"
              >
                <Plus size={15} />
                <span>+ Thêm người nhận</span>
              </button>
            </div>

            <div className="space-y-3.5">
              {recipients.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-50/80 border border-slate-200/90 rounded-2xl grid grid-cols-1 sm:grid-cols-12 gap-3 items-center hover:bg-white hover:border-indigo-200 transition"
                >
                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      Họ và tên người nhận *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Nguyễn Văn An"
                      value={rec.recipientName}
                      onChange={(e) =>
                        handleUpdateRecipient(idx, 'recipientName', e.target.value)
                      }
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      Số TK Ngân hàng / SĐT Ví *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="9704... hoặc 0912..."
                      value={rec.recipientReference}
                      onChange={(e) =>
                        handleUpdateRecipient(idx, 'recipientReference', e.target.value)
                      }
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      Ngân hàng
                    </label>
                    <select
                      value={rec.bankCode}
                      onChange={(e) => handleUpdateRecipient(idx, 'bankCode', e.target.value)}
                      className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-800"
                    >
                      <option value="VCB">Vietcombank</option>
                      <option value="MB">MB Bank</option>
                      <option value="TCB">Techcombank</option>
                      <option value="ACB">ACB</option>
                      <option value="VPB">VPBank</option>
                      <option value="9PAY_WALLET">Ví điện tử 9Pay</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      Số tiền (VND) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="15000000"
                      value={rec.amount}
                      onChange={(e) => handleUpdateRecipient(idx, 'amount', e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900 tabular-nums"
                    />
                  </div>

                  <div className="sm:col-span-1 flex justify-center pt-2 sm:pt-0">
                    {recipients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRecipient(idx)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition"
                        title="Xoá dòng này"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Lossless Real-time Calculation Badge */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-50/80 via-white to-indigo-50/40 border border-indigo-200/80 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <p className="text-xs font-bold text-indigo-950">Tổng số tiền đợt chi này:</p>
                <p className="text-[11px] text-indigo-600 mt-0.5">
                  Phân bổ cho {recipients.length} người nhận thụ hưởng
                </p>
              </div>
              <div className="text-right">
                <span className="text-lg sm:text-xl font-black text-indigo-700 tabular-nums block">
                  {formatLosslessAmount(liveTotal, asset)}
                </span>
                <p className="text-[10px] text-indigo-500 font-medium">Toán học chính xác BigInt không sai số</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800"
              >
                ← Quay lại Bước 1
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm shadow-indigo-600/30"
              >
                Kiểm tra & Đối soát →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Pre-flight Audit */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-soft space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Bước 3: Đối soát Ngân sách & Xác nhận Bản nháp</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kiểm tra lại toàn bộ danh sách trước khi gửi lên hệ thống. Đợt chi sẽ ở trạng thái Bản nháp và cần được kiểm tra thông tin ngân hàng trước khi CFO ký duyệt.
              </p>
            </div>

            {/* Audit Checklist Box */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-[#FAF9F6] border border-slate-200/90 rounded-2xl space-y-1">
                <span className="text-xs font-bold text-slate-500 block">Tổng ngân sách chi trả</span>
                <span className="text-xl font-black text-slate-900 block tabular-nums">
                  {formatLosslessAmount(liveTotal, asset)}
                </span>
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  <span>Chính xác 100% không làm tròn</span>
                </span>
              </div>

              <div className="p-5 bg-[#FAF9F6] border border-slate-200/90 rounded-2xl space-y-1">
                <span className="text-xs font-bold text-slate-500 block">Số nhân sự nhận tiền</span>
                <span className="text-xl font-black text-slate-900 block">{recipients.length} Người</span>
                <span className="text-xs text-indigo-600 font-semibold block">
                  Chuyển mạch NAPAS 24/7
                </span>
              </div>

              <div className="p-5 bg-[#FAF9F6] border border-slate-200/90 rounded-2xl space-y-1">
                <span className="text-xs font-bold text-slate-500 block">Kênh kết nối</span>
                <span className="text-sm font-extrabold text-amber-800 uppercase block mt-1">
                  9Pay Testnet Gateway
                </span>
                <span className="text-xs text-slate-500 block">Mô phỏng thử nghiệm an toàn</span>
              </div>
            </div>

            {/* Review Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-[#FAF9F6] text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">#</th>
                    <th className="py-3.5 px-4">Người nhận</th>
                    <th className="py-3.5 px-4">Số tài khoản / SĐT</th>
                    <th className="py-3.5 px-4">Ngân hàng</th>
                    <th className="py-3.5 px-4 text-right">Số tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recipients.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-4 text-slate-400 font-mono">{i + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{r.recipientName}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{r.recipientReference}</td>
                      <td className="py-3.5 px-4 font-semibold text-indigo-700">{r.bankCode}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 tabular-nums text-sm">
                        {formatLosslessAmount(r.amount, asset)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-amber-50/80 border border-amber-200 text-amber-900 text-xs rounded-2xl flex items-start gap-3">
              <ShieldCheck size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Quy tắc An toàn Kiểm soát kép (SEC-804):</strong> Sau khi tạo, đợt chi trả sẽ được lưu ở trạng thái{' '}
                <span className="font-bold underline">BẢN NHÁP (DRAFT)</span>. Hệ thống tuyệt đối không tự ý trừ tiền cho đến khi được kiểm tra hợp lệ và có chữ ký xác nhận của người có thẩm quyền (CFO).
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800"
              >
                ← Chỉnh sửa danh sách
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
              >
                {loading ? 'Đang tạo đợt chi trả...' : 'Xác nhận & Đăng ký Đợt chi trả 🚀'}
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
