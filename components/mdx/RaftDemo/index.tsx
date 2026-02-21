'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface NodeState {
  id: number;
  role: 'follower' | 'candidate' | 'leader';
  term: number;
  voted_for: number | null;
  log_length: number;
  commit_index: number;
  election_timeout_pct: number;
  votes_received: number | null;
  dead: boolean;
}

interface InflightState {
  id: number;
  from: number;
  to: number;
  kind: 'RequestVote' | 'RequestVoteReply' | 'AppendEntries' | 'AppendEntriesReply';
  progress: number;
  granted: boolean | null;
  success: boolean | null;
  entries_count: number | null;
}

interface ClusterState {
  now_ms: number;
  nodes: NodeState[];
  inflight: InflightState[];
  partitions: [number, number][];
  events: string[];
  applied_commands: string[];
}

interface WasmCluster {
  tick(elapsed_ms: number): string;
  get_state(): string;
  kill_node(id: number): void;
  revive_node(id: number): void;
  toggle_partition(a: number, b: number): void;
  submit_command(cmd: string): void;
  free(): void;
}

type WasmClusterClass = new () => WasmCluster;

// ── Constants ─────────────────────────────────────────────────────────────────

const SVG_W = 400;
const SVG_H = 400;
const SVG_CX = 200;
const SVG_CY = 200;
const PENTAGON_R = 140;
const NODE_R = 22;
const ARC_R = 29;
const ARC_CIRC = 2 * Math.PI * ARC_R;

// Node positions: id 1–5, starting at top, clockwise
const NODE_POS: Record<number, { x: number; y: number }> = {};
for (let i = 0; i < 5; i++) {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
  NODE_POS[i + 1] = {
    x: SVG_CX + PENTAGON_R * Math.cos(a),
    y: SVG_CY + PENTAGON_R * Math.sin(a),
  };
}

const ROLE_FILL: Record<string, string> = {
  dead: '#1d2021',
  leader: '#b8bb26',
  candidate: '#d79921',
  follower: '#3c3836',
};

const ROLE_TEXT: Record<string, string> = {
  dead: '#504945',
  leader: '#1d2021',
  candidate: '#1d2021',
  follower: '#928374',
};

function msgColor(msg: InflightState): string {
  switch (msg.kind) {
    case 'RequestVote':       return '#d79921';
    case 'RequestVoteReply':  return msg.granted  ? '#b8bb26' : '#fb4934';
    case 'AppendEntries':     return '#83a598';
    case 'AppendEntriesReply':return msg.success  ? '#b8bb26' : '#fb4934';
    default: return '#928374';
  }
}

function loadExternalModule(url: string): Promise<Record<string, unknown>> {
  return (Function('u', 'return import(u)') as (u: string) => Promise<Record<string, unknown>>)(url);
}

const SPEEDS = [0.5, 1, 2, 5] as const;

// ── Component ─────────────────────────────────────────────────────────────────

