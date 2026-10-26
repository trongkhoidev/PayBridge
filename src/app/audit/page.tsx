'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  FileText,
} from 'lucide-react';

interface AuditRow {
  id: string;
  batchId: string;
  batchTitle?: string;
  actorId: string;
  eventType: string;
  fromStatus?: string;
  toStatus?: string;
  metadataRedacted?: Record<string, unknown>;
  createdAt: string;
}

export default function AuditPage() {
  const [events, setEvents] = useState<AuditRow[]>([]);
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchAuditEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/audit');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setEvents(data.data);
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditEvents();
  }, []);

  const filtered = events.filter((ev) => {
    const matchesSearch =
      ev.batchId.toLowerCase().includes(search.toLowerCase()) ||
      ev.actorId.toLowerCase().includes(search.toLowerCase()) ||
      (ev.batchTitle && ev.batchTitle.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = eventFilter === 'ALL' || ev.eventType === eventFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900 tracking-tight">
              Sổ cái Kiểm toán & Đối soát Giao dịch
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Ghi nhận bất biến (append-only) mọi sự kiện tạo đợt chi, đối soát ngân hàng, chữ ký CFO và mã tham chiếu từ cổng 9Pay.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-3 py-1 bg-zinc-100 text-zinc-800 border border-zinc-200 rounded-md text-xs font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Sổ cái Bất biến (Append-only)</span>
            </span>
          </div>
        </div>

        {/* Security Invariants Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-lg border border-zinc-200 space-y-1">
            <span className="text-xs text-zinc-500 block">Tổng số sự kiện ghi nhận</span>
            <span className="text-2xl font-semibold text-zinc-900 tracking-tight">{events.length}</span>
            <span className="text-xs text-zinc-400 block font-mono">Sự kiện vòng đời đợt chi</span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-zinc-200 space-y-1">
            <span className="text-xs text-zinc-500 block">Chữ ký Kiểm soát kép (CFO)</span>
            <span className="text-2xl font-semibold text-zinc-900 tracking-tight">
              {events.filter((e) => e.eventType === 'BATCH_APPROVED').length} Lượt duyệt
            </span>
            <span className="text-xs text-zinc-500 block font-mono">Chuẩn SEC-804 phê duyệt</span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-zinc-200 space-y-1">
            <span className="text-xs text-zinc-500 block">Bảo mật & Dữ liệu riêng tư</span>
            <span className="text-sm font-semibold text-zinc-900 block mt-1">
              Khử định danh 100%
            </span>
            <span className="text-xs text-zinc-400 block font-mono">Không lưu secret hay private key</span>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-lg border border-zinc-200 p-3 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="text"
              placeholder="Tìm theo người thực hiện, tên đợt chi trả hoặc mã đợt..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 border border-zinc-200 rounded-md focus:outline-none focus:border-black font-normal placeholder:text-zinc-400 transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-zinc-500 whitespace-nowrap">Loại sự kiện:</span>
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="text-xs px-2.5 py-2 border border-zinc-200 rounded-md bg-white text-zinc-800 font-medium focus:outline-none focus:border-black transition"
            >
              <option value="ALL">Tất cả sự kiện</option>
              <option value="BATCH_CREATED">Tạo đợt chi (BATCH_CREATED)</option>
              <option value="BATCH_VALIDATED">Kiểm tra tài khoản (BATCH_VALIDATED)</option>
              <option value="BATCH_APPROVED">Ký duyệt chi (BATCH_APPROVED)</option>
              <option value="BATCH_EXECUTION_STARTED">Bắt đầu giải ngân (BATCH_EXECUTION_STARTED)</option>
              <option value="BATCH_EXECUTION_COMPLETED">Hoàn tất chi trả (BATCH_EXECUTION_COMPLETED)</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-zinc-500 font-medium border-b border-zinc-200 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Thời gian ghi nhận</th>
                  <th className="py-3 px-4">Loại sự kiện</th>
                  <th className="py-3 px-4">Đợt chi trả</th>
                  <th className="py-3 px-4">Người thực hiện</th>
                  <th className="py-3 px-4">Chuyển trạng thái</th>
                  <th className="py-3 px-4">Dữ liệu kiểm toán</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-zinc-400 italic">
                      Không có bản ghi nào khớp với bộ lọc tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  filtered.map((ev) => (
                    <tr key={ev.id} className="hover:bg-zinc-50/80 transition">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-500">
                        {new Date(ev.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-medium text-zinc-900 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded">
                          {ev.eventType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-zinc-900">
                        <a
                          href={`/batches/${ev.batchId}`}
                          className="hover:underline font-mono"
                        >
                          {ev.batchTitle || ev.batchId}
                        </a>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-700">
                        {ev.actorId}
                      </td>
                      <td className="py-3.5 px-4">
                        {ev.fromStatus && ev.toStatus ? (
                          <span className="text-zinc-600 font-mono text-[11px]">
                            {ev.fromStatus} →{' '}
                            <span className="text-zinc-900 font-medium">{ev.toStatus}</span>
                          </span>
                        ) : (
                          <span className="text-zinc-400 font-mono">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-500 max-w-xs truncate">
                        {ev.metadataRedacted
                          ? JSON.stringify(ev.metadataRedacted)
                          : 'None'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
