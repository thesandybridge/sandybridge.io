import type { Block, BlockChange, BlockIndex, TreeNode } from './types';

export function extractUUID(zone: string): string {
  if (zone.startsWith('before-')) return zone.slice(7);
  if (zone.startsWith('after-')) return zone.slice(6);
  if (zone.startsWith('into-')) return zone.slice(5);
  return zone;
}

export function cloneMap<K, V>(map: Map<K, V>): Map<K, V> {
  return new Map(map);
}

export function cloneParentMap(map: Map<string | null, string[]>): Map<string | null, string[]> {
  const newMap = new Map<string | null, string[]>();
  for (const [k, v] of map.entries()) {
    newMap.set(k, [...v]);
  }
  return newMap;
}

export function reparentBlockIndex(
  state: BlockIndex,
  activeId: string,
  hoverZone: string
): BlockIndex {
  const byId = cloneMap(state.byId);
  const byParent = cloneParentMap(state.byParent);

  const dragged = byId.get(activeId);
  if (!dragged) return state;

  const zoneTargetId = extractUUID(hoverZone);
  const isAfter = hoverZone.startsWith('after-');
  const isInto = hoverZone.startsWith('into-');
  const target = byId.get(zoneTargetId);

  const oldParentId = dragged.parentId ?? null;
  const newParentId = isInto ? zoneTargetId : target?.parentId ?? null;

  // Sections can be nested now (unlike original which restricted to root)
  if (dragged.id === zoneTargetId) return state;

  // Prevent dropping into own descendants
  let checkId: string | null = newParentId;
  while (checkId) {
    if (checkId === dragged.id) return state;
    checkId = byId.get(checkId)?.parentId ?? null;
  }

  // Remove dragged from old parent
  const oldList = byParent.get(oldParentId) ?? [];
  const filtered = oldList.filter(id => id !== dragged.id);
  byParent.set(oldParentId, filtered);

  // Insert dragged into new parent
  const newList = [...(byParent.get(newParentId) ?? [])];
  let insertIndex = newList.length;

  if (!isInto) {
    const idx = newList.indexOf(zoneTargetId);
    insertIndex = idx === -1 ? newList.length : isAfter ? idx + 1 : idx;
  }

  // Filter out the dragged id if it's already in the new list (same parent reorder)
  const cleanList = newList.filter(id => id !== dragged.id);
  cleanList.splice(insertIndex, 0, dragged.id);
  byParent.set(newParentId, cleanList);

  byId.set(dragged.id, {
    ...dragged,
    parentId: newParentId,
  });

  return { byId, byParent };
}

export function diffBlocks(prev: Block[], next: Block[]): BlockChange[] {
  // Build position maps: id -> { parentId, index }
  const prevPositions = new Map<string, { parentId: string | null; index: number }>();
  const nextPositions = new Map<string, { parentId: string | null; index: number }>();

  // Group by parent and track indices
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

  // Build position maps from grouped data
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

  // First pass: create nodes and track insertion order per parent
  for (const block of blocks) {
    map.set(block.id, { ...block, children: [], depth: 0 });

    const parentKey = block.parentId ?? '__root__';
    const order = childrenOrder.get(parentKey) ?? [];
    order.push(block.id);
    childrenOrder.set(parentKey, order);
  }

  // Second pass: build tree structure preserving array order
  for (const block of blocks) {
    const node = map.get(block.id)!;
    if (node.parentId && map.has(node.parentId)) {
      const parent = map.get(node.parentId)!;
      node.depth = parent.depth + 1;
    }
  }

  // Build children arrays in correct order
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

  // Calculate depths after tree is built
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
