'use client';

import { useRef, useEffect, useMemo } from 'react';
import { diffBlocks, buildTree, flattenTree } from './utils';
import type { Block, BlockChange, TreeNode } from './types';
import s from './DragTreeDemo.module.css';

interface MiniMapProps {
  blocks: Block[];
  initialBlocks: Block[];
}

const DIFF_CLASS: Record<string, string> = {
  added: s.diffAdded,
  removed: s.diffRemoved,
  changed: s.diffChanged,
};

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
    <div className={s.dragTreeMinimap}>
      <div className={s.minimapHeader}>
        <span className={s.minimapTitle}>Structure Diff</span>
        {hasChanges && <span className={s.minimapBadge}>{changes.size} change{changes.size !== 1 ? 's' : ''}</span>}
      </div>
      <div className={s.minimapTree}>
        {tree.map((node) => (
          <MiniMapNode key={node.id} node={node} changeType={changes.get(node.id)} />
        ))}
      </div>
      <div className={s.minimapLegend}>
        <span className={s.legendItem}><span className={`${s.legendDot} ${s.diffChanged}`} /> moved</span>
        <span className={s.legendItem}><span className={`${s.legendDot} ${s.diffAdded}`} /> added</span>
        <span className={s.legendItem}><span className={`${s.legendDot} ${s.diffRemoved}`} /> removed</span>
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
      className={`${s.minimapNode}${changeType ? ` ${DIFF_CLASS[changeType]}` : ''}`}
      style={{ '--depth': node.depth } as React.CSSProperties}
    >
      {indicator && <span className={s.minimapIndicator}>{indicator}</span>}
      <span className={s.minimapType}>{node.type === 'section' ? '\u25B8' : '\u00B7'}</span>
      <span className={s.minimapLabel}>{node.title}</span>
    </div>
  );
}
