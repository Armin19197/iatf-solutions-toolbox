import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '8D-Generator — IATF Solutions',
  description: 'KI-gestützter 8D-Berichtsgenerator für Qualitätsingenieure in der Automobilindustrie.',
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

