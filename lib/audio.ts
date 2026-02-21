let _ctx: AudioContext | null = null;
let _volume = 0.5;
let _preMuteVolume = 0.5;

export function initAudio(): void {
  if (typeof window === 'undefined') return;
  const saved = localStorage.getItem('audioVolume');
  if (saved !== null) {
    _volume = parseFloat(saved);
    if (Number.isNaN(_volume)) _volume = 0.5;
  }
  _preMuteVolume = _volume || 0.5;
}

/** Must be called from a user gesture (pointerdown/keydown). */
export function unlock(): void {
  if (_ctx) return;
  try { _ctx = new AudioContext(); } catch { /* unsupported */ }
}

export function isUnlocked(): boolean {
  return _ctx !== null && _ctx.state === 'running';
}

export function getVolume(): number { return _volume; }

export function setVolume(v: number): void {
  _volume = Math.max(0, Math.min(1, v));
  if (_volume > 0) _preMuteVolume = _volume;
  if (typeof window !== 'undefined') localStorage.setItem('audioVolume', String(_volume));
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

function thock(c: AudioContext, bodyHz: number, endHz: number, ms: number, vol: number): void {
  const now = c.currentTime;
  const dur = ms / 1000;
  const v = vol * _volume;

  const osc = c.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(bodyHz, now);
  osc.frequency.exponentialRampToValueAtTime(endHz, now + dur);

  const bodyGain = c.createGain();
  bodyGain.gain.setValueAtTime(v, now);
  bodyGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

  osc.connect(bodyGain);
  bodyGain.connect(c.destination);
  osc.start(now);
  osc.stop(now + dur + 0.01);

  const attackMs = Math.min(ms * 0.35, 12);
  const attackDur = attackMs / 1000;
  const bufLen = Math.ceil(c.sampleRate * attackDur);
  const buf = c.createBuffer(1, bufLen, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;

  const noise = c.createBufferSource();
  noise.buffer = buf;

  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 600;
  lp.Q.value = 0.7;

  const noiseGain = c.createGain();
  noiseGain.gain.setValueAtTime(v * 0.7, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + attackDur);

  noise.connect(lp);
  lp.connect(noiseGain);
  noiseGain.connect(c.destination);
  noise.start(now);
  noise.stop(now + attackDur);
}

function emit(type: 'click' | 'hover' | 'select'): void {
  if (!_ctx) return;
  switch (type) {
    case 'click':  thock(_ctx, 250, 80, 35, 0.55); break;
    case 'hover':  thock(_ctx, 300, 120, 20, 0.3); break;
    case 'select': thock(_ctx, 200, 60, 45, 0.5); break;
  }
}

/**
 * Play a sound. For click/select (called from user gestures), this handles
 * resuming the context. For hover, it only plays if the context is already running.
 */
export function playSound(type: 'click' | 'hover' | 'select'): void {
  if (_volume === 0 || !_ctx) return;

  if (_ctx.state === 'running') {
    emit(type);
  } else if (_ctx.state === 'suspended' && type !== 'hover') {
    // Only resume from gesture-driven sounds (click/select).
    // Hover can't resume — browsers block it.
    _ctx.resume().then(() => emit(type)).catch(() => {});
  }
}
