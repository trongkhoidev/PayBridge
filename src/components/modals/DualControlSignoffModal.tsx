'use client';

import React, { useState } from 'react';
import { ShieldCheck, Key, AlertTriangle, CheckCircle2, Lock, X, Fingerprint, Coins } from 'lucide-react';
import { formatLosslessAmount } from '@/lib/utils/currency';
import { PayrollBatch } from '@/types';

interface DualControlSignoffModalProps {
  batch: PayrollBatch;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DualControlSignoffModal({
  batch,
  isOpen,
  onClose,
  onConfirm,
}: DualControlSignoffModalProps) {
  const [approverName, setApproverName] = useState('Lê Thu Hằng (Giám đốc Tài chính / CFO)');
  const [securityPin, setSecurityPin] = useState('889922');
  const [attestationChecked, setAttestationChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attestationChecked) return;
    setIsSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-soft-lg w-full max-w-lg text-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/50 via-white to-indigo-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Ký duyệt Chi trả Kiểm soát kép
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Quy chuẩn SEC-804 • Xác nhận bởi Giám đốc Tài chính (CFO)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {/* Policy Alert Card */}
          <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl text-emerald-900 space-y-1">
            <div className="flex items-center gap-2 font-bold text-emerald-800">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>Bảo vệ An toàn Ngân sách Doanh nghiệp</span>
            </div>
            <p className="text-[11px] leading-relaxed text-emerald-800/90">
              Để đảm bảo quyền lợi của nhân viên và minh bạch tài chính, đợt chi trả bắt buộc cần xác nhận của người phê duyệt trước khi gửi lệnh chuyển mạch đến cổng 9Pay và ngân hàng NAPAS 24/7.
            </p>
          </div>

          {/* Batch Summary Review Box */}
          <div className="bg-[#FAF9F6] border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-2.5">
            <div className="flex items-center justify-between text-slate-600">
              <span className="font-medium text-slate-500">Tên đợt chi trả:</span>
              <span className="font-bold text-slate-900 text-right max-w-[240px] truncate">
                {batch.title}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span className="font-medium text-slate-500">Tổng số tiền giải ngân:</span>
              <span className="font-extrabold text-emerald-700 text-base tabular-nums">
                {formatLosslessAmount(batch.sourceAmountTotal, batch.asset)}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span className="font-medium text-slate-500">Số nhân sự nhận tiền:</span>
              <span className="font-bold text-slate-900">{batch.items.length} Người</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span className="font-medium text-slate-500">Cổng thanh toán:</span>
              <span className="font-semibold text-xs uppercase text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                {batch.provider === 'mock' ? '9Pay Sandbox' : batch.provider}
              </span>
            </div>
          </div>

          {/* Approver Credential Fields */}
          <div className="space-y-3.5 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Người ký duyệt (CFO / Ban Giám đốc)
              </label>
              <input
                type="text"
                required
                value={approverName}
                onChange={(e) => setApproverName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Mã xác thực bảo mật / PIN phê duyệt
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={securityPin}
                  onChange={(e) => setSecurityPin(e.target.value)}
                  className="w-full text-xs pl-3.5 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tracking-widest font-bold"
                />
                <Key
                  size={16}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Attestation Checkbox */}
          <label className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl cursor-pointer hover:bg-indigo-50/20 transition">
            <input
              type="checkbox"
              required
              checked={attestationChecked}
              onChange={(e) => setAttestationChecked(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-0 w-4 h-4"
            />
            <span className="text-xs text-slate-700 leading-relaxed font-medium">
              Tôi xác nhận đã đối soát đầy đủ bảng chấm công và danh sách tài khoản của {batch.items.length} nhân sự. Đồng ý cấp phép giải ngân đợt chi trả này.
            </span>
          </label>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition font-bold"
            >
              Huỷ bỏ
            </button>
            <button
              type="submit"
              disabled={!attestationChecked || isSubmitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm shadow-emerald-600/30 transition disabled:opacity-40 flex items-center gap-2 hover:shadow-md"
            >
              <Lock size={15} />
              <span>{isSubmitting ? 'Đang cấp chữ ký...' : 'Ký duyệt & Cho phép giải ngân'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
