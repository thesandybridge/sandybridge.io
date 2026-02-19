'use client';

import { memo, useCallback, type MouseEvent } from 'react';

interface PaletteTitlebarProps {
  title: string;
  isMinimized: boolean;
  isMaximized: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onHeaderClick?: () => void;
}

export const PaletteTitlebar = memo(function PaletteTitlebar({
  title,
  isMinimized,
  isMaximized,
  onClose,
  onMinimize,
  onMaximize,
  onHeaderClick,
}: PaletteTitlebarProps) {
  const handleClose = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    onClose();
  }, [onClose]);

  const handleMinimize = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    onMinimize();
  }, [onMinimize]);

  const handleMaximize = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    onMaximize();
  }, [onMaximize]);

  return (
    <div className="term-header" onClick={onHeaderClick}>
      <div className="term-dots">
        <button
          className="term-dot red"
          onClick={handleClose}
          aria-label="Close"
          title="Close"
        />
        <button
          className="term-dot yellow"
          onClick={handleMinimize}
          aria-label={isMinimized ? "Restore" : "Minimize"}
          title={isMinimized ? "Restore" : "Minimize"}
        />
        <button
          className="term-dot green"
          onClick={handleMaximize}
          aria-label={isMaximized ? "Restore" : "Maximize"}
          title={isMaximized ? "Restore" : "Maximize"}
        />
      </div>
      <span className="term-title">{title}</span>
    </div>
  );
});
