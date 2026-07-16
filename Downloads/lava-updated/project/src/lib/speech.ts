export type Accent = 'american' | 'british' | 'australian' | 'canadian' | 'neutral';

export interface VoiceOption {
  accent: Accent;
  gender: 'male' | 'female';
  rate: number;
  pitch: number;
}

// Slightly under 1.0 reads as more natural/human than the robotic default of exactly 1.0.
let currentVoiceOption: VoiceOption = { accent: 'american', gender: 'female', rate: 0.98, pitch: 1.02 };
let voicesCache: SpeechSynthesisVoice[] = [];
let voicesReady: Promise<SpeechSynthesisVoice[]> | null = null;

export function speechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
}

export function setVoiceOption(opt: VoiceOption) {
  currentVoiceOption = opt;
}

export function getVoiceOption(): VoiceOption {
  return currentVoiceOption;
}

const ACCENT_LANG_MAP: Record<Accent, string[]> = {
  american: ['en-US'],
  british: ['en-GB'],
  australian: ['en-AU'],
  canadian: ['en-CA', 'en-US'],
  neutral: ['en-US', 'en-GB', 'en'],
};

// Names/markers of genuinely natural, modern neural voices exposed through the Web Speech API.
// These are the ones that DON'T sound robotic (Edge "Online (Natural)", Chrome "Google",
// Apple premium & Siri voices, etc.).
const NATURAL_MARKERS = [
  'natural', 'neural', 'online', 'wavenet', 'journey', 'studio', 'siri', 'premium', 'enhanced',
];
const NATURAL_NAMES = [
  'google', // Chrome's bundled voices are noticeably smoother than local SAPI voices
  'samantha', 'ava', 'allison', 'susan', 'zoe', 'serena', 'karen', 'moira', 'tessa', 'fiona',
  'aaron', 'arthur', 'daniel', 'evan', 'nathan', 'tom', 'oliver', 'alex',
];
// Classic robotic / low-quality voices to avoid when anything better exists.
const ROBOTIC_MARKERS = [
  'espeak', 'compact', 'zarvox', 'fred', 'albert', 'bad news', 'bahh', 'bells', 'boing',
  'bubbles', 'cellos', 'wobble', 'trinoids', 'whisper', 'jester', 'organ',
  'microsoft david', 'microsoft zira', 'microsoft mark', 'microsoft hazel', 'microsoft eva',
];

function scoreVoice(v: SpeechSynthesisVoice, opt: VoiceOption, primaryLang: string): number {
  const name = v.name.toLowerCase();
  const lang = v.lang.toLowerCase();
  let score = 0;

  // Language / accent match is the strongest signal.
  if (lang.startsWith(primaryLang.toLowerCase())) score += 100;
  else if (lang.startsWith('en')) score += 30;

  // Strongly prefer modern neural / natural voices.
  if (NATURAL_MARKERS.some(m => name.includes(m))) score += 70;
  if (NATURAL_NAMES.some(m => name.includes(m))) score += 40;

  // Cloud (non-local) voices are almost always the neural, natural-sounding ones.
  if (v.localService === false) score += 25;

  // Gender preference (soft — many good voices don't advertise gender in the name).
  if (name.includes(opt.gender)) score += 15;

  // Penalise the classic robotic/novelty voices.
  if (ROBOTIC_MARKERS.some(m => name.includes(m))) score -= 90;

  // A tiny nudge toward the platform default when scores are otherwise tied.
  if (v.default) score += 3;

  return score;
}

function pickBestVoice(voices: SpeechSynthesisVoice[], opt: VoiceOption): SpeechSynthesisVoice | undefined {
  if (voices.length === 0) return undefined;
  const langPrefs = ACCENT_LANG_MAP[opt.accent] ?? ['en-US'];
  const primaryLang = langPrefs[0];
  let best: SpeechSynthesisVoice | undefined;
  let bestScore = -Infinity;
  for (const v of voices) {
    const s = scoreVoice(v, opt, primaryLang);
    if (s > bestScore) { bestScore = s; best = v; }
  }
  return best;
}

// Kept for backward compatibility with any external callers.
function findVoiceForAccent(voices: SpeechSynthesisVoice[], opt: VoiceOption): SpeechSynthesisVoice | undefined {
  return pickBestVoice(voices, opt);
}

// Chrome loads voices asynchronously and returns [] on the first synchronous call.
// Resolve once voices are actually available (with a timeout fallback).
function ensureVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!speechSynthesisSupported()) return Promise.resolve([]);
  const immediate = window.speechSynthesis.getVoices();
  if (immediate.length > 0) {
    voicesCache = immediate;
    return Promise.resolve(immediate);
  }
  if (voicesReady) return voicesReady;
  voicesReady = new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) voicesCache = v;
      resolve(voicesCache);
    };
    window.speechSynthesis.onvoiceschanged = finish;
    // Fallback in case the event never fires (some browsers).
    setTimeout(finish, 1200);
  });
  return voicesReady;
}

