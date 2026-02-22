'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from '@tanstack/react-form';
import { X } from 'lucide-react';
import s from './ContactModal.module.css';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [apiError, setApiError] = useState('');

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
      setStatus('sending');
      setApiError('');
      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(value),
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
      form.reset();
    }
  }, [isOpen, form]);

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
