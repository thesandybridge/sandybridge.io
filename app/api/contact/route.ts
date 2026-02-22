import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getClientIP } from '@/lib/views';
import { rateLimit } from '@/lib/rate-limit';

interface ContactBody {
  name: string;
  email: string;
  message: string;
}

function validate(body: ContactBody): string | null {
  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    return 'Name is required';
  }
  if (!body.email || typeof body.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return 'Valid email is required';
  }
  if (!body.message || typeof body.message !== 'string' || !body.message.trim()) {
    return 'Message is required';
  }
  if (body.message.length > 2000) {
    return 'Message must be under 2000 characters';
  }
  return null;
}

export async function POST(req: Request) {
  let body: ContactBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const error = validate(body);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const ip = getClientIP(req);
  const allowed = await rateLimit(`contact:${ip}`, 3, 3600);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    );
  }

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) {
    console.error('SMTP credentials not configured');
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.protonmail.ch',
    port: 587,
    secure: false,
    auth: { user, pass },
  });

  try {
    await transporter.sendMail({
      from: user,
      to: user,
      replyTo: body.email,
      subject: `Contact from ${body.name.trim()}`,
      text: `Name: ${body.name.trim()}\nEmail: ${body.email.trim()}\n\n${body.message.trim()}`,
    });
  } catch (err) {
    console.error('Failed to send email:', err);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
