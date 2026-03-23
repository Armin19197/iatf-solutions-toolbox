# IATF Solutions Toolbox

An AI-powered quality engineering and cost optimization platform designed for automotive suppliers and modern engineering teams.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=flat&logo=tailwind-css)
![Stripe](https://img.shields.io/badge/Stripe-Billing-6772E5?style=flat&logo=stripe)
![Anthropic](https://img.shields.io/badge/Claude_3.5_Sonnet-AI-D97757?style=flat)

## 🚀 Key Features

*   **8D Report Generator:** An intelligent, multi-step wizard that guides users through the VDA 8D problem-solving methodology. Uses AI to automatically generate Root Cause Analyses (5 Whys), Containment Actions, and fully compliant Corrective Actions based on structural rules.
*   **AI Cost Optimizer:** A dashboard that connects to AWS environments to analyze billing records, detect anomalies, identify underutilized resources, and generate cost-saving recommendations.
*   **Internationalization (i18n):** Full support for English and German interfaces (routing and translations via `next-intl`).
*   **Professional Exports:** Server-side generation of pixel-perfect PDF and XLSX files.
*   **Credit-Based Billing:** Integrated Stripe checkout flow for credit purchases with webhook verification.
*   **Custom Quote Requests:** Direct email pipeline (via Resend) for enterprise/custom package inquiries.
*   **Zero-Database Architecture:** To maximize security and minimize liability, complaint data is strictly maintained in the browser (`localStorage`) and never saved to a database.

## 🛠 Tech Stack

*   **Framework:** Next.js 15 (App Router) + React 19
*   **Language:** TypeScript
*   **Styling & UI:** Tailwind CSS v4, `shadcn/ui`, `lucide-react`, Framer Motion
*   **AI Providers:** Anthropic (`@anthropic-ai/sdk`)
*   **Payment & Billing:** Stripe
*   **Email Delivery:** Resend
*   **Caching/State:** Upstash Redis (for API rate limiting and stateless session verification)
*   **Form Management:** React Hook Form + Zod
*   **Exports:** `@react-pdf/renderer`, `exceljs`

## ⚙️ Environment Variables

To run this project locally, create a `.env.local` file in the root directory and populate it with the following:

```env
# URL Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Stripe Integration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AI Configuration
ANTHROPIC_API_KEY=sk-ant-...

# Email Configuration (Resend)
RESEND_API_KEY=re_...
CONTACT_EMAIL_TO=youremail@example.com

# Upstash Redis
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
```

*Note: For the AWS Cost Optimizer to function, AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`) must be provided by the end-user via the UI or added locally for testing.*

## 💻 Getting Started

1.  **Install dependencies:**
    ```bash
    npm install
    # or yarn install
    ```

2.  **Run the development server:**
    ```bash
    npm run dev
    # or yarn dev
    ```

3.  **Open the application:**
    Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗 Architecture Details

*   **Locality of Data:** Forms utilize a robust auto-save hook tied to `localStorage` equipped with UTF-8 safe Base64 obfuscation to prevent tampering. When users export a report, the data is sent statelessly to the server via an API route, transformed into a PDF/XLSX buffer, and returned directly to the client without ever touching a disk.
*   **AI Prompting:** The `modules/eightd/lib/prompts.ts` file enforces strict IATF 16949 / VDA vocabulary and logically checks 5-Why chaining.
*   **Webhooks:** The `/api/webhooks/stripe` endpoint listens for `checkout.session.completed` events, updates the user's credit balance in Redis, and enables immediate PDF generation.

## 🛡 Security

- No sensitive corporate RCA (Root Cause Analysis) data is stored in a database.
- Redis is only utilized to manage access tokens, credit counters, and API rate limits. 
- API routes are protected by robust Zod validation schemas.
