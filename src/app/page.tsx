'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { StatusBadge } from '@/components/StatusBadge';
import { PayrollBatch } from '@/types';
import { formatLosslessAmount, sumAmounts } from '@/lib/utils/currency';
import { GeminiAdvisorDrawer } from '@/components/modals/GeminiAdvisorDrawer';
import {
  Plus,
  Sparkles,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Users,
  Coins,
  Search,
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<PayrollBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
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

  // Filter batches by tab & search query
  const filteredBatches = batches.filter((b) => {
    const matchesTab = filterStatus === 'ALL' || b.status === filterStatus;
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // 1-Click Demo Simulator: creates, validates, approves & executes a 3-recipient batch
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
        {/* Vercel Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-950">
              Đợt chi trả nhân sự
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Quản lý, đối soát và giải ngân cho đội ngũ kỹ sư và freelancer tại Việt Nam.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fetchBatches()}
              className="p-2 text-zinc-600 hover:text-black bg-white border border-zinc-200 hover:bg-zinc-50 rounded-md shadow-vercel-sm transition"
              title="Làm mới danh sách"
            >
              <RefreshCw size={14} />
            </button>

            <button
              onClick={() => {
                if (batches.length > 0) setAiDrawerBatch(batches[0]);
              }}
              disabled={batches.length === 0}
              className="px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-md shadow-vercel-sm transition flex items-center gap-1.5 disabled:opacity-40"
            >
              <Sparkles size={13} className="text-zinc-500" />
              <span>Trợ lý Rủi ro AI</span>
            </button>

            <button
              onClick={handleRunFullDemoFlow}
              disabled={demoSimulating}
              className="px-3 py-1.5 text-xs font-medium text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-md shadow-vercel-sm transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>{demoSimulating ? 'Đang chạy mô phỏng...' : '⚡ Chạy thử 3 người'}</span>
            </button>

            <a
              href="/batches/new"
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-black hover:bg-zinc-800 rounded-md shadow-vercel-sm transition flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>Tạo đợt chi mới</span>
            </a>
          </div>
        </div>

        {/* Minimalist Vercel KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Disbursed */}
          <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-vercel-sm space-y-1">
            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block">
              Tổng số tiền đã giải ngân
            </span>
            <p className="text-2xl font-semibold text-zinc-950 tracking-tight tabular-nums">
              {formatLosslessAmount(totalDisbursedVND, 'VND')}
            </p>
            <span className="text-[11px] text-zinc-500 block pt-0.5">
              {completedBatches.length} đợt chi trả thành công
            </span>
          </div>

          {/* Card 2: Pending Approval */}
          <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-vercel-sm space-y-1">
            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block">
              Chờ ký duyệt (CFO)
            </span>
            <p className="text-2xl font-semibold text-zinc-950 tracking-tight tabular-nums">
              {pendingApprovalCount} đợt
            </p>
            <span className="text-[11px] text-amber-600 block pt-0.5">
              Cần xác nhận kiểm soát kép
            </span>
          </div>

          {/* Card 3: Drafts in Prep */}
          <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-vercel-sm space-y-1">
            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block">
              Bản nháp đang lập
            </span>
            <p className="text-2xl font-semibold text-zinc-950 tracking-tight tabular-nums">
              {draftCount} bản nháp
            </p>
            <span className="text-[11px] text-zinc-500 block pt-0.5">
              Chờ kiểm tra danh sách tài khoản
            </span>
          </div>

          {/* Card 4: 9Pay Rail */}
          <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-vercel-sm space-y-1">
            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block">
              Cổng thanh toán
            </span>
            <p className="text-sm font-semibold text-zinc-950 tracking-tight mt-1">
              9Pay Vietnam Sandbox
            </p>
            <span className="text-[11px] text-emerald-600 flex items-center gap-1.5 pt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              <span>Chuyển mạch NAPAS 24/7 sẵn sàng</span>
            </span>
          </div>
        </div>

        {/* Filter Navigation & Table Container */}
        <div className="bg-white rounded-lg border border-zinc-200 shadow-vercel-sm overflow-hidden">
          {/* Toolbar: Search input + Segmented Status Tabs */}
          <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                type="text"
                placeholder="Tìm kiếm đợt chi trả..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 border border-zinc-200 rounded-md focus:outline-none focus:border-zinc-400 font-normal bg-zinc-50/50"
              />
            </div>

            {/* Vercel Segmented Filter Control */}
            <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-md text-xs font-medium w-full sm:w-auto overflow-x-auto">
              {[
                { id: 'ALL', label: `Tất cả (${batches.length})` },
                { id: 'DRAFT', label: `Bản nháp (${draftCount})` },
                { id: 'VALIDATED', label: `Chờ duyệt (${pendingApprovalCount})` },
                {
                  id: 'APPROVED',
                  label: `Đã duyệt (${batches.filter((b) => b.status === 'APPROVED').length})`,
                },
                { id: 'COMPLETED', label: `Hoàn tất (${completedBatches.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterStatus(tab.id)}
                  className={`px-3 py-1 rounded text-xs transition whitespace-nowrap ${
                    filterStatus === tab.id
                      ? 'bg-white text-black font-semibold shadow-vercel-sm'
                      : 'text-zinc-600 hover:text-black'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table or Empty State */}
          {loading && batches.length === 0 ? (
            <div className="p-16 text-center text-xs text-zinc-400">
              Đang tải danh sách đợt chi...
            </div>
          ) : filteredBatches.length === 0 ? (
            <div className="p-16 text-center max-w-sm mx-auto space-y-3">
              <div className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto text-sm font-semibold">
                —
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">
                  {filterStatus === 'ALL'
                    ? 'Chưa có đợt chi trả nào'
                    : `Không tìm thấy đợt chi nào ở mục "${filterStatus}"`}
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Bắt đầu bằng việc tạo đợt chi trả mới hoặc chạy thử nghiệm mẫu.
                </p>
              </div>
              <div className="pt-2">
                <a
                  href="/batches/new"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-zinc-800 text-white rounded-md text-xs font-medium shadow-vercel-sm transition"
                >
                  <Plus size={14} />
                  <span>Tạo đợt chi đầu tiên</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50/70 text-zinc-500 font-medium border-b border-zinc-200 uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Tên đợt chi trả</th>
                    <th className="py-3 px-4">Số người nhận</th>
                    <th className="py-3 px-4">Tổng số tiền (VND)</th>
                    <th className="py-3 px-4">Cổng chi trả</th>
                    <th className="py-3 px-4">Trạng thái</th>
                    <th className="py-3 px-4">Ngày tạo</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredBatches.map((b) => (
                    <tr
                      key={b.id}
                      onClick={() => router.push(`/batches/${b.id}`)}
                      className="hover:bg-zinc-50/80 transition cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-medium text-zinc-900">
                        <div className="group-hover:text-black transition font-semibold">
                          {b.title}
                        </div>
                        <div className="text-[11px] font-mono text-zinc-400">
                          {b.id}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-600 font-normal">
                        {b.items.length} người nhận
                      </td>
                      <td className="py-3.5 px-4 font-medium text-zinc-950 tabular-nums">
                        {formatLosslessAmount(b.sourceAmountTotal, b.asset)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] font-mono text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                          {b.provider === 'mock' ? '9pay-testnet' : b.provider}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-zinc-500">
                        {new Date(b.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-zinc-700 group-hover:text-black hover:underline">
                          <span>Chi tiết</span>
                          <ArrowRight size={12} />
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
