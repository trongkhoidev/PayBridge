import React from 'react';
import { BatchStatus, PayoutItemStatus } from '@/types';

interface StatusBadgeProps {
  status: BatchStatus | PayoutItemStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  let colorStyles = 'bg-slate-100 text-slate-700 border-slate-300';

  switch (status) {
    case 'DRAFT':
    case 'PENDING':
      colorStyles = 'bg-slate-100 text-slate-700 border-slate-300';
      break;
    case 'VALIDATED':
      colorStyles = 'bg-blue-50 text-blue-700 border-blue-300';
      break;
    case 'QUOTED':
      colorStyles = 'bg-purple-50 text-purple-700 border-purple-300';
      break;
    case 'APPROVED':
      colorStyles = 'bg-emerald-50 text-emerald-800 border-emerald-300';
      break;
    case 'PROCESSING':
    case 'SUBMITTED':
      colorStyles = 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse';
      break;
    case 'COMPLETED':
    case 'SUCCESS':
      colorStyles = 'bg-green-100 text-green-900 border-green-400 font-semibold';
      break;
    case 'FAILED':
      colorStyles = 'bg-rose-100 text-rose-800 border-rose-300';
      break;
    case 'REQUIRES_REVIEW':
    case 'PARTIALLY_FAILED':
      colorStyles = 'bg-orange-100 text-orange-900 border-orange-300 font-medium';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorStyles}`}>
      {status}
    </span>
  );
}
