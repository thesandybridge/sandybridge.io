'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import s from './Sha3Demo.module.css';

interface Sha3WasmStateInstance {
  free(): void;
  set_input(input: string): void;
  step(): void;
  is_complete(): boolean;
  get_round(): number;
  get_step_index(): number;
  get_current_step_name(): string;
  get_lane(x: number, z: number): number;
  get_state_as_bytes(): Uint8Array;
  get_output_hex(): string;
}

type Sha3WasmClass = new () => Sha3WasmStateInstance;

// Step colors matching the Bevy demo
const STEP_COLORS = ['#fb4934', '#b8bb26', '#83a598', '#d3869b', '#d79921'];

// Load WASM module from /public, escaping bundler static analysis.
function loadExternalModule(url: string): Promise<Record<string, unknown>> {
  return (Function('u', 'return import(u)') as (u: string) => Promise<Record<string, unknown>>)(url);
}

function lanePop(bytes: Uint8Array, x: number, z: number): number {
  const off = (x + 5 * z) * 8;
  let n = 0;
  for (let i = 0; i < 8; i++) {
    let b = bytes[off + i];
    while (b) { n += b & 1; b >>>= 1; }
  }
  return n;
}

function laneHex(bytes: Uint8Array, x: number, z: number): string {
  const off = (x + 5 * z) * 8;
  let s = '';
  for (let i = 7; i >= 0; i--) s += bytes[off + i].toString(16).padStart(2, '0');
  return s;
}

const EMPTY_BYTES = new Uint8Array(200);

export function Sha3Demo() {
  const [wasmReady, setWasmReady] = useState(false);
  const [input, setInput] = useState('');
  const [round, setRound] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [stepName, setStepName] = useState('Absorb Input');
  const [isComplete, setIsComplete] = useState(false);
  const [stateBytes, setStateBytes] = useState<Uint8Array>(EMPTY_BYTES);
  const [outputHex, setOutputHex] = useState('');
  const [isAuto, setIsAuto] = useState(false);

  const wasmClassRef = useRef<Sha3WasmClass | null>(null);
  const stateRef = useRef<Sha3WasmStateInstance | null>(null);
  const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const syncUi = useCallback(() => {
    const st = stateRef.current;
    if (!st) return;
    setRound(st.get_round());
    setStepIndex(st.get_step_index());
    setStepName(st.get_current_step_name());
    const complete = st.is_complete();
    setIsComplete(complete);
    setStateBytes(st.get_state_as_bytes());
    if (complete) setOutputHex(st.get_output_hex());
  }, []);

  const stopAuto = useCallback(() => {
    if (autoTimerRef.current !== null) {
      clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
    }
    setIsAuto(false);
  }, []);

  // Load WASM on mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const mod = await loadExternalModule('/wasm/sha3/sha3_visualizer.js');
      await (mod.default as () => Promise<unknown>)();
      if (cancelled) return;
      const Cls = mod.Sha3WasmState as Sha3WasmClass;
      wasmClassRef.current = Cls;
      stateRef.current = new Cls();
      setWasmReady(true);
    }
    load().catch(console.error);
    return () => { cancelled = true; };
  }, []);

  const doStep = useCallback(() => {
    const st = stateRef.current;
    if (!st || st.is_complete()) return;
    st.step();
    syncUi();
    if (st.is_complete()) stopAuto();
  }, [syncUi, stopAuto]);

  const resetState = useCallback((val: string) => {
    stopAuto();
    const Cls = wasmClassRef.current;
    if (!Cls) return;
    stateRef.current?.free();
    const st = new Cls();
    stateRef.current = st;
    if (val) st.set_input(val);
    setRound(0);
    setStepIndex(0);
    setStepName('Absorb Input');
    setIsComplete(false);
    setStateBytes(new Uint8Array(200));
    setOutputHex('');
  }, [stopAuto]);

  const handleInput = useCallback((val: string) => {
    setInput(val);
    resetState(val);
  }, [resetState]);

  const toggleAuto = useCallback(() => {
    if (isAuto) {
      stopAuto();
      return;
    }
    const st = stateRef.current;
    if (!st || st.is_complete()) return;
    setIsAuto(true);
    autoTimerRef.current = setInterval(() => {
      const cur = stateRef.current;
      if (!cur || cur.is_complete()) {
        stopAuto();
        return;
      }
      cur.step();
      syncUi();
      if (cur.is_complete()) stopAuto();
    }, 100);
  }, [isAuto, stopAuto, syncUi]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAuto();
      stateRef.current?.free();
    };
  }, [stopAuto]);

  const stepColor = STEP_COLORS[stepIndex] ?? '#928374';

  return (
    <div className={s.sha3Demo}>
      <div className={s.sha3DemoHeader}>
        <input
          className={s.sha3DemoInput}
          type="text"
          placeholder="type to hash..."
          value={input}
          onChange={e => handleInput(e.target.value)}
          disabled={!wasmReady}
        />
        <span className={s.sha3DemoVariant}>SHA3-256</span>
      </div>

      <div className={s.sha3DemoStatus}>
        <span className={s.sha3DemoStepInfo}>
          Round <strong>{round}</strong>/23
          {' \u00B7 '}
          <span style={{ color: stepColor }}>{stepName}</span>
        </span>
        <div className={s.sha3DemoButtons}>
          <button
            className={s.sha3DemoBtn}
            onClick={doStep}
            disabled={!wasmReady || isComplete}
          >
            Step
          </button>
          <button
            className={`${s.sha3DemoBtn}${isAuto ? ` ${s.sha3DemoBtnActive}` : ''}`}
            onClick={toggleAuto}
            disabled={!wasmReady || isComplete}
          >
            {isAuto ? 'Pause' : 'Auto'}
          </button>
          <button
            className={s.sha3DemoBtn}
            onClick={() => resetState(input)}
            disabled={!wasmReady}
          >
            Reset
          </button>
        </div>
      </div>

      <div className={s.sha3DemoGrid}>
        {!wasmReady ? (
          <div className={s.sha3DemoLoading}>loading wasm...</div>
        ) : (
          Array.from({ length: 25 }, (_, i) => {
            const x = i % 5;
            const z = Math.floor(i / 5);
            const pop = lanePop(stateBytes, x, z);
            const lightness = 8 + (pop / 64) * 25;
            const hex = laneHex(stateBytes, x, z);
            return (
              <div
                key={i}
                className={s.sha3DemoCell}
                style={{
                  background: `hsl(0,0%,${lightness.toFixed(1)}%)`,
                  borderColor: stepColor,
                }}
                title={hex}
              >
                <span className={s.sha3DemoCellLabel}>{hex.slice(0, 8)}</span>
              </div>
            );
          })
        )}
      </div>

      {isComplete && outputHex && (
        <div className={s.sha3DemoOutput}>
          <span className={s.sha3DemoOutputLabel}>SHA3-256</span>
          <code className={s.sha3DemoOutputHex}>{outputHex}</code>
        </div>
      )}
    </div>
  );
}
