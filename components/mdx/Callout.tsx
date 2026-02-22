import { cx } from '@/lib/cx';
import s from './Callout.module.css';

interface CalloutProps {
  type?: 'info' | 'warning' | 'tip' | 'danger';
  title?: string;
  children: React.ReactNode;
}

const icons: Record<string, string> = {
  info: 'ℹ',
  warning: '⚠',
  tip: '💡',
  danger: '🚨',
};

const typeClass: Record<string, string> = {
  info: s.calloutInfo,
  warning: s.calloutWarning,
  tip: s.calloutTip,
  danger: s.calloutDanger,
};

export function Callout({ type = 'info', title, children }: CalloutProps) {
  return (
    <div className={cx(s.callout, typeClass[type])}>
      <div className={s.calloutHeader}>
        <span className={s.calloutIcon}>{icons[type]}</span>
        {title && <strong>{title}</strong>}
      </div>
      <div className={s.calloutBody}>{children}</div>
    </div>
  );
}
