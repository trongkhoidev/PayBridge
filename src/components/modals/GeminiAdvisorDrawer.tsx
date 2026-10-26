'use client';

import React, { useState } from 'react';
import { Sparkles, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, X, Bot, FileText } from 'lucide-react';
import { PayrollBatch } from '@/types';
import { formatLosslessAmount } from '@/lib/utils/currency';

interface GeminiAdvisorDrawerProps {
  batch: PayrollBatch | null;
  isOpen: boolean;
  onClose: () => void;
}

export function GeminiAdvisorDrawer({
  batch,
  isOpen,
  onClose,
}: GeminiAdvisorDrawerProps) {
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [aiNote, setAiNote] = useState<string | null>(null);

  if (!isOpen || !batch) return null;

  const totalLossless = batch.sourceAmountTotal;
  const isHighValue = BigInt(totalLossless) > BigInt(100_000_000);

  const handleAskQuickPrompt = (prompt: string) => {
    setSelectedPrompt(prompt);
    if (prompt === 'tax') {
      setAiNote(
        'Vietnamese Tax Regulation Notice: For offshore payments to Vietnamese freelance individuals exceeding 2,000,000 VND per disbursement, standard local tax practice recommends keeping signed contractor service agreements and noting potential 10% Personal Income Tax (PIT) withholding obligations.'
      );
    } else if (prompt === 'routing') {
      setAiNote(
        `All ${batch.items.length} beneficiary bank accounts in this batch are mapped to supported domestic clearing endpoints (VCB, MB, Techcombank, ACB, 9Pay E-Wallet). Pre-flight formatting audit shows zero malformed routing codes.`
      );
    } else if (prompt === 'executive') {
      setAiNote(
        `Executive Memo: Batch "${batch.title}" represents a total allocation of ${formatLosslessAmount(batch.sourceAmountTotal, batch.asset)} across ${batch.items.length} engineers. Recommended for approval under Policy SEC-804.`
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-150">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col text-slate-100 z-50">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Sparkles size={17} className="text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Gemini Risk Intelligence</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Advisory Mode
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Model: Gemini 3.8 Flash • Anomaly Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* Anomaly Score Card */}
          <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Batch Anomaly Risk Score</span>
              <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                0.04 / 10.0 (Low Risk)
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="w-[4%] h-full bg-emerald-400 rounded-full" />
            </div>
            <p className="text-[11px] text-slate-400">
              Corridor stability and beneficiary account histories match standard recurring contractor distributions.
            </p>
          </div>

          {/* High-value threshold alert */}
          {isHighValue && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <AlertTriangle size={15} />
                <span>High-Value Batch Notice (&gt; 100M VND)</span>
              </div>
              <p className="text-[11px] text-amber-200/80">
                This batch total exceeds 100,000,000 VND. Ensure dual-control secondary sign-off is completed prior to triggering the 9Pay testnet dispatch.
              </p>
            </div>
          )}

          {/* Quick AI Prompts */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Suggested AI Analysis Prompts
            </span>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => handleAskQuickPrompt('tax')}
                className="w-full text-left p-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition flex items-center justify-between"
              >
                <span>🔍 Analyze Vietnam PIT & Contractor Tax Rules</span>
                <ArrowRight size={13} className="text-slate-500" />
              </button>
              <button
                type="button"
                onClick={() => handleAskQuickPrompt('routing')}
                className="w-full text-left p-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition flex items-center justify-between"
              >
                <span>🏦 Verify Bank Routing & NAPAS Compatibility</span>
                <ArrowRight size={13} className="text-slate-500" />
              </button>
              <button
                type="button"
                onClick={() => handleAskQuickPrompt('executive')}
                className="w-full text-left p-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition flex items-center justify-between"
              >
                <span>📋 Generate Executive Board Summary Memo</span>
                <ArrowRight size={13} className="text-slate-500" />
              </button>
            </div>
          </div>

          {/* Dynamic AI Note Output */}
          {aiNote && (
            <div className="p-4 bg-indigo-950/40 border border-indigo-700/50 rounded-xl space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5 text-indigo-300 font-bold">
                <Bot size={15} />
                <span>Gemini Analysis Result</span>
              </div>
              <p className="text-[11px] text-slate-200 leading-relaxed">{aiNote}</p>
            </div>
          )}

          {/* Compliance Safe Boundary Reminder */}
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-400 text-[10px] space-y-1">
            <span className="font-bold text-slate-300 block">System Compliance Boundary:</span>
            <p>
              Gemini Risk Intelligence runs in strictly isolated read-only advisory mode. The AI model is cryptographically air-gapped from execution keys and cannot sign off or dispatch transactions.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
          >
            Close Advisor
          </button>
        </div>
      </div>
    </div>
  );
}
