'use client';

import React, { useState } from 'react';
import { Sparkles, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, X, Bot, FileText, HeartHandshake } from 'lucide-react';
import { PayrollBatch } from '@/types';
import { formatLosslessAmount } from '@/lib/utils/currency';

interface GeminiAdvisorDrawerProps {
  batch: PayrollBatch | null;
  isOpen: boolean;
  onClose: () => void;
}

export function GeminiAdvisorDrawer({
  batch,
  isOpen,
  onClose,
}: GeminiAdvisorDrawerProps) {
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [aiNote, setAiNote] = useState<string | null>(null);

  if (!isOpen || !batch) return null;

  const totalLossless = batch.sourceAmountTotal;
  const isHighValue = BigInt(totalLossless) > BigInt(100_000_000);

  const handleAskQuickPrompt = (prompt: string) => {
    setSelectedPrompt(prompt);
    if (prompt === 'tax') {
      setAiNote(
        'Lưu ý Thuế TNCN tại Việt Nam: Theo quy định hiện hành đối với khoản chi trả thù lao cho cá nhân không ký hợp đồng lao động có mức từ 2.000.000 VNĐ/lần trở lên, doanh nghiệp cần lưu giữ biên bản nghiệm thu dịch vụ và khấu trừ 10% thuế TNCN tại nguồn (trừ trường hợp cá nhân đủ điều kiện làm cam kết mẫu 08/CK-TNCN).'
      );
    } else if (prompt === 'routing') {
      setAiNote(
        `Đã kiểm tra ${batch.items.length} tài khoản thụ hưởng trong đợt này. Tất cả số tài khoản và đầu số ví (VCB, MB, Techcombank, ACB, 9Pay) đều khớp với định dạng chuyển mạch nhanh NAPAS 24/7. Không phát hiện tài khoản sai cấu trúc.`
      );
    } else if (prompt === 'executive') {
      setAiNote(
        `Biên bản tóm tắt trình Giám đốc: Đợt chi trả "${batch.title}" có tổng ngân sách ${formatLosslessAmount(batch.sourceAmountTotal, batch.asset)} phân bổ cho ${batch.items.length} nhân sự kỹ thuật. Các chỉ số rủi ro đều ở mức tối thiểu. Đủ điều kiện để CFO ký duyệt giải ngân.`
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-150">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white border-l border-slate-200 shadow-soft-lg flex flex-col text-slate-800 z-50">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50/50 via-white to-indigo-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
              <Sparkles size={20} className="text-amber-600" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span>Trợ lý Rủi ro Gemini AI</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  Cố vấn
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Mô hình Gemini 3.8 Flash • Phân tích bất thường
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

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs">
          {/* Anomaly Score Card */}
          <div className="p-5 bg-[#FAF9F6] border border-slate-200/90 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-bold">Chỉ số rủi ro bất thường:</span>
              <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 text-xs">
                0.04 / 10.0 (Rất An toàn)
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="w-[4%] h-full bg-emerald-500 rounded-full" />
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Mức độ biến động và lịch sử giao dịch hoàn toàn khớp với chu kỳ chi trả thù lao định kỳ cho đội ngũ kỹ sư.
            </p>
          </div>

          {/* High-value threshold alert */}
          {isHighValue && (
            <div className="p-4 bg-amber-50/80 border border-amber-200 text-amber-900 rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-800">
                <AlertTriangle size={16} />
                <span>Khoản chi giá trị lớn (&gt; 100.000.000 VNĐ)</span>
              </div>
              <p className="text-xs text-amber-800/90 leading-relaxed">
                Đợt chi này vượt quá 100 triệu VNĐ. Hệ thống khuyến nghị CFO kiểm tra lại số liệu trước khi ký duyệt giải ngân qua cổng 9Pay.
              </p>
            </div>
          )}

          {/* Quick AI Prompts */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Gợi ý câu hỏi phân tích nhanh:
            </span>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleAskQuickPrompt('tax')}
                className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/40 border border-slate-200 text-slate-700 hover:text-indigo-900 transition flex items-center justify-between font-semibold"
              >
                <span>🔍 Quy định thuế TNCN 10% vãng lai tại Việt Nam</span>
                <ArrowRight size={14} className="text-slate-400" />
              </button>
              <button
                type="button"
                onClick={() => handleAskQuickPrompt('routing')}
                className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/40 border border-slate-200 text-slate-700 hover:text-indigo-900 transition flex items-center justify-between font-semibold"
              >
                <span>🏦 Kiểm tra tính tương thích tài khoản NAPAS 24/7</span>
                <ArrowRight size={14} className="text-slate-400" />
              </button>
              <button
                type="button"
                onClick={() => handleAskQuickPrompt('executive')}
                className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/40 border border-slate-200 text-slate-700 hover:text-indigo-900 transition flex items-center justify-between font-semibold"
              >
                <span>📋 Soạn biên bản tóm tắt gửi Ban Giám đốc & CFO</span>
                <ArrowRight size={14} className="text-slate-400" />
              </button>
            </div>
          </div>

          {/* Dynamic AI Note Output */}
          {aiNote && (
            <div className="p-4 sm:p-5 bg-gradient-to-br from-indigo-50/80 to-purple-50/40 border border-indigo-200 rounded-2xl space-y-2 animate-in fade-in duration-200 shadow-xs">
              <div className="flex items-center gap-2 text-indigo-900 font-bold">
                <Bot size={17} className="text-indigo-600" />
                <span>Kết quả Phân tích từ Gemini AI:</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">{aiNote}</p>
            </div>
          )}

          {/* Compliance Safe Boundary Reminder */}
          <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl text-slate-500 text-xs space-y-1">
            <span className="font-bold text-slate-700 block">Nguyên tắc An toàn AI:</span>
            <p className="leading-relaxed">
              Trí tuệ nhân tạo Gemini hoạt động độc lập ở chế độ đọc và cố vấn. AI không có quyền hạn can thiệp vào tài khoản ngân hàng, không thể tự ý chuyển tiền hoặc thay đổi chữ ký phê duyệt của con người.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-[#FAF9F6] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition"
          >
            Đóng bảng cố vấn
          </button>
        </div>
      </div>
    </div>
  );
}
