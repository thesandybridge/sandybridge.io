export interface Block {
  id: string;
  type: 'section' | 'item';
  parentId: string | null;
  order: number;
  title: string;
}

export interface BlockIndex {
  byId: Map<string, Block>;
  byParent: Map<string | null, string[]>;
}

export type BlockAction =
  | { type: 'MOVE_ITEM'; payload: { activeId: string; zone: string } }
  | { type: 'SET_ALL'; payload: Block[] }
  | { type: 'ADD_ITEM'; payload: Block }
  | { type: 'DELETE_ITEM'; payload: { id: string } };

export interface TreeNode extends Block {
  children: TreeNode[];
  depth: number;
}

export type BlockChangeType = 'added' | 'removed' | 'changed';

export interface BlockChange {
  type: BlockChangeType;
  block: Block;
}
