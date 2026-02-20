'use client';

import { useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useDragTree } from './context';

interface DropZoneProps {
  id: string;
  className?: string;
}

export function DropZone({ id, className = '' }: DropZoneProps) {
  const { handleHover, activeId } = useDragTree();
  const { setNodeRef, isOver } = useDroppable({ id, disabled: !activeId });

  useEffect(() => {
    if (isOver && activeId) {
      handleHover(id);
    }
  }, [isOver, activeId, id, handleHover]);

  return (
    <div
      ref={setNodeRef}
      className={`drop-zone ${activeId ? 'drop-zone-visible' : ''} ${isOver ? 'drop-zone-active' : ''} ${className}`}
    />
  );
}
