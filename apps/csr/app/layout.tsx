import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CSR Matrix — IATF Solutions',
  description: 'Customer Specific Requirements Matrix for automotive quality management.',
}

// This is a minimal root layout - the actual layout is in [locale]/layout.tsx
// Required for Next.js even though locale layout handles the HTML structure
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

