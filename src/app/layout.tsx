import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'WarrantyWise — Never Lose a Warranty Again | React & Next.js SaaS',
  description: 'Securely organize, track expiration dates, scan receipts with AI OCR, and manage warranty claims in one unified dashboard powered by React, Next.js, Node.js, and Supabase.',
  keywords: 'warranty tracker, invoice safe, AI receipt scanner, Supabase warranty app, React SaaS, Next.js SaaS'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
