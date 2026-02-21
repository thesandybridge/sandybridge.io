/* tslint:disable */
/* eslint-disable */
export class Sha3WasmState {
  free(): void;
  is_complete(): boolean;
  get_output_hex(): string;
  get_step_index(): number;
  /**
   * Returns the full 1600-bit state as 200 bytes (25 lanes × 8 bytes, little-endian).
   * Efficient for bulk transfer to JS for visualization.
   */
  get_state_as_bytes(): Uint8Array;
  get_current_step_name(): string;
  constructor();
  step(): void;
  /**
   * Returns the lane value at (x, z) as f64. Precision is limited for large u64 values,
   * but sufficient for visual density calculations.
   */
  get_lane(x: number, z: number): number;
  get_round(): number;
  set_input(input: string): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_sha3wasmstate_free: (a: number, b: number) => void;
  readonly sha3wasmstate_get_current_step_name: (a: number) => [number, number];
  readonly sha3wasmstate_get_lane: (a: number, b: number, c: number) => number;
  readonly sha3wasmstate_get_output_hex: (a: number) => [number, number];
  readonly sha3wasmstate_get_round: (a: number) => number;
  readonly sha3wasmstate_get_state_as_bytes: (a: number) => [number, number];
  readonly sha3wasmstate_get_step_index: (a: number) => number;
  readonly sha3wasmstate_is_complete: (a: number) => number;
  readonly sha3wasmstate_new: () => number;
  readonly sha3wasmstate_set_input: (a: number, b: number, c: number) => void;
  readonly sha3wasmstate_step: (a: number) => void;
  readonly __wbindgen_export_0: WebAssembly.Table;
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
