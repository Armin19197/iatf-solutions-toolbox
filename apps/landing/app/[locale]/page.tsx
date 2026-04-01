'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Check } from 'lucide-react'
import { LanguageToggle } from '@/components/language-toggle'
import { BuyCreditsButton } from '@/components/BuyCreditsButton'
import { RequestQuoteButton } from '@/components/RequestQuoteButton'

/* ─── Embedded styles for responsive + hover behaviour ───────────────── */
const pageStyles = `
  /* ─── Base ─────────────────────────────────────────────── */
  .lp { font-family: 'Inter', system-ui, -apple-system, sans-serif; min-height: 100vh; background: #fff; }
  *, *::before, *::after { box-sizing: border-box; }

  /* ─── Header ───────────────────────────────────────────── */
  .lp-header { position: sticky; top: 0; z-index: 50; background: rgba(255,255,255,0.97); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border-bottom: 1px solid #f0f0f0; }
  .lp-header-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; padding: 14px 24px; }
  .lp-logo { font-size: 18px; font-weight: 700; letter-spacing: -0.02em; text-decoration: none; white-space: nowrap; }
  .lp-logo-blue { color: #0066FF; }
  .lp-logo-black { color: #111; }
  .lp-nav { display: flex; align-items: center; gap: 4px; }
  .lp-nav-link { padding: 6px 14px; font-size: 14px; font-weight: 500; color: #0066FF; text-decoration: none; border-radius: 6px; transition: color 0.2s, background 0.2s; white-space: nowrap; }
  .lp-nav-link:hover { color: #888; background: #f5f5f5; }

  /* ─── Hero ─────────────────────────────────────────────── */
  .lp-hero { text-align: center; padding: 72px 24px 56px; max-width: 820px; margin: 0 auto; }
  .lp-hero h1 { font-size: 46px; font-weight: 800; line-height: 1.15; color: #0033AA; letter-spacing: -0.02em; margin: 0; }
  .lp-hero p { font-size: 22px; font-weight: 400; line-height: 1.5; color: #888; margin-top: 16px; max-width: 650px; margin-left: auto; margin-right: auto; }
  .lp-hero-btns { margin-top: 32px; display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
  .lp-btn-primary { display: inline-flex; align-items: center; justify-content: center; height: 44px; padding: 0 28px; border-radius: 999px; font-size: 14px; font-weight: 600; color: #fff; background: #4B5EAA; text-decoration: none; transition: background 0.2s; border: none; cursor: pointer; }
  .lp-btn-primary:hover { background: #3a4d8f; }
  .lp-btn-secondary { display: inline-flex; align-items: center; justify-content: center; height: 44px; padding: 0 28px; border-radius: 999px; font-size: 14px; font-weight: 600; color: #333; background: #F3F3F3; text-decoration: none; transition: background 0.2s; border: none; cursor: pointer; }
  .lp-btn-secondary:hover { background: #e5e5e5; }

  /* ─── Purpose ──────────────────────────────────────────── */
  .lp-purpose { text-align: center; padding: 48px 24px 56px; max-width: 780px; margin: 0 auto; }
  .lp-purpose h2 { font-size: 28px; font-weight: 700; color: #0033AA; margin: 0; }
  .lp-purpose p { font-size: 15px; line-height: 1.7; color: #666; margin-top: 16px; }

  /* ─── Tools ────────────────────────────────────────────── */
  .lp-tools { padding: 24px 24px 48px; max-width: 1000px; margin: 0 auto; }
  .lp-tools-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
  .lp-tool-img { border-radius: 12px; overflow: hidden; aspect-ratio: 16/10; background: #f5f5f7; }
  .lp-tool-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .lp-tool-title { font-size: 22px; font-weight: 700; color: #111; margin-top: 20px; margin-bottom: 8px; }
  .lp-tool-desc { font-size: 14px; line-height: 1.65; color: #666; margin: 0; }
  .lp-tool-actions { margin-top: 16px; display: flex; gap: 12px; flex-wrap: wrap; }
  .lp-btn-primary[disabled], .lp-btn-secondary[disabled] { opacity: 0.55; cursor: not-allowed; }

  /* ─── Steps ────────────────────────────────────────────── */
  .lp-steps { display: flex; justify-content: center; align-items: flex-start; gap: 0; margin-top: 64px; }
  .lp-step-item { display: flex; align-items: center; }
  .lp-step-content { text-align: center; width: 160px; }
  .lp-step-circle { width: 48px; height: 48px; border-radius: 50%; border: 2px solid #ccc; background: #fff; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 600; color: #888; margin: 0 auto 10px; }
  .lp-step-label { font-size: 14px; font-weight: 600; color: #111; text-decoration: none; display: block; }
  .lp-step-line { width: 60px; height: 2px; background: #ddd; flex-shrink: 0; margin-top: -18px; }

  /* ─── Pricing ──────────────────────────────────────────── */
  .lp-pricing { padding: 64px 24px 80px; max-width: 1000px; margin: 0 auto; }
  .lp-pricing-header { text-align: center; margin-bottom: 40px; }
  .lp-pricing-header h2 { font-size: 32px; font-weight: 700; color: #111; margin: 0; }
  .lp-pricing-header p { font-size: 20px; color: #888; margin-top: 6px; font-weight: 400; }
  .lp-pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 36px; }
  .lp-price-card { background: #F7F7F8; border-radius: 14px; padding: 28px 24px 24px; display: flex; flex-direction: column; }
  .lp-price-card-title { font-size: 13px; font-weight: 500; color: #888; margin: 0; }
  .lp-price-card-amount { font-size: 36px; font-weight: 800; color: #111; margin: 8px 0 0; letter-spacing: -0.02em; }
  .lp-price-card-features { list-style: none; padding: 0; margin: 20px 0 0; flex: 1; }
  .lp-price-card-features li { display: flex; align-items: flex-start; gap: 8px; font-size: 14px; color: #555; margin-bottom: 10px; line-height: 1.4; }
  .lp-price-card-features .check-icon { width: 16px; height: 16px; color: #888; flex-shrink: 0; margin-top: 2px; }
  .lp-price-card-btn { margin-top: auto; padding-top: 20px; }

  /* All purchase buttons: equal height, black bg → gray on hover */
  .lp-buy-btn {
    display: inline-flex; width: 100%; height: 44px;
    align-items: center; justify-content: center;
    border-radius: 999px; padding: 0 24px;
    font-size: 14px; font-weight: 600; line-height: 1;
    color: #fff !important; background: #111 !important;
    border: none; cursor: pointer;
    transition: background 0.2s; text-decoration: none;
  }
  .lp-buy-btn:hover { background: #555 !important; color: #fff !important; }

  /* ─── Footer ───────────────────────────────────────────── */
  .lp-footer { border-top: 1px solid #eee; padding: 48px 24px 40px; }
  .lp-footer-inner { max-width: 1000px; margin: 0 auto; display: grid; grid-template-columns: 1.2fr 1fr 1fr 1fr; gap: 40px; }
  .lp-footer-col h4 { font-size: 13px; font-weight: 600; color: #111; margin: 0 0 14px; text-transform: uppercase; letter-spacing: 0.04em; }
  .lp-footer-col ul { list-style: none; padding: 0; margin: 0; }
  .lp-footer-col li { margin-bottom: 10px; font-size: 14px; }
  .lp-footer-col a { color: #0066FF; text-decoration: none; transition: color 0.2s; }
  .lp-footer-col a:hover { color: #0066FF; }
  .lp-footer-col .muted { color: #666; }
  .lp-footer-col .faint { color: #999; }

  /* ═══════════════════════════════════════════════════════════
     RESPONSIVE — large tablets / small laptops (≤ 1024px)
     ═══════════════════════════════════════════════════════════ */
  @media (max-width: 1024px) {
    .lp-header-inner { padding: 12px 20px; }
    .lp-nav-link { padding: 5px 10px; font-size: 13px; }
    .lp-hero { padding: 56px 20px 44px; }
    .lp-hero h1 { font-size: 36px; }
    .lp-hero p { font-size: 18px; }
    .lp-purpose { padding: 40px 20px 44px; }
    .lp-purpose h2 { font-size: 24px; }
    .lp-purpose p { font-size: 14px; }
    .lp-tools { padding: 20px 20px 40px; }
    .lp-tools-grid { gap: 24px; }
    .lp-tool-title { font-size: 19px; margin-top: 16px; }
    .lp-tool-desc { font-size: 13px; }
    .lp-steps { margin-top: 48px; }
    .lp-step-content { width: 140px; }
    .lp-step-circle { width: 42px; height: 42px; font-size: 16px; }
    .lp-step-label { font-size: 13px; }
    .lp-step-line { width: 44px; }
    .lp-pricing { padding: 48px 20px 60px; }
    .lp-pricing-header h2 { font-size: 28px; }
    .lp-pricing-header p { font-size: 17px; }
    .lp-pricing-grid { gap: 16px; }
    .lp-price-card { padding: 24px 20px 22px; border-radius: 12px; }
    .lp-price-card-amount { font-size: 30px; }
    .lp-price-card-features li { font-size: 13px; }
    .lp-buy-btn { height: 42px; font-size: 13px; }
    .lp-footer { padding: 40px 20px 32px; }
    .lp-footer-inner { gap: 32px; }
    .lp-footer-col li { font-size: 13px; }
    .lp-footer-col h4 { font-size: 12px; }
  }

  /* ═══════════════════════════════════════════════════════════
     RESPONSIVE — tablets / small screens (≤ 768px)
     ═══════════════════════════════════════════════════════════ */
  @media (max-width: 768px) {
    /* Header */
    .lp-header-inner { padding: 10px 16px; }
    .lp-logo { font-size: 16px; }
    .lp-nav { gap: 2px; }
    .lp-nav-link { padding: 4px 8px; font-size: 12px; }

    /* Hero */
    .lp-hero { padding: 40px 16px 32px; }
    .lp-hero h1 { font-size: 28px; }
    .lp-hero p { font-size: 15px; margin-top: 12px; }
    .lp-hero-btns { margin-top: 24px; gap: 10px; }
    .lp-btn-primary, .lp-btn-secondary { height: 40px; padding: 0 22px; font-size: 13px; }

    /* Purpose */
    .lp-purpose { padding: 32px 16px 36px; }
    .lp-purpose h2 { font-size: 22px; }
    .lp-purpose p { font-size: 13px; }

    /* Tools */
    .lp-tools { padding: 16px 16px 32px; }
    .lp-tools-grid { grid-template-columns: 1fr; gap: 28px; }
    .lp-tool-img { border-radius: 10px; }
    .lp-tool-title { font-size: 18px; margin-top: 14px; }
    .lp-tool-desc { font-size: 13px; }

    /* Steps */
    .lp-steps { margin-top: 36px; }
    .lp-step-content { width: 100px; }
    .lp-step-circle { width: 38px; height: 38px; font-size: 14px; margin-bottom: 8px; }
    .lp-step-label { font-size: 11px; }
    .lp-step-line { width: 24px; margin-top: -14px; }

    /* Pricing */
    .lp-pricing { padding: 40px 16px 48px; }
    .lp-pricing-header { margin-bottom: 28px; }
    .lp-pricing-header h2 { font-size: 24px; }
    .lp-pricing-header p { font-size: 15px; }
    .lp-pricing-grid { grid-template-columns: 1fr; gap: 14px; margin-bottom: 24px; }
    .lp-price-card { padding: 22px 18px 20px; border-radius: 12px; }
    .lp-price-card-title { font-size: 12px; }
    .lp-price-card-amount { font-size: 28px; }
    .lp-price-card-features li { font-size: 13px; }
    .lp-buy-btn { height: 42px; font-size: 13px; }

    /* Footer */
    .lp-footer { padding: 32px 16px 28px; }
    .lp-footer-inner { grid-template-columns: 1fr 1fr; gap: 28px; }
    .lp-footer-col h4 { font-size: 11px; margin-bottom: 10px; }
    .lp-footer-col li { font-size: 13px; margin-bottom: 8px; }
  }

  /* ═══════════════════════════════════════════════════════════
     RESPONSIVE — small phones (≤ 480px)
     ═══════════════════════════════════════════════════════════ */
  @media (max-width: 480px) {
    /* Header */
    .lp-header-inner { padding: 8px 12px; }
    .lp-logo { font-size: 14px; }
    .lp-nav-link { padding: 3px 6px; font-size: 11px; }

    /* Hero */
    .lp-hero { padding: 28px 12px 24px; }
    .lp-hero h1 { font-size: 22px; line-height: 1.2; }
    .lp-hero p { font-size: 13px; margin-top: 8px; }
    .lp-hero-btns { margin-top: 18px; gap: 8px; flex-direction: column; align-items: center; }
    .lp-btn-primary, .lp-btn-secondary { height: 38px; padding: 0 20px; font-size: 12px; width: 100%; max-width: 260px; }

    /* Purpose */
    .lp-purpose { padding: 24px 12px 28px; }
    .lp-purpose h2 { font-size: 18px; }
    .lp-purpose p { font-size: 12px; line-height: 1.6; }

    /* Tools */
    .lp-tools { padding: 12px 12px 24px; }
    .lp-tools-grid { gap: 20px; }
    .lp-tool-img { border-radius: 8px; }
    .lp-tool-title { font-size: 16px; margin-top: 10px; margin-bottom: 4px; }
    .lp-tool-desc { font-size: 12px; }

    /* Steps — 2×2 grid on tiny screens */
    .lp-steps { margin-top: 28px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; justify-items: center; }
    .lp-step-item { flex-direction: column; }
    .lp-step-content { width: auto; }
    .lp-step-circle { width: 36px; height: 36px; font-size: 14px; margin-bottom: 6px; }
    .lp-step-label { font-size: 11px; }
    .lp-step-line { display: none; }

    /* Pricing */
    .lp-pricing { padding: 28px 12px 36px; }
    .lp-pricing-header { margin-bottom: 20px; }
    .lp-pricing-header h2 { font-size: 20px; }
    .lp-pricing-header p { font-size: 13px; }
    .lp-pricing-grid { gap: 10px; margin-bottom: 16px; }
    .lp-price-card { padding: 18px 14px 16px; border-radius: 10px; }
    .lp-price-card-title { font-size: 11px; }
    .lp-price-card-amount { font-size: 24px; }
    .lp-price-card-features li { font-size: 12px; gap: 6px; margin-bottom: 6px; }
    .lp-price-card-features .check-icon { width: 14px; height: 14px; }
    .lp-buy-btn { height: 38px; font-size: 12px; padding: 0 16px; }

    /* Footer */
    .lp-footer { padding: 24px 12px 20px; }
    .lp-footer-inner { grid-template-columns: 1fr; gap: 20px; }
    .lp-footer-col h4 { font-size: 11px; margin-bottom: 8px; }
    .lp-footer-col li { font-size: 12px; margin-bottom: 6px; }
  }
`

