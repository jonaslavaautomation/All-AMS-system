import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Headphones, Play, Volume2, CheckCircle2, AlertCircle,
  ArrowRight, Sparkles, Brain, Eye,
} from 'lucide-react';
import { ModuleHeader } from '../components/modules/ModuleHeader';
import { ModuleComplete } from '../components/modules/ModuleComplete';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { VoiceWave } from '../components/ui/VoiceWave';
import { PhoneCallInterface } from '../components/ui/PhoneCallInterface';
import { useAssessment } from '../context/AssessmentContext';
import { speak, speechSynthesisSupported, stopSpeaking } from '../lib/speech';
import { evaluateListening } from '../lib/evaluator';
import { getListeningScenarios } from '../lib/listeningBank';
import { getPositionByLabel } from '../lib/positionBank';

interface Props {
  onComplete: (score: number, details: any) => void;
}

export function ListeningModule({ onComplete }: Props) {
  const navigate = useNavigate();
  const { saveModuleScore, candidate } = useAssessment();
  const position = candidate ? getPositionByLabel(candidate.position) : null;
  const scenarios = getListeningScenarios(position?.id ?? 'general-va');

  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [phase, setPhase] = useState<'incoming' | 'playing' | 'paused' | 'questions' | 'feedback'>('incoming');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [allAnswers, setAllAnswers] = useState<{ correct: boolean }[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalDetails, setFinalDetails] = useState<any>(null);
  const [playCount, setPlayCount] = useState(0);
  const [callDuration, setCallDuration] = useState(0);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scenario = scenarios[scenarioIdx];
  const maxReplays = 2;

  useEffect(() => () => stopSpeaking(), []);
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const startCallTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCallDuration(0);
    timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
  };

  const stopCallTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const answerCall = async () => {
    setPhase('playing');
    startCallTimer();
    await speak(scenario.audioScript, { rate: 0.92 });
    if (phaseRef.current === 'playing') {
      setPhase('paused');
      stopCallTimer();
    }
  };

  const declineCall = () => {
    stopSpeaking();
    stopCallTimer();
    setPhase('incoming');
  };

  const endCall = () => {
    stopSpeaking();
    stopCallTimer();
    setPhase('paused');
  };

  const replayAudio = async () => {
    stopSpeaking();
    setPlayCount(playCount + 1);
    setPhase('playing');
    startCallTimer();
    await speak(scenario.audioScript, { rate: 0.92 });
    if (phaseRef.current === 'playing') {
      setPhase('paused');
      stopCallTimer();
    }
  };

  const handleSubmit = () => {
    const correct = scenario.questions.map((q) => answers[q.id] === q.correctIndex);
    setAllAnswers(prev => [...prev, ...correct.map(c => ({ correct: c }))]);
    setPhase('feedback');
  };

  const nextScenario = async () => {
    if (scenarioIdx + 1 < scenarios.length) {
      setScenarioIdx(scenarioIdx + 1);
      setAnswers({});
      setPlayCount(0);
      setCallDuration(0);
      setPhase('incoming');
    } else {
      const result = evaluateListening(allAnswers);
      setFinalScore(result.score);
      setFinalDetails(result);
      await saveModuleScore(1, 'Listening Comprehension', result.score, {
        categoryScores: { Accuracy: result.details.accuracy, Retention: result.details.retention, Attention: result.details.attention },
        strengths: [`Answered ${result.correctCount} of ${allAnswers.length} questions correctly.`],
        weaknesses: result.details.accuracy < 70 ? ['Work on retaining key details from audio.'] : [],
        improvements: ['Practice active listening with business audio to improve retention.'],
        responses: allAnswers.map((a, i) => ({ prompt: `Question ${i + 1}`, scores: { correct: a.correct ? 100 : 0 }, feedback: a.correct ? 'Correct' : 'Incorrect' })),
      });
      setShowResult(true);
    }
  };

  if (showResult) {
    return (
      <ModuleComplete
        score={finalScore}
        title="Listening Comprehension"
        summary={`You answered ${finalDetails.correctCount} of ${allAnswers.length} questions correctly across ${scenarios.length} ${position?.label ?? ''} scenarios.`}
        isLast={false}
        onContinue={() => { onComplete(finalScore, finalDetails); navigate('/dashboard'); }}
      />
    );
  }

  const canReplay = playCount < maxReplays;
  const callerName = position?.label ? `${position.label} Caller` : 'Business Caller';
  const callerCompany = position?.label ?? 'Global Services';

  return (
    <div>
      <ModuleHeader
        icon={<Headphones size={22} />}
        title="Module 1: Listening Comprehension"
        description={`Answer simulated phone calls from realistic ${position?.label ?? 'business'} scenarios. Listen carefully — the AI voice reads each scenario as a real phone conversation.`}
        instructions={[
          'When a call comes in, tap the green button to answer.',
          'Listen carefully to the caller — you can replay the call up to 2 times.',
          'After the call ends, answer all questions about what you heard.',
          'Each scenario is tailored to the position you are applying for.',
        ]}
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card className="p-6">
            {/* Progress */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-ink-600 dark:text-ink-300">
                Call {scenarioIdx + 1} of {scenarios.length}
              </span>
              <div className="flex items-center gap-2">
                <span className="badge bg-lava-50 dark:bg-lava-950/40 text-lava-700 dark:text-lava-400">{scenario.scenario}</span>
                {position && (
                  <span className="badge bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300">{position.label}</span>
                )}
              </div>
            </div>

            {/* Context hint */}
            <div className="rounded-xl bg-ink-50 dark:bg-ink-800/50 p-3 mb-4">
              <p className="text-xs text-ink-500 dark:text-ink-400">Call Context</p>
              <p className="text-sm text-ink-700 dark:text-ink-200 mt-0.5">{scenario.context}</p>
            </div>

            {/* Phone Call Interface */}
            {phase === 'incoming' ? (
              <PhoneCallInterface
                callerName={callerName}
                callerCompany={callerCompany}
                scenarioName={scenario.scenario}
                onAnswer={answerCall}
                onDecline={declineCall}
                isActive={false}
                duration={callDuration}
                onMute={() => {}}
                onEndCall={endCall}
                isPlaying={false}
                onReplay={replayAudio}
                replaysLeft={0}
              />
            ) : (
              <PhoneCallInterface
                callerName={callerName}
                callerCompany={callerCompany}
                scenarioName={scenario.scenario}
                onAnswer={answerCall}
                onDecline={declineCall}
                isActive
                duration={callDuration}
                onMute={() => {}}
                onEndCall={endCall}
                isPlaying={phase === 'playing'}
                onReplay={replayAudio}
                replaysLeft={canReplay ? maxReplays - playCount : 0}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full gradient-lava flex items-center justify-center text-white shadow-md">
                      <Volume2 size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">AI Voice Call</p>
                      <p className="text-xs text-ink-500 dark:text-ink-400">
                        {phase === 'playing' ? 'Call in progress...' : phase === 'paused' ? 'Call ended' : 'Ready for questions'}
                      </p>
                    </div>
                  </div>
                  <VoiceWave active={phase === 'playing'} />
                </div>

                {!speechSynthesisSupported() && (
                  <div className="mt-2 p-3 rounded-lg bg-white dark:bg-ink-900 text-sm text-ink-600 dark:text-ink-300 italic leading-relaxed">
                    "{scenario.audioScript}"
                  </div>
                )}

                {phase === 'paused' && (
                  <div className="flex gap-2 mt-2">
                    <Button onClick={() => setPhase('questions')}>
                      Continue to Questions <ArrowRight size={16} />
                    </Button>
                  </div>
                )}
              </PhoneCallInterface>
            )}

            {/* Questions */}
            <AnimatePresence>
              {phase === 'questions' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-5 mt-6"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Brain size={18} className="text-lava-600" />
                    <h3 className="font-display font-bold text-ink-800 dark:text-ink-100">Answer the following questions:</h3>
                  </div>
                  {scenario.questions.map((q, qi) => (
                    <div key={q.id}>
                      <p className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-2">
                        {qi + 1}. {q.question}
                      </p>
                      <div className="space-y-2">
                        {q.options.map((opt, oi) => (
                          <button
                            key={oi}
                            onClick={() => setAnswers({ ...answers, [q.id]: oi })}
                            className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm flex items-center gap-3 ${
                              answers[q.id] === oi
                                ? 'border-lava-500 bg-lava-50 dark:bg-lava-950/30 text-ink-800 dark:text-ink-100 shadow-sm'
                                : 'border-ink-200 dark:border-ink-700 hover:border-lava-300 text-ink-600 dark:text-ink-300'
                            }`}
                          >
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono shrink-0 ${
                              answers[q.id] === oi
                                ? 'gradient-lava text-white'
                                : 'bg-ink-100 dark:bg-ink-800 text-ink-400'
                            }`}>
                              {String.fromCharCode(65 + oi)}
                            </span>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <Button
                    onClick={handleSubmit}
                    disabled={scenario.questions.some((q) => answers[q.id] === undefined)}
                    className="w-full"
                  >
                    Submit Answers
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Feedback */}
            <AnimatePresence>
              {phase === 'feedback' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 mt-6"
                >
                  <h3 className="font-display font-bold text-ink-800 dark:text-ink-100">Results for this call:</h3>
                  {scenario.questions.map((q) => {
                    const userAns = answers[q.id];
                    const isCorrect = userAns === q.correctIndex;
                    return (
                      <div key={q.id} className={`p-3 rounded-xl border ${isCorrect ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : 'border-red-200 bg-red-50 dark:bg-red-900/20'}`}>
                        <div className="flex items-start gap-2">
                          {isCorrect ? <CheckCircle2 size={18} className="text-green-600 mt-0.5 shrink-0" /> : <AlertCircle size={18} className="text-red-600 mt-0.5 shrink-0" />}
                          <div className="text-sm">
                            <p className="font-semibold text-ink-800 dark:text-ink-100">{q.question}</p>
                            <p className="text-ink-600 dark:text-ink-300 mt-1">
                              Your answer: <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>{q.options[userAns]}</span>
                            </p>
                            {!isCorrect && <p className="text-green-700 mt-0.5">Correct: {q.options[q.correctIndex]}</p>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <Button onClick={nextScenario} className="w-full">
                    {scenarioIdx + 1 < scenarios.length ? 'Next Call' : 'Finish Module'} <ArrowRight size={16} />
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
              <h3 className="font-display text-sm font-bold text-ink-800 dark:text-ink-100">Position-Specific Calls</h3>
            </div>
            <p className="text-xs text-ink-500 dark:text-ink-400 mb-3">
              Each call is tailored to {position?.label ?? 'your position'} with realistic scenarios you'll encounter on the job.
            </p>
            <div className="space-y-2">
              {scenarios.map((s, i) => (
                <div key={s.id} className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                  i === scenarioIdx
                    ? 'bg-lava-50 dark:bg-lava-950/30 text-lava-700 dark:text-lava-400 font-semibold'
                    : i < scenarioIdx
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-ink-500 dark:text-ink-400'
                }`}>
                  {i < scenarioIdx ? <CheckCircle2 size={14} className="shrink-0" /> : i === scenarioIdx ? <Play size={14} className="shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-current shrink-0" />}
                  <span className="truncate">{s.scenario}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Eye size={18} className="text-lava-600" />
              <h3 className="font-display text-sm font-bold text-ink-800 dark:text-ink-100">Listening Tips</h3>
            </div>
            <ul className="space-y-2 text-xs text-ink-600 dark:text-ink-300">
              <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-green-600 mt-0.5 shrink-0" /> Focus on key details: names, numbers, dates, and amounts.</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-green-600 mt-0.5 shrink-0" /> Note the caller's tone — it signals urgency and priority.</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-green-600 mt-0.5 shrink-0" /> Listen for the main reason for the call, not just the details.</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-green-600 mt-0.5 shrink-0" /> Use replays strategically — you only get 2 per call.</li>
            </ul>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Brain size={18} className="text-lava-600" />
              <h3 className="font-display text-sm font-bold text-ink-800 dark:text-ink-100">Call Stats</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-ink-500 dark:text-ink-400">Calls Completed</span>
                <span className="text-ink-700 dark:text-ink-200">{scenarioIdx} / {scenarios.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-500 dark:text-ink-400">Questions Answered</span>
                <span className="text-ink-700 dark:text-ink-200">{allAnswers.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-500 dark:text-ink-400">Correct So Far</span>
                <span className="text-ink-700 dark:text-ink-200">{allAnswers.filter(a => a.correct).length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-500 dark:text-ink-400">Replays Used</span>
                <span className="text-ink-700 dark:text-ink-200">{playCount} / {maxReplays}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-500 dark:text-ink-400">Call Duration</span>
                <span className="text-ink-700 dark:text-ink-200 font-mono">{Math.floor(callDuration / 60).toString().padStart(2, '0')}:{(callDuration % 60).toString().padStart(2, '0')}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
