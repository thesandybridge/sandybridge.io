import type { Block, BlockChange, TreeNode } from './types';

export function diffBlocks(prev: Block[], next: Block[]): BlockChange[] {
  const prevByParent = new Map<string | null, string[]>();
  const nextByParent = new Map<string | null, string[]>();

  for (const block of prev) {
    const list = prevByParent.get(block.parentId) ?? [];
    list.push(block.id);
    prevByParent.set(block.parentId, list);
  }

  for (const block of next) {
    const list = nextByParent.get(block.parentId) ?? [];
    list.push(block.id);
    nextByParent.set(block.parentId, list);
  }

  const prevPositions = new Map<string, { parentId: string | null; index: number }>();
  const nextPositions = new Map<string, { parentId: string | null; index: number }>();

  for (const [parentId, ids] of prevByParent.entries()) {
    ids.forEach((id, index) => {
      prevPositions.set(id, { parentId, index });
    });
  }

  for (const [parentId, ids] of nextByParent.entries()) {
    ids.forEach((id, index) => {
      nextPositions.set(id, { parentId, index });
    });
  }

  const prevMap = new Map(prev.map(b => [b.id, b]));
  const nextMap = new Map(next.map(b => [b.id, b]));
  const changes: BlockChange[] = [];

  for (const [id, nextBlock] of nextMap.entries()) {
    const prevPos = prevPositions.get(id);
    const nextPos = nextPositions.get(id);

    if (!prevPos) {
      changes.push({ type: 'added', block: nextBlock });
    } else if (nextPos) {
      const parentChanged = prevPos.parentId !== nextPos.parentId;
      const indexChanged = prevPos.index !== nextPos.index;

      if (parentChanged || indexChanged) {
        changes.push({ type: 'changed', block: nextBlock });
      }
    }
  }

  for (const id of prevMap.keys()) {
    if (!nextMap.has(id)) {
      const prevBlock = prevMap.get(id)!;
      changes.push({ type: 'removed', block: prevBlock });
    }
  }

  return changes;
}

export function buildTree(blocks: Block[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];
  const childrenOrder = new Map<string, string[]>();

  for (const block of blocks) {
    map.set(block.id, { ...block, children: [], depth: 0 });

    const parentKey = block.parentId ?? '__root__';
    const order = childrenOrder.get(parentKey) ?? [];
    order.push(block.id);
    childrenOrder.set(parentKey, order);
  }

  for (const block of blocks) {
    const node = map.get(block.id)!;
    if (node.parentId && map.has(node.parentId)) {
      const parent = map.get(node.parentId)!;
      node.depth = parent.depth + 1;
    }
  }

  for (const [parentKey, ids] of childrenOrder.entries()) {
    if (parentKey === '__root__') {
      for (const id of ids) {
        const node = map.get(id);
        if (node && !node.parentId) roots.push(node);
      }
    } else {
      const parent = map.get(parentKey);
      if (parent) {
        for (const id of ids) {
          const child = map.get(id);
          if (child) parent.children.push(child);
        }
      }
    }
  }

  function setDepths(nodes: TreeNode[], depth: number) {
    for (const node of nodes) {
      node.depth = depth;
      setDepths(node.children, depth + 1);
    }
  }
  setDepths(roots, 0);

  return roots;
}

export function flattenTree(nodes: TreeNode[]): TreeNode[] {
  const result: TreeNode[] = [];
  function walk(list: TreeNode[]) {
    for (const node of list) {
      result.push(node);
      walk(node.children);
    }
  }
  walk(nodes);
  return result;
}
