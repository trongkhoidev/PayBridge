'use client';

import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, Loader2, ShieldCheck, ArrowRight, X, ExternalLink, Zap } from 'lucide-react';
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

    // Simulate animated step progression
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-soft-lg w-full max-w-lg text-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 via-white to-amber-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shadow-xs">
              <Send size={20} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Điều phối Giải ngân qua Cổng 9Pay
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Đợt chi #{batch.id.slice(-8)} • {batch.items.length} Người nhận thụ hưởng
              </p>
            </div>
          </div>
          {dispatchPhase !== 'PROCESSING' && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold transition"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {dispatchPhase === 'IDLE' && (
            <div className="space-y-4">
              <div className="p-4 sm:p-5 bg-[#FAF9F6] border border-slate-200/90 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Tổng số tiền chi:</span>
                  <span className="font-extrabold text-slate-900 text-base tabular-nums">
                    {formatLosslessAmount(batch.sourceAmountTotal, batch.asset)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Cổng chuyển mạch:</span>
                  <span className="font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 uppercase text-[10px]">
                    9Pay Sandbox Chi Hộ
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Chữ ký phê duyệt:</span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 size={13} />
                    <span>{batch.approvedBy || 'CFO đã ký duyệt'}</span>
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-indigo-50/80 border border-indigo-200/80 rounded-2xl text-indigo-900 text-xs flex items-start gap-2.5 leading-relaxed">
                <ShieldCheck size={18} className="text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Bảo vệ Giao dịch An toàn:</strong> Lệnh chi này được gắn khoá Idempotency duy nhất, đảm bảo tuyệt đối không có nguy cơ chuyển tiền hai lần ngay cả khi mạng chập chờn.
                </span>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition font-bold"
                >
                  Để sau
                </button>
                <button
                  type="button"
                  onClick={handleStartDispatch}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm shadow-indigo-600/30 transition flex items-center gap-2 hover:shadow-md"
                >
                  <Send size={15} />
                  <span>Xác nhận & Giải ngân ngay</span>
                </button>
              </div>
            </div>
          )}

          {dispatchPhase === 'PROCESSING' && (
            <div className="py-6 space-y-6 text-center">
              <Loader2 size={40} className="animate-spin text-indigo-600 mx-auto" />
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  Đang điều phối chuyển tiền qua cổng 9Pay...
                </h4>
                <p className="text-slate-500 text-xs">
                  Vui lòng đợi giây lát trong khi hệ thống xác thực và cấp mã tham chiếu giao dịch.
                </p>
              </div>

              {/* Progress Steps */}
              <div className="space-y-3 max-w-sm mx-auto text-left">
                <div className={`p-3 rounded-xl flex items-center gap-3 border ${activeStep >= 1 ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950 font-semibold' : 'text-slate-400 border-transparent'}`}>
                  {activeStep > 1 ? <CheckCircle2 size={16} className="text-emerald-600 shrink-0" /> : <Loader2 size={16} className="animate-spin text-indigo-600 shrink-0" />}
                  <span className="text-xs">1. Kiểm tra chữ ký số CFO & khoá Idempotency</span>
                </div>
                <div className={`p-3 rounded-xl flex items-center gap-3 border ${activeStep >= 2 ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950 font-semibold' : 'text-slate-400 border-transparent'}`}>
                  {activeStep > 2 ? <CheckCircle2 size={16} className="text-emerald-600 shrink-0" /> : activeStep === 2 ? <Loader2 size={16} className="animate-spin text-indigo-600 shrink-0" /> : <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />}
                  <span className="text-xs">2. Bắt tay kết nối cổng 9Pay Chi Hộ Sandbox</span>
                </div>
                <div className={`p-3 rounded-xl flex items-center gap-3 border ${activeStep >= 3 ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950 font-semibold' : 'text-slate-400 border-transparent'}`}>
                  {activeStep > 3 ? <CheckCircle2 size={16} className="text-emerald-600 shrink-0" /> : activeStep === 3 ? <Loader2 size={16} className="animate-spin text-indigo-600 shrink-0" /> : <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />}
                  <span className="text-xs">3. Chuyển mạch liên ngân hàng nhanh NAPAS 24/7</span>
                </div>
              </div>
            </div>
          )}

          {dispatchPhase === 'COMPLETED' && (
            <div className="py-4 space-y-5 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl shadow-xs">
                ✓
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900">Chi trả Thành công Tức thì!</h4>
                <p className="text-slate-500 text-xs mt-1">
                  Toàn bộ {batch.items.length} người nhận đã được hệ thống 9Pay xác nhận giải ngân.
                </p>
              </div>

              <div className="p-4 bg-[#FAF9F6] border border-slate-200/90 rounded-2xl text-left text-xs space-y-1.5 text-slate-700">
                <div className="text-slate-500 font-medium">Mã tham chiếu giao dịch đại diện:</div>
                <div className="text-emerald-700 font-bold font-mono text-sm truncate">
                  MOCK-9PAY-TXN-{batch.id.slice(-8)}-001
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm transition hover:shadow-md"
              >
                Đóng & Xem Bảng kê chi tiết
              </button>
            </div>
          )}

          {dispatchPhase === 'ERROR' && (
            <div className="py-4 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <X size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Lỗi khi thực hiện giải ngân</h4>
                <p className="text-rose-600 text-xs mt-1">{errorMessage}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
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
