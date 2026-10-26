'use client';

import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, Loader2, ShieldCheck, X } from 'lucide-react';
import { PayrollBatch } from '@/types';
import { formatLosslessAmount } from '@/lib/utils/currency';

interface SettlementDispatchModalProps {
  batch: PayrollBatch;
  isOpen: boolean;
  onClose: () => void;
  onExecute: () => Promise<void>;
}

export function SettlementDispatchModal({
  batch,
  isOpen,
  onClose,
  onExecute,
}: SettlementDispatchModalProps) {
  const [dispatchPhase, setDispatchPhase] = useState<'IDLE' | 'PROCESSING' | 'COMPLETED' | 'ERROR'>('IDLE');
  const [activeStep, setActiveStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDispatchPhase('IDLE');
      setActiveStep(1);
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartDispatch = async () => {
    setDispatchPhase('PROCESSING');
    setActiveStep(1);

    setTimeout(() => setActiveStep(2), 600);
    setTimeout(() => setActiveStep(3), 1300);

    try {
      await onExecute();
      setActiveStep(4);
      setDispatchPhase('COMPLETED');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Giải ngân thất bại');
      setDispatchPhase('ERROR');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-100">
      <div className="bg-white border border-zinc-200 rounded-lg shadow-xl w-full max-w-lg text-zinc-900 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-900 flex items-center justify-center font-semibold">
              <Send size={16} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 tracking-tight">
                Điều phối Giải ngân qua Cổng 9Pay
              </h3>
              <p className="text-xs text-zinc-500 font-mono">
                Đợt chi #{batch.id.slice(-8)} • {batch.items.length} Người nhận thụ hưởng
              </p>
            </div>
          </div>
          {dispatchPhase !== 'PROCESSING' && (
            <button
              onClick={onClose}
              className="w-7 h-7 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 flex items-center justify-center transition"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {dispatchPhase === 'IDLE' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-md space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Tổng số tiền chi:</span>
                  <span className="font-semibold text-zinc-900 tabular-nums">
                    {formatLosslessAmount(batch.sourceAmountTotal, batch.asset)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Cổng chuyển mạch:</span>
                  <span className="font-mono text-zinc-800 bg-white px-2 py-0.5 rounded border border-zinc-200 uppercase text-[10px]">
                    9Pay Sandbox Chi Hộ
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Chữ ký phê duyệt:</span>
                  <span className="font-medium text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 size={13} />
                    <span>{batch.approvedBy || 'CFO đã ký duyệt'}</span>
                  </span>
                </div>
              </div>

              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-md text-zinc-700 text-xs flex items-start gap-2 leading-relaxed">
                <ShieldCheck size={16} className="text-zinc-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-zinc-900">Bảo vệ Giao dịch An toàn:</strong> Lệnh chi này được gắn khoá Idempotency duy nhất, đảm bảo tuyệt đối không có nguy cơ chuyển tiền hai lần ngay cả khi mạng chập chờn.
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 text-zinc-600 hover:bg-zinc-100 rounded-md transition font-medium text-xs"
                >
                  Để sau
                </button>
                <button
                  type="button"
                  onClick={handleStartDispatch}
                  className="px-4 py-1.5 bg-black hover:bg-zinc-800 text-white rounded-md font-medium text-xs shadow-sm transition flex items-center gap-1.5"
                >
                  <Send size={13} />
                  <span>Xác nhận & Giải ngân ngay</span>
                </button>
              </div>
            </div>
          )}

          {dispatchPhase === 'PROCESSING' && (
            <div className="py-6 space-y-5 text-center">
              <Loader2 size={32} className="animate-spin text-zinc-900 mx-auto" />
              <div>
                <h4 className="text-sm font-semibold text-zinc-900 mb-1">
                  Đang điều phối chuyển tiền qua cổng 9Pay...
                </h4>
                <p className="text-zinc-500 text-xs font-mono">
                  Đang xác thực và cấp mã tham chiếu giao dịch.
                </p>
              </div>

              {/* Progress Steps */}
              <div className="space-y-2 max-w-sm mx-auto text-left">
                <div className={`p-2.5 rounded-md flex items-center gap-2.5 border text-xs ${activeStep >= 1 ? 'bg-zinc-50 border-zinc-300 text-zinc-900 font-medium' : 'text-zinc-400 border-transparent'}`}>
                  {activeStep > 1 ? <CheckCircle2 size={14} className="text-emerald-600 shrink-0" /> : <Loader2 size={14} className="animate-spin text-zinc-900 shrink-0" />}
                  <span>1. Kiểm tra chữ ký số CFO & khoá Idempotency</span>
                </div>
                <div className={`p-2.5 rounded-md flex items-center gap-2.5 border text-xs ${activeStep >= 2 ? 'bg-zinc-50 border-zinc-300 text-zinc-900 font-medium' : 'text-zinc-400 border-transparent'}`}>
                  {activeStep > 2 ? <CheckCircle2 size={14} className="text-emerald-600 shrink-0" /> : activeStep === 2 ? <Loader2 size={14} className="animate-spin text-zinc-900 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-zinc-300 shrink-0" />}
                  <span>2. Bắt tay kết nối cổng 9Pay Chi Hộ Sandbox</span>
                </div>
                <div className={`p-2.5 rounded-md flex items-center gap-2.5 border text-xs ${activeStep >= 3 ? 'bg-zinc-50 border-zinc-300 text-zinc-900 font-medium' : 'text-zinc-400 border-transparent'}`}>
                  {activeStep > 3 ? <CheckCircle2 size={14} className="text-emerald-600 shrink-0" /> : activeStep === 3 ? <Loader2 size={14} className="animate-spin text-zinc-900 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-zinc-300 shrink-0" />}
                  <span>3. Chuyển mạch liên ngân hàng NAPAS 24/7</span>
                </div>
              </div>
            </div>
          )}

          {dispatchPhase === 'COMPLETED' && (
            <div className="py-4 space-y-4 text-center">
              <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-900 flex items-center justify-center mx-auto text-base font-semibold">
                ✓
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-900">Chi trả Thành công Tức thì!</h4>
                <p className="text-zinc-500 text-xs mt-1">
                  Toàn bộ {batch.items.length} người nhận đã được hệ thống 9Pay xác nhận giải ngân.
                </p>
              </div>

              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-md text-left text-xs space-y-1 text-zinc-700">
                <div className="text-zinc-500 text-[11px]">Mã tham chiếu giao dịch:</div>
                <div className="text-zinc-900 font-mono font-medium truncate">
                  MOCK-9PAY-TXN-{batch.id.slice(-8)}-001
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 bg-black hover:bg-zinc-800 text-white rounded-md font-medium text-xs shadow-sm transition"
              >
                Đóng & Xem Bảng kê chi tiết
              </button>
            </div>
          )}

          {dispatchPhase === 'ERROR' && (
            <div className="py-4 space-y-3 text-center">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                <X size={18} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-900">Lỗi khi thực hiện giải ngân</h4>
                <p className="text-red-600 text-xs mt-1">{errorMessage}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-md font-medium text-xs"
              >
                Đóng cửa sổ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
