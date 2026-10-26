'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import {
  Settings,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building,
  Key,
  Server,
  Cpu,
  Layers,
  HeartHandshake,
} from 'lucide-react';

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Cấu hình Kênh Thanh toán & Nguyên tắc An toàn
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Thiết lập adapter cổng chi hộ 9Pay, cơ chế mô phỏng an toàn và các nguyên tắc bảo vệ tài chính bất biến.
          </p>
        </div>

        {/* Provider Adapter Grid */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Các Kênh Kết nối & Cổng Thanh toán
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 9Pay Adapter */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-soft space-y-3 hover:border-indigo-200 transition">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-black text-sm">
                  9P
                </div>
                <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-[10px] font-bold">
                  Testnet Chi Hộ
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">9Pay Vietnam Gateway</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Cổng thanh toán chi hộ nội địa Việt Nam, chuyển mạch NAPAS 24/7 và ví điện tử 9Pay.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 text-[11px] space-y-1 text-slate-600 font-mono">
                <div>Endpoint: sandbox.9pay.vn</div>
                <div>Trạng thái: Sẵn sàng nạp API Keys</div>
              </div>
            </div>

            {/* Mock Adapter */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-soft space-y-3 hover:border-emerald-200 transition">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-black text-sm">
                  SIM
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-bold">
                  Đang hoạt động (Demo)
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Mock Payout Simulator</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Bộ mô phỏng chuyển tiền chính xác cao, tạo mã tham chiếu thật và chống trùng lặp giao dịch.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 text-[11px] space-y-1 text-slate-600 font-mono">
                <div>Độ trễ phản hồi: 500ms</div>
                <div>Tỷ lệ thành công: 100% (Sandbox)</div>
              </div>
            </div>

            {/* Stellar SEP-31 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-soft space-y-3 opacity-80">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-black text-sm">
                  XLM
                </div>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-[10px] font-bold">
                  Giai đoạn tương lai
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Stellar SEP-31 Anchor Rail</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Giao thức cầu nối thanh toán xuyên biên giới crypto-to-fiat qua đối tác anchor.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 text-[11px] space-y-1 text-slate-600 font-mono">
                <div>Trạng thái: Nằm ngoài MVP đầu tiên</div>
                <div>Đối tác: Đang xác minh</div>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Financial Invariants Checklist */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-soft space-y-5">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={20} className="text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Các Nguyên tắc An toàn Tài chính Bất biến (Financial Invariants)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 sm:p-5 bg-[#FAF9F6] border border-slate-200/90 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <CheckCircle2 size={16} />
                <span>Toán học Chính xác Tuyệt đối (Lossless Math)</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Tất cả số tiền VND được tính toán bằng số nguyên lớn <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold">BigInt</code> và chuỗi số học. Tuyệt đối không dùng số thực dấu phẩy động (float) để tránh sai lệch dù chỉ 1 đồng.
              </p>
            </div>

            <div className="p-4 sm:p-5 bg-[#FAF9F6] border border-slate-200/90 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <CheckCircle2 size={16} />
                <span>Kiểm soát kép Phê duyệt (SEC-804 / BR-01)</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Các đợt chi trả ở trạng thái <code className="font-mono font-bold">BẢN NHÁP</code> hoặc <code className="font-mono font-bold">ĐÃ KIỂM TRA</code> bị khoá cứng, không thể tự giải ngân nếu chưa có chữ ký xác nhận của người có thẩm quyền (CFO).
              </p>
            </div>

            <div className="p-4 sm:p-5 bg-[#FAF9F6] border border-slate-200/90 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <CheckCircle2 size={16} />
                <span>Khoá Chống Trùng lặp Giao dịch (Idempotency)</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Mỗi thao tác giải ngân gắn liền với một khoá Idempotency duy nhất. Nếu đường truyền mạng bị lỗi hoặc gửi lại nhiều lần, hệ thống sẽ trả về giao dịch cũ mà không bao giờ trừ tiền lần hai.
              </p>
            </div>

            <div className="p-4 sm:p-5 bg-[#FAF9F6] border border-slate-200/90 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <CheckCircle2 size={16} />
                <span>Tuyệt đối Không để Lộ Bí mật (Zero Secrets)</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Mọi thông tin API keys, private keys và chữ ký webhook chỉ đọc từ biến môi trường của hệ thống. Không bao giờ commit mã bí mật vào Git repository.
              </p>
            </div>
          </div>
        </div>

        {/* AI Safety Boundary Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-soft space-y-3">
          <div className="flex items-center gap-2.5">
            <Cpu size={20} className="text-amber-500" />
            <h2 className="text-base font-bold text-slate-900">
              Quy tắc An toàn Dành cho Trí tuệ Nhân tạo (Gemini AI)
            </h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Hệ thống tích hợp Gemini hoạt động hoàn toàn ở chế độ <strong>Cố vấn & Phân tích Độc lập</strong>. AI có thể hỗ trợ tính thuế TNCN 10%, phát hiện khoản chi bất thường và tóm tắt biên bản chi trả cho ban giám đốc. Về mặt kiến trúc, AI <strong>hoàn toàn không được cấp quyền</strong> gọi API chuyển tiền hoặc tự phê duyệt ngân sách.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
