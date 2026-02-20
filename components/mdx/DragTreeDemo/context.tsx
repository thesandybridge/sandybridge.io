'use client';

import {
  createContext,
  useContext,
  useReducer,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  type ReactNode,
} from 'react';
import type { Block, BlockIndex } from './types';
import { blockReducer, createInitialState } from './reducer';
import { reparentBlockIndex, cloneMap, cloneParentMap } from './utils';

interface DragTreeContextType {
  blocks: Block[];
  blocksByParent: Map<string | null, Block[]>;
  activeId: string | null;
  startDrag: (id: string) => void;
  endDrag: () => void;
  hoverZone: string | null;
  handleHover: (zone: string | null) => void;
  moveItem: (activeId: string, zone: string) => void;
  addItem: (type: Block['type'], parentId: string | null) => void;
  deleteItem: (id: string) => void;
  reset: () => void;
  expandedMap: Record<string, boolean>;
  toggleExpand: (id: string) => void;
  blockCount: number;
  isDragging: boolean;
}

const DragTreeContext = createContext<DragTreeContextType | null>(null);

export function useDragTree() {
  const ctx = useContext(DragTreeContext);
  if (!ctx) throw new Error('useDragTree must be used within DragTreeProvider');
  return ctx;
}

interface DragTreeProviderProps {
  initialBlocks: Block[];
  children: ReactNode;
}

export function DragTreeProvider({ initialBlocks, children }: DragTreeProviderProps) {
  const [state, dispatch] = useReducer(blockReducer, initialBlocks, createInitialState);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoverZone, setHoverZone] = useState<string | null>(null);
  const [virtualState, setVirtualState] = useState<BlockIndex | null>(null);
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    for (const block of initialBlocks) {
      if (block.type === 'section') {
        map[block.id] = true;
      }
    }
    return map;
  });

  // Snapshot of state when drag starts - all computations use this
  const initialStateRef = useRef<BlockIndex | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Use virtual state during drag, actual state otherwise
  const effectiveState = virtualState ?? state;

  const blocks = useMemo(() => {
    const result: Block[] = [];
    const walk = (parentId: string | null) => {
      const children = effectiveState.byParent.get(parentId) ?? [];
      for (const id of children) {
        const block = effectiveState.byId.get(id);
        if (block) {
          result.push(block);
          if (block.type === 'section') {
            walk(block.id);
          }
        }
      }
    };
    walk(null);
    return result;
  }, [effectiveState]);

  const blocksByParent = useMemo(() => {
    const map = new Map<string | null, Block[]>();
    for (const [parentId, ids] of effectiveState.byParent.entries()) {
      const blockList = ids
        .map(id => effectiveState.byId.get(id))
        .filter((b): b is Block => b !== undefined);
      map.set(parentId, blockList);
    }
    return map;
  }, [effectiveState]);

  const startDrag = useCallback((id: string) => {
    // Snapshot current state for all drag computations
    initialStateRef.current = {
      byId: cloneMap(state.byId),
      byParent: cloneParentMap(state.byParent),
    };
    setActiveId(id);
  }, [state]);

  const endDrag = useCallback(() => {
    setActiveId(null);
    setHoverZone(null);
    setVirtualState(null);
    initialStateRef.current = null;
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  }, []);

  const handleHover = useCallback((zone: string | null) => {
    setHoverZone(zone);

    // Compute virtual preview from initial snapshot (debounced)
    if (zone && activeId && initialStateRef.current) {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        if (!initialStateRef.current || !activeId) return;
        const newState = reparentBlockIndex(initialStateRef.current, activeId, zone);
        setVirtualState(newState);
      }, 150);
    }
  }, [activeId]);

  const moveItem = useCallback((activeId: string, zone: string) => {
    dispatch({ type: 'MOVE_ITEM', payload: { activeId, zone } });
  }, []);

  const addItem = useCallback((type: Block['type'], parentId: string | null) => {
    const id = `${type[0]}${Date.now()}`;
    const title = type === 'section' ? 'New Section' : 'New Item';
    dispatch({
      type: 'ADD_ITEM',
      payload: { id, type, parentId, order: 0, title },
    });
    if (type === 'section') {
      setExpandedMap(prev => ({ ...prev, [id]: true }));
    }
  }, []);

  const deleteItem = useCallback((id: string) => {
    dispatch({ type: 'DELETE_ITEM', payload: { id } });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'SET_ALL', payload: initialBlocks });
    const map: Record<string, boolean> = {};
    for (const block of initialBlocks) {
      if (block.type === 'section') {
        map[block.id] = true;
      }
    }
    setExpandedMap(map);
  }, [initialBlocks]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedMap(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const isDragging = activeId !== null;

  const blockCount = blocks.length;

  const value = useMemo(
    () => ({
      blocks,
      blocksByParent,
      activeId,
      startDrag,
      endDrag,
      hoverZone,
      handleHover,
      moveItem,
      addItem,
      deleteItem,
      reset,
      expandedMap,
      toggleExpand,
      blockCount,
      isDragging,
    }),
    [blocks, blocksByParent, activeId, startDrag, endDrag, hoverZone, handleHover, moveItem, addItem, deleteItem, reset, expandedMap, toggleExpand, blockCount, isDragging]
  );

  return (
    <DragTreeContext.Provider value={value}>
      {children}
    </DragTreeContext.Provider>
  );
}
