/* tslint:disable */
/* eslint-disable */

export class WasmCluster {
    free(): void;
    [Symbol.dispose](): void;
    get_state(): string;
    kill_node(id: number): void;
    constructor();
    revive_node(id: number): void;
    /**
     * Submit a command to the current leader. No-op if there is no leader.
     */
    submit_command(cmd: string): void;
    /**
     * Advance simulation by `elapsed_ms` milliseconds and return JSON state.
     */
    tick(elapsed_ms: number): string;
    /**
     * Toggle partition between nodes a and b. If not partitioned, adds one;
     * if already partitioned, removes it.
     */
    toggle_partition(a: number, b: number): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_wasmcluster_free: (a: number, b: number) => void;
    readonly wasmcluster_get_state: (a: number) => [number, number];
    readonly wasmcluster_kill_node: (a: number, b: number) => void;
    readonly wasmcluster_new: () => number;
    readonly wasmcluster_revive_node: (a: number, b: number) => void;
    readonly wasmcluster_submit_command: (a: number, b: number, c: number) => void;
    readonly wasmcluster_tick: (a: number, b: number) => [number, number];
    readonly wasmcluster_toggle_partition: (a: number, b: number, c: number) => void;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
