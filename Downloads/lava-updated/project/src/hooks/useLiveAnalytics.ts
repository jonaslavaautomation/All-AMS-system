import { useState, useRef, useCallback, useEffect } from 'react';
import { FILLER_WORDS } from '../lib/assessmentData';
import { calculateWPM, countFillerWords } from '../lib/speech';

export interface LiveAnalytics {
  wpm: number;
  idealWpm: string;
  speakingTime: number;
  silenceDuration: number;
  confidence: number;
  grammarAccuracy: number;
  pronunciationScore: number;
  vocabularyScore: number;
  sentenceComplexity: number;
  toneConsistency: number;
  energyLevel: number;
  fillerWords: number;
  fillerWordsList: string[];
  highlightedTranscript: string;
  wordCount: number;
}

export function useLiveAnalytics() {
  const [analytics, setAnalytics] = useState<LiveAnalytics>({
    wpm: 0,
    idealWpm: '130-160',
    speakingTime: 0,
    silenceDuration: 0,
    confidence: 50,
    grammarAccuracy: 75,
    pronunciationScore: 75,
    vocabularyScore: 70,
    sentenceComplexity: 50,
    toneConsistency: 70,
    energyLevel: 60,
    fillerWords: 0,
    fillerWordsList: [],
    highlightedTranscript: '',
    wordCount: 0,
  });

  const startTimeRef = useRef<number | null>(null);
  const lastWordTimeRef = useRef<number | null>(null);
  const silenceRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTracking = useCallback(() => {
    startTimeRef.current = Date.now();
    lastWordTimeRef.current = Date.now();
    silenceRef.current = 0;
    intervalRef.current = setInterval(() => {
      if (!startTimeRef.current) return;
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      setAnalytics((prev) => ({
        ...prev,
        speakingTime: elapsed,
        silenceDuration: silenceRef.current,
      }));
    }, 200);
  }, []);

  const updateTranscript = useCallback((transcript: string) => {
    const trimmed = transcript.trim();
    if (!trimmed) return;
    const now = Date.now();
    lastWordTimeRef.current = now;

    const wordCount = trimmed.split(/\s+/).length;
    const duration = startTimeRef.current ? (now - startTimeRef.current) / 1000 : 1;
    const wpm = calculateWPM(trimmed, duration);
    const fillerCount = countFillerWords(trimmed, FILLER_WORDS);
    const fillerWordsList = FILLER_WORDS.filter((f) => {
      const regex = new RegExp(`\\b${f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      return regex.test(trimmed.toLowerCase());
    });

    // Highlight filler words in transcript
    let highlighted = transcript;
    for (const f of FILLER_WORDS) {
      const regex = new RegExp(`\\b(${f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'gi');
      highlighted = highlighted.replace(regex, '**$1**');
    }

    const fillerRatio = wordCount > 0 ? fillerCount / wordCount : 0;
    const confidence = Math.max(20, Math.min(100, Math.round(70 - fillerRatio * 200 + (wpm >= 120 && wpm <= 170 ? 15 : -10))));
    const grammarAccuracy = Math.max(30, Math.min(100, Math.round(80 - fillerRatio * 100)));
    const pronunciationScore = Math.max(30, Math.min(100, Math.round(75 + (wpm >= 120 && wpm <= 170 ? 10 : -5))));
    const vocabularyScore = Math.max(30, Math.min(100, Math.round(70 + wordCount / 10)));
    const sentenceComplexity = Math.min(100, Math.round((wordCount / Math.max(trimmed.split(/[.!?]+/).length, 1)) * 5));
    const toneConsistency = Math.max(40, Math.min(100, Math.round(75 - fillerRatio * 80)));
    const energyLevel = wpm >= 120 && wpm <= 170 ? 80 : wpm < 100 ? 40 : 65;

    setAnalytics((prev) => ({
      ...prev,
      wpm,
      confidence,
      grammarAccuracy,
      pronunciationScore,
      vocabularyScore,
      sentenceComplexity,
      toneConsistency,
      energyLevel,
      fillerWords: fillerCount,
      fillerWordsList,
      highlightedTranscript: highlighted,
      wordCount,
    }));
  }, []);

  const trackSilence = useCallback(() => {
    if (lastWordTimeRef.current) {
      const silence = (Date.now() - lastWordTimeRef.current) / 1000;
      if (silence > 0.5) {
        silenceRef.current += 0.2;
      }
    }
  }, []);

  const stopTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stopTracking();
    startTimeRef.current = null;
    lastWordTimeRef.current = null;
    silenceRef.current = 0;
    setAnalytics({
      wpm: 0,
      idealWpm: '130-160',
      speakingTime: 0,
      silenceDuration: 0,
      confidence: 50,
      grammarAccuracy: 75,
      pronunciationScore: 75,
      vocabularyScore: 70,
      sentenceComplexity: 50,
      toneConsistency: 70,
      energyLevel: 60,
      fillerWords: 0,
      fillerWordsList: [],
      highlightedTranscript: '',
      wordCount: 0,
    });
  }, [stopTracking]);

  useEffect(() => () => stopTracking(), [stopTracking]);

  return { analytics, startTracking, updateTranscript, trackSilence, stopTracking, reset };
}
