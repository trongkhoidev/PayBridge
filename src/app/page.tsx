'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { StatusBadge } from '@/components/StatusBadge';
import { PayrollBatch } from '@/types';
import { formatLosslessAmount, sumAmounts } from '@/lib/utils/currency';
import { GeminiAdvisorDrawer } from '@/components/modals/GeminiAdvisorDrawer';
import {
  PlusCircle,
  Sparkles,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Users,
  Coins,
  Send,
  Zap,
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<PayrollBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [demoSimulating, setDemoSimulating] = useState(false);
  const [aiDrawerBatch, setAiDrawerBatch] = useState<PayrollBatch | null>(null);

  const fetchBatches = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/batches');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setBatches(data.data);
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  // Compute Total Disbursed safely using lossless BigInt
  const completedBatches = batches.filter((b) => b.status === 'COMPLETED');
  let totalDisbursedVND = '0';
  try {
    if (completedBatches.length > 0) {
      totalDisbursedVND = sumAmounts(completedBatches.map((b) => b.sourceAmountTotal));
    }
  } catch {
    totalDisbursedVND = '0';
  }

  const pendingApprovalCount = batches.filter((b) => b.status === 'VALIDATED').length;
  const draftCount = batches.filter((b) => b.status === 'DRAFT').length;

  // Filter batches by tab
  const filteredBatches = batches.filter((b) => {
    if (filterStatus === 'ALL') return true;
    return b.status === filterStatus;
  });

  // Instant 1-Click Demo Simulator: creates, validates, approves & executes a 3-recipient batch
  const handleRunFullDemoFlow = async () => {
    setDemoSimulating(true);
    try {
      // 1. Create
      const createRes = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Đợt chi trả Sprint 42 (Mô phỏng lúc ${new Date().toLocaleTimeString('vi-VN')})`,
          employerId: 'emp_acme_vn',
          asset: 'VND',
          items: [
            {
              recipientName: 'Nguyễn Văn An',
              recipientReference: '9704050012345678',
              bankCode: 'VCB',
              amount: '15000000',
              asset: 'VND',
            },
            {
              recipientName: 'Trần Thị Mai',
              recipientReference: '9704220087654321',
              bankCode: 'MB',
              amount: '22000000',
              asset: 'VND',
            },
            {
              recipientName: 'Lê Hoàng Long',
              recipientReference: '0912345678',
              bankCode: '9PAY_WALLET',
              amount: '8500000',
              asset: 'VND',
            },
          ],
        }),
      });
      const createData = await createRes.json();
      const newId = createData.data.id;

      // 2. Validate
      await fetch(`/api/batches/${newId}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actorId: 'admin_compliance_demo' }),
      });

      // 3. Approve
      await fetch(`/api/batches/${newId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approverId: 'executive_cfo_signoff' }),
      });

      // 4. Execute
      await fetch(`/api/batches/${newId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idempotencyKey: `DEMO-EXEC-${newId}`,
          actorId: 'admin_treasury_ops',
        }),
      });

      await fetchBatches();
      router.push(`/batches/${newId}`);
    } finally {
      setDemoSimulating(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Human Welcome & Greeting Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-white via-indigo-50/40 to-amber-50/30 p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-soft">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span>Cổng thanh toán tự động & đối soát an toàn</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                Xin chào, Acme Global! 👋
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                Hôm nay bạn có thể tạo đợt chi trả mới, đối soát tài khoản ngân hàng NAPAS 24/7 và ký duyệt kiểm soát kép để giải ngân tức thì cho nhân sự tại Việt Nam.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={() => fetchBatches()}
                className="p-2.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-xs transition"
                title="Làm mới dữ liệu"
              >
                <RefreshCw size={16} />
              </button>

              <button
                onClick={() => {
                  if (batches.length > 0) setAiDrawerBatch(batches[0]);
                }}
                disabled={batches.length === 0}
                className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-xs transition flex items-center gap-2 disabled:opacity-40"
              >
                <Sparkles size={15} className="text-amber-500" />
                <span>Trợ lý Rủi ro AI</span>
              </button>

              <button
                onClick={handleRunFullDemoFlow}
                disabled={demoSimulating}
                className="px-4 py-2.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-xl shadow-xs transition flex items-center gap-2 disabled:opacity-50"
              >
                <Zap size={15} className="text-amber-500" />
                <span>
                  {demoSimulating ? 'Đang chạy mô phỏng 4 bước...' : '⚡ Chạy thử đợt chi trả mẫu'}
                </span>
              </button>

              <a
                href="/batches/new"
                className="px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-600/30 transition flex items-center gap-2 hover:shadow-md hover:-translate-y-0.5"
              >
                <PlusCircle size={15} />
                <span>+ Tạo đợt chi trả</span>
              </a>
            </div>
          </div>
        </div>

        {/* Warm & Approachable KPI Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Total Disbursed */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-soft space-y-2 hover:border-emerald-200 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Đã giải ngân
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Coins size={16} />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight tabular-nums">
              {formatLosslessAmount(totalDisbursedVND, 'VND')}
            </p>
            <p className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-500" />
              <span>{completedBatches.length} đợt chi trả thành công</span>
            </p>
          </div>

          {/* Pending Approval */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-soft space-y-2 hover:border-amber-200 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Chờ ký duyệt
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock size={16} />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight tabular-nums">
              {pendingApprovalCount} đợt
            </p>
            <p className="text-xs text-amber-700 font-medium">
              Cần CFO ký duyệt kiểm soát kép
            </p>
          </div>

          {/* Draft Batches */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-soft space-y-2 hover:border-indigo-200 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Đang chuẩn bị
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <TrendingUp size={16} />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight tabular-nums">
              {draftCount} bản nháp
            </p>
            <p className="text-xs text-indigo-600 font-medium">
              Chờ kiểm tra danh sách tài khoản
            </p>
          </div>

          {/* Settlement Rail */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-soft space-y-2 hover:border-slate-300 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Cổng liên kết
              </span>
              <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <ShieldCheck size={16} />
              </div>
            </div>
            <p className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight mt-1">
              9Pay Testnet (Chi Hộ)
            </p>
            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              <span>Sẵn sàng chuyển tiền NAPAS 24/7</span>
            </p>
          </div>
        </div>

        {/* Filter Navigation & Batches View */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft overflow-hidden">
          {/* Status Tabs Header */}
          <div className="border-b border-slate-200/80 px-6 flex items-center gap-6 overflow-x-auto text-xs font-bold">
            {[
              { id: 'ALL', label: `Tất cả đợt chi (${batches.length})` },
              { id: 'DRAFT', label: `Bản nháp (${draftCount})` },
              { id: 'VALIDATED', label: `Chờ ký duyệt (${pendingApprovalCount})` },
              {
                id: 'APPROVED',
                label: `Đã duyệt (${batches.filter((b) => b.status === 'APPROVED').length})`,
              },
              { id: 'COMPLETED', label: `Đã hoàn thành (${completedBatches.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`py-4 border-b-2 transition whitespace-nowrap ${
                  filterStatus === tab.id
                    ? 'border-indigo-600 text-indigo-600 font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Batches Table or Empty State */}
          {loading && batches.length === 0 ? (
            <div className="p-16 text-center text-xs text-slate-500 space-y-2">
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p>Đang tải danh sách các đợt chi trả...</p>
            </div>
          ) : filteredBatches.length === 0 ? (
            <div className="p-16 text-center max-w-md mx-auto space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-2xl shadow-xs">
                💳
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {filterStatus === 'ALL'
                    ? 'Chưa có đợt chi trả nào'
                    : `Không có đợt nào ở trạng thái "${filterStatus}"`}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Bạn có thể tạo mới một đợt chi trả lương hoặc bấm nút chạy thử nghiệm để trải nghiệm toàn bộ luồng duyệt chi và giải ngân.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleRunFullDemoFlow}
                  className="px-4 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Sparkles size={14} className="text-amber-500" />
                  <span>Chạy thử đợt chi trả 3 người</span>
                </button>
                <a
                  href="/batches/new"
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                >
                  + Tạo đợt mới
                </a>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF9F6] text-slate-500 font-bold border-b border-slate-200/80 uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-4 px-5">Tên đợt chi trả & Mã</th>
                    <th className="py-4 px-5">Số người nhận</th>
                    <th className="py-4 px-5">Tổng số tiền (Chính xác)</th>
                    <th className="py-4 px-5">Cổng chi trả</th>
                    <th className="py-4 px-5">Trạng thái</th>
                    <th className="py-4 px-5">Thời gian tạo</th>
                    <th className="py-4 px-5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBatches.map((b) => (
                    <tr
                      key={b.id}
                      onClick={() => router.push(`/batches/${b.id}`)}
                      className="hover:bg-indigo-50/30 transition cursor-pointer group"
                    >
                      <td className="py-4 px-5 font-bold text-slate-900">
                        <div className="group-hover:text-indigo-600 transition text-sm">{b.title}</div>
                        <div className="text-[11px] font-mono text-slate-400 font-normal">
                          {b.id}
                        </div>
                      </td>
                      <td className="py-4 px-5 text-slate-600 font-medium">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                          <Users size={12} className="text-slate-500" />
                          <span>{b.items.length} người</span>
                        </span>
                      </td>
                      <td className="py-4 px-5 font-bold text-slate-900 text-sm tabular-nums">
                        {formatLosslessAmount(b.sourceAmountTotal, b.asset)}
                      </td>
                      <td className="py-4 px-5">
                        <span className="font-semibold text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wide">
                          {b.provider === 'mock' ? '9Pay Sandbox' : b.provider}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="py-4 px-5 text-[11px] text-slate-500 font-medium">
                        {new Date(b.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 group-hover:text-white bg-indigo-50 group-hover:bg-indigo-600 px-3.5 py-2 rounded-xl transition shadow-xs">
                          <span>Chi tiết</span>
                          <ArrowRight size={13} />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Gemini AI Advisor Drawer */}
      <GeminiAdvisorDrawer
        batch={aiDrawerBatch || (batches.length > 0 ? batches[0] : null)}
        isOpen={Boolean(aiDrawerBatch)}
        onClose={() => setAiDrawerBatch(null)}
      />
    </AppShell>
  );
}
