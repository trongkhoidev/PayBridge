import React from 'react';
import { BatchStatus, PayoutItemStatus } from '@/types';
import { CheckCircle2, Clock, ShieldCheck, AlertCircle, RefreshCw, FileText } from 'lucide-react';

interface StatusBadgeProps {
  status: BatchStatus | PayoutItemStatus;
  showIcon?: boolean;
}

export function StatusBadge({ status, showIcon = true }: StatusBadgeProps) {
  let colorStyles = 'bg-slate-100 text-slate-700 border-slate-200';
  let label = status as string;
  let Icon = Clock;

  switch (status) {
    case 'DRAFT':
      colorStyles = 'bg-stone-100 text-stone-700 border-stone-200';
      label = 'Bản nháp';
      Icon = FileText;
      break;
    case 'PENDING':
      colorStyles = 'bg-amber-50 text-amber-800 border-amber-200';
      label = 'Chờ xử lý';
      Icon = Clock;
      break;
    case 'VALIDATED':
      colorStyles = 'bg-sky-50 text-sky-800 border-sky-200';
      label = 'Đã kiểm tra';
      Icon = CheckCircle2;
      break;
    case 'QUOTED':
      colorStyles = 'bg-purple-50 text-purple-800 border-purple-200';
      label = 'Đã tính phí';
      Icon = Clock;
      break;
    case 'APPROVED':
      colorStyles = 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold';
      label = 'Đã duyệt chi';
      Icon = ShieldCheck;
      break;
    case 'PROCESSING':
    case 'SUBMITTED':
      colorStyles = 'bg-indigo-50 text-indigo-800 border-indigo-200 animate-pulse';
      label = 'Đang chuyển tiền';
      Icon = RefreshCw;
      break;
    case 'COMPLETED':
    case 'SUCCESS':
      colorStyles = 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
      label = 'Thành công';
      Icon = CheckCircle2;
      break;
    case 'FAILED':
      colorStyles = 'bg-rose-50 text-rose-800 border-rose-200 font-medium';
      label = 'Thất bại';
      Icon = AlertCircle;
      break;
    case 'REQUIRES_REVIEW':
    case 'PARTIALLY_FAILED':
      colorStyles = 'bg-amber-100 text-amber-900 border-amber-300 font-medium';
      label = 'Cần xem xét';
      Icon = AlertCircle;
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border shadow-xs transition-colors ${colorStyles}`}>
      {showIcon && <Icon size={13} className="shrink-0" />}
      <span>{label}</span>
      <span className="text-[10px] opacity-60 font-mono">({status})</span>
    </span>
  );
}
