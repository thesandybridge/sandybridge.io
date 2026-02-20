import type { BaseBlock } from 'dnd-block-tree';

export interface Block extends BaseBlock {
  type: 'section' | 'item';
  title: string;
}

export interface TreeNode extends Block {
  children: TreeNode[];
  depth: number;
}

export type BlockChangeType = 'added' | 'removed' | 'changed';

export interface BlockChange {
  type: BlockChangeType;
  block: Block;
}
