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

export function Callout({ type = 'info', title, children }: CalloutProps) {
  return (
    <div className={`callout callout-${type}`}>
      <div className="callout-header">
        <span className="callout-icon">{icons[type]}</span>
        {title && <strong>{title}</strong>}
      </div>
      <div className="callout-body">{children}</div>
    </div>
  );
}
