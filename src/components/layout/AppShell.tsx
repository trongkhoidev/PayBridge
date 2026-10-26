'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PlusCircle,
  Users,
  ShieldCheck,
  Settings,
  Building2,
  Menu,
  X,
  Sparkles,
  HeartHandshake,
  CheckCircle2,
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
      name: 'Tổng quan chi trả',
      subtext: 'Overview & Batches',
      href: '/',
      icon: LayoutDashboard,
      active: pathname === '/',
    },
    {
      name: 'Tạo đợt chi trả mới',
      subtext: 'New Payout Batch',
      href: '/batches/new',
      icon: PlusCircle,
      active: pathname === '/batches/new',
    },
    {
      name: 'Danh bạ nhân sự & Freelancer',
      subtext: 'Contractor Vault',
      href: '/recipients',
      icon: Users,
      active: pathname === '/recipients',
    },
    {
      name: 'Sổ cái kiểm toán & Đối soát',
      subtext: 'Audit & Compliance',
      href: '/audit',
      icon: ShieldCheck,
      active: pathname === '/audit',
    },
    {
      name: 'Cấu hình cổng thanh toán',
      subtext: '9Pay Rails & Config',
      href: '/settings',
      icon: Settings,
      active: pathname === '/settings',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col lg:flex-row text-slate-800 antialiased font-sans">
      {/* Mobile Header Bar */}
      <div className="lg:hidden bg-[#181C26] text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <a href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-sm">
            PB
          </div>
          <div>
            <span className="font-bold text-base tracking-tight">PayBridge</span>
            <span className="ml-2 text-[10px] font-semibold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
              9Pay Sandbox
            </span>
          </div>
        </a>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Desktop Sidebar (Warm, human, reassuring dark navy) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#181C26] text-slate-300 flex flex-col justify-between transition-transform duration-200 lg:static lg:translate-x-0 border-r border-slate-800/80 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo & App Brand */}
          <div className="p-6 border-b border-slate-800/80">
            <a href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-950/60 transition group-hover:scale-105">
                PB
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl text-white tracking-tight">
                    PayBridge
                  </span>
                </div>
                <p className="text-xs text-indigo-200/70 font-medium">
                  Chi trả nhân sự Việt Nam
                </p>
              </div>
            </a>

            {/* Sandbox Notice Tag - Friendly and Clear */}
            <div className="mt-5 p-3 bg-slate-800/70 rounded-xl border border-slate-700/60 flex items-start gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-1 animate-pulse shrink-0"></span>
              <div className="text-xs">
                <p className="font-semibold text-slate-200 flex items-center gap-1.5">
                  Môi trường Thử nghiệm
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Đang dùng 9Pay Sandbox & Mock. Không xử lý tiền thật.
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Quy trình chi trả
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                    item.active
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/40 translate-x-0.5'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <Icon
                    size={18}
                    className={item.active ? 'text-white shrink-0' : 'text-slate-400 shrink-0'}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="leading-tight truncate">{item.name}</p>
                    <p className={`text-[10px] font-normal truncate ${item.active ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {item.subtext}
                    </p>
                  </div>
                </a>
              );
            })}

            <div className="pt-5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Trợ lý thông minh
            </div>
            <a
              href="/#ai-assistant"
              className="flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition"
            >
              <div className="w-6 h-6 rounded-lg bg-amber-400/20 flex items-center justify-center shrink-0">
                <Sparkles size={14} className="text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-200">Trợ lý Rủi ro Gemini AI</p>
                <p className="text-[10px] text-slate-400">Kiểm tra thuế & bất thường</p>
              </div>
              <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full font-mono font-bold">
                AI
              </span>
            </a>
          </nav>

          {/* Tenant Profile Footer (Warm human avatar and role) */}
          <div className="p-4 border-t border-slate-800/80 bg-[#12151D]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center font-bold text-white text-sm shadow-inner">
                AG
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                  Acme Global Ltd
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  Tài khoản Doanh nghiệp (CFO)
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Desktop Topbar */}
        <header className="hidden lg:flex h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-8 items-center justify-between sticky top-0 z-30 transition">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Building2 size={16} className="text-indigo-600" />
              Acme Global Ltd
            </span>
            <span className="text-slate-300">/</span>
            <span className="px-2.5 py-1 rounded-full bg-slate-100 font-mono text-[11px] text-slate-700 border border-slate-200 font-medium">
              ID: emp_acme_vn
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-600 font-medium flex items-center gap-1">
              <HeartHandshake size={14} className="text-emerald-600" />
              Chi nhánh Việt Nam
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-xs font-semibold text-amber-900 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>Cổng 9Pay Testnet (Mô phỏng an toàn)</span>
            </div>

            <a
              href="/batches/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-600/30 transition hover:shadow-md hover:-translate-y-0.5"
            >
              <PlusCircle size={15} />
              <span>+ Tạo đợt chi trả mới</span>
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
