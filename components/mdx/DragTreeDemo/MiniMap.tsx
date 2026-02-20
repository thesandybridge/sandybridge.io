'use client';

import { useRef, useEffect, useMemo } from 'react';
import { diffBlocks, buildTree, flattenTree } from './utils';
import type { Block, BlockChange, TreeNode } from './types';

interface MiniMapProps {
  blocks: Block[];
  initialBlocks: Block[];
}

export function MiniMap({ blocks, initialBlocks }: MiniMapProps) {
  const prevBlocksRef = useRef<Block[]>(initialBlocks);

  const { changes, tree } = useMemo(() => {
    const changeList = diffBlocks(prevBlocksRef.current, blocks);
    const changeMap = new Map<string, BlockChange['type']>();
    for (const change of changeList) {
      changeMap.set(change.block.id, change.type);
    }

    const removedBlocks = changeList
      .filter(c => c.type === 'removed')
      .map(c => c.block);

    const allBlocks = [...blocks, ...removedBlocks];
    const treeNodes = buildTree(allBlocks);
    const flat = flattenTree(treeNodes);

    return {
      changes: changeMap,
      tree: flat,
    };
  }, [blocks]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      prevBlocksRef.current = [...blocks];
    }, 500);
    return () => clearTimeout(timeout);
  }, [blocks]);

  const hasChanges = changes.size > 0;

  return (
    <div className="drag-tree-minimap">
      <div className="minimap-header">
        <span className="minimap-title">Structure Diff</span>
        {hasChanges && <span className="minimap-badge">{changes.size} change{changes.size !== 1 ? 's' : ''}</span>}
      </div>
      <div className="minimap-tree">
        {tree.map((node) => (
          <MiniMapNode key={node.id} node={node} changeType={changes.get(node.id)} />
        ))}
      </div>
      <div className="minimap-legend">
        <span className="legend-item"><span className="legend-dot diff-changed" /> moved</span>
        <span className="legend-item"><span className="legend-dot diff-added" /> added</span>
        <span className="legend-item"><span className="legend-dot diff-removed" /> removed</span>
      </div>
    </div>
  );
}

interface MiniMapNodeProps {
  node: TreeNode;
  changeType?: BlockChange['type'];
}

function MiniMapNode({ node, changeType }: MiniMapNodeProps) {
  const indicator = changeType === 'added' ? '+' : changeType === 'removed' ? '-' : changeType === 'changed' ? '~' : '';

  return (
    <div
      className={`minimap-node ${changeType ? `diff-${changeType}` : ''}`}
      style={{ '--depth': node.depth } as React.CSSProperties}
    >
      {indicator && <span className="minimap-indicator">{indicator}</span>}
      <span className="minimap-type">{node.type === 'section' ? '▸' : '·'}</span>
      <span className="minimap-label">{node.title}</span>
    </div>
  );
}
