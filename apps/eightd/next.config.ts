import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'

const withNextIntl = createNextIntlPlugin('./i18n.ts')

const allowedOrigins = [
  'https://8-d-three.vercel.app',
  'https://iatf-solutions.com',
  'https://www.iatf-solutions.com',
]

const corsHeaders = [
  { key: 'Access-Control-Allow-Methods', value: 'POST, OPTIONS' },
  { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
  { key: 'Access-Control-Max-Age', value: '86400' },
]

const nextConfig: NextConfig = {
  transpilePackages: ['@iatf/ui', '@iatf/config'],
  async headers() {
    return [
      {
        source: '/api/billing/:path*',
        headers: [
          ...corsHeaders,
          {
            key: 'Access-Control-Allow-Origin',
            value: allowedOrigins.join(', '),
          },
        ],
      },
    ]
  },
}

export default withNextIntl(nextConfig)
