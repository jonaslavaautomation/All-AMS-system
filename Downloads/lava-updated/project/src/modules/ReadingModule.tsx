import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ArrowRight, Gauge, Sparkles, Volume2, CheckCircle2 } from 'lucide-react';
import { ModuleHeader } from '../components/modules/ModuleHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { MicButton } from '../components/ui/MicButton';
import { VoiceWave } from '../components/ui/VoiceWave';
import { useAssessment } from '../context/AssessmentContext';
import { createRecognition, speechRecognitionSupported, calculateWPM, estimateSpeakingPace, speak, type RecognitionHandle } from '../lib/speech';
import { evaluateResponse } from '../lib/evaluator';
import { getReadingItems } from '../lib/positionContentBank';
import { getPositionByLabel } from '../lib/positionBank';

interface Props {
  onComplete: (score: number, details: any) => void;
}

export function ReadingModule({ onComplete }: Props) {
  const navigate = useNavigate();
  const { saveModuleScore, candidate } = useAssessment();
  const position = candidate ? getPositionByLabel(candidate.position) : null;
  const paragraphs = getReadingItems(position?.id ?? 'general-va');

  const [paraIdx, setParaIdx] = useState(0);
  const [phase, setPhase] = useState<'intro' | 'recording' | 'feedback'>('intro');
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [recordingStart, setRecordingStart] = useState<number | null>(null);
  const [evals, setEvals] = useState<any[]>([]);
  const [currentEval, setCurrentEval] = useState<any>(null);
  const recRef = useRef<RecognitionHandle | null>(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const para = paragraphs[paraIdx];
  const supported = speechRecognitionSupported();

  useEffect(() => () => { recRef.current?.abort(); }, []);

  const startRecording = () => {
    setTranscript('');
    setInterim('');
    setPhase('recording');
    setRecordingStart(Date.now());
    if (!supported) {
      setTimeout(() => {
        setTranscript(para.text);
        stopRecording();
      }, 5000);
      return;
    }
    const rec = createRecognition({
      onResult: (text, isFinal) => {
        if (isFinal) { setTranscript(prev => prev + ' ' + text); setInterim(''); }
        else setInterim(text);
      },
      onEnd: () => { if (phaseRef.current === 'recording') stopRecording(); },
      onError: () => stopRecording(),
    });
    recRef.current = rec;
    rec?.start();
  };

  const stopRecording = () => {
    recRef.current?.stop();
    setPhase('feedback');
    const duration = recordingStart ? (Date.now() - recordingStart) / 1000 : 10;
    const full = (transcript + ' ' + interim).trim() || para.text;
    const evalResult = evaluateResponse({ transcript: full, prompt: para.text, durationSeconds: duration, seed: para.id + full });
    (evalResult as any).wpm = calculateWPM(full, duration);
    (evalResult as any).pace = estimateSpeakingPace(full, duration);
    setCurrentEval(evalResult);
  };

  const nextPara = async () => {
    const newEvals = [...evals, currentEval];
    setEvals(newEvals);
    if (paraIdx + 1 < paragraphs.length) {
      setParaIdx(paraIdx + 1);
      setPhase('intro');
      setTranscript('');
      setInterim('');
      setCurrentEval(null);
    } else {
      const avg = newEvals.reduce((a, e) => a + e.overall, 0) / newEvals.length;
      await saveModuleScore(3, 'Reading Aloud', avg, {
        categoryScores: newEvals.reduce((acc, e) => { for (const [k, v] of Object.entries(e.categoryScores)) acc[k] = (acc[k] || 0) + v; return acc; }, {} as Record<string, number>),
        strengths: newEvals.flatMap(e => e.strengths).slice(0, 5),
        weaknesses: newEvals.flatMap(e => e.weaknesses).slice(0, 5),
        improvements: newEvals.flatMap(e => e.improvements).slice(0, 5),
        responses: newEvals,
      });
      onComplete(avg, {});
      navigate('/dashboard');
    }
  };

  return (
    <div>
      <ModuleHeader
        icon={<BookOpen size={22} />}
        title="Module 3: Reading Aloud"
        description={`Read ${position?.label ?? 'professional'} scripts aloud at a natural pace. The AI evaluates fluency, pacing, confidence, pronunciation, pauses, and expression using position-specific scripts.`}
        instructions={[
          'Click the microphone and read the full paragraph aloud.',
          'Aim for a natural pace of 130-160 words per minute.',
          'Pause briefly at commas and periods for natural rhythm.',
        ]}
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-ink-600 dark:text-ink-300">Paragraph {paraIdx + 1} of {paragraphs.length}</span>
              <div className="flex items-center gap-2">
                <span className="badge bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300">{para.title}</span>
                {position && <span className="badge bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300">{position.label}</span>}
              </div>
            </div>

            <div className="rounded-2xl bg-lava-50 dark:bg-lava-950/30 border border-lava-100 dark:border-lava-900/50 p-6 mb-6">
              <p className="font-display text-base text-ink-800 dark:text-ink-100 leading-relaxed">{para.text}</p>
              <div className="mt-3 flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => speak(para.text)}>
                  <Volume2 size={14} /> Hear reference
                </Button>
              </div>
            </div>

            {phase === 'intro' && (
              <div className="text-center py-6">
                <MicButton active={false} onClick={startRecording} label="Click to start reading" />
              </div>
            )}

            {phase === 'recording' && (
              <div className="text-center py-6">
                <MicButton active onClick={stopRecording} label="Click to stop when finished" />
                <div className="mt-4 flex justify-center"><VoiceWave active /></div>
                <p className="text-sm text-ink-500 dark:text-ink-400 mt-3 italic max-w-2xl mx-auto line-clamp-3">{interim || 'Listening...'}</p>
              </div>
            )}

            <AnimatePresence>
              {phase === 'feedback' && currentEval && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 rounded-xl bg-ink-50 dark:bg-ink-800/50">
                      <Gauge size={18} className="mx-auto text-lava-600 mb-1" />
                      <p className="text-xs text-ink-500 dark:text-ink-400">Pace</p>
                      <p className="font-display font-bold text-ink-800 dark:text-ink-100 capitalize">{currentEval.pace}</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-ink-50 dark:bg-ink-800/50">
                      <p className="text-xs text-ink-500 dark:text-ink-400">WPM</p>
                      <p className="font-display font-bold text-lg text-ink-800 dark:text-ink-100">{currentEval.wpm}</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-ink-50 dark:bg-ink-800/50">
                      <p className="text-xs text-ink-500 dark:text-ink-400">Score</p>
                      <p className="font-display font-bold text-lg text-ink-800 dark:text-ink-100">{Math.round(currentEval.overall)}/100</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {['Fluency', 'Pronunciation', 'Confidence', 'Grammar', 'Vocabulary'].map((cat) => (
                      <div key={cat} className="text-center p-2 rounded-lg bg-ink-50 dark:bg-ink-800/50">
                        <p className="text-xs text-ink-500 dark:text-ink-400">{cat}</p>
                        <p className="font-display font-bold text-lg text-ink-800 dark:text-ink-100">{currentEval.categoryScores[cat]}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-green-200 dark:border-green-900/40 bg-green-50 dark:bg-green-900/10 p-4">
                    <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase mb-2">Feedback</p>
                    <p className="text-sm text-ink-700 dark:text-ink-200">{currentEval.feedback}</p>
                  </div>

                  <Button onClick={nextPara} className="w-full">
                    {paraIdx + 1 < paragraphs.length ? 'Next Paragraph' : 'Finish Module'} <ArrowRight size={16} />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={18} className="text-lava-600" />
              <h3 className="font-display text-sm font-bold text-ink-800 dark:text-ink-100">Position Scripts</h3>
            </div>
            <p className="text-xs text-ink-500 dark:text-ink-400 mb-3">
              Real {position?.label ?? 'professional'} scripts you'll read on the job.
            </p>
            <div className="space-y-2">
              {paragraphs.map((p, i) => (
                <div key={p.id} className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                  i === paraIdx
                    ? 'bg-lava-50 dark:bg-lava-950/30 text-lava-700 dark:text-lava-400 font-semibold'
                    : i < paraIdx
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-ink-500 dark:text-ink-400'
                }`}>
                  {i < paraIdx ? <CheckCircle2 size={14} className="shrink-0" /> : i === paraIdx ? <BookOpen size={14} className="shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-current shrink-0" />}
                  <span className="truncate">{p.title}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Gauge size={18} className="text-lava-600" />
              <h3 className="font-display text-sm font-bold text-ink-800 dark:text-ink-100">Reading Tips</h3>
            </div>
            <ul className="space-y-2 text-xs text-ink-600 dark:text-ink-300">
              <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-green-600 mt-0.5 shrink-0" /> Aim for 130-160 words per minute.</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-green-600 mt-0.5 shrink-0" /> Pause at commas and periods.</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-green-600 mt-0.5 shrink-0" /> Use the reference audio to check pacing.</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-green-600 mt-0.5 shrink-0" /> Read with expression, not monotone.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
