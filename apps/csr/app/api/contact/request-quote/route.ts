import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(req: Request) {
  try {
    const { planId, locale } = await req.json()

    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
      console.error('No RESEND_API_KEY found.')
      return NextResponse.json({ success: false, error: 'Email configuration missing.' }, { status: 500 })
    }

    const resend = new Resend(resendApiKey)
    const fromEmail = process.env.CREDIT_DELIVERY_EMAIL_FROM || 'contact@iatf-solutions.com'
    const toEmail = process.env.ADMIN_EMAIL || 'contact@iatf-solutions.com'

    console.log('\n=======================================')
    console.log(`📝 NEW QUOTE REQUEST INCOMING`)
    console.log(`Plan ID: ${planId}`)
    console.log(`User Locale: ${locale}`)
    console.log('=======================================\n')

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `New Custom Quote Request for ${planId}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>New Enquiry for Custom Codes</h2>
          <p>A user has requested a custom quote/on-request package for: <strong>${planId}</strong>.</p>
          <p>Language active on site: ${locale}</p>
          <hr />
          <p>Please review and communicate with them shortly.</p>
        </div>
      `,
    })

    if (error) {
      console.error('Resend API Error:', error.message || error)
      return NextResponse.json({ success: false, error: 'Failed to send email.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (err) {
    console.error('Exception in request-quote API route:', err)
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 })
  }
}
