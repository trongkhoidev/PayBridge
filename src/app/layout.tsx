import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PayBridge — Quản lý Chi trả Nhân sự & Freelancer Việt Nam',
  description: 'Nền tảng thanh toán B2B xuyên biên giới thân thiện, chính xác và an toàn.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${plusJakartaSans.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-[#F8F9FA] text-slate-800 antialiased font-sans selection:bg-indigo-100 selection:text-indigo-900">
        {children}
      </body>
    </html>
  );
}
