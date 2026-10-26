'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import {
  ShieldCheck,
  Search,
  Clock,
  CheckCircle2,
  Building,
  Key,
  FileText,
  BadgeCheck,
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
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Sổ cái Kiểm toán & Đối soát Giao dịch
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Ghi nhận bất biến (append-only) mọi sự kiện tạo đợt chi, đối soát ngân hàng, chữ ký CFO và mã tham chiếu từ cổng 9Pay.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs">
              <CheckCircle2 size={14} className="text-emerald-600" />
              <span>Sổ cái Bất biến Không thể xoá</span>
            </span>
          </div>
        </div>

        {/* Security Invariants Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft space-y-1">
            <span className="text-xs font-bold text-slate-500 block">
              Tổng số bản ghi sự kiện
            </span>
            <span className="text-2xl font-black text-slate-900">{events.length}</span>
            <span className="text-xs text-slate-400 block">Sự kiện vòng đời chi trả</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft space-y-1">
            <span className="text-xs font-bold text-slate-500 block">
              Chữ ký Kiểm soát kép (CFO)
            </span>
            <span className="text-2xl font-black text-indigo-700">
              {events.filter((e) => e.eventType === 'BATCH_APPROVED').length} Lượt duyệt
            </span>
            <span className="text-xs text-indigo-600 font-semibold block">
              Được bảo vệ bởi 2 lớp thẩm quyền
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft space-y-1">
            <span className="text-xs font-bold text-slate-500 block">
              Bảo mật Thông tin & Dữ liệu riêng
            </span>
            <span className="text-sm font-extrabold text-emerald-700 block mt-1">
              Khử định danh 100%
            </span>
            <span className="text-xs text-slate-400 block">
              Không lưu trữ mật khẩu hay khoá bí mật
            </span>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-soft flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Tìm theo người thực hiện, tên đợt chi trả hoặc mã đợt..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <span className="text-xs text-slate-500 font-bold whitespace-nowrap">
              Loại sự kiện:
            </span>
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 font-semibold focus:outline-none"
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
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F6] text-slate-500 font-bold border-b border-slate-200/80 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-4 px-5">Thời gian ghi nhận</th>
                  <th className="py-4 px-5">Loại sự kiện</th>
                  <th className="py-4 px-5">Đợt chi trả liên quan</th>
                  <th className="py-4 px-5">Người thực hiện</th>
                  <th className="py-4 px-5">Chuyển trạng thái</th>
                  <th className="py-4 px-5">Dữ liệu kiểm toán</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-400 italic">
                      Không có bản ghi nào khớp với bộ lọc tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  filtered.map((ev) => (
                    <tr key={ev.id} className="hover:bg-indigo-50/20 transition">
                      <td className="py-4 px-5 font-mono text-[11px] text-slate-500">
                        {new Date(ev.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="py-4 px-5">
                        <span className="font-mono font-bold text-[11px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">
                          {ev.eventType}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-bold text-slate-900">
                        <a
                          href={`/batches/${ev.batchId}`}
                          className="hover:text-indigo-600 hover:underline"
                        >
                          {ev.batchTitle || ev.batchId}
                        </a>
                      </td>
                      <td className="py-4 px-5 font-mono font-semibold text-slate-700">
                        {ev.actorId}
                      </td>
                      <td className="py-4 px-5">
                        {ev.fromStatus && ev.toStatus ? (
                          <span className="font-semibold text-slate-700">
                            {ev.fromStatus} →{' '}
                            <span className="text-emerald-700 font-bold">{ev.toStatus}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-4 px-5 font-mono text-[11px] text-slate-500 max-w-xs truncate">
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
