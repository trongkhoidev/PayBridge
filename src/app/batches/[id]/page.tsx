'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { StatusBadge } from '@/components/StatusBadge';
import { PayrollBatch, AuditEvent } from '@/types';
import { formatLosslessAmount } from '@/lib/utils/currency';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Send,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Users,
  Coins,
  Building,
  Check,
  FileText,
  CreditCard,
} from 'lucide-react';

import { DualControlSignoffModal } from '@/components/modals/DualControlSignoffModal';
import { SettlementDispatchModal } from '@/components/modals/SettlementDispatchModal';
import { GeminiAdvisorDrawer } from '@/components/modals/GeminiAdvisorDrawer';

export default function BatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [batch, setBatch] = useState<PayrollBatch | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'roster' | 'audit' | 'ai'>('roster');
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  // Modals state
  const [signoffModalOpen, setSignoffModalOpen] = useState(false);
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);

  const fetchBatch = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/batches/${id}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Không tìm thấy đợt chi trả');
      }
      setBatch(data.data.batch);
      setAuditEvents(data.data.auditTrail || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi khi tải thông tin đợt chi trả');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatch();
  }, [id]);

  const handleValidate = async () => {
    setActionLoading('validate');
    setError(null);
    try {
      const res = await fetch(`/api/batches/${id}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actorId: 'admin_compliance_officer' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      await fetchBatch();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Kiểm tra tài khoản thất bại');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async () => {
    setActionLoading('approve');
    setError(null);
    try {
      const res = await fetch(`/api/batches/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approverId: 'executive_cfo_signoff' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      await fetchBatch();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ký duyệt thất bại');
    } finally {
      setActionLoading(null);
    }
  };

  const handleExecute = async () => {
    setActionLoading('execute');
    setError(null);
    try {
      const res = await fetch(`/api/batches/${id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idempotencyKey: `EXEC-${batch?.id}-${Date.now()}`,
          actorId: 'admin_treasury_ops',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      await fetchBatch();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Giải ngân qua 9Pay thất bại');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLoadAI = async () => {
    setActionLoading('ai');
    setActiveTab('ai');
    try {
      const res = await fetch(`/api/batches/${id}/ai-summary`);
      const data = await res.json();
      if (data.success && data.data) {
        setAiSummary(data.data.summary);
      }
    } catch {
      // Ignored
    } finally {
      setActionLoading(null);
    }
  };

  if (loading && !batch) {
    return (
      <AppShell>
        <div className="bg-white rounded-2xl border border-slate-200/90 p-16 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500">Đang tải trung tâm điều phối đợt chi...</p>
        </div>
      </AppShell>
    );
  }

  if (!batch) {
    return (
      <AppShell>
        <div className="bg-white rounded-2xl border border-rose-200 p-12 text-center space-y-3">
          <p className="text-sm font-bold text-rose-700">Không tìm thấy đợt chi trả này.</p>
          <a
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:underline"
          >
            ← Quay lại danh sách tổng quan
          </a>
        </div>
      </AppShell>
    );
  }

  // Stepper Stage Calculation
  const stages = ['DRAFT', 'VALIDATED', 'APPROVED', 'COMPLETED'];
  const currentStage = stages.indexOf(batch.status);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition shadow-xs"
              title="Quay lại"
            >
              <ArrowLeft size={16} />
            </a>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {batch.title}
                </h1>
                <StatusBadge status={batch.status} />
              </div>
              <p className="text-xs text-slate-500 font-mono mt-1">
                Mã đợt chi: <span className="font-semibold text-slate-700">{batch.id}</span> • Khoá Idempotency: {batch.idempotencyKey}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchBatch}
              className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
            >
              <RefreshCw size={14} />
              <span>Cập nhật trạng thái</span>
            </button>
            <button
              onClick={() => setAiDrawerOpen(true)}
              className="px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
            >
              <Sparkles size={14} className="text-amber-500" />
              <span>Trợ lý Rủi ro AI</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Lifecycle Progress Stepper (Warm, human visual roadmap) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-soft">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
            Quy trình Duyệt chi & Giải ngân (4 Bước)
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Step 1: Draft */}
            <div
              className={`p-3.5 rounded-2xl border transition ${
                currentStage >= 0
                  ? 'bg-slate-50 border-slate-300 text-slate-900'
                  : 'bg-white border-slate-100 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <span className="text-xs font-bold">Bản nháp</span>
              </div>
              <p className="text-[11px] text-slate-500">Đã nạp danh sách & số tiền</p>
            </div>

            {/* Step 2: Validated */}
            <div
              className={`p-3.5 rounded-2xl border transition ${
                currentStage >= 1
                  ? 'bg-sky-50 border-sky-200 text-sky-950 font-medium'
                  : 'bg-white border-slate-100 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    currentStage >= 1
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  2
                </span>
                <span className="text-xs font-bold">Đã kiểm tra</span>
              </div>
              <p className="text-[11px] text-slate-500">Đối soát tài khoản ngân hàng</p>
            </div>

            {/* Step 3: Approved */}
            <div
              className={`p-3.5 rounded-2xl border transition ${
                currentStage >= 2
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950 font-medium'
                  : 'bg-white border-slate-100 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    currentStage >= 2
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  3
                </span>
                <span className="text-xs font-bold">CFO đã ký duyệt</span>
              </div>
              <p className="text-[11px] text-slate-500">
                {batch.approvedBy ? `Đã ký bởi ${batch.approvedBy}` : 'Chờ ký duyệt kiểm soát kép'}
              </p>
            </div>

            {/* Step 4: Dispatched / Completed */}
            <div
              className={`p-3.5 rounded-2xl border transition ${
                currentStage >= 3
                  ? 'bg-emerald-100/80 border-emerald-300 text-emerald-950 font-bold'
                  : 'bg-white border-slate-100 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    currentStage >= 3
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  4
                </span>
                <span className="text-xs font-bold">Đã chuyển tiền</span>
              </div>
              <p className="text-[11px] text-slate-500">Giải ngân 9Pay / NAPAS xong</p>
            </div>
          </div>
        </div>

        {/* Financial KPI Banner */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft space-y-1">
            <span className="text-xs font-bold text-slate-500 block">
              Tổng số tiền đợt chi
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 block tabular-nums">
              {formatLosslessAmount(batch.sourceAmountTotal, batch.asset)}
            </span>
            <span className="text-xs text-emerald-600 font-semibold block">
              ✓ Nguyên vẹn không làm tròn
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft space-y-1">
            <span className="text-xs font-bold text-slate-500 block">
              Số nhân sự nhận tiền
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 block">
              {batch.items.length} Người
            </span>
            <span className="text-xs text-slate-500 block">Mạng lưới ngân hàng VN</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft space-y-1">
            <span className="text-xs font-bold text-slate-500 block">
              Cổng giải ngân
            </span>
            <span className="text-sm font-extrabold text-amber-800 uppercase block mt-1">
              9Pay Sandbox Testnet
            </span>
            <span className="text-xs text-slate-500 block">Mô phỏng không mất phí</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft space-y-1">
            <span className="text-xs font-bold text-slate-500 block">
              Trạng thái Ký duyệt
            </span>
            <span className="text-sm font-extrabold text-slate-900 block mt-1">
              {batch.status === 'APPROVED' || batch.status === 'COMPLETED'
                ? 'Đã xác thực & Có chữ ký'
                : 'Đang chờ ký duyệt'}
            </span>
            <span className="text-xs text-slate-500 block">
              {batch.approvedBy || 'Cần CFO phê duyệt'}
            </span>
          </div>
        </div>

        {/* Dual-Control Action Center Box (Warm, reassuring design) */}
        <div className="bg-gradient-to-r from-[#1E2433] via-[#242C3F] to-[#1E2433] rounded-2xl p-6 text-white shadow-soft-lg flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <ShieldCheck size={20} className="text-amber-400" />
              <h3 className="text-base font-bold tracking-tight">Khu vực Phê duyệt & Điều phối Giải ngân</h3>
            </div>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              {batch.status === 'DRAFT' &&
                'Bước 1: Bấm kiểm tra để hệ thống xác thực định dạng số tài khoản ngân hàng của nhân sự.'}
              {batch.status === 'VALIDATED' &&
                'Bước 2: Phê duyệt kiểm soát kép (Dual Control). CFO hoặc người có thẩm quyền ký xác nhận đợt chi.'}
              {batch.status === 'APPROVED' &&
                'Bước 3: Đã sẵn sàng giải ngân! Bấm nút bên phải để gửi lệnh chi qua cổng 9Pay và chuyển mạch NAPAS 24/7.'}
              {batch.status === 'COMPLETED' &&
                'Đợt chi trả đã hoàn tất thành công! Tất cả người nhận đã được cấp mã tham chiếu giao dịch.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {batch.status === 'DRAFT' && (
              <button
                onClick={handleValidate}
                disabled={actionLoading === 'validate'}
                className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
              >
                {actionLoading === 'validate'
                  ? 'Đang kiểm tra tài khoản...'
                  : 'Kiểm tra tài khoản (Bước 1)'}
              </button>
            )}

            {batch.status === 'VALIDATED' && (
              <button
                onClick={() => setSignoffModalOpen(true)}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2 hover:shadow-lg"
              >
                <ShieldCheck size={16} />
                <span>CFO Ký duyệt chi (Bước 2)</span>
              </button>
            )}

            {batch.status === 'APPROVED' && (
              <button
                onClick={() => setDispatchModalOpen(true)}
                className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/40 transition flex items-center gap-2 hover:shadow-lg"
              >
                <Send size={15} />
                <span>Giải ngân qua 9Pay (Bước 3)</span>
              </button>
            )}

            {batch.status === 'COMPLETED' && (
              <div className="px-5 py-2.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>Chi trả thành công</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs: Roster vs Audit Trail vs AI Advisor */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft overflow-hidden">
          <div className="border-b border-slate-200/80 px-6 flex items-center gap-6 text-xs font-bold">
            <button
              onClick={() => setActiveTab('roster')}
              className={`py-4 border-b-2 transition ${
                activeTab === 'roster'
                  ? 'border-indigo-600 text-indigo-600 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Danh sách nhân sự thụ hưởng ({batch.items.length})
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`py-4 border-b-2 transition ${
                activeTab === 'audit'
                  ? 'border-indigo-600 text-indigo-600 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Lịch sử kiểm toán & Chữ ký ({auditEvents.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('ai');
                if (!aiSummary) handleLoadAI();
              }}
              className={`py-4 border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'ai'
                  ? 'border-indigo-600 text-indigo-600 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles size={14} className="text-amber-500" />
              <span>Phân tích rủi ro Gemini AI</span>
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'roster' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF9F6] text-slate-500 font-bold border-b border-slate-200/80 uppercase text-[11px] tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Người nhận</th>
                      <th className="py-3.5 px-4">Số tài khoản / SĐT ví</th>
                      <th className="py-3.5 px-4">Ngân hàng</th>
                      <th className="py-3.5 px-4">Số tiền nhận</th>
                      <th className="py-3.5 px-4">Trạng thái</th>
                      <th className="py-3.5 px-4">Mã tham chiếu 9Pay</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {batch.items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {item.recipientName}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          {item.recipientReference}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-indigo-700">
                          {item.bankCode || 'VCB'}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 tabular-nums text-sm">
                          {formatLosslessAmount(item.amount, item.asset)}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                          {item.providerReference ? (
                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold">
                              {item.providerReference}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Chờ giải ngân</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'audit' && (
              <div className="space-y-3">
                {auditEvents.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-6 text-center">Chưa có bản ghi kiểm toán nào.</p>
                ) : (
                  auditEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-4 bg-slate-50/90 border border-slate-200/80 rounded-2xl text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-700">{ev.eventType}</span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          {new Date(ev.createdAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-slate-600">
                        Người thực hiện:{' '}
                        <span className="font-mono font-bold text-slate-800">
                          {ev.actorId}
                        </span>
                        {ev.fromStatus && ev.toStatus && (
                          <span>
                            {' '}
                            | Chuyển trạng thái: <span className="font-semibold text-slate-700">{ev.fromStatus}</span> →{' '}
                            <span className="font-bold text-emerald-700">{ev.toStatus}</span>
                          </span>
                        )}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="p-6 bg-[#FAF9F6] rounded-2xl border border-slate-200/90 space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={17} className="text-amber-500" />
                    <span className="font-bold text-slate-900 text-sm">
                      Đánh giá An toàn & Tuân thủ từ Gemini AI
                    </span>
                  </div>
                  <button
                    onClick={() => setAiDrawerOpen(true)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs transition"
                  >
                    Mở khay phân tích đầy đủ →
                  </button>
                </div>

                <p className="text-slate-700 leading-relaxed font-medium">
                  {`Đợt chi trả "${batch.title}" hiện đang ở trạng thái ${batch.status}. Tổng ngân sách là ${formatLosslessAmount(batch.sourceAmountTotal, batch.asset)} được phân bổ chính xác cho ${batch.items.length} người nhận. Toàn bộ tài khoản đã được ánh xạ vào kênh thanh toán NAPAS 24/7 và cổng 9Pay.`}
                </p>

                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs leading-relaxed">
                  🔒 <strong>Nguyên tắc An toàn Tuyệt đối:</strong> Trí tuệ nhân tạo (AI) chỉ đóng vai trò phân tích và cố vấn, hoàn toàn không có quyền hạn tự ý bấm giải ngân hoặc chuyển tiền. Mọi lệnh chuyển tiền đều phải qua sự phê duyệt của con người (CFO).
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Interactive Modals */}
        <DualControlSignoffModal
          batch={batch}
          isOpen={signoffModalOpen}
          onClose={() => setSignoffModalOpen(false)}
          onConfirm={handleApprove}
        />

        <SettlementDispatchModal
          batch={batch}
          isOpen={dispatchModalOpen}
          onClose={() => setDispatchModalOpen(false)}
          onExecute={handleExecute}
        />

        <GeminiAdvisorDrawer
          batch={batch}
          isOpen={aiDrawerOpen}
          onClose={() => setAiDrawerOpen(false)}
        />
      </div>
    </AppShell>
  );
}
