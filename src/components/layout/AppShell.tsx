'use client';

import React, { useState } from 'react';
import Link from 'next/navigation';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PlusCircle,
  Users,
  ShieldCheck,
  Settings,
  CreditCard,
  Building2,
  Menu,
  X,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      name: 'Overview & Batches',
      href: '/',
      icon: LayoutDashboard,
      active: pathname === '/',
    },
    {
      name: 'New Payout Batch',
      href: '/batches/new',
      icon: PlusCircle,
      active: pathname === '/batches/new',
    },
    {
      name: 'Contractor Vault',
      href: '/recipients',
      icon: Users,
      active: pathname === '/recipients',
    },
    {
      name: 'Audit & Compliance',
      href: '/audit',
      icon: ShieldCheck,
      active: pathname === '/audit',
    },
    {
      name: 'Payment Rails & Config',
      href: '/settings',
      icon: Settings,
      active: pathname === '/settings',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row text-slate-900 font-sans antialiased">
      {/* Mobile Header Bar */}
      <div className="lg:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <a href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-sm">
            PB
          </div>
          <div>
            <span className="font-bold text-base tracking-tight">PayBridge</span>
            <span className="ml-2 text-[10px] font-semibold bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-400/30">
              Sandbox
            </span>
          </div>
        </a>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo & App Brand */}
          <div className="p-5 border-b border-slate-800/80">
            <a href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-900/40">
                PB
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg text-white tracking-tight">
                    PayBridge
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 tracking-wide font-medium">
                  VN Contractor Settlement
                </p>
              </div>
            </a>

            {/* Sandbox Notice Tag */}
            <div className="mt-4 p-2 bg-slate-800/60 rounded-lg border border-slate-700/60 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <div className="text-[11px]">
                <p className="font-semibold text-slate-200">9Pay Sandbox / Mock</p>
                <p className="text-[10px] text-slate-400">Zero real money processed</p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Platform Workflow
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    item.active
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <Icon size={17} className={item.active ? 'text-white' : 'text-slate-400'} />
                  <span>{item.name}</span>
                </a>
              );
            })}

            <div className="pt-4 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              AI Intelligence
            </div>
            <a
              href="/#ai-assistant"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition"
            >
              <Sparkles size={17} className="text-amber-400" />
              <span>Gemini Risk Advisor</span>
              <span className="ml-auto text-[9px] bg-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded font-mono">
                AI
              </span>
            </a>
          </nav>

          {/* Tenant Profile Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/40">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-700/50 flex items-center justify-center font-bold text-xs text-indigo-300">
                AG
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">Acme Global Ltd</p>
                <p className="text-[11px] text-slate-400 truncate">Role: Admin & Approver</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Desktop Topbar */}
        <header className="hidden lg:flex h-16 bg-white border-b border-slate-200/80 px-8 items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Building2 size={15} className="text-indigo-600" />
              Acme Global Ltd
            </span>
            <span>/</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 font-mono text-[11px] text-slate-700 border border-slate-200">
              Tenant ID: emp_acme_vn
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200/80 rounded-full text-xs font-medium text-amber-900">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Testnet Simulator Active</span>
            </div>

            <a
              href="/batches/new"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              <PlusCircle size={15} />
              <span>New Payout Batch</span>
            </a>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