export function RaftDemo() {
  const [wasmReady, setWasmReady]       = useState(false);
  const [state, setState]               = useState<ClusterState | null>(null);
  const [running, setRunning]           = useState(true);
  const [speed, setSpeed]               = useState<number>(1);
  const [partitionMode, setPartitionMode] = useState(false);
  const [partitionFrom, setPartitionFrom] = useState<number | null>(null);
  const [cmdInput, setCmdInput]         = useState('');

  const clusterRef  = useRef<WasmCluster | null>(null);
  const rafRef      = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const runningRef  = useRef(true);
  const speedRef    = useRef(1);

  useEffect(() => { runningRef.current = running; }, [running]);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  // Load WASM
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const mod = await loadExternalModule('/wasm/raft/raft.js');
      await (mod.default as () => Promise<unknown>)();
      if (cancelled) return;
      const Cls = mod.WasmCluster as WasmClusterClass;
      const cluster = new Cls();
      clusterRef.current = cluster;
      setState(JSON.parse(cluster.get_state()) as ClusterState);
      setWasmReady(true);
    }
    load().catch(console.error);
    return () => { cancelled = true; };
  }, []);

  // RAF loop
  useEffect(() => {
    if (!wasmReady) return;
    function frame(now: number) {
      if (lastTimeRef.current === null) lastTimeRef.current = now;
      const delta = Math.min(now - lastTimeRef.current, 100);
      lastTimeRef.current = now;

      if (runningRef.current && clusterRef.current) {
        const elapsed = Math.round(delta * speedRef.current);
        if (elapsed > 0) {
          const json = clusterRef.current.tick(elapsed);
          setState(JSON.parse(json) as ClusterState);
        }
      }
      rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
  }, [wasmReady]);

  // Cleanup
  useEffect(() => {
    return () => { clusterRef.current?.free(); };
  }, []);

  const handleNodeClick = useCallback((id: number) => {
    const cluster = clusterRef.current;
    if (!cluster || !state) return;

    if (partitionMode) {
      if (partitionFrom === null) {
        setPartitionFrom(id);
      } else {
        if (partitionFrom !== id) {
          cluster.toggle_partition(partitionFrom, id);
          setState(JSON.parse(cluster.get_state()) as ClusterState);
        }
        setPartitionFrom(null);
        setPartitionMode(false);
      }
      return;
    }

    const node = state.nodes.find(n => n.id === id);
    if (!node) return;
    if (node.dead) cluster.revive_node(id);
    else cluster.kill_node(id);
    setState(JSON.parse(cluster.get_state()) as ClusterState);
  }, [state, partitionMode, partitionFrom]);

  const submitCommand = useCallback(() => {
    const cluster = clusterRef.current;
    if (!cluster || !cmdInput.trim()) return;
    cluster.submit_command(cmdInput.trim());
    setCmdInput('');
    setState(JSON.parse(cluster.get_state()) as ClusterState);
  }, [cmdInput]);

  const cancelPartition = useCallback(() => {
    setPartitionMode(false);
    setPartitionFrom(null);
  }, []);

  if (!wasmReady || !state) {
    return <div className="raft-demo raft-demo--loading">loading wasm…</div>;
  }

  return (
    <div className="raft-demo">
      {/* Controls */}
      <div className="raft-demo-controls">
        <button
          className={`raft-demo-btn${running ? '' : ' raft-demo-btn--active'}`}
          onClick={() => setRunning(r => !r)}
        >
          {running ? 'Pause' : 'Resume'}
        </button>

        <div className="raft-demo-speeds">
          {SPEEDS.map(s => (
            <button
              key={s}
              className={`raft-demo-speed-btn${speed === s ? ' raft-demo-speed-btn--active' : ''}`}
              onClick={() => setSpeed(s)}
            >
              {s}×
            </button>
          ))}
        </div>

        {partitionMode ? (
          <>
            <span className="raft-demo-hint">
              {partitionFrom === null ? 'click first node…' : 'click second node…'}
            </span>
            <button className="raft-demo-btn raft-demo-btn--active" onClick={cancelPartition}>
              Cancel
            </button>
          </>
        ) : (
          <button className="raft-demo-btn" onClick={() => setPartitionMode(true)}>
            Partition
          </button>
        )}
      </div>

      {/* SVG visualization */}
      <svg
        className="raft-demo-svg"
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        aria-label="Raft cluster visualization"
      >
        {/* Partition lines */}
        {state.partitions.map(([a, b]) => {
          const pa = NODE_POS[a], pb = NODE_POS[b];
          if (!pa || !pb) return null;
          return (
            <line
              key={`part-${a}-${b}`}
              x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
              stroke="#fb4934"
              strokeWidth={2}
              strokeDasharray="6 4"
              opacity={0.6}
            />
          );
        })}

        {/* In-flight messages */}
        {state.inflight.map(msg => {
          const ps = NODE_POS[msg.from], pd = NODE_POS[msg.to];
          if (!ps || !pd) return null;
          const x = ps.x + (pd.x - ps.x) * msg.progress;
          const y = ps.y + (pd.y - ps.y) * msg.progress;
          const color = msgColor(msg);
          const isHeartbeat = msg.kind === 'AppendEntries' && msg.entries_count === 0;
          return (
            <circle
              key={msg.id}
              cx={x} cy={y}
              r={isHeartbeat ? 3 : 5}
              fill={color}
              opacity={0.9}
            />
          );
        })}

        {/* Nodes */}
        {state.nodes.map(node => {
          const pos = NODE_POS[node.id];
          if (!pos) return null;
          const roleKey = node.dead ? 'dead' : node.role;
          const fill = ROLE_FILL[roleKey];
          const textCol = ROLE_TEXT[roleKey];
          const arcOffset = ARC_CIRC * (1 - node.election_timeout_pct);
          const isPartSel = partitionMode && partitionFrom === node.id;

          let sublabel: string;
          if (node.dead) sublabel = '—';
          else if (node.role === 'leader') sublabel = 'lead';
          else if (node.role === 'candidate') sublabel = `${node.votes_received ?? 0}/3`;
          else sublabel = `t${node.term}`;

          return (
            <g
              key={node.id}
              onClick={() => handleNodeClick(node.id)}
              style={{ cursor: 'pointer' }}
            >
              {/* Election timeout arc */}
              {!node.dead && node.role !== 'leader' && (
                <circle
                  cx={pos.x} cy={pos.y}
                  r={ARC_R}
                  fill="none"
                  stroke={node.role === 'candidate' ? '#d79921' : '#504945'}
                  strokeWidth={3}
                  strokeDasharray={ARC_CIRC}
                  strokeDashoffset={arcOffset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${pos.x} ${pos.y})`}
                />
              )}

              {/* Selection ring */}
              {isPartSel && (
                <circle
                  cx={pos.x} cy={pos.y}
                  r={NODE_R + 6}
                  fill="none"
                  stroke="#fb4934"
                  strokeWidth={2}
                />
              )}

              {/* Node body */}
              <circle
                cx={pos.x} cy={pos.y}
                r={NODE_R}
                fill={fill}
                stroke={node.role === 'leader' ? '#b8bb26' : '#504945'}
                strokeWidth={node.role === 'leader' ? 2.5 : 1}
              />

              {/* ID label */}
              <text
                x={pos.x} y={pos.y - 3}
                textAnchor="middle"
                dominantBaseline="auto"
                fontSize={14}
                fontWeight="bold"
                fill={textCol}
                style={{ userSelect: 'none', pointerEvents: 'none' }}
              >
                {node.id}
              </text>

              {/* Sublabel */}
              <text
                x={pos.x} y={pos.y + 10}
                textAnchor="middle"
                dominantBaseline="auto"
                fontSize={8}
                fill={textCol}
                opacity={0.85}
                style={{ userSelect: 'none', pointerEvents: 'none' }}
              >
                {sublabel}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Command input */}
      <div className="raft-demo-cmd">
        <input
          className="raft-demo-input"
          type="text"
          placeholder="submit command to leader…"
          value={cmdInput}
          onChange={e => setCmdInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submitCommand()}
        />
        <button className="raft-demo-btn" onClick={submitCommand} disabled={!cmdInput.trim()}>
          Submit
        </button>
      </div>

      {/* Info panels */}
      <div className="raft-demo-info">
        <div className="raft-demo-events">
          <div className="raft-demo-info-label">Events</div>
          <ul className="raft-demo-event-list">
            {[...state.events].reverse().slice(0, 10).map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>

        {state.applied_commands.length > 0 && (
          <div className="raft-demo-applied">
            <div className="raft-demo-info-label">Applied</div>
            <ul className="raft-demo-applied-list">
              {[...state.applied_commands].reverse().map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="raft-demo-legend">
        <span className="raft-demo-legend-item" style={{ '--dot': '#b8bb26' } as React.CSSProperties}>leader</span>
        <span className="raft-demo-legend-item" style={{ '--dot': '#d79921' } as React.CSSProperties}>candidate</span>
        <span className="raft-demo-legend-item" style={{ '--dot': '#3c3836' } as React.CSSProperties}>follower</span>
        <span className="raft-demo-legend-item" style={{ '--dot': '#1d2021' } as React.CSSProperties}>dead</span>
        <span className="raft-demo-legend-sep">·</span>
        <span className="raft-demo-legend-note">click node to kill/revive</span>
      </div>
    </div>
  );
}
