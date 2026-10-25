import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PayBridge — Cross-Border Payroll Settlement MVP',
  description: 'Streamlined batch payout orchestration for Vietnam contractors and staff.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
