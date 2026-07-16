export type CallEnvironmentType =
  | 'none' | 'office' | 'phone-ring' | 'typing' | 'printer' | 'chatter' | 'static' | 'busy-office';

export const CALL_ENVIRONMENTS: { id: CallEnvironmentType; label: string; icon: string }[] = [
  { id: 'none', label: 'None', icon: 'VolumeX' },
  { id: 'office', label: 'Office', icon: 'Building' },
  { id: 'phone-ring', label: 'Phone Ring', icon: 'Phone' },
  { id: 'typing', label: 'Typing', icon: 'Keyboard' },
  { id: 'printer', label: 'Printer', icon: 'Printer' },
  { id: 'chatter', label: 'Chatter', icon: 'Users' },
  { id: 'static', label: 'Static Line', icon: 'Radio' },
  { id: 'busy-office', label: 'Busy Office', icon: 'Briefcase' },
];

let audioCtx: AudioContext | null = null;
let activeNodes: AudioNode[] = [];
let gainNode: GainNode | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return audioCtx;
}

export function isCallEnvironmentSupported(): boolean {
  return typeof window !== 'undefined' && (!!window.AudioContext || !!(window as any).webkitAudioContext);
}

export function stopCallEnvironment(): void {
  activeNodes.forEach((n) => {
    try { (n as OscillatorNode).stop?.(); } catch { /* not an oscillator */ }
    try { n.disconnect(); } catch { /* already disconnected */ }
  });
  activeNodes = [];
  if (gainNode) {
    try { gainNode.disconnect(); } catch { /* */ }
    gainNode = null;
  }
}

export function playCallEnvironment(type: CallEnvironmentType, volume = 0.15): void {
  stopCallEnvironment();
  if (type === 'none') return;

  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();

  gainNode = ctx.createGain();
  gainNode.gain.value = volume;
  gainNode.connect(ctx.destination);

  switch (type) {
    case 'office': playAmbientNoise(ctx, gainNode, 0.08); break;
    case 'phone-ring': playPhoneRing(ctx, gainNode); break;
    case 'typing': playTyping(ctx, gainNode); break;
    case 'printer': playPrinter(ctx, gainNode); break;
    case 'chatter': playChatter(ctx, gainNode); break;
    case 'static': playStatic(ctx, gainNode); break;
    case 'busy-office': playAmbientNoise(ctx, gainNode, 0.12); playTyping(ctx, gainNode); playChatter(ctx, gainNode); break;
  }
}

function playAmbientNoise(ctx: AudioContext, dest: AudioNode, volume: number): void {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.3;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 600;
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = volume;
  source.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(dest);
  source.start();
  activeNodes.push(source, filter, noiseGain);
}

function playPhoneRing(ctx: AudioContext, dest: AudioNode): void {
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 440;
  const gain = ctx.createGain();
  gain.gain.value = 0;
  osc.connect(gain);
  gain.connect(dest);
  osc.start();

  // Ring pattern: 2 seconds on, 4 seconds off, repeat
  const now = ctx.currentTime;
  for (let i = 0; i < 100; i++) {
    const start = now + i * 6;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.1, start + 0.05);
    gain.gain.setValueAtTime(0.1, start + 2);
    gain.gain.linearRampToValueAtTime(0, start + 2.05);
  }
  activeNodes.push(osc, gain);
}

function playTyping(ctx: AudioContext, dest: AudioNode): void {
  const interval = setInterval(() => {
    if (!gainNode || !audioCtx || audioCtx !== ctx) { clearInterval(interval); return; }
    // Random key press
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = 800 + Math.random() * 400;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    osc.connect(gain);
    gain.connect(dest);
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    osc.start(now);
    osc.stop(now + 0.05);
  }, 120 + Math.random() * 200);
  // Store interval for cleanup
  (activeNodes as any).push({ disconnect: () => clearInterval(interval), stop: () => clearInterval(interval) });
}

function playPrinter(ctx: AudioContext, dest: AudioNode): void {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (i % 100 < 50 ? 0.4 : 0.1);
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 2000;
  const gain = ctx.createGain();
  gain.gain.value = 0.06;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  source.start();
  activeNodes.push(source, filter, gain);
}

function playChatter(ctx: AudioContext, dest: AudioNode): void {
  const bufferSize = ctx.sampleRate * 3;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    const envelope = Math.sin((i / bufferSize) * Math.PI * 8) * 0.5 + 0.5;
    data[i] = (Math.random() * 2 - 1) * envelope * 0.2;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 800;
  filter.Q.value = 1;
  const gain = ctx.createGain();
  gain.gain.value = 0.08;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  source.start();
  activeNodes.push(source, filter, gain);
}

function playStatic(ctx: AudioContext, dest: AudioNode): void {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.5;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 2000;
  const gain = ctx.createGain();
  gain.gain.value = 0.04;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  source.start();
  activeNodes.push(source, filter, gain);
}
