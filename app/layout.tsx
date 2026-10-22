import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'OmniPulse CRM — Multi-Tenant Sales & Automation Platform',
  description: 'Enterprise multi-tenant CRM for agencies and service businesses with pipelines, RBAC, contact intelligence, and automated background workflows.',
  openGraph: {
    title: 'OmniPulse CRM — Multi-Tenant Sales & Automation Platform',
    description: 'Enterprise multi-tenant CRM for agencies and service businesses with pipelines, RBAC, contact intelligence, and automated background workflows.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OmniPulse CRM — Multi-Tenant Sales & Automation Platform',
    description: 'Enterprise multi-tenant CRM for agencies and service businesses with pipelines, RBAC, contact intelligence, and automated background workflows.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full bg-slate-50 antialiased ${plusJakartaSans.variable} ${jetbrainsMono.variable}`}>
      <body className="h-full bg-slate-50 text-slate-700 font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
