import type { Block, BlockAction, BlockIndex } from './types';
import { cloneMap, cloneParentMap, reparentBlockIndex } from './utils';

export function blockReducer(state: BlockIndex, action: BlockAction): BlockIndex {
  switch (action.type) {
    case 'SET_ALL': {
      const byId = new Map<string, Block>();
      const byParent = new Map<string | null, string[]>();

      for (const block of action.payload) {
        byId.set(block.id, block);
        const key = block.parentId ?? null;
        const list = byParent.get(key) ?? [];
        byParent.set(key, [...list, block.id]);
      }

      return { byId, byParent };
    }

    case 'MOVE_ITEM': {
      return reparentBlockIndex(state, action.payload.activeId, action.payload.zone);
    }

    case 'ADD_ITEM': {
      const byId = cloneMap(state.byId);
      const byParent = cloneParentMap(state.byParent);
      const item = action.payload;

      byId.set(item.id, item);

      const parentKey = item.parentId ?? null;
      const list = byParent.get(parentKey) ?? [];
      byParent.set(parentKey, [...list, item.id]);

      return { byId, byParent };
    }

    case 'DELETE_ITEM': {
      const byId = cloneMap(state.byId);
      const byParent = cloneParentMap(state.byParent);

      // Collect all descendants
      const collectDescendants = (id: string): Set<string> => {
        const toDelete = new Set<string>();
        const stack = [id];
        while (stack.length > 0) {
          const current = stack.pop()!;
          toDelete.add(current);
          const children = byParent.get(current) ?? [];
          stack.push(...children);
        }
        return toDelete;
      };

      const idsToDelete = collectDescendants(action.payload.id);
      for (const id of idsToDelete) {
        byId.delete(id);
        byParent.delete(id);
      }

      // Remove deleted ids from all parent lists
      for (const [parent, list] of byParent.entries()) {
        byParent.set(parent, list.filter(id => !idsToDelete.has(id)));
      }

      return { byId, byParent };
    }

    default:
      return state;
  }
}

export function createInitialState(blocks: Block[]): BlockIndex {
  const byId = new Map<string, Block>();
  const byParent = new Map<string | null, string[]>();

  for (const block of blocks) {
    byId.set(block.id, block);
    const key = block.parentId ?? null;
    const list = byParent.get(key) ?? [];
    byParent.set(key, [...list, block.id]);
  }

  return { byId, byParent };
}
