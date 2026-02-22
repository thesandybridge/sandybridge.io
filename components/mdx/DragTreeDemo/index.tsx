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
import s from './DragTreeDemo.module.css';

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
    <div className={`${s.dragSection}${isDragging ? ` ${s.dragDragging}` : ''}`}>
      <div className={`${s.dragNode} ${s.dragNodeSection}`}>
        <GripVertical size={14} className={s.dragGrip} />
        <button
          className={s.expandToggle}
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          <ChevronRight size={14} className={`${s.expandChevron}${isExpanded ? ` ${s.expanded}` : ''}`} />
        </button>
        <Icon size={14} className={`${s.nodeIcon}${isExpanded ? ` ${s.nodeIconActive}` : ''}`} />
        <span className={s.nodeTitle}>{block.title}</span>
      </div>
      {isExpanded && children && (
        <div className={s.sectionChildren}>
          {children}
        </div>
      )}
    </div>
  );
}

function ItemRenderer({ block, isDragging }: BlockRendererProps<Block>) {
  return (
    <div className={`${s.dragNode} ${s.dragNodeItem}${isDragging ? ` ${s.dragDragging}` : ''}`}>
      <GripVertical size={14} className={s.dragGrip} />
      <FileText size={14} className={s.nodeIcon} />
      <span className={s.nodeTitle}>{block.title}</span>
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
    <div className={s.dragTreeDemo}>
      <div className={s.dragTreePanel}>
        <div className={s.dragTreeControls}>
          <button
            className={s.dragTreeBtn}
            onClick={() => addItem('section')}
            disabled={!canAdd}
            title="Add section"
          >
            <Plus size={14} />
            <Folder size={14} />
          </button>
          <button
            className={s.dragTreeBtn}
            onClick={() => addItem('item')}
            disabled={!canAdd}
            title="Add item"
          >
            <Plus size={14} />
            <FileText size={14} />
          </button>
          <button
            className={s.dragTreeBtn}
            onClick={reset}
            title="Reset to initial"
          >
            <RotateCcw size={14} />
          </button>
          <span className={s.dragTreeCount}>{blockCount}/{MAX_BLOCKS}</span>
        </div>
        <BlockTree<Block, typeof CONTAINER_TYPES>
          blocks={blocks}
          renderers={renderers}
          containerTypes={CONTAINER_TYPES}
          onChange={setBlocks}
          initialExpanded="all"
          showDropPreview
          activationDistance={8}
          previewDebounce={200}
          className={s.dragTree}
          dropZoneClassName={s.dropIndicator}
          dropZoneActiveClassName={s.dropIndicatorActive}
          indentClassName={s.treeIndent}
          dragOverlay={(block) => (
            <div className={s.dragOverlayItem}>
              <GripVertical size={14} className={s.dragOverlayGrip} />
              {block.type === 'section' ? (
                <Folder size={14} />
              ) : (
                <FileText size={14} />
              )}
              <span className={s.dragOverlayTitle}>{block.title}</span>
            </div>
          )}
        />
      </div>
      <MiniMap blocks={blocks} initialBlocks={INITIAL_BLOCKS} />
    </div>
  );
}
