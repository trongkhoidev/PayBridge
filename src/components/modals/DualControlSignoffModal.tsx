'use client';

import React, { useState } from 'react';
import { ShieldCheck, Key, CheckCircle2, Lock, X } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-100">
      <div className="bg-white border border-zinc-200 rounded-lg shadow-xl w-full max-w-lg text-zinc-900 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-900 flex items-center justify-center font-semibold">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 tracking-tight">
                Ký duyệt Chi trả Kiểm soát kép
              </h3>
              <p className="text-xs text-zinc-500 font-mono">
                Quy chuẩn SEC-804 • Xác nhận bởi CFO
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 flex items-center justify-center transition"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Policy Alert Card */}
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-md text-zinc-700 space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-zinc-900">
              <CheckCircle2 size={14} className="text-emerald-600" />
              <span>Bảo vệ Ngân sách Doanh nghiệp</span>
            </div>
            <p className="text-[11px] leading-relaxed text-zinc-600">
              Đợt chi trả bắt buộc cần xác nhận của CFO trước khi gửi lệnh chuyển mạch đến cổng 9Pay và ngân hàng NAPAS 24/7.
            </p>
          </div>

          {/* Batch Summary Review Box */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-md p-3.5 space-y-2">
            <div className="flex items-center justify-between text-zinc-600">
              <span className="text-zinc-500">Tên đợt chi trả:</span>
              <span className="font-medium text-zinc-900 text-right truncate max-w-[240px]">
                {batch.title}
              </span>
            </div>
            <div className="flex items-center justify-between text-zinc-600">
              <span className="text-zinc-500">Tổng số tiền giải ngân:</span>
              <span className="font-semibold text-zinc-900 tabular-nums">
                {formatLosslessAmount(batch.sourceAmountTotal, batch.asset)}
              </span>
            </div>
            <div className="flex items-center justify-between text-zinc-600">
              <span className="text-zinc-500">Số nhân sự nhận tiền:</span>
              <span className="font-medium text-zinc-900">{batch.items.length} Người</span>
            </div>
            <div className="flex items-center justify-between text-zinc-600">
              <span className="text-zinc-500">Cổng thanh toán:</span>
              <span className="font-mono text-[11px] text-zinc-800 bg-white px-2 py-0.5 rounded border border-zinc-200">
                {batch.provider === 'mock' ? '9Pay Sandbox' : batch.provider}
              </span>
            </div>
          </div>

          {/* Approver Credential Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Người ký duyệt (CFO / Ban Giám đốc)
              </label>
              <input
                type="text"
                required
                value={approverName}
                onChange={(e) => setApproverName(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-zinc-200 rounded-md text-zinc-900 focus:outline-none focus:border-black font-medium transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Mã xác thực bảo mật / PIN phê duyệt
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={securityPin}
                  onChange={(e) => setSecurityPin(e.target.value)}
                  className="w-full text-xs pl-3 pr-9 py-2 bg-white border border-zinc-200 rounded-md text-zinc-900 focus:outline-none focus:border-black font-mono tracking-widest transition"
                />
                <Key
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
                />
              </div>
            </div>
          </div>

          {/* Attestation Checkbox */}
          <label className="flex items-start gap-2.5 p-3 bg-zinc-50 border border-zinc-200 rounded-md cursor-pointer hover:bg-zinc-100/70 transition">
            <input
              type="checkbox"
              required
              checked={attestationChecked}
              onChange={(e) => setAttestationChecked(e.target.checked)}
              className="mt-0.5 rounded border-zinc-300 text-black focus:ring-0 w-3.5 h-3.5"
            />
            <span className="text-xs text-zinc-700 leading-relaxed">
              Tôi xác nhận đã đối soát đầy đủ danh sách và số tài khoản của {batch.items.length} nhân sự. Đồng ý cấp phép giải ngân đợt chi trả này.
            </span>
          </label>

          {/* Actions */}
          <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 text-zinc-600 hover:bg-zinc-100 rounded-md transition font-medium text-xs"
            >
              Huỷ bỏ
            </button>
            <button
              type="submit"
              disabled={!attestationChecked || isSubmitting}
              className="px-4 py-1.5 bg-black hover:bg-zinc-800 text-white rounded-md font-medium text-xs shadow-sm transition disabled:opacity-40 flex items-center gap-1.5"
            >
              <Lock size={13} />
              <span>{isSubmitting ? 'Đang cấp chữ ký...' : 'Ký duyệt & Cho phép giải ngân'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
