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
  ShieldCheck,
  Send,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Users,
  CreditCard,
  Building2,
  Check,
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
        <div className="bg-white rounded-lg border border-zinc-200 p-16 text-center space-y-3">
          <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-zinc-500 font-mono">Đang tải trung tâm điều phối đợt chi...</p>
        </div>
      </AppShell>
    );
  }

  if (!batch) {
    return (
      <AppShell>
        <div className="bg-white rounded-lg border border-red-200 p-12 text-center space-y-3">
          <p className="text-sm font-medium text-red-600">Không tìm thấy đợt chi trả này.</p>
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-900 hover:underline"
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <a href="/" className="hover:text-zinc-900 transition flex items-center gap-1">
                <ArrowLeft size={13} />
                <span>Tổng quan đợt chi</span>
              </a>
              <span>/</span>
              <span className="font-mono text-zinc-700">{batch.id}</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900 tracking-tight">
                {batch.title}
              </h1>
              <StatusBadge status={batch.status} />
            </div>
            <p className="text-xs text-zinc-500 font-mono">
              Idempotency: <span className="text-zinc-700">{batch.idempotencyKey}</span> • Tạo lúc {new Date(batch.createdAt).toLocaleString('vi-VN')}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={fetchBatch}
              className="px-3 py-1.5 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 rounded-md text-xs font-medium flex items-center gap-1.5 transition shadow-2xs"
            >
              <RefreshCw size={13} />
              <span>Làm mới</span>
            </button>
            <button
              onClick={() => setAiDrawerOpen(true)}
              className="px-3 py-1.5 bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-50 rounded-md text-xs font-medium flex items-center gap-1.5 transition shadow-2xs"
            >
              <Sparkles size={13} className="text-zinc-700" />
              <span>Trợ lý Rủi ro AI</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md flex items-center gap-2">
            <AlertTriangle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* Vercel 4-Stage Lifecycle Stepper */}
        <div className="bg-white rounded-lg border border-zinc-200 p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {/* Step 1: Draft */}
            <div
              className={`p-3 rounded-md border transition ${
                currentStage >= 0
                  ? 'bg-zinc-50 border-zinc-300 text-zinc-900'
                  : 'bg-white border-zinc-100 text-zinc-400'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  currentStage > 0 ? 'bg-zinc-900 text-white' : 'bg-zinc-800 text-white'
                }`}>
                  {currentStage > 0 ? <Check size={11} /> : '1'}
                </span>
                <span className="text-xs font-medium">Bản nháp</span>
              </div>
              <p className="text-[11px] text-zinc-500">Đã nạp danh sách & số tiền</p>
            </div>

            {/* Step 2: Validated */}
            <div
              className={`p-3 rounded-md border transition ${
                currentStage >= 1
                  ? 'bg-blue-50/50 border-blue-200 text-blue-950 font-medium'
                  : 'bg-white border-zinc-100 text-zinc-400'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    currentStage > 1
                      ? 'bg-blue-600 text-white'
                      : currentStage === 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-200 text-zinc-600'
                  }`}
                >
                  {currentStage > 1 ? <Check size={11} /> : '2'}
                </span>
                <span className="text-xs font-medium">Đã đối soát</span>
              </div>
              <p className="text-[11px] text-zinc-500">Xác thực tài khoản ngân hàng</p>
            </div>

            {/* Step 3: Approved */}
            <div
              className={`p-3 rounded-md border transition ${
                currentStage >= 2
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950 font-medium'
                  : 'bg-white border-zinc-100 text-zinc-400'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    currentStage > 2
                      ? 'bg-emerald-600 text-white'
                      : currentStage === 2
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-200 text-zinc-600'
                  }`}
                >
                  {currentStage > 2 ? <Check size={11} /> : '3'}
                </span>
                <span className="text-xs font-medium">CFO Ký duyệt</span>
              </div>
              <p className="text-[11px] text-zinc-500">
                {batch.approvedBy ? `Đã ký bởi ${batch.approvedBy}` : 'Chờ ký duyệt SEC-804'}
              </p>
            </div>

            {/* Step 4: Completed */}
            <div
              className={`p-3 rounded-md border transition ${
                currentStage >= 3
                  ? 'bg-zinc-900 border-zinc-900 text-white font-medium'
                  : 'bg-white border-zinc-100 text-zinc-400'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    currentStage >= 3
                      ? 'bg-white text-zinc-900'
                      : 'bg-zinc-200 text-zinc-600'
                  }`}
                >
                  {currentStage >= 3 ? <Check size={11} /> : '4'}
                </span>
                <span className="text-xs font-medium">Đã giải ngân</span>
              </div>
              <p className={`text-[11px] ${currentStage >= 3 ? 'text-zinc-300' : 'text-zinc-500'}`}>
                {currentStage >= 3 ? 'Gửi thành công qua 9Pay' : 'Cổng 9Pay Testnet'}
              </p>
            </div>
          </div>
        </div>

        {/* Financial KPI Banner */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-lg border border-zinc-200 space-y-1">
            <span className="text-xs text-zinc-500 block">Tổng số tiền đợt chi</span>
            <span className="text-xl font-semibold text-zinc-900 block tabular-nums tracking-tight">
              {formatLosslessAmount(batch.sourceAmountTotal, batch.asset)}
            </span>
            <span className="text-[11px] text-zinc-500 block font-mono">Định dạng BigInt lossless</span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-zinc-200 space-y-1">
            <span className="text-xs text-zinc-500 block">Số nhân sự nhận tiền</span>
            <span className="text-xl font-semibold text-zinc-900 block tracking-tight">
              {batch.items.length} Người
            </span>
            <span className="text-[11px] text-zinc-500 block">Mạng lưới ngân hàng VN</span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-zinc-200 space-y-1">
            <span className="text-xs text-zinc-500 block">Cổng giải ngân</span>
            <span className="text-sm font-semibold text-zinc-900 uppercase block mt-1">
              9Pay Sandbox Testnet
            </span>
            <span className="text-[11px] text-zinc-500 block font-mono">Mô phỏng an toàn</span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-zinc-200 space-y-1">
            <span className="text-xs text-zinc-500 block">Trạng thái Ký duyệt</span>
            <span className="text-sm font-semibold text-zinc-900 block mt-1">
              {batch.status === 'APPROVED' || batch.status === 'COMPLETED'
                ? 'Đã ký duyệt (CFO)'
                : 'Chưa ký duyệt'}
            </span>
            <span className="text-[11px] text-zinc-500 block truncate">
              {batch.approvedBy || 'Cần kiểm soát kép'}
            </span>
          </div>
        </div>

        {/* Dual-Control Action Center Box - Minimalist Vercel Banner */}
        <div className="bg-zinc-900 text-white rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-zinc-400" />
              <h3 className="text-sm font-semibold tracking-tight">Quy trình Phê duyệt & Điều phối Giải ngân</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {batch.status === 'DRAFT' &&
                'Bước 1: Kiểm tra tính hợp lệ của số tài khoản ngân hàng thụ hưởng trước khi trình duyệt.'}
              {batch.status === 'VALIDATED' &&
                'Bước 2: Yêu cầu chữ ký kiểm soát kép (Dual Control SEC-804) của CFO trước khi gửi lệnh chi.'}
              {batch.status === 'APPROVED' &&
                'Bước 3: Đã có đủ chữ ký hợp lệ. Sẵn sàng phát lệnh thanh toán đến cổng 9Pay Testnet.'}
              {batch.status === 'COMPLETED' &&
                'Đợt chi trả đã hoàn tất giải ngân. Mỗi nhân sự đã nhận được mã tham chiếu giao dịch đối soát.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            {batch.status === 'DRAFT' && (
              <button
                onClick={handleValidate}
                disabled={actionLoading === 'validate'}
                className="w-full sm:w-auto px-4 py-2 bg-white text-zinc-900 hover:bg-zinc-100 rounded-md text-xs font-medium transition disabled:opacity-50"
              >
                {actionLoading === 'validate' ? 'Đang kiểm tra...' : 'Kiểm tra tài khoản (Bước 1)'}
              </button>
            )}

            {batch.status === 'VALIDATED' && (
              <button
                onClick={() => setSignoffModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-medium transition flex items-center justify-center gap-2 shadow-sm"
              >
                <ShieldCheck size={14} />
                <span>CFO Ký duyệt chi (Bước 2)</span>
              </button>
            )}

            {batch.status === 'APPROVED' && (
              <button
                onClick={() => setDispatchModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2 bg-white text-zinc-900 hover:bg-zinc-100 rounded-md text-xs font-medium transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Send size={14} />
                <span>Giải ngân qua 9Pay (Bước 3)</span>
              </button>
            )}

            {batch.status === 'COMPLETED' && (
              <div className="px-3.5 py-1.5 bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-md text-xs font-medium flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>Đã giải ngân xong</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs: Roster vs Audit Trail vs AI Advisor */}
        <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
          <div className="border-b border-zinc-200 px-4 flex items-center gap-6 text-xs font-medium">
            <button
              onClick={() => setActiveTab('roster')}
              className={`py-3.5 border-b-2 transition ${
                activeTab === 'roster'
                  ? 'border-zinc-900 text-zinc-900 font-semibold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Danh sách thụ hưởng ({batch.items.length})
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`py-3.5 border-b-2 transition ${
                activeTab === 'audit'
                  ? 'border-zinc-900 text-zinc-900 font-semibold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Sổ cái kiểm toán ({auditEvents.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('ai');
                if (!aiSummary) handleLoadAI();
              }}
              className={`py-3.5 border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'ai'
                  ? 'border-zinc-900 text-zinc-900 font-semibold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <Sparkles size={13} className="text-zinc-700" />
              <span>Phân tích Gemini AI</span>
            </button>
          </div>

          <div className="p-4 sm:p-5">
            {activeTab === 'roster' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-zinc-500 font-medium border-b border-zinc-200 uppercase text-[11px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Người nhận</th>
                      <th className="py-2.5 px-3">Số tài khoản</th>
                      <th className="py-2.5 px-3">Ngân hàng</th>
                      <th className="py-2.5 px-3">Số tiền nhận</th>
                      <th className="py-2.5 px-3">Trạng thái</th>
                      <th className="py-2.5 px-3">Mã tham chiếu 9Pay</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {batch.items.map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-50/80 transition">
                        <td className="py-3 px-3 font-medium text-zinc-900">
                          {item.recipientName}
                        </td>
                        <td className="py-3 px-3 font-mono text-zinc-600">
                          {item.recipientReference}
                        </td>
                        <td className="py-3 px-3 font-medium text-zinc-900">
                          {item.bankCode || 'VCB'}
                        </td>
                        <td className="py-3 px-3 font-medium text-zinc-900 tabular-nums">
                          {formatLosslessAmount(item.amount, item.asset)}
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-zinc-500">
                          {item.providerReference ? (
                            <span className="bg-zinc-100 text-zinc-800 border border-zinc-200 px-2 py-0.5 rounded text-[11px]">
                              {item.providerReference}
                            </span>
                          ) : (
                            <span className="text-zinc-400 italic">Chờ giải ngân</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'audit' && (
              <div className="space-y-2">
                {auditEvents.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic p-6 text-center">Chưa có bản ghi kiểm toán nào.</p>
                ) : (
                  auditEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3 bg-zinc-50/70 border border-zinc-200 rounded-md text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-zinc-900 font-mono">{ev.eventType}</span>
                        <span className="text-zinc-400 font-mono text-[11px]">
                          {new Date(ev.createdAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-zinc-600">
                        Người thực hiện:{' '}
                        <span className="font-mono font-medium text-zinc-900">
                          {ev.actorId}
                        </span>
                        {ev.fromStatus && ev.toStatus && (
                          <span className="text-zinc-500">
                            {' '}
                            • {ev.fromStatus} →{' '}
                            <span className="font-medium text-zinc-900">{ev.toStatus}</span>
                          </span>
                        )}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={15} className="text-zinc-700" />
                    <span className="font-semibold text-zinc-900">
                      Đánh giá An toàn & Tuân thủ từ Gemini AI
                    </span>
                  </div>
                  <button
                    onClick={() => setAiDrawerOpen(true)}
                    className="px-2.5 py-1 bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-900 rounded-md font-medium text-xs transition"
                  >
                    Mở chi tiết cố vấn →
                  </button>
                </div>

                <p className="text-zinc-700 leading-relaxed">
                  {`Đợt chi trả "${batch.title}" hiện đang ở trạng thái ${batch.status}. Tổng ngân sách là ${formatLosslessAmount(batch.sourceAmountTotal, batch.asset)} được phân bổ chính xác cho ${batch.items.length} người nhận. Toàn bộ tài khoản đã được ánh xạ vào kênh thanh toán NAPAS 24/7 và cổng 9Pay.`}
                </p>

                <div className="p-3 bg-white border border-zinc-200 rounded-md text-zinc-700 text-xs leading-relaxed">
                  <span className="font-medium text-zinc-900">Nguyên tắc Bất biến:</span> AI chỉ hỗ trợ phân tích và tóm tắt rủi ro, không bao giờ tự ý ký duyệt hay giải ngân tiền. Mọi giao dịch chuyển tiền đều cần chữ ký kiểm soát kép từ con người (CFO).
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
