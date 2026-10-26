import React from 'react';
import { BatchStatus, PayoutItemStatus } from '@/types';

interface StatusBadgeProps {
  status: BatchStatus | PayoutItemStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  let dotColor = 'bg-zinc-400';
  let label = status as string;

  switch (status) {
    case 'DRAFT':
      dotColor = 'bg-zinc-400';
      label = 'Bản nháp';
      break;
    case 'PENDING':
      dotColor = 'bg-amber-400';
      label = 'Chờ duyệt';
      break;
    case 'VALIDATED':
      dotColor = 'bg-sky-500';
      label = 'Đã kiểm tra';
      break;
    case 'QUOTED':
      dotColor = 'bg-purple-500';
      label = 'Đã báo giá';
      break;
    case 'APPROVED':
      dotColor = 'bg-blue-600';
      label = 'Đã duyệt';
      break;
    case 'PROCESSING':
    case 'SUBMITTED':
      dotColor = 'bg-indigo-500 animate-pulse';
      label = 'Đang chuyển tiền';
      break;
    case 'COMPLETED':
    case 'SUCCESS':
      dotColor = 'bg-emerald-500';
      label = 'Hoàn tất';
      break;
    case 'FAILED':
      dotColor = 'bg-red-500';
      label = 'Thất bại';
      break;
    case 'REQUIRES_REVIEW':
    case 'PARTIALLY_FAILED':
      dotColor = 'bg-amber-500';
      label = 'Cần kiểm tra';
      break;
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-white border border-zinc-200 text-zinc-800 shadow-vercel-sm">
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{label}</span>
      <span className="text-[10px] text-zinc-400 font-mono">({status})</span>
    </span>
  );
}
