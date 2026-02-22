import { Howl, Howler } from 'howler';

let _volume = 0.5;
let _preMuteVolume = 0.5;
let _sounds: Record<string, Howl> | null = null;

const RATE = 44100;

function writeStr(v: DataView, o: number, s: string) {
  for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i));
}

function toWav(samples: Float32Array): string {
  const n = samples.length;
  const buf = new ArrayBuffer(44 + n * 2);
  const v = new DataView(buf);
  writeStr(v, 0, 'RIFF');
  v.setUint32(4, 36 + n * 2, true);
  writeStr(v, 8, 'WAVE');
  writeStr(v, 12, 'fmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, RATE, true);
  v.setUint32(28, RATE * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  writeStr(v, 36, 'data');
  v.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) {
    v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, samples[i])) * 0x7FFF, true);
  }
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return 'data:audio/wav;base64,' + btoa(bin);
}

/** Mechanical thock — sine sweep + noise transient */
function genClick(): string {
  const dur = 0.04;
  const len = Math.ceil(RATE * dur);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / RATE;
    const env = Math.exp(-t * 80);
    const freq = 250 * Math.pow(80 / 250, t / dur);
    const sine = Math.sin(2 * Math.PI * freq * t) * 0.5;
    const noise = t < 0.012 ? (Math.random() * 2 - 1) * 0.4 * Math.exp(-t * 200) : 0;
    out[i] = (sine + noise) * env;
  }
  return toWav(out);
}

/** Short tick — clicky noise burst + sine ping */
function genHover(): string {
  const dur = 0.02;
  const len = Math.ceil(RATE * dur);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / RATE;
    const env = Math.exp(-t * 120);
    const noise = (Math.random() * 2 - 1) * 0.45;
    const freq = 1200 * Math.pow(600 / 1200, t / dur);
    const sine = Math.sin(2 * Math.PI * freq * t) * 0.25;
    out[i] = (noise + sine) * env;
  }
  return toWav(out);
}

/** Deeper thock for selection */
function genSelect(): string {
  const dur = 0.05;
  const len = Math.ceil(RATE * dur);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / RATE;
    const env = Math.exp(-t * 60);
    const freq = 200 * Math.pow(60 / 200, t / dur);
    const sine = Math.sin(2 * Math.PI * freq * t) * 0.45;
    const noise = t < 0.015 ? (Math.random() * 2 - 1) * 0.35 * Math.exp(-t * 150) : 0;
    out[i] = (sine + noise) * env;
  }
  return toWav(out);
}

export function initAudio(): void {
  if (typeof window === 'undefined') return;
  const saved = localStorage.getItem('audioVolume');
  if (saved !== null) {
    _volume = parseFloat(saved);
    if (Number.isNaN(_volume)) _volume = 0.5;
  }
  _preMuteVolume = _volume || 0.5;
  Howler.volume(_volume);

  if (!_sounds) {
    _sounds = {
      click: new Howl({ src: [genClick()], volume: 0.55 }),
      hover: new Howl({ src: [genHover()], volume: 0.5 }),
      select: new Howl({ src: [genSelect()], volume: 0.5 }),
    };
  }
}

export function unlock(): void {
  const ctx = Howler.ctx;
  if (ctx?.state === 'suspended') ctx.resume();
}

export function isUnlocked(): boolean {
  return _sounds !== null;
}

export function getVolume(): number { return _volume; }

export function setVolume(v: number): void {
  _volume = Math.max(0, Math.min(1, v));
  if (_volume > 0) _preMuteVolume = _volume;
  if (typeof window !== 'undefined') localStorage.setItem('audioVolume', String(_volume));
  Howler.volume(_volume);
}

export function isMuted(): boolean { return _volume === 0; }

export function setMuted(muted: boolean): void {
  if (muted) {
    if (_volume > 0) _preMuteVolume = _volume;
    setVolume(0);
  } else {
    setVolume(_preMuteVolume || 0.5);
  }
}

export function playSound(type: 'click' | 'hover' | 'select'): void {
  if (_volume === 0 || !_sounds) return;
  const ctx = Howler.ctx;
  if (type === 'hover' && ctx?.state !== 'running') return;
  _sounds[type].play();
}
