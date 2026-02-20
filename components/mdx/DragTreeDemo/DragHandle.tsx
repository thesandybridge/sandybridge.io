'use client';

import { useDraggable } from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';

interface DragHandleProps {
  id: string;
}

export function DragHandle({ id }: DragHandleProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`drag-handle ${isDragging ? 'drag-handle-active' : ''}`}
      aria-label="Drag to reorder"
    >
      <GripVertical size={14} />
    </button>
  );
}
