'use client';

import React from 'react';

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            PB
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">PayBridge</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-800 border border-amber-300">
                Sandbox / Mock Simulation
              </span>
            </div>
            <p className="text-xs text-slate-500">Cross-Border Payout Settlement Service</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-800">Acme Global Ltd</p>
            <p className="text-xs text-slate-500">Role: Employer Admin & Approver</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-medium text-xs text-slate-700">
            AG
          </div>
        </div>
      </div>
    </header>
  );
}