const TOOL_URL = process.env.NEXT_PUBLIC_TOOL_URL || 'https://app.iatf-solutions.com'

export default function LandingPage() {
  const t = useTranslations('landing')
  const locale = useLocale()

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  /* ─── Pricing data ──────────────────────────────────────────────────── */
  const eightDPlans = [
    {
      key: '8d-single',
      title: t('pricing.single'),
      price: '€19',
      features: [t('pricing.single_f1'), t('pricing.single_f2'), t('pricing.single_f3')],
      action: (
        <BuyCreditsButton
          priceId={process.env.NEXT_PUBLIC_STRIPE_PRICE_8D_SINGLE}
          creditCountHint={1}
          toolId="tool_8d"
          label={t('pricing.single_btn')}
          className="lp-buy-btn"
        />
      ),
    },
    {
      key: '8d-five',
      title: t('pricing.fivePack'),
      price: '€79',
      features: [t('pricing.fivePack_f1'), t('pricing.fivePack_f2'), t('pricing.fivePack_f3')],
      action: (
        <BuyCreditsButton
          priceId={process.env.NEXT_PUBLIC_STRIPE_PRICE_8D_FIVE}
          creditCountHint={5}
          toolId="tool_8d"
          label={t('pricing.fivePack_btn')}
          className="lp-buy-btn"
        />
      ),
    },
    {
      key: '8d-pilot',
      title: t('pricing.pilot'),
      price: t('pricing.pilot_f3'),
      features: [t('pricing.pilot_f1'), t('pricing.pilot_f2'), t('pricing.pilot_f3')],
      action: (
        <RequestQuoteButton
          planId="8d-pilot"
          label={t('pricing.pilot_btn')}
          className="lp-buy-btn"
        />
      ),
    },
  ]

  const csrPlans = [
    {
      key: 'csr-single',
      title: t('pricing.csrSingle'),
      price: '€29',
      features: [t('pricing.csrSingle_f1'), t('pricing.csrSingle_f2'), t('pricing.csrSingle_f3')],
      action: (
        <BuyCreditsButton
          priceId={process.env.NEXT_PUBLIC_STRIPE_PRICE_CSR_SINGLE}
          creditCountHint={1}
          toolId="tool_csr"
          label={t('pricing.csrSingle_btn')}
          className="lp-buy-btn"
        />
      ),
    },
    {
      key: 'csr-five',
      title: t('pricing.csrFive'),
      price: '€119',
      features: [t('pricing.csrFive_f1'), t('pricing.csrFive_f2'), t('pricing.csrFive_f3')],
      action: (
        <BuyCreditsButton
          priceId={process.env.NEXT_PUBLIC_STRIPE_PRICE_CSR_FIVE}
          creditCountHint={5}
          toolId="tool_csr"
          label={t('pricing.csrFive_btn')}
          className="lp-buy-btn"
        />
      ),
    },
    {
      key: 'csr-twenty',
      title: t('pricing.csrTwenty'),
      price: '€399',
      features: [t('pricing.csrTwenty_f1'), t('pricing.csrTwenty_f2'), t('pricing.csrTwenty_f3')],
      action: (
        <BuyCreditsButton
          priceId={process.env.NEXT_PUBLIC_STRIPE_PRICE_CSR_TWENTY}
          creditCountHint={20}
          toolId="tool_csr"
          label={t('pricing.csrTwenty_btn')}
          className="lp-buy-btn"
        />
      ),
    },
  ]

  const steps = [
    { num: '1', label: t('tools.step1') },
    { num: '2', label: t('tools.step2'), href: `${TOOL_URL}/${locale}/unlock` },
    { num: '3', label: t('tools.step3'), href: `${TOOL_URL}/${locale}/generator` },
    { num: '4', label: t('tools.step4') },
  ]

  return (
    <div className="lp">
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      {/* ─── Header ──────────────────────────────────────────── */}
      <header className="lp-header">
        <div className="lp-header-inner">
          <span className="lp-logo">
            <span className="lp-logo-blue">IATF</span>{' '}
            <span className="lp-logo-black">Solutions</span>
          </span>
          <nav className="lp-nav">
            <a href="#tools" onClick={(e) => handleScroll(e, 'tools')} className="lp-nav-link">
              {t('nav.tools')}
            </a>
            <a href="#pricing" onClick={(e) => handleScroll(e, 'pricing')} className="lp-nav-link">
              {t('nav.pricing')}
            </a>
            <a href="#about" onClick={(e) => handleScroll(e, 'about')} className="lp-nav-link">
              {t('nav.about')}
            </a>
            <div style={{ marginLeft: 6 }}>
              <LanguageToggle />
            </div>
          </nav>
        </div>
      </header>

      <main>
        {/* ─── Hero ──────────────────────────────────────────── */}
        <section className="lp-hero">
          <h1>{t('hero.title')}</h1>
          <p>{t('hero.subtitle')}</p>
          <div className="lp-hero-btns">
            <a href="#pricing" onClick={(e) => handleScroll(e, 'pricing')} className="lp-btn-primary">
              {t('hero.buyBtn')}
            </a>
            <a href="#tools" onClick={(e) => handleScroll(e, 'tools')} className="lp-btn-secondary">
              {t('hero.exploreBtn')}
            </a>
          </div>
        </section>

        {/* ─── Purpose ───────────────────────────────────────── */}
        <section id="about" className="lp-purpose">
          <h2>{t('purpose.title')}</h2>
          <p>{t('purpose.desc')}</p>
        </section>

        {/* ─── Tools ─────────────────────────────────────────── */}
        <section id="tools" className="lp-tools">
          <div className="lp-tools-grid">
            {/* 8D Generator */}
            <div>
              <div className="lp-tool-img">
                <img
                  src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800"
                  alt="8D Generator"
                />
              </div>
              <h3 className="lp-tool-title">{t('tools.generatorTitle')}</h3>
              <p className="lp-tool-desc">{t('tools.generatorDesc')}</p>
              <div className="lp-tool-actions">
                <a href={`${TOOL_URL}/${locale}/unlock`} className="lp-btn-primary">
                  {t('hero.openToolBtn')}
                </a>
              </div>
            </div>
            {/* CSR Norm Matrix */}
            <div>
              <div className="lp-tool-img">
                <img
                  src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800"
                  alt="CSR Norm Matrix"
                />
              </div>
              <h3 className="lp-tool-title">{t('tools.csrTitle')}</h3>
              <p className="lp-tool-desc">{t('tools.csrDesc')}</p>
              <div className="lp-tool-actions">
                <button type="button" className="lp-btn-secondary" disabled>
                  Open {t('tools.csrTitle')} {t('footer.comingSoon')}
                </button>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="lp-steps">
            {steps.map((step, i) => (
              <div key={step.num} className="lp-step-item">
                <div className="lp-step-content">
                  <div className="lp-step-circle">{step.num}</div>
                  {step.href ? (
                    <a href={step.href} className="lp-step-label">{step.label}</a>
                  ) : (
                    <span className="lp-step-label">{step.label}</span>
                  )}
                </div>
                {i < steps.length - 1 && <div className="lp-step-line" />}
              </div>
            ))}
          </div>
        </section>

        {/* ─── Pricing ───────────────────────────────────────── */}
        <section id="pricing" className="lp-pricing">
          <div className="lp-pricing-header">
            <h2>{t('pricing.title')}</h2>
            <p>{t('pricing.subtitle')}</p>
          </div>

          {/* 8D Plans */}
          <div className="lp-pricing-grid">
            {eightDPlans.map((plan) => (
              <div key={plan.key} className="lp-price-card">
                <p className="lp-price-card-title">{plan.title}</p>
                <p className="lp-price-card-amount">{plan.price}</p>
                <ul className="lp-price-card-features">
                  {plan.features.map((f) => (
                    <li key={f}>
                      <Check className="check-icon" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="lp-price-card-btn">{plan.action}</div>
              </div>
            ))}
          </div>

          {/* CSR Plans */}
          <div className="lp-pricing-grid">
            {csrPlans.map((plan) => (
              <div key={plan.key} className="lp-price-card">
                <p className="lp-price-card-title">{plan.title}</p>
                <p className="lp-price-card-amount">{plan.price}</p>
                <ul className="lp-price-card-features">
                  {plan.features.map((f) => (
                    <li key={f}>
                      <Check className="check-icon" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="lp-price-card-btn">{plan.action}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ─── Footer ──────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-col">
            <span className="lp-logo">
              <span className="lp-logo-blue">IATF</span>{' '}
              <span className="lp-logo-black">Solutions</span>
            </span>
          </div>

          <div className="lp-footer-col">
            <h4>{t('footer.legal')}</h4>
            <ul>
              <li><a href="#">{t('footer.terms')}</a></li>
              <li><a href="#">{t('footer.privacy')}</a></li>
              <li><a href="#">{t('footer.imprint')}</a></li>
            </ul>
          </div>

          <div className="lp-footer-col">
            <h4>{t('footer.aboutTitle')}</h4>
            <ul>
              <li><a href="#">{t('footer.disclaimer')}</a></li>
              <li><span className="muted">{t('footer.contact')}</span></li>
              <li><span className="faint">{t('footer.lang')}</span></li>
            </ul>
          </div>

          <div className="lp-footer-col">
            <h4>{t('footer.toolsTitle')}</h4>
            <ul>
              <li>
                <a href="#tools" onClick={(e) => handleScroll(e, 'tools')}>8D Generator</a>
              </li>
              <li>
                <span className="muted">
                  CSR Norm Matrix <span className="faint">({t('footer.comingSoon')})</span>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}