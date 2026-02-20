'use client';

import { useState, useCallback } from 'react';
import {
  BlockTree,
  type ContainerRendererProps,
  type BlockRendererProps,
} from 'dnd-block-tree';
import { ChevronRight, Folder, FolderOpen, FileText, Plus, RotateCcw, GripVertical } from 'lucide-react';
import { MiniMap } from './MiniMap';
import type { Block } from './types';

const MAX_BLOCKS = 20;

const INITIAL_BLOCKS: Block[] = [
  { id: 's1', type: 'section', parentId: null, order: 0, title: 'Frontend' },
  { id: 's1-1', type: 'section', parentId: 's1', order: 0, title: 'Components' },
  { id: 'i1', type: 'item', parentId: 's1-1', order: 0, title: 'Button' },
  { id: 'i2', type: 'item', parentId: 's1-1', order: 1, title: 'Modal' },
  { id: 's1-2', type: 'section', parentId: 's1', order: 1, title: 'Hooks' },
  { id: 'i3', type: 'item', parentId: 's1-2', order: 0, title: 'useAuth' },
  { id: 's2', type: 'section', parentId: null, order: 1, title: 'Backend' },
  { id: 's2-1', type: 'section', parentId: 's2', order: 0, title: 'API Routes' },
  { id: 'i4', type: 'item', parentId: 's2-1', order: 0, title: '/users' },
  { id: 'i5', type: 'item', parentId: 's2-1', order: 1, title: '/posts' },
  { id: 's3', type: 'section', parentId: null, order: 2, title: 'Infrastructure' },
  { id: 'i6', type: 'item', parentId: 's3', order: 0, title: 'Docker setup' },
];

const CONTAINER_TYPES = ['section'] as const;

function SectionRenderer({ block, children, isDragging, isExpanded, onToggleExpand }: ContainerRendererProps<Block>) {
  const Icon = isExpanded ? FolderOpen : Folder;

  return (
    <div className={`drag-section${isDragging ? ' drag-dragging' : ''}`}>
      <div className="drag-node drag-node-section">
        <GripVertical size={14} className="drag-grip" />
        <button
          className="expand-toggle"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          <ChevronRight size={14} className={`expand-chevron${isExpanded ? ' expanded' : ''}`} />
        </button>
        <Icon size={14} className={`node-icon${isExpanded ? ' node-icon-active' : ''}`} />
        <span className="node-title">{block.title}</span>
      </div>
      {isExpanded && children && (
        <div className="section-children">
          {children}
        </div>
      )}
    </div>
  );
}

function ItemRenderer({ block, isDragging }: BlockRendererProps<Block>) {
  return (
    <div className={`drag-node drag-node-item${isDragging ? ' drag-dragging' : ''}`}>
      <GripVertical size={14} className="drag-grip" />
      <FileText size={14} className="node-icon" />
      <span className="node-title">{block.title}</span>
    </div>
  );
}

const renderers = {
  section: SectionRenderer,
  item: ItemRenderer,
};

export function DragTreeDemo() {
  const [blocks, setBlocks] = useState<Block[]>(INITIAL_BLOCKS);
  const blockCount = blocks.length;
  const canAdd = blockCount < MAX_BLOCKS;

  const addItem = useCallback((type: Block['type']) => {
    const id = `${type[0]}${Date.now()}`;
    const title = type === 'section' ? 'New Section' : 'New Item';
    setBlocks(prev => [...prev, { id, type, parentId: null, order: prev.length, title }]);
  }, []);

  const reset = useCallback(() => {
    setBlocks(INITIAL_BLOCKS);
  }, []);

  return (
    <div className="drag-tree-demo">
      <div className="drag-tree-panel">
        <div className="drag-tree-controls">
          <button
            className="drag-tree-btn"
            onClick={() => addItem('section')}
            disabled={!canAdd}
            title="Add section"
          >
            <Plus size={14} />
            <Folder size={14} />
          </button>
          <button
            className="drag-tree-btn"
            onClick={() => addItem('item')}
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
        <BlockTree<Block, typeof CONTAINER_TYPES>
          blocks={blocks}
          renderers={renderers}
          containerTypes={CONTAINER_TYPES}
          onChange={setBlocks}
          initialExpanded="all"
          showDropPreview
          activationDistance={8}
          className="drag-tree"
          dropZoneClassName="drop-indicator"
          dropZoneActiveClassName="drop-indicator-active"
          indentClassName="tree-indent"
          dragOverlay={(block) => (
            <div className="drag-overlay-item">
              <GripVertical size={14} className="drag-overlay-grip" />
              {block.type === 'section' ? (
                <Folder size={14} />
              ) : (
                <FileText size={14} />
              )}
              <span className="drag-overlay-title">{block.title}</span>
            </div>
          )}
        />
      </div>
      <MiniMap blocks={blocks} initialBlocks={INITIAL_BLOCKS} />
    </div>
  );
}
