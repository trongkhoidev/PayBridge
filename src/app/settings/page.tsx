'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import {
  ShieldCheck,
  CheckCircle2,
  Cpu,
} from 'lucide-react';

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900 tracking-tight">
            Cấu hình Kênh Thanh toán & Nguyên tắc An toàn
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Thiết lập adapter cổng chi hộ 9Pay, cơ chế mô phỏng an toàn và các nguyên tắc bảo vệ tài chính bất biến.
          </p>
        </div>

        {/* Provider Adapter Grid */}
        <div className="space-y-3">
          <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Các Kênh Kết nối & Cổng Thanh toán
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 9Pay Adapter */}
            <div className="bg-white rounded-lg border border-zinc-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-900 flex items-center justify-center font-semibold text-xs">
                  9P
                </div>
                <span className="px-2 py-0.5 bg-zinc-100 text-zinc-800 border border-zinc-200 rounded text-[10px] font-medium font-mono">
                  Testnet Chi Hộ
                </span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">9Pay Vietnam Gateway</h3>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  Cổng thanh toán chi hộ nội địa Việt Nam, chuyển mạch NAPAS 24/7 và ví điện tử 9Pay.
                </p>
              </div>
              <div className="pt-3 border-t border-zinc-100 text-[11px] space-y-1 text-zinc-600 font-mono">
                <div>Endpoint: sandbox.9pay.vn</div>
                <div>Trạng thái: Sẵn sàng nạp API Keys</div>
              </div>
            </div>

            {/* Mock Adapter */}
            <div className="bg-white rounded-lg border border-zinc-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-semibold text-xs">
                  SIM
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-medium font-mono">
                  Đang hoạt động (Demo)
                </span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">Mock Payout Simulator</h3>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  Bộ mô phỏng chuyển tiền chính xác cao, tạo mã tham chiếu thật và chống trùng lặp giao dịch.
                </p>
              </div>
              <div className="pt-3 border-t border-zinc-100 text-[11px] space-y-1 text-zinc-600 font-mono">
                <div>Độ trễ phản hồi: 500ms</div>
                <div>Tỷ lệ thành công: 100% (Sandbox)</div>
              </div>
            </div>

            {/* Stellar SEP-31 */}
            <div className="bg-white rounded-lg border border-zinc-200 p-4 space-y-3 opacity-60">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-600 flex items-center justify-center font-semibold text-xs">
                  XLM
                </div>
                <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 border border-zinc-200 rounded text-[10px] font-medium font-mono">
                  Giai đoạn 2
                </span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">Stellar SEP-31 Anchor Rail</h3>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  Giao thức cầu nối thanh toán xuyên biên giới crypto-to-fiat qua đối tác anchor.
                </p>
              </div>
              <div className="pt-3 border-t border-zinc-100 text-[11px] space-y-1 text-zinc-600 font-mono">
                <div>Trạng thái: Nằm ngoài MVP đầu tiên</div>
                <div>Đối tác: Đang xác minh</div>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Financial Invariants Checklist */}
        <div className="bg-white rounded-lg border border-zinc-200 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-zinc-900" />
            <h2 className="text-sm font-semibold text-zinc-900">
              Các Nguyên tắc An toàn Tài chính Bất biến (Financial Invariants)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-md space-y-1.5">
              <div className="flex items-center gap-2 text-zinc-900 font-semibold">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>Toán học Chính xác Tuyệt đối (Lossless Math)</span>
              </div>
              <p className="text-zinc-600 leading-relaxed">
                Tất cả số tiền VND được tính toán bằng số nguyên lớn <code className="font-mono bg-white px-1 py-0.5 rounded border border-zinc-200 text-zinc-900">BigInt</code> và chuỗi số học. Tuyệt đối không dùng số thực dấu phẩy động (float) để tránh sai lệch dù chỉ 1 đồng.
              </p>
            </div>

            <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-md space-y-1.5">
              <div className="flex items-center gap-2 text-zinc-900 font-semibold">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>Kiểm soát kép Phê duyệt (SEC-804 / BR-01)</span>
              </div>
              <p className="text-zinc-600 leading-relaxed">
                Các đợt chi trả ở trạng thái <code className="font-mono text-zinc-900">BẢN NHÁP</code> hoặc <code className="font-mono text-zinc-900">ĐÃ KIỂM TRA</code> bị khoá cứng, không thể tự giải ngân nếu chưa có chữ ký xác nhận của CFO.
              </p>
            </div>

            <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-md space-y-1.5">
              <div className="flex items-center gap-2 text-zinc-900 font-semibold">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>Khoá Chống Trùng lặp Giao dịch (Idempotency)</span>
              </div>
              <p className="text-zinc-600 leading-relaxed">
                Mỗi thao tác giải ngân gắn liền với một khoá Idempotency duy nhất. Nếu mạng bị chập chờn hoặc gửi lại, hệ thống sẽ trả về giao dịch cũ mà không bao giờ trừ tiền lần hai.
              </p>
            </div>

            <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-md space-y-1.5">
              <div className="flex items-center gap-2 text-zinc-900 font-semibold">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>Tuyệt đối Không để Lộ Bí mật (Zero Secrets)</span>
              </div>
              <p className="text-zinc-600 leading-relaxed">
                Mọi thông tin API keys, private keys và chữ ký webhook chỉ đọc từ biến môi trường của hệ thống. Không bao giờ commit mã bí mật vào Git repository.
              </p>
            </div>
          </div>
        </div>

        {/* AI Safety Boundary Card */}
        <div className="bg-white rounded-lg border border-zinc-200 p-5 space-y-2">
          <div className="flex items-center gap-2">
            <Cpu size={18} className="text-zinc-900" />
            <h2 className="text-sm font-semibold text-zinc-900">
              Quy tắc An toàn Dành cho Trí tuệ Nhân tạo (Gemini AI)
            </h2>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Hệ thống tích hợp Gemini hoạt động hoàn toàn ở chế độ <strong>Cố vấn & Phân tích Độc lập</strong>. AI có thể hỗ trợ tính thuế TNCN 10%, phát hiện khoản chi bất thường và tóm tắt biên bản chi trả cho ban giám đốc. Về mặt kiến trúc, AI <strong>hoàn toàn không được cấp quyền</strong> gọi API chuyển tiền hoặc tự phê duyệt ngân sách.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
