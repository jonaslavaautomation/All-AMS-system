import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ArrowRight, CheckCircle2, BookOpen, Sparkles, Volume2 } from 'lucide-react';
import { ModuleHeader } from '../components/modules/ModuleHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { MicButton } from '../components/ui/MicButton';
import { VoiceWave } from '../components/ui/VoiceWave';
import { useAssessment } from '../context/AssessmentContext';
import { createRecognition, speechRecognitionSupported, speak, type RecognitionHandle } from '../lib/speech';
import { evaluateResponse, evaluateInsuranceResponse } from '../lib/evaluator';
import { getScenarioTopics } from '../lib/positionContentBank';
import { getPositionByLabel } from '../lib/positionBank';

interface Props {
  onComplete: (score: number, details: any) => void;
}

export function InsuranceModule({ onComplete }: Props) {
  const navigate = useNavigate();
  const { saveModuleScore, candidate } = useAssessment();
  const position = candidate ? getPositionByLabel(candidate.position) : null;
  const topics = getScenarioTopics(position?.id ?? 'general-va');

  const [topicIdx, setTopicIdx] = useState(0);
  const [phase, setPhase] = useState<'intro' | 'recording' | 'feedback'>('intro');
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [recordingStart, setRecordingStart] = useState<number | null>(null);
  const [evals, setEvals] = useState<any[]>([]);
  const [currentEval, setCurrentEval] = useState<any>(null);
  const recRef = useRef<RecognitionHandle | null>(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const supported = speechRecognitionSupported();

  const topic = topics[topicIdx];

  useEffect(() => () => { recRef.current?.abort(); }, []);

  const startRecording = () => {
    setTranscript('');
    setInterim('');
    setPhase('recording');
    setRecordingStart(Date.now());
    if (!supported) {
      setTimeout(() => {
        setTranscript(`${topic.topic} is an important part of your professional role. It helps protect you in case of unexpected events. Let me explain how it works and why it matters.`);
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
    const duration = recordingStart ? (Date.now() - recordingStart) / 1000 : 15;
    const full = (transcript + ' ' + interim).trim() || `${topic.topic} is a key part of your role. It involves understanding the details and communicating them clearly.`;
    const baseEval = evaluateResponse({ transcript: full, prompt: topic.prompt, durationSeconds: duration, seed: topic.id + full });
    const insuranceEval = evaluateInsuranceResponse(full, topic.keyTerms);
    const combined = { ...baseEval, overall: insuranceEval.score, termsUsed: insuranceEval.termsUsed, termsMissing: insuranceEval.termsMissing };
    setCurrentEval(combined);
  };

  const nextTopic = async () => {
    const newEvals = [...evals, currentEval];
    setEvals(newEvals);
    if (topicIdx + 1 < topics.length) {
      setTopicIdx(topicIdx + 1);
      setPhase('intro');
      setTranscript('');
      setInterim('');
      setCurrentEval(null);
    } else {
      const avg = newEvals.reduce((a, e) => a + e.overall, 0) / newEvals.length;
      await saveModuleScore(7, 'Professional Communication', avg, {
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
        icon={<ShieldCheck size={22} />}
        title="Module 7: Professional Communication"
        description={`Explain ${position?.label ?? 'industry'}-specific concepts in simple, customer-friendly language. The AI evaluates your vocabulary, accuracy, and professional communication.`}
        instructions={[
          'Read the scenario prompt and click the microphone.',
          'Explain the concept clearly, as if speaking to a real customer.',
          'Use the key terms listed below in your explanation.',
        ]}
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-ink-600 dark:text-ink-300">Scenario {topicIdx + 1} of {topics.length}</span>
              <div className="flex items-center gap-2">
                <span className="badge bg-lava-50 dark:bg-lava-950/40 text-lava-700 dark:text-lava-400">{topic.topic}</span>
                {position && <span className="badge bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300">{position.label}</span>}
              </div>
            </div>

            <div className="rounded-2xl bg-lava-50 dark:bg-lava-950/30 border border-lava-100 dark:border-lava-900/50 p-6 mb-4">
              <div className="flex items-start gap-3">
                <BookOpen size={20} className="text-lava-600 mt-1 shrink-0" />
                <div>
                  <p className="text-xs text-lava-600 font-semibold uppercase tracking-wide mb-2">Scenario prompt:</p>
                  <p className="font-display text-base text-ink-800 dark:text-ink-100 leading-relaxed italic">"{topic.prompt}"</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => speak(topic.prompt)}>
                  <Volume2 size={14} /> Hear prompt
                </Button>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs font-semibold text-ink-500 dark:text-ink-400 mb-2">Key terms to include:</p>
              <div className="flex flex-wrap gap-2">
                {topic.keyTerms.map((term) => (
                  <span key={term} className="badge bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300">{term}</span>
                ))}
              </div>
            </div>

            {phase === 'intro' && (
              <div className="text-center py-6">
                <MicButton active={false} onClick={startRecording} label="Click to record your explanation" />
              </div>
            )}

            {phase === 'recording' && (
              <div className="text-center py-6">
                <MicButton active onClick={stopRecording} label="Click to stop" />
                <div className="mt-4 flex justify-center"><VoiceWave active /></div>
                <p className="text-sm text-ink-500 dark:text-ink-400 mt-3 italic max-w-2xl mx-auto line-clamp-2">{interim || 'Listening...'}</p>
              </div>
            )}

            <AnimatePresence>
              {phase === 'feedback' && currentEval && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-lava-50 dark:bg-lava-950/30">
                    <div className="text-center">
                      <p className="font-display text-3xl font-bold text-lava-700">{Math.round(currentEval.overall)}</p>
                      <p className="text-xs text-ink-500">/100</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">Vocabulary Score</p>
                      <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">{currentEval.termsUsed.length} of {topic.keyTerms.length} key terms used</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {topic.keyTerms.map((term) => {
                      const used = currentEval.termsUsed.includes(term);
                      return (
                        <span key={term} className={`badge ${used ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                          {used ? <CheckCircle2 size={12} /> : <ArrowRight size={12} />} {term}
                        </span>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['Vocabulary', 'Professionalism', 'Grammar', 'Confidence'].map((cat) => (
                      <div key={cat} className="text-center p-2 rounded-lg bg-ink-50 dark:bg-ink-800/50">
                        <p className="text-xs text-ink-500 dark:text-ink-400">{cat}</p>
                        <p className="font-display font-bold text-lg text-ink-800 dark:text-ink-100">{currentEval.categoryScores[cat]}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-lava-200 dark:border-lava-900/40 bg-lava-50 dark:bg-lava-950/20 p-4">
                    <p className="text-xs font-semibold text-lava-700 dark:text-lava-400 uppercase mb-2">Sample Explanation</p>
                    <p className="text-sm text-ink-700 dark:text-ink-200 italic">"{currentEval.sampleAnswer}"</p>
                  </div>

                  <Button onClick={nextTopic} className="w-full">
                    {topicIdx + 1 < topics.length ? 'Next Scenario' : 'Finish Module'} <ArrowRight size={16} />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={18} className="text-lava-600" />
              <h3 className="font-display text-sm font-bold text-ink-800 dark:text-ink-100">Position Scenarios</h3>
            </div>
            <p className="text-xs text-ink-500 dark:text-ink-400 mb-3">
              Real {position?.label ?? 'professional'} scenarios you'll encounter on the job.
            </p>
            <div className="space-y-2">
              {topics.map((t, i) => (
                <div key={t.id} className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                  i === topicIdx
                    ? 'bg-lava-50 dark:bg-lava-950/30 text-lava-700 dark:text-lava-400 font-semibold'
                    : i < topicIdx
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-ink-500 dark:text-ink-400'
                }`}>
                  {i < topicIdx ? <CheckCircle2 size={14} className="shrink-0" /> : i === topicIdx ? <ShieldCheck size={14} className="shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-current shrink-0" />}
                  <span className="truncate">{t.topic}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={18} className="text-lava-600" />
              <h3 className="font-display text-sm font-bold text-ink-800 dark:text-ink-100">Communication Tips</h3>
            </div>
            <ul className="space-y-2 text-xs text-ink-600 dark:text-ink-300">
              <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-green-600 mt-0.5 shrink-0" /> Use simple, jargon-free language.</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-green-600 mt-0.5 shrink-0" /> Include all key terms naturally.</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-green-600 mt-0.5 shrink-0" /> Give examples to illustrate concepts.</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-green-600 mt-0.5 shrink-0" /> Speak with confidence and clarity.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
