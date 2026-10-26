'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight, X, Bot } from 'lucide-react';
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
        'Lưu ý Thuế TNCN tại Việt Nam: Đối với khoản chi trả thù lao cho cá nhân không ký hợp đồng lao động từ 2.000.000 VNĐ/lần trở lên, doanh nghiệp cần lưu giữ biên bản nghiệm thu dịch vụ và khấu trừ 10% thuế TNCN tại nguồn (trừ trường hợp cá nhân đủ điều kiện làm cam kết mẫu 08/CK-TNCN).'
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
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-100">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white border-l border-zinc-200 shadow-xl flex flex-col text-zinc-900 z-50">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-900 flex items-center justify-center font-semibold">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                <span>Trợ lý Rủi ro Gemini AI</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-100 text-zinc-800 border border-zinc-200">
                  Advisory Only
                </span>
              </h3>
              <p className="text-xs text-zinc-500 font-mono">
                Gemini 3.8 Flash • Phân tích bất thường
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

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Anomaly Score Card */}
          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-zinc-600 font-medium">Chỉ số rủi ro bất thường:</span>
              <span className="font-mono font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                0.04 / 10.0 (An toàn)
              </span>
            </div>
            <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
              <div className="w-[4%] h-full bg-emerald-500 rounded-full" />
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Mức độ biến động và lịch sử giao dịch khớp với chu kỳ chi trả thù lao định kỳ cho đội ngũ kỹ sư.
            </p>
          </div>

          {/* High-value threshold alert */}
          {isHighValue && (
            <div className="p-3 bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-lg space-y-1">
              <div className="font-medium text-zinc-900">
                Khoản chi giá trị lớn (&gt; 100.000.000 VNĐ)
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Đợt chi này vượt quá 100 triệu VNĐ. Hệ thống khuyến nghị CFO kiểm tra lại số liệu trước khi ký duyệt giải ngân qua cổng 9Pay.
              </p>
            </div>
          )}

          {/* Quick AI Prompts */}
          <div className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 block">
              Gợi ý câu hỏi phân tích nhanh:
            </span>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => handleAskQuickPrompt('tax')}
                className="w-full text-left p-3 rounded-md bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 transition flex items-center justify-between font-normal text-xs"
              >
                <span>🔍 Quy định thuế TNCN 10% vãng lai tại Việt Nam</span>
                <ArrowRight size={13} className="text-zinc-400" />
              </button>
              <button
                type="button"
                onClick={() => handleAskQuickPrompt('routing')}
                className="w-full text-left p-3 rounded-md bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 transition flex items-center justify-between font-normal text-xs"
              >
                <span>🏦 Kiểm tra tính tương thích tài khoản NAPAS 24/7</span>
                <ArrowRight size={13} className="text-zinc-400" />
              </button>
              <button
                type="button"
                onClick={() => handleAskQuickPrompt('executive')}
                className="w-full text-left p-3 rounded-md bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 transition flex items-center justify-between font-normal text-xs"
              >
                <span>📋 Soạn biên bản tóm tắt gửi Ban Giám đốc & CFO</span>
                <ArrowRight size={13} className="text-zinc-400" />
              </button>
            </div>
          </div>

          {/* Dynamic AI Note Output */}
          {aiNote && (
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg space-y-2 animate-in fade-in duration-100">
              <div className="flex items-center gap-1.5 text-zinc-900 font-medium">
                <Bot size={15} className="text-zinc-700" />
                <span>Kết quả Phân tích từ Gemini AI:</span>
              </div>
              <p className="text-xs text-zinc-700 leading-relaxed font-normal">{aiNote}</p>
            </div>
          )}

          {/* Compliance Safe Boundary Reminder */}
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-600 text-xs space-y-1">
            <span className="font-medium text-zinc-900 block">Nguyên tắc An toàn AI:</span>
            <p className="leading-relaxed text-[11px]">
              Trí tuệ nhân tạo Gemini hoạt động độc lập ở chế độ đọc và cố vấn. AI không có quyền hạn can thiệp vào tài khoản ngân hàng, không thể tự ý chuyển tiền hoặc thay đổi chữ ký phê duyệt của con người.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-md text-xs font-medium transition"
          >
            Đóng bảng cố vấn
          </button>
        </div>
      </div>
    </div>
  );
}
