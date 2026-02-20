'use client';

import { useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type CollisionDetection,
} from '@dnd-kit/core';
import { Folder, FileText, Plus, RotateCcw, GripVertical } from 'lucide-react';
import { DragTreeProvider, useDragTree } from './context';
import { TreeRenderer } from './TreeRenderer';
import { MiniMap } from './MiniMap';
import type { Block } from './types';

const MAX_BLOCKS = 20;

// Custom collision detection using edge distance with bottom bias
// Much better for thin horizontal drop zones than rectIntersection or closestCenter
const weightedVerticalCollision: CollisionDetection = ({ droppableContainers, collisionRect }) => {
  if (!collisionRect) return [];

  const pointerY = collisionRect.top + collisionRect.height / 2;

  const candidates = droppableContainers
    .map((container) => {
      const rect = container.rect.current;
      if (!rect) return null;

      const distanceToTop = Math.abs(pointerY - rect.top);
      const distanceToBottom = Math.abs(pointerY - rect.bottom);
      const edgeDistance = Math.min(distanceToTop, distanceToBottom);

      // Bias toward bottom edge when pointer is below center
      const isBelowCenter = pointerY > rect.top + rect.height / 2;
      const bias = isBelowCenter ? -5 : 0;

      return {
        id: container.id,
        data: { droppableContainer: container, value: edgeDistance + bias },
      };
    })
    .filter(Boolean) as { id: string | number; data: { droppableContainer: unknown; value: number } }[];

  candidates.sort((a, b) => a.data.value - b.data.value);
  return candidates.slice(0, 1);
};

const INITIAL_BLOCKS: Block[] = [
  // Level 1: Root sections
  { id: 's1', type: 'section', parentId: null, order: 0, title: 'Frontend' },

  // Level 2: Nested sections
  { id: 's1-1', type: 'section', parentId: 's1', order: 0, title: 'Components' },
  { id: 'i1', type: 'item', parentId: 's1-1', order: 0, title: 'Button' },
  { id: 'i2', type: 'item', parentId: 's1-1', order: 1, title: 'Modal' },

  { id: 's1-2', type: 'section', parentId: 's1', order: 1, title: 'Hooks' },
  { id: 'i3', type: 'item', parentId: 's1-2', order: 0, title: 'useAuth' },

  // Level 1: Another root
  { id: 's2', type: 'section', parentId: null, order: 1, title: 'Backend' },
  { id: 's2-1', type: 'section', parentId: 's2', order: 0, title: 'API Routes' },
  { id: 'i4', type: 'item', parentId: 's2-1', order: 0, title: '/users' },
  { id: 'i5', type: 'item', parentId: 's2-1', order: 1, title: '/posts' },

  { id: 's3', type: 'section', parentId: null, order: 2, title: 'Infrastructure' },
  { id: 'i6', type: 'item', parentId: 's3', order: 0, title: 'Docker setup' },
];

export function DragTreeDemo() {
  return (
    <DragTreeProvider initialBlocks={INITIAL_BLOCKS}>
      <DragTreeInner />
    </DragTreeProvider>
  );
}

function DragTreeInner() {
  const { startDrag, endDrag, activeId, hoverZone, handleHover, moveItem, addItem, reset, blocks, blockCount } = useDragTree();
  const canAdd = blockCount < MAX_BLOCKS;

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { distance: 8 },
  });
  const sensors = useSensors(pointerSensor, touchSensor);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    startDrag(String(event.active.id));
  }, [startDrag]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const dropZone = hoverZone ?? (event.over?.id ? String(event.over.id) : null);
    if (dropZone && activeId) {
      moveItem(activeId, dropZone);
    }
    endDrag();
  }, [hoverZone, activeId, moveItem, endDrag]);

  const handleDragCancel = useCallback(() => {
    endDrag();
  }, [endDrag]);

  const activeBlock = activeId ? blocks.find(b => b.id === activeId) : null;

  return (
    <div className="drag-tree-demo">
      <div className="drag-tree-panel">
        <div className="drag-tree-controls">
          <button
            className="drag-tree-btn"
            onClick={() => addItem('section', null)}
            disabled={!canAdd}
            title="Add section"
          >
            <Plus size={14} />
            <Folder size={14} />
          </button>
          <button
            className="drag-tree-btn"
            onClick={() => addItem('item', null)}
            disabled={!canAdd}
            title="Add item"
          >
            <Plus size={14} />
            <FileText size={14} />
          </button>
          <button
            className="drag-tree-btn"
            onClick={reset}
            title="Reset to initial"
          >
            <RotateCcw size={14} />
          </button>
          <span className="drag-tree-count">{blockCount}/{MAX_BLOCKS}</span>
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={weightedVerticalCollision}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="drag-tree">
            <TreeRenderer parentId={null} />
          </div>
          <DragOverlay dropAnimation={null} adjustScale={false}>
            {activeBlock && (
              <div className="drag-overlay-item">
                <GripVertical size={14} className="drag-overlay-grip" />
                {activeBlock.type === 'section' ? (
                  <Folder size={14} />
                ) : (
                  <FileText size={14} />
                )}
                <span className="drag-overlay-title">{activeBlock.title}</span>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
      <MiniMap initialBlocks={INITIAL_BLOCKS} />
    </div>
  );
}