// Split into sentence-sized chunks so delivery has natural breath pauses instead of one
// flat monotone run-on. Also sidesteps the Chrome bug that truncates long utterances.
function splitIntoChunks(text: string): string[] {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  const parts = clean.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g);
  if (!parts) return [clean];
  const chunks: string[] = [];
  let buffer = '';
  for (const raw of parts) {
    const piece = raw.trim();
    if (!piece) continue;
    // Merge very short fragments so we don't over-fragment the delivery.
    if (buffer && (buffer.length + piece.length) < 160) {
      buffer += ' ' + piece;
    } else {
      if (buffer) chunks.push(buffer);
      buffer = piece;
    }
  }
  if (buffer) chunks.push(buffer);
  return chunks;
}

function speakChunk(
  text: string,
  voice: SpeechSynthesisVoice | undefined,
  rate: number,
  pitch: number,
): Promise<void> {
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = 1;
    let done = false;
    const finish = () => { if (!done) { done = true; resolve(); } };
    utterance.onend = finish;
    utterance.onerror = finish;
    window.speechSynthesis.speak(utterance);
  });
}

export async function speak(
  text: string,
  opts: { rate?: number; pitch?: number; voice?: SpeechSynthesisVoice } = {},
): Promise<void> {
  if (!speechSynthesisSupported() || !text?.trim()) return;
  window.speechSynthesis.cancel();

  const voices = await ensureVoices();
  const voice = opts.voice ?? pickBestVoice(voices, currentVoiceOption);
  const rate = clamp(opts.rate ?? currentVoiceOption.rate, 0.5, 1.5);
  const pitch = clamp(opts.pitch ?? currentVoiceOption.pitch, 0.5, 1.6);

  const chunks = splitIntoChunks(text);
  for (let i = 0; i < chunks.length; i++) {
    await speakChunk(chunks[i], voice, rate, pitch);
    // A short, natural breath pause between sentences (skip after the last one).
    if (i < chunks.length - 1) await delay(90);
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function stopSpeaking(): void {
  if (speechSynthesisSupported()) window.speechSynthesis.cancel();
}

export function getVoices(): SpeechSynthesisVoice[] {
  if (!speechSynthesisSupported()) return [];
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) voicesCache = voices;
  return voices;
}

export function onVoicesChanged(cb: () => void): () => void {
  if (!speechSynthesisSupported()) return () => {};
  const handler = () => {
    voicesCache = window.speechSynthesis.getVoices();
    cb();
  };
  window.speechSynthesis.addEventListener('voiceschanged', handler);
  return () => { window.speechSynthesis.removeEventListener('voiceschanged', handler); };
}

export function getAvailableAccents(): { id: Accent; label: string; flag: string }[] {
  return [
    { id: 'american', label: 'American', flag: 'US' },
    { id: 'british', label: 'British', flag: 'GB' },
    { id: 'australian', label: 'Australian', flag: 'AU' },
    { id: 'canadian', label: 'Canadian', flag: 'CA' },
    { id: 'neutral', label: 'Neutral', flag: 'EN' },
  ];
}

// Expose the best-guess voice (useful for a "voice preview" UI, if desired).
export async function getPreferredVoice(): Promise<SpeechSynthesisVoice | undefined> {
  const voices = await ensureVoices();
  return pickBestVoice(voices, currentVoiceOption);
}

type AnyRecognition = any;

export interface RecognitionHandle {
  start: () => void;
  stop: () => void;
  abort: () => void;
}

export function createRecognition(opts: {
  onResult: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
}): RecognitionHandle | null {
  if (!speechRecognitionSupported()) return null;
  const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition: AnyRecognition = new Ctor();
  recognition.lang = opts.lang ?? 'en-US';
  recognition.continuous = opts.continuous ?? true;
  recognition.interimResults = opts.interimResults ?? true;

  recognition.onresult = (event: any) => {
    let interim = '';
    let final = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (result.isFinal) final += result[0].transcript;
      else interim += result[0].transcript;
    }
    if (final) opts.onResult(final, true);
    else if (interim) opts.onResult(interim, false);
  };
  recognition.onerror = (e: any) => opts.onError?.(e.error || 'unknown');
  recognition.onend = () => opts.onEnd?.();

  return {
    start: () => { try { recognition.start(); } catch { /* already started */ } },
    stop: () => { try { recognition.stop(); } catch { /* not started */ } },
    abort: () => { try { recognition.abort(); } catch { /* not started */ } },
  };
}

export function calculateWPM(transcript: string, durationSeconds: number): number {
  if (!transcript || durationSeconds <= 0) return 0;
  const words = transcript.trim().split(/\s+/).length;
  return Math.round((words / durationSeconds) * 60);
}

export function countFillerWords(transcript: string, fillerList: string[]): number {
  if (!transcript) return 0;
  const lower = transcript.toLowerCase();
  let count = 0;
  for (const filler of fillerList) {
    const regex = new RegExp(`\\b${filler.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = lower.match(regex);
    if (matches) count += matches.length;
  }
  return count;
}

export function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!word) return 0;
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

export function estimateSpeakingPace(transcript: string, durationSeconds: number): 'slow' | 'moderate' | 'fast' {
  const wpm = calculateWPM(transcript, durationSeconds);
  if (wpm === 0) return 'moderate';
  if (wpm < 110) return 'slow';
  if (wpm > 170) return 'fast';
  return 'moderate';
}

// Retained for backward compatibility (was internal previously).
export { findVoiceForAccent };
