import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Mic, BookOpen, MessageCircle, ShieldCheck,
  Play, CheckCircle2, Sparkles, Gauge, Zap,
} from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { MicButton } from '../components/ui/MicButton';
import { VoiceWave } from '../components/ui/VoiceWave';
import {
  CONVERSATION_QUESTIONS, PRONUNCIATION_SENTENCES, READING_PARAGRAPHS,
  INSURANCE_TOPICS,
} from '../lib/assessmentData';
import { createRecognition, speak, speechRecognitionSupported, calculateWPM, type RecognitionHandle } from '../lib/speech';
import { evaluateResponse } from '../lib/evaluator';

const practiceModes = [
  { id: 'interview', name: 'Interview Practice', icon: MessageCircle, desc: 'Practice answering common VA interview questions.' },
  { id: 'pronunciation', name: 'Pronunciation Drill', icon: Mic, desc: 'Read sentences and get instant pronunciation feedback.' },
  { id: 'reading', name: 'Reading Fluency', icon: BookOpen, desc: 'Read paragraphs aloud and track your WPM.' },
  { id: 'insurance', name: 'Insurance Vocab', icon: ShieldCheck, desc: 'Practice explaining insurance concepts.' },
] as const;

type Mode = typeof practiceModes[number]['id'];

export function PracticePage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode | null>(null);
  const [promptIdx, setPromptIdx] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'recording' | 'feedback'>('idle');
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [start, setStart] = useState<number | null>(null);
  const [result, setResult] = useState<any>(null);
  const recRef = useRef<RecognitionHandle | null>(null);
  const supported = speechRecognitionSupported();

  const prompts = mode === 'interview' ? CONVERSATION_QUESTIONS
    : mode === 'pronunciation' ? PRONUNCIATION_SENTENCES.map(s => s.text)
    : mode === 'reading' ? READING_PARAGRAPHS.map(p => p.text)
    : mode === 'insurance' ? INSURANCE_TOPICS.map(t => t.prompt)
    : [];

  const startRec = () => {
    setTranscript(''); setInterim(''); setResult(null); setPhase('recording'); setStart(Date.now());
    if (!supported) {
      setTimeout(() => { setTranscript(prompts[promptIdx]); stopRec(); }, 4000);
      return;
    }
    const rec = createRecognition({
      onResult: (t, f) => { if (f) { setTranscript(p => p + ' ' + t); setInterim(''); } else setInterim(t); },
      onEnd: () => { if (phase === 'recording') stopRec(); },
      onError: () => stopRec(),
    });
    recRef.current = rec; rec?.start();
  };

  const stopRec = () => {
    recRef.current?.stop();
    setPhase('feedback');
    const dur = start ? (Date.now() - start) / 1000 : 5;
    const full = (transcript + ' ' + interim).trim() || prompts[promptIdx];
    const evalResult = evaluateResponse({ transcript: full, prompt: prompts[promptIdx], durationSeconds: dur, seed: (mode ?? 'practice') + promptIdx + full });
    (evalResult as any).wpm = calculateWPM(full, dur);
    setResult(evalResult);
  };

  const nextPrompt = () => {
    setPromptIdx((promptIdx + 1) % prompts.length);
    setPhase('idle'); setTranscript(''); setInterim(''); setResult(null);
  };

  return (
    <div className="min-h-screen bg-ink-100 dark:bg-ink-950">
      <header className="sticky top-0 z-20 glass border-b border-ink-200/60 dark:border-ink-800/60">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <Logo size="sm" />
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}><ArrowLeft size={16} /> Home</Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lava-50 dark:bg-lava-950/40 text-lava-700 dark:text-lava-400 text-xs font-semibold mb-3">
            <Zap size={12} /> Daily Practice Mode
          </div>
          <h1 className="font-display text-3xl font-bold text-ink-800 dark:text-ink-100">Unlimited Practice</h1>
          <p className="text-ink-500 dark:text-ink-400 mt-1">Sharpen your skills anytime — no score recorded, just pure practice.</p>
        </div>

        {!mode && (
          <div className="grid sm:grid-cols-2 gap-4">
            {practiceModes.map((m) => (
              <motion.button
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => { setMode(m.id); setPromptIdx(0); }}
                className="card p-5 text-left hover:shadow-elevated transition-all hover:border-lava-300"
              >
                <div className="w-10 h-10 rounded-xl gradient-lava flex items-center justify-center text-white mb-3">
                  <m.icon size={18} />
                </div>
                <h3 className="font-display font-bold text-ink-800 dark:text-ink-100 mb-1">{m.name}</h3>
                <p className="text-sm text-ink-500 dark:text-ink-400">{m.desc}</p>
              </motion.button>
            ))}
          </div>
        )}

        {mode && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="sm" onClick={() => { setMode(null); setPhase('idle'); }}><ArrowLeft size={14} /> Change Mode</Button>
              <span className="text-sm text-ink-500">Prompt {promptIdx + 1} of {prompts.length}</span>
            </div>

            <div className="rounded-2xl bg-lava-50 dark:bg-lava-950/30 border border-lava-100 dark:border-lava-900/50 p-5 mb-6">
              <p className="font-display text-base text-ink-800 dark:text-ink-100 leading-relaxed">{prompts[promptIdx]}</p>
              {mode === 'interview' && (
                <Button variant="ghost" size="sm" className="mt-2" onClick={() => speak(prompts[promptIdx])}><Play size={14} /> Hear question</Button>
              )}
            </div>

            {phase === 'idle' && (
              <div className="text-center py-6">
                <MicButton active={false} onClick={startRec} label="Click to start recording" />
              </div>
            )}

            {phase === 'recording' && (
              <div className="text-center py-6">
                <MicButton active onClick={stopRec} label="Click to stop" />
                <div className="mt-4 flex justify-center"><VoiceWave active /></div>
                <p className="text-sm text-ink-500 mt-3 italic line-clamp-2">{interim || 'Listening...'}</p>
              </div>
            )}

            <AnimatePresence>
              {phase === 'feedback' && result && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 rounded-xl bg-ink-50 dark:bg-ink-800/50">
                      <p className="text-xs text-ink-500">Score</p>
                      <p className="font-display text-2xl font-bold text-ink-800 dark:text-ink-100">{Math.round(result.overall)}</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-ink-50 dark:bg-ink-800/50">
                      <Gauge size={16} className="mx-auto text-lava-600 mb-1" />
                      <p className="text-xs text-ink-500">WPM</p>
                      <p className="font-display text-lg font-bold text-ink-800 dark:text-ink-100">{result.wpm}</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-ink-50 dark:bg-ink-800/50">
                      <Sparkles size={16} className="mx-auto text-lava-600 mb-1" />
                      <p className="text-xs text-ink-500">Confidence</p>
                      <p className="font-display text-lg font-bold text-ink-800 dark:text-ink-100">{result.categoryScores.Confidence}</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-lava-200 dark:border-lava-900/40 bg-lava-50 dark:bg-lava-950/20 p-4">
                    <p className="text-xs font-semibold text-lava-700 dark:text-lava-400 uppercase mb-1">Feedback</p>
                    <p className="text-sm text-ink-700 dark:text-ink-200">{result.feedback}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="rounded-xl border border-green-200 dark:border-green-900/40 bg-green-50 dark:bg-green-900/10 p-3">
                      <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase mb-1.5">Strengths</p>
                      <ul className="space-y-1">{result.strengths.map((s: string, i: number) => <li key={i} className="text-xs text-ink-700 dark:text-ink-200 flex items-start gap-1.5"><CheckCircle2 size={12} className="text-green-600 mt-0.5 shrink-0" /> {s}</li>)}</ul>
                    </div>
                    <div className="rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/10 p-3">
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase mb-1.5">Improvements</p>
                      <ul className="space-y-1">{result.improvements.map((s: string, i: number) => <li key={i} className="text-xs text-ink-700 dark:text-ink-200">• {s}</li>)}</ul>
                    </div>
                  </div>

                  <Button onClick={nextPrompt} className="w-full">Next Prompt</Button>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        )}
      </main>
    </div>
  );
}
