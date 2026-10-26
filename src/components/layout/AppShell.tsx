'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Plus,
  Users,
  ShieldCheck,
  Settings,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Menu,
  X,
  CreditCard,
  Building2,
} from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    {
      name: 'Tổng quan đợt chi',
      en: 'Overview',
      href: '/',
      active: pathname === '/',
    },
    {
      name: 'Tạo đợt chi mới',
      en: 'New Batch',
      href: '/batches/new',
      active: pathname === '/batches/new',
    },
    {
      name: 'Danh bạ nhân sự',
      en: 'Contractors',
      href: '/recipients',
      active: pathname === '/recipients',
    },
    {
      name: 'Sổ cái kiểm toán',
      en: 'Audit Ledger',
      href: '/audit',
      active: pathname === '/audit',
    },
    {
      name: 'Cài đặt & Cổng thanh toán',
      en: 'Settings',
      href: '/settings',
      active: pathname === '/settings',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 font-sans antialiased flex flex-col">
      {/* Vercel-style Top Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Left: Brand Monogram + Breadcrumb Workspace Switcher */}
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2 group">
              {/* Minimalist Vercel-style Geometric Logo */}
              <div className="w-7 h-7 bg-black text-white rounded-md flex items-center justify-center font-bold text-xs tracking-tighter shadow-vercel-sm group-hover:bg-zinc-800 transition">
                ▲
              </div>
              <span className="font-semibold text-sm tracking-tight text-zinc-900">
                PayBridge
              </span>
            </a>

            <span className="text-zinc-300 font-normal">/</span>

            {/* Organization Dropdown */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-md hover:bg-zinc-100 cursor-pointer transition text-xs font-medium text-zinc-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>Acme Global Ltd</span>
              <span className="text-zinc-400 font-mono text-[11px]">(emp_acme_vn)</span>
              <ChevronDown size={13} className="text-zinc-400" />
            </div>
          </div>

          {/* Right: Environment Pill, Actions & Profile */}
          <div className="flex items-center gap-3">
            {/* Sandbox Indicator (Minimalist Vercel Badge) */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-50 border border-zinc-200 text-[11px] font-medium text-zinc-600 shadow-vercel-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>9Pay Sandbox (Demo)</span>
            </div>

            <a
              href="/batches/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-zinc-800 text-white rounded-md text-xs font-medium shadow-vercel-sm transition"
            >
              <Plus size={14} />
              <span>Tạo đợt chi</span>
            </a>

            {/* User Avatar Circle */}
            <div className="w-7 h-7 rounded-full bg-zinc-200 text-zinc-700 border border-zinc-300 flex items-center justify-center text-[11px] font-semibold">
              AG
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-1.5 text-zinc-600 hover:text-black rounded-md"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Vercel-style Sub-navigation Tabs */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 overflow-x-auto">
          <nav className="flex space-x-1 sm:space-x-6">
            {tabs.map((tab) => (
              <a
                key={tab.href}
                href={tab.href}
                className={`py-3 text-xs font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  tab.active
                    ? 'border-black text-black font-semibold'
                    : 'border-transparent text-zinc-500 hover:text-zinc-900'
                }`}
              >
                <span>{tab.name}</span>
                <span className="text-[10px] text-zinc-400 font-mono hidden md:inline">
                  {tab.en}
                </span>
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-b border-zinc-200 px-4 py-3 space-y-1">
          {tabs.map((tab) => (
            <a
              key={tab.href}
              href={tab.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-xs font-medium ${
                tab.active ? 'bg-zinc-100 text-black font-semibold' : 'text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              {tab.name}
            </a>
          ))}
        </div>
      )}

      {/* Main Viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {children}
      </main>

      {/* Minimalist Vercel-style Footer */}
      <footer className="border-t border-zinc-200 bg-white py-6 text-center text-xs text-zinc-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-zinc-500">
            <span className="font-medium text-zinc-700">PayBridge</span>
            <span>—</span>
            <span>Nền tảng chi trả nhân sự xuyên biên giới cho thị trường Việt Nam</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-400 text-[11px]">
            <span>9Pay Testnet Rail</span>
            <span>•</span>
            <span>Lossless BigInt Precision</span>
            <span>•</span>
            <span>SEC-804 Dual-Control</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
