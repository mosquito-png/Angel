/**
 * Tiny synthesized SFX for the roaming chibi layer (Web Audio, no asset files).
 * Safe to call from user gestures; contexts are resumed lazily.
 */
let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!ctx || ctx.state === 'closed') ctx = new Ctx();
  if (ctx.state === 'suspended') void ctx.resume().catch(() => {});
  return ctx;
}

function beep(opts: {
  freq: number;
  freq2?: number;
  dur: number;
  type?: OscillatorType;
  gain?: number;
  delay?: number;
  slide?: boolean;
}) {
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime + (opts.delay ?? 0);
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = opts.type ?? 'sine';
  osc.frequency.setValueAtTime(opts.freq, t0);
  if (opts.slide && opts.freq2) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, opts.freq2), t0 + opts.dur);
  } else if (opts.freq2) {
    osc.frequency.setValueAtTime(opts.freq2, t0 + opts.dur * 0.55);
  }
  const g = opts.gain ?? 0.06;
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(g, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.dur);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + opts.dur + 0.02);
}

function noiseBurst(dur: number, gain = 0.03, highpass = 900) {
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime;
  const len = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const hp = c.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = highpass;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(hp).connect(g).connect(c.destination);
  src.start(t0);
  src.stop(t0 + dur + 0.02);
}

/** Soft pickup chirp when a drag starts. */
export function playDragStart() {
  beep({ freq: 420, freq2: 620, dur: 0.09, type: 'triangle', gain: 0.045, slide: true });
  beep({ freq: 660, freq2: 520, dur: 0.06, type: 'sine', gain: 0.02, delay: 0.04, slide: true });
}

/** Occasional light blip while dragging (call throttled). */
export function playDragTick() {
  beep({ freq: 520 + Math.random() * 120, freq2: 460, dur: 0.045, type: 'sine', gain: 0.018, slide: true });
}

/** Gentle drop/plop when released. */
export function playDragEnd() {
  beep({ freq: 360, freq2: 180, dur: 0.11, type: 'sine', gain: 0.05, slide: true });
}

/** Annoyed grumble. */
export function playAnnoyed() {
  beep({ freq: 220, freq2: 160, dur: 0.12, type: 'square', gain: 0.025, slide: true });
  beep({ freq: 180, freq2: 140, dur: 0.1, type: 'triangle', gain: 0.02, delay: 0.07, slide: true });
}

/** Throw/yeet whoosh + pop. */
export function playThrow() {
  noiseBurst(0.09, 0.028, 1200);
  beep({ freq: 520, freq2: 980, dur: 0.12, type: 'sawtooth', gain: 0.03, slide: true });
  beep({ freq: 220, freq2: 120, dur: 0.08, type: 'triangle', gain: 0.02, delay: 0.05, slide: true });
}
