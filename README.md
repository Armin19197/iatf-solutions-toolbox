# IATF Solutions Toolbox

AI-powered quality engineering tools for automotive suppliers.

## Tools

| Module | Status |
|--------|--------|
| 8D Generator | In development |

## Tech Stack

- **Framework**: Next.js 15 App Router + TypeScript
- **UI**: TailwindCSS v4 + shadcn/ui
- **Hosting**: Vercel
- **Database**: Upstash Redis (access codes only)
- **AI**: Anthropic Claude Sonnet (default) / OpenAI (switchable via `AI_PROVIDER`)
- **PDF**: react-pdf (server-side)
- **XLSX**: ExcelJS (server-side)
- **Session**: iron-session (httpOnly cookie, 24h)

## Architecture

- All 8D logic lives in `modules/eightd/` for future toolbox extensibility
- AI provider abstracted in `lib/ai/provider.ts` — switch via `AI_PROVIDER` env var
- No complaint data stored server-side — Redis stores access codes only
- All report data lives in the browser (localStorage autosave)

## Access Model

Single-use access codes purchased via Stripe. Validated against Upstash Redis (atomic, SHA-256 + pepper). Success issues a 24h httpOnly session cookie.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
