'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from '@tanstack/react-form';
import { X } from 'lucide-react';
import s from './ContactModal.module.css';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id: string) => void;
      remove: (id: string) => void;
    };
  }
}

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [apiError, setApiError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const form = useForm({
    defaultValues: { name: '', email: '', message: '' },
    validators: {
      onSubmit: ({ value }) => {
        const errors: Record<string, string> = {};
        if (!value.name.trim()) errors.name = 'Name is required';
        if (!value.email.trim()) {
          errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)) {
          errors.email = 'Invalid email format';
        }
        if (!value.message.trim()) {
          errors.message = 'Message is required';
        } else if (value.message.length > 2000) {
          errors.message = 'Message must be under 2000 characters';
        }
        return Object.keys(errors).length
          ? { fields: errors }
          : undefined;
      },
    },
    onSubmit: async ({ value }) => {
      if (siteKey && !turnstileToken) {
        setApiError('Please complete the verification');
        return;
      }
      setStatus('sending');
      setApiError('');
      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...value, turnstileToken }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to send');
        }
        setStatus('sent');
      } catch (err) {
        setApiError(err instanceof Error ? err.message : 'Failed to send');
        setStatus('error');
      }
    },
  });

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    if (!isOpen) {
      setStatus('idle');
      setApiError('');
      setTurnstileToken('');
      form.reset();
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
      return;
    }
    if (!siteKey) return;

    function renderWidget() {
      if (!turnstileRef.current || widgetIdRef.current) return;
      if (!window.turnstile) return;
      widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
        sitekey: siteKey,
        theme: 'dark',
        callback: (token: string) => setTurnstileToken(token),
        'expired-callback': () => setTurnstileToken(''),
      });
    }

    if (window.turnstile) {
      renderWidget();
    } else {
      const existing = document.querySelector('script[src*="turnstile"]');
      if (!existing) {
        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.onload = renderWidget;
        document.head.appendChild(script);
      } else {
        existing.addEventListener('load', renderWidget);
      }
    }
  }, [isOpen, form, siteKey]);

  if (!isOpen) return null;

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        <div className={s.header}>
          <h2>Get in touch</h2>
          <button className={s.closeBtn} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {status === 'sent' ? (
          <div className={s.success}>
            <p>Message sent</p>
            <p>I&apos;ll get back to you soon.</p>
          </div>
        ) : (
          <form
            className={s.form}
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <form.Field name="name">
              {(field) => (
                <div className={s.field}>
                  <label htmlFor="contact-name">Name</label>
                  <input
                    id="contact-name"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    autoComplete="name"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <div className={s.fieldError}>{field.state.meta.errors.join(', ')}</div>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="email">
              {(field) => (
                <div className={s.field}>
                  <label htmlFor="contact-email">Email</label>
                  <input
                    id="contact-email"
                    type="email"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    autoComplete="email"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <div className={s.fieldError}>{field.state.meta.errors.join(', ')}</div>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="message">
              {(field) => (
                <div className={s.field}>
                  <label htmlFor="contact-message">Message</label>
                  <textarea
                    id="contact-message"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    rows={5}
                  />
                  <div className={s.charCount}>{field.state.value.length}/2000</div>
                  {field.state.meta.errors.length > 0 && (
                    <div className={s.fieldError}>{field.state.meta.errors.join(', ')}</div>
                  )}
                </div>
              )}
            </form.Field>

            {siteKey && <div ref={turnstileRef} className={s.turnstile} />}

            {apiError && <div className={s.apiError}>{apiError}</div>}

            <button
              type="submit"
              className={s.submitBtn}
              disabled={status === 'sending'}
            >
              {status === 'sending' ? 'Sending...' : 'Send'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
