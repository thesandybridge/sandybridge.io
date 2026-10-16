import { createFileRoute } from '@tanstack/react-router'
import { Resend } from 'resend'
import { getClientIP } from '~/lib/server/views'
import { escapeHtml } from '~/lib/escape-html'
import { rateLimit } from '~/lib/server/rate-limit'

const VALID_CATEGORIES = ['General', 'Work inquiry', 'Bug report', 'Feedback']

interface ContactBody {
  name: string
  email: string
  category: string
  message: string
  turnstileToken?: string
}

function validate(body: ContactBody): string | null {
  if (!body || typeof body !== 'object') return 'Invalid body'
  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    return 'Name is required'
  }
  if (!body.email || typeof body.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return 'Valid email is required'
  }
  if (!body.message || typeof body.message !== 'string' || !body.message.trim()) {
    return 'Message is required'
  }
  if (body.name.length > 100 || body.email.length > 254) return 'Name or email too long'
  if (body.turnstileToken !== undefined && typeof body.turnstileToken !== 'string') return 'Invalid verification token'
  if (body.message.length > 2000) {
    return 'Message must be under 2000 characters'
  }
  if (!body.category || !VALID_CATEGORIES.includes(body.category)) {
    return 'Invalid category'
  }
  return null
}

export const Route = createFileRoute('/api/contact')({
  server: {
    handlers: {
      POST: async ({ request }) => {
    let body: ContactBody
    try {
      body = await request.json()
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const error = validate(body)
    if (error) {
      return Response.json({ error }, { status: 400 })
    }

    const ip = getClientIP(request)

    const allowed = await rateLimit(`contact:${ip}`, 3, 3600)
    if (!allowed) {
      return Response.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      )
    }

    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY
    if (turnstileSecret) {
      try {
      const tokenRes = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          signal: AbortSignal.timeout(5000),
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            secret: turnstileSecret,
            response: body.turnstileToken || '',
            remoteip: ip,
          }),
        },
      )
      const tokenData = await tokenRes.json()
      if (!tokenData.success) {
        return Response.json(
          { error: 'Verification failed. Please try again.' },
          { status: 403 },
        )
      }
      } catch {
        return Response.json({ error: 'Verification temporarily unavailable' }, { status: 503 })
      }
    }

    const apiKey = process.env.RESEND_API_KEY
    const fromAddress = process.env.RESEND_FROM
    const toAddress = process.env.RESEND_TO
    if (!apiKey || !fromAddress || !toAddress) {
      console.error('Resend credentials not configured')
      return Response.json({ error: 'Server misconfigured' }, { status: 500 })
    }

    const resend = new Resend(apiKey)

    const name = body.name.trim()
    const email = body.email.trim()
    const message = body.message.trim()
    const category = body.category
    const prefix = category.toUpperCase().replace(/\s+/g, '_')
    const timestamp = new Date().toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'America/New_York',
    })

    const text = [
      `Category: ${category}`,
      `From: ${name} <${email}>`,
      `Date: ${timestamp}`,
      '',
      message,
    ].join('\n')

    const html = `
<div style="font-family: -apple-system, system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="border-bottom: 2px solid #d79921; padding-bottom: 12px; margin-bottom: 16px;">
    <span style="font-size: 12px; letter-spacing: 1px; color: #928374; text-transform: uppercase;">${category}</span>
    <h2 style="margin: 4px 0 0; font-size: 18px; color: #ebdbb2;">Message from ${escapeHtml(name)}</h2>
  </div>
  <table style="font-size: 14px; color: #a89984; margin-bottom: 16px;">
    <tr><td style="padding: 2px 12px 2px 0; color: #928374;">From</td><td>${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</td></tr>
    <tr><td style="padding: 2px 12px 2px 0; color: #928374;">Date</td><td>${timestamp}</td></tr>
  </table>
  <div style="background: #1d2021; border-left: 3px solid #d79921; padding: 16px; border-radius: 0 4px 4px 0; white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: #ebdbb2;">${message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
  <p style="font-size: 11px; color: #665c54; margin-top: 16px;">Sent via sandybridge.io contact form</p>
</div>`

    try {
      const { error: sendError } = await resend.emails.send({
        from: fromAddress,
        to: toAddress,
        replyTo: email,
        subject: `${prefix}: ${name}`,
        text,
        html,
      })
      if (sendError) {
        console.error('Failed to send email:', sendError)
        return Response.json({ error: 'Failed to send message' }, { status: 500 })
      }
    } catch (err) {
      console.error('Failed to send email:', err)
      return Response.json({ error: 'Failed to send message' }, { status: 500 })
    }

    return Response.json({ ok: true })
      },
    },
  },
})
