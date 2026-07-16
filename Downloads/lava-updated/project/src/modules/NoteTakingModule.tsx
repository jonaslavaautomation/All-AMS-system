import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PenLine, ArrowRight, Volume2, CheckCircle2, AlertCircle, Sparkles, Phone, RotateCw } from 'lucide-react';
import { ModuleHeader } from '../components/modules/ModuleHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { VoiceWave } from '../components/ui/VoiceWave';
import { PhoneCallInterface } from '../components/ui/PhoneCallInterface';
import { useAssessment } from '../context/AssessmentContext';
import { speak, speechSynthesisSupported, stopSpeaking } from '../lib/speech';
import { evaluateNotes } from '../lib/evaluator';
import { getNoteTakingItems } from '../lib/positionContentBank';
import { getPositionByLabel } from '../lib/positionBank';

interface Props {
  onComplete: (score: number, details: any) => void;
}

export function NoteTakingModule({ onComplete }: Props) {
  const navigate = useNavigate();
  const { saveModuleScore, candidate } = useAssessment();
  const position = candidate ? getPositionByLabel(candidate.position) : null;
  const exercises = getNoteTakingItems(position?.id ?? 'general-va');

  const [exIdx, setExIdx] = useState(0);
  const [phase, setPhase] = useState<'incoming' | 'playing' | 'paused' | 'writing' | 'feedback'>('incoming');
  const [notes, setNotes] = useState('');
  const [allResults, setAllResults] = useState<any[]>([]);
  const [currentResult, setCurrentResult] = useState<any>(null);
  const [playCount, setPlayCount] = useState(0);
  const [callDuration, setCallDuration] = useState(0);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const exercise = exercises[exIdx];
  const maxReplays = 2;

  useEffect(() => () => { stopSpeaking(); if (timerRef.current) clearInterval(timerRef.current); }, []);

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
    await speak(exercise.audioScript, { rate: 0.92 });
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
    await speak(exercise.audioScript, { rate: 0.92 });
    if (phaseRef.current === 'playing') {
      setPhase('paused');
      stopCallTimer();
    }
  };

  const submitNotes = () => {
    const result = evaluateNotes(notes, exercise.keyPoints);
    setCurrentResult(result);
    setPhase('feedback');
  };

  const nextExercise = async () => {
    const newResults = [...allResults, currentResult];
    setAllResults(newResults);
    if (exIdx + 1 < exercises.length) {
      setExIdx(exIdx + 1);
      setPhase('incoming');
      setNotes('');
      setCurrentResult(null);
      setPlayCount(0);
      setCallDuration(0);
    } else {
      const avg = newResults.reduce((a, r) => a + r.score, 0) / newResults.length;
      await saveModuleScore(6, 'Listening + Note Taking', avg, {
        categoryScores: { Accuracy: avg, Completeness: avg, Organization: avg },
        strengths: newResults.flatMap(r => r.matched.map((k: string) => `Captured: ${k}`)).slice(0, 5),
        weaknesses: newResults.flatMap(r => r.missing.map((k: string) => `Missed: ${k}`)).slice(0, 5),
        improvements: ['Practice identifying key numbers, names, and dates in business audio.'],
        responses: newResults,
      });
      onComplete(avg, {});
      navigate('/dashboard');
    }
  };

  const canReplay = playCount < maxReplays;
  const callerName = exercise.callerName;
  const callerCompany = exercise.callerCompany;

  return (
    <div>
      <ModuleHeader
        icon={<PenLine size={22} />}
        title="Module 6: Listening + Note Taking"
        description={`Listen to realistic ${position?.label ?? 'business'} phone calls and take notes. The AI compares your notes against key information to evaluate accuracy and organization.`}
        instructions={[
          'When a call comes in, tap the green button to answer.',
          'Listen carefully — you can replay the call up to 2 times.',
          'After the call ends, type your notes capturing key details.',
          'You will be scored on accuracy, completeness, and organization.',
        ]}
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-ink-600 dark:text-ink-300">Call {exIdx + 1} of {exercises.length}</span>
              <div className="flex items-center gap-2">
                <span className="badge bg-lava-50 dark:bg-lava-950/40 text-lava-700 dark:text-lava-400">{exercise.title}</span>
                {position && <span className="badge bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300">{position.label}</span>}
              </div>
            </div>

            {phase === 'incoming' ? (
              <PhoneCallInterface
                callerName={callerName}
                callerCompany={callerCompany}
                scenarioName={exercise.title}
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
            ) : phase !== 'writing' && phase !== 'feedback' ? (
              <PhoneCallInterface
                callerName={callerName}
                callerCompany={callerCompany}
                scenarioName={exercise.title}
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
                        {phase === 'playing' ? 'Call in progress...' : 'Call ended'}
                      </p>
                    </div>
                  </div>
                  <VoiceWave active={phase === 'playing'} />
                </div>

                {!speechSynthesisSupported() && (
                  <div className="mt-2 p-3 rounded-lg bg-white dark:bg-ink-900 text-sm text-ink-600 dark:text-ink-300 italic leading-relaxed">
                    "{exercise.audioScript}"
                  </div>
                )}

                {phase === 'paused' && (
                  <div className="flex gap-2 mt-2">
                    <Button onClick={() => setPhase('writing')}>
                      Start Taking Notes <ArrowRight size={16} />
                    </Button>
                  </div>
                )}
              </PhoneCallInterface>
            ) : null}

            <AnimatePresence>
              {(phase === 'writing' || phase === 'feedback') && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 mt-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink-600 dark:text-ink-300 mb-1.5">Your Notes</label>
                    <textarea
                      className="input-field min-h-[160px] resize-y font-mono text-sm"
                      placeholder="Type your notes here. Capture key details like names, dates, amounts, and policy numbers..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      disabled={phase === 'feedback'}
                    />
                  </div>

                  {phase === 'writing' && (
                    <Button onClick={submitNotes} className="w-full" disabled={!notes.trim()}>Submit Notes</Button>
                  )}

                  {phase === 'feedback' && currentResult && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-lava-50 dark:bg-lava-950/30">
                        <div className="text-center">
                          <p className="font-display text-3xl font-bold text-lava-700">{Math.round(currentResult.score)}</p>
                          <p className="text-xs text-ink-500">/100</p>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">You captured {currentResult.capturedCount} of {currentResult.totalCount} key points</p>
                          <div className="w-full h-2 rounded-full bg-ink-200 dark:bg-ink-700 mt-1.5 overflow-hidden">
                            <div className="h-full gradient-lava rounded-full" style={{ width: `${(currentResult.capturedCount / currentResult.totalCount) * 100}%` }} />
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="rounded-xl border border-green-200 dark:border-green-900/40 bg-green-50 dark:bg-green-900/10 p-3">
                          <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase mb-2">Captured ({currentResult.matched.length})</p>
                          <ul className="space-y-1">
                            {currentResult.matched.length === 0 ? <li className="text-xs text-ink-400">None</li> :
                              currentResult.matched.map((k: string, i: number) => <li key={i} className="text-xs text-ink-700 dark:text-ink-200 flex items-start gap-1.5"><CheckCircle2 size={12} className="text-green-600 mt-0.5 shrink-0" /> {k}</li>)}
                          </ul>
                        </div>
                        <div className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 p-3">
                          <p className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase mb-2">Missed ({currentResult.missing.length})</p>
                          <ul className="space-y-1">
                            {currentResult.missing.length === 0 ? <li className="text-xs text-ink-400">None — great job!</li> :
                              currentResult.missing.map((k: string, i: number) => <li key={i} className="text-xs text-ink-700 dark:text-ink-200 flex items-start gap-1.5"><AlertCircle size={12} className="text-red-600 mt-0.5 shrink-0" /> {k}</li>)}
                          </ul>
                        </div>
                      </div>

                      <Button onClick={nextExercise} className="w-full">
                        {exIdx + 1 < exercises.length ? 'Next Call' : 'Finish Module'} <ArrowRight size={16} />
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>

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
              {exercises.map((e, i) => (
                <div key={e.id} className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                  i === exIdx
                    ? 'bg-lava-50 dark:bg-lava-950/30 text-lava-700 dark:text-lava-400 font-semibold'
                    : i < exIdx
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-ink-500 dark:text-ink-400'
                }`}>
                  {i < exIdx ? <CheckCircle2 size={14} className="shrink-0" /> : i === exIdx ? <Phone size={14} className="shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-current shrink-0" />}
                  <span className="truncate">{e.title}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <PenLine size={18} className="text-lava-600" />
              <h3 className="font-display text-sm font-bold text-ink-800 dark:text-ink-100">Note-Taking Tips</h3>
            </div>
            <ul className="space-y-2 text-xs text-ink-600 dark:text-ink-300">
              <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-green-600 mt-0.5 shrink-0" /> Focus on names, numbers, dates, and amounts.</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-green-600 mt-0.5 shrink-0" /> Use abbreviations to keep up with the audio.</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-green-600 mt-0.5 shrink-0" /> Organize notes by topic, not by chronology.</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-green-600 mt-0.5 shrink-0" /> Use replays strategically — you only get 2.</li>
            </ul>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <RotateCw size={18} className="text-lava-600" />
              <h3 className="font-display text-sm font-bold text-ink-800 dark:text-ink-100">Call Stats</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-ink-500 dark:text-ink-400">Calls Completed</span>
                <span className="text-ink-700 dark:text-ink-200">{exIdx} / {exercises.length}</span>
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
