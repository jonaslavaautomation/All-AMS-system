import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, ArrowRight, BookOpen, Volume2, CheckCircle2, Sparkles } from 'lucide-react';
import { ModuleHeader } from '../components/modules/ModuleHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { MicButton } from '../components/ui/MicButton';
import { VoiceWave } from '../components/ui/VoiceWave';
import { useAssessment } from '../context/AssessmentContext';
import { createRecognition, speak, speechRecognitionSupported, type RecognitionHandle } from '../lib/speech';
import { evaluateResponse } from '../lib/evaluator';
import { getPronunciationItems } from '../lib/positionContentBank';
import { getPositionByLabel } from '../lib/positionBank';

interface Props {
  onComplete: (score: number, details: any) => void;
}

export function PronunciationModule({ onComplete }: Props) {
  const navigate = useNavigate();
  const { saveModuleScore, candidate } = useAssessment();
  const position = candidate ? getPositionByLabel(candidate.position) : null;
  const sentences = getPronunciationItems(position?.id ?? 'general-va');

  const [sentenceIdx, setSentenceIdx] = useState(0);
  const [phase, setPhase] = useState<'intro' | 'recording' | 'feedback' | 'done'>('intro');
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [recordingStart, setRecordingStart] = useState<number | null>(null);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [currentEval, setCurrentEval] = useState<any>(null);
  const recRef = useRef<RecognitionHandle | null>(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const sentence = sentences[sentenceIdx];
  const supported = speechRecognitionSupported();

  useEffect(() => () => { recRef.current?.abort(); }, []);

  const startRecording = () => {
    setTranscript('');
    setInterim('');
    setPhase('recording');
    setRecordingStart(Date.now());
    if (!supported) {
      setTimeout(() => {
        setTranscript(sentence.text);
        stopRecording();
      }, 3000);
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
    const duration = recordingStart ? (Date.now() - recordingStart) / 1000 : 5;
    const fullTranscript = (transcript + ' ' + interim).trim() || sentence.text;
    const evalResult = evaluateResponse({
      transcript: fullTranscript,
      prompt: sentence.text,
      durationSeconds: duration,
      seed: sentence.id + fullTranscript,
    });
    setCurrentEval(evalResult);
  };

  const nextSentence = async () => {
    const newEvals = [...evaluations, currentEval];
    setEvaluations(newEvals);

    if (sentenceIdx + 1 < sentences.length) {
      setSentenceIdx(sentenceIdx + 1);
      setPhase('intro');
      setTranscript('');
      setInterim('');
      setCurrentEval(null);
    } else {
      const avgScore = newEvals.reduce((a, e) => a + e.overall, 0) / newEvals.length;
      const allStrengths = newEvals.flatMap((e) => e.strengths).slice(0, 5);
      const allWeaknesses = newEvals.flatMap((e) => e.weaknesses).slice(0, 5);
      const allImprovements = newEvals.flatMap((e) => e.improvements).slice(0, 5);
      await saveModuleScore(2, 'Pronunciation Assessment', avgScore, {
        categoryScores: newEvals.reduce((acc, e) => {
          for (const [k, v] of Object.entries(e.categoryScores)) acc[k] = (acc[k] || 0) + v;
          return acc;
        }, {} as Record<string, number>),
        strengths: allStrengths,
        weaknesses: allWeaknesses,
        improvements: allImprovements,
        responses: newEvals,
      });
      onComplete(avgScore, {});
      navigate('/dashboard');
    }
  };

  if (phase === 'done') return null;

  return (
    <div>
      <ModuleHeader
        icon={<Mic size={22} />}
        title="Module 2: Pronunciation Assessment"
        description={`Read ${position?.label ?? 'industry'}-specific sentences aloud. The system evaluates pronunciation clarity, word stress, and natural rhythm using position-specific vocabulary.`}
        instructions={[
          'Click the microphone button and read the sentence aloud.',
          'Speak clearly at a natural pace.',
          'You will receive feedback after each sentence.',
        ]}
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-ink-600 dark:text-ink-300">
                Sentence {sentenceIdx + 1} of {sentences.length}
              </span>
              <div className="flex items-center gap-2">
                <span className="badge bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300">{sentence.category}</span>
                <span className={`badge text-xs ${
                  sentence.difficulty === 'easy' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
                  sentence.difficulty === 'medium' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' :
                  'bg-lava-50 dark:bg-lava-950/40 text-lava-700 dark:text-lava-400'
                }`}>{sentence.difficulty}</span>
                {position && <span className="badge bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300">{position.label}</span>}
              </div>
            </div>

            {/* Sentence to read */}
            <div className="rounded-2xl bg-lava-50 dark:bg-lava-950/30 border border-lava-100 dark:border-lava-900/50 p-6 mb-6">
              <div className="flex items-start gap-3">
                <BookOpen size={20} className="text-lava-600 mt-1 shrink-0" />
                <div>
                  <p className="text-xs text-lava-600 font-semibold uppercase tracking-wide mb-2">Read this aloud:</p>
                  <p className="font-display text-lg text-ink-800 dark:text-ink-100 leading-relaxed">"{sentence.text}"</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => speak(sentence.text)}>
                  <Volume2 size={14} /> Hear reference
                </Button>
              </div>
            </div>

            {/* Recording UI */}
            {phase === 'intro' && (
              <div className="text-center py-8">
                <MicButton active={false} onClick={startRecording} label="Click to start recording" />
                {!supported && (
                  <p className="text-xs text-amber-600 mt-3 max-w-sm mx-auto">
                    Speech recognition is not available in this browser. A simulated transcript will be used for evaluation.
                  </p>
                )}
              </div>
            )}

            {phase === 'recording' && (
              <div className="text-center py-8">
                <MicButton active onClick={() => stopRecording()} label="Recording... Click to stop" />
                <div className="mt-4 flex justify-center"><VoiceWave active /></div>
                <p className="text-sm text-ink-500 dark:text-ink-400 mt-3 italic">{interim || 'Listening...'}</p>
              </div>
            )}

            {/* Feedback */}
            <AnimatePresence>
              {phase === 'feedback' && currentEval && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="rounded-xl bg-ink-50 dark:bg-ink-800/50 p-4">
                    <p className="text-xs text-ink-500 dark:text-ink-400 mb-1">Your transcript:</p>
                    <p className="text-sm text-ink-800 dark:text-ink-100 italic">"{transcript || sentence.text}"</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {['Pronunciation', 'Fluency', 'Confidence', 'Grammar', 'Vocabulary'].map((cat) => (
                      <div key={cat} className="text-center p-2 rounded-lg bg-ink-50 dark:bg-ink-800/50">
                        <p className="text-xs text-ink-500 dark:text-ink-400">{cat}</p>
                        <p className="font-display font-bold text-lg text-ink-800 dark:text-ink-100">{currentEval.categoryScores[cat]}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-green-200 dark:border-green-900/40 bg-green-50 dark:bg-green-900/10 p-4">
                      <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase mb-2">Strengths</p>
                      <ul className="space-y-1">
                        {currentEval.strengths.map((s: string, i: number) => (
                          <li key={i} className="text-sm text-ink-700 dark:text-ink-200 flex items-start gap-2">
                            <CheckCircle2 size={14} className="text-green-600 mt-0.5 shrink-0" /> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/10 p-4">
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase mb-2">Areas to Improve</p>
                      <ul className="space-y-1">
                        {currentEval.improvements.map((s: string, i: number) => (
                          <li key={i} className="text-sm text-ink-700 dark:text-ink-200">• {s}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <Button onClick={nextSentence} className="w-full">
                    {sentenceIdx + 1 < sentences.length ? 'Next Sentence' : 'Finish Module'} <ArrowRight size={16} />
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
              <h3 className="font-display text-sm font-bold text-ink-800 dark:text-ink-100">Position Vocabulary</h3>
            </div>
            <p className="text-xs text-ink-500 dark:text-ink-400 mb-3">
              These sentences use real {position?.label ?? 'industry'} terminology you'll encounter on the job.
            </p>
            <div className="space-y-2">
              {sentences.map((s, i) => (
                <div key={s.id} className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                  i === sentenceIdx
                    ? 'bg-lava-50 dark:bg-lava-950/30 text-lava-700 dark:text-lava-400 font-semibold'
                    : i < sentenceIdx
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-ink-500 dark:text-ink-400'
                }`}>
                  {i < sentenceIdx ? <CheckCircle2 size={14} className="shrink-0" /> : i === sentenceIdx ? <Mic size={14} className="shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-current shrink-0" />}
                  <span className="truncate">{s.category}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Volume2 size={18} className="text-lava-600" />
              <h3 className="font-display text-sm font-bold text-ink-800 dark:text-ink-100">Pronunciation Tips</h3>
            </div>
            <ul className="space-y-2 text-xs text-ink-600 dark:text-ink-300">
              <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-green-600 mt-0.5 shrink-0" /> Articulate each word clearly — don't rush.</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-green-600 mt-0.5 shrink-0" /> Stress key syllables in industry terms.</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-green-600 mt-0.5 shrink-0" /> Maintain a steady, natural pace.</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-green-600 mt-0.5 shrink-0" /> Use the reference audio to check pronunciation.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
