'use client';

import { Fragment } from 'react';
import { ChevronRight, ChevronDown, Folder, FileText, X } from 'lucide-react';
import { useDragTree } from './context';
import { DropZone } from './DropZone';
import { DragHandle } from './DragHandle';
import type { Block } from './types';

interface TreeRendererProps {
  parentId: string | null;
  depth?: number;
}

export function TreeRenderer({ parentId, depth = 0 }: TreeRendererProps) {
  const { blocksByParent, dragStartByParent, activeId } = useDragTree();
  const children = blocksByParent.get(parentId) ?? [];
  // Use original state for zone visibility to prevent flickering
  const originalChildren = dragStartByParent?.get(parentId) ?? children;
  const isRoot = parentId === null;

  if (children.length === 0 && parentId !== null) {
    return activeId ? <DropZone id={`into-${parentId}`} className="drop-zone-empty" /> : null;
  }

  // Determine which block was last in the ORIGINAL order (before drag started)
  const originalLastId = originalChildren.length > 0
    ? originalChildren[originalChildren.length - 1].id
    : null;

  return (
    <>
      {children.map((block) => {
        const isActiveBlock = block.id === activeId;
        const wasOriginallyLast = block.id === originalLastId;
        const showBefore = !isActiveBlock;
        // Only show after zone at root level to avoid competing with into-{section} zones
        const showAfter = isRoot && wasOriginallyLast && !isActiveBlock;
        return (
          <Fragment key={block.id}>
            {showBefore && <DropZone id={`before-${block.id}`} />}
            {block.type === 'section' ? (
              <SectionNode block={block} depth={depth} />
            ) : (
              <ItemNode block={block} depth={depth} />
            )}
            {showAfter && <DropZone id={`after-${block.id}`} />}
          </Fragment>
        );
      })}
    </>
  );
}

interface NodeProps {
  block: Block;
  depth: number;
}

function SectionNode({ block, depth }: NodeProps) {
  const { expandedMap, toggleExpand, activeId, blocksByParent, deleteItem } = useDragTree();
  const isExpanded = expandedMap[block.id] ?? true;
  const hasChildren = (blocksByParent.get(block.id) ?? []).length > 0;

  return (
    <div className="drag-section" style={{ '--depth': depth } as React.CSSProperties}>
      <div className="drag-node drag-node-section">
        <DragHandle id={block.id} />
        <button
          className="expand-toggle"
          onClick={() => toggleExpand(block.id)}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <Folder size={14} className="node-icon" />
        <span className="node-title">{block.title}</span>
        <button
          className="delete-btn"
          onClick={() => deleteItem(block.id)}
          aria-label="Delete"
        >
          <X size={12} />
        </button>
      </div>
      {isExpanded ? (
        <div className="section-children">
          <TreeRenderer parentId={block.id} depth={depth + 1} />
          {activeId && hasChildren && (
            <DropZone id={`into-${block.id}`} className="drop-zone-section-end" />
          )}
        </div>
      ) : (
        activeId && <DropZone id={`into-${block.id}`} className="drop-zone-collapsed" />
      )}
    </div>
  );
}

function ItemNode({ block, depth }: NodeProps) {
  const { deleteItem } = useDragTree();

  return (
    <div className="drag-node drag-node-item" style={{ '--depth': depth } as React.CSSProperties}>
      <DragHandle id={block.id} />
      <FileText size={14} className="node-icon" />
      <span className="node-title">{block.title}</span>
      <button
        className="delete-btn"
        onClick={() => deleteItem(block.id)}
        aria-label="Delete"
      >
        <X size={12} />
      </button>
    </div>
  );
}
