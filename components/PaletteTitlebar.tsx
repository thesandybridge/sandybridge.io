'use client';

interface PaletteTitlebarProps {
  title: string;
  isMinimized: boolean;
  isMaximized: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onHeaderClick?: () => void;
}

export function PaletteTitlebar({
  title,
  isMinimized,
  isMaximized,
  onClose,
  onMinimize,
  onMaximize,
  onHeaderClick,
}: PaletteTitlebarProps) {
  return (
    <div className="term-header" onClick={onHeaderClick}>
      <div className="term-dots">
        <button
          className="term-dot red"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          aria-label="Close"
          title="Close"
        />
        <button
          className="term-dot yellow"
          onClick={(e) => { e.stopPropagation(); onMinimize(); }}
          aria-label={isMinimized ? "Restore" : "Minimize"}
          title={isMinimized ? "Restore" : "Minimize"}
        />
        <button
          className="term-dot green"
          onClick={(e) => { e.stopPropagation(); onMaximize(); }}
          aria-label={isMaximized ? "Restore" : "Maximize"}
          title={isMaximized ? "Restore" : "Maximize"}
        />
      </div>
      <span className="term-title">{title}</span>
    </div>
  );
}
