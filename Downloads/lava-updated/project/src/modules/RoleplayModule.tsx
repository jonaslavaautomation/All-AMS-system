import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Headset, ArrowRight, Bot, User, Frown, Meh, Smile, AlertTriangle, Brain, Sparkles,
} from 'lucide-react';
import { ModuleHeader } from '../components/modules/ModuleHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { MicButton } from '../components/ui/MicButton';
import { VoiceWave } from '../components/ui/VoiceWave';
import { TypingDots } from '../components/ui/TypingDots';
import { LiveAnalyticsPanel } from '../components/ui/LiveAnalyticsPanel';
import { CallEnvironmentToggle } from '../components/ui/CallEnvironmentToggle';
import { CoachFeedback } from '../components/modules/CoachFeedback';
import { useAssessment } from '../context/AssessmentContext';
import { createRecognition, speak, speechSynthesisSupported, speechRecognitionSupported, stopSpeaking, countFillerWords, calculateWPM, type RecognitionHandle } from '../lib/speech';
import { generateCoachFeedback, type CoachFeedback as CoachFeedbackData } from '../lib/coachEngine';
import { getRandomPersonality, getVoiceParams, type Personality } from '../lib/personalityEngine';
import { analyzeEmotion, summarizeEmotions, type EmotionSnapshot } from '../lib/emotionEngine';
import { getPositionByLabel } from '../lib/positionBank';
import { useLiveAnalytics } from '../hooks/useLiveAnalytics';
import { FILLER_WORDS } from '../lib/assessmentData';

interface Props {
  onComplete: (score: number, details: any) => void;
}

interface ChatMessage {
  role: 'customer' | 'agent';
  text: string;
  emotion?: string;
  personalityName?: string;
}

const TOTAL_SCENARIOS = 4;

const dynamicCustomerReplies = [
  "Okay, I understand. Can you tell me what happens next?",
  "That doesn't really solve my problem. Is there anything else you can do?",
  "Hmm, alright. How long will that take?",
  "I appreciate that. Can you confirm the details for me?",
  "That's better. Thank you for your help.",
  "Wait, I'm still confused about one thing. Can you clarify?",
  "I'm not sure that works for me. What are my other options?",
  "Okay, but what if that doesn't work? Then what?",
];

const emotionTransitions: Record<string, string[]> = {
  angry: ['frustrated', 'angry', 'frustrated'],
  frustrated: ['confused', 'frustrated', 'polite'],
  confused: ['confused', 'polite', 'anxious'],
  polite: ['polite', 'satisfied', 'polite'],
  anxious: ['anxious', 'confused', 'polite'],
  dismissive: ['dismissive', 'skeptical', 'interested'],
  skeptical: ['skeptical', 'confused', 'interested'],
  interested: ['interested', 'polite', 'satisfied'],
  demanding: ['demanding', 'frustrated', 'polite'],
  professional: ['professional', 'polite', 'satisfied'],
};

const emotionConfig: Record<string, { icon: any; color: string; label: string }> = {
  angry: { icon: Frown, color: 'text-red-600 bg-red-50 dark:bg-red-900/20', label: 'Angry' },
  frustrated: { icon: AlertTriangle, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20', label: 'Frustrated' },
  confused: { icon: Meh, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20', label: 'Confused' },
  polite: { icon: Smile, color: 'text-green-600 bg-green-50 dark:bg-green-900/20', label: 'Polite' },
  anxious: { icon: Meh, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20', label: 'Anxious' },
  dismissive: { icon: AlertTriangle, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20', label: 'Dismissive' },
  skeptical: { icon: Meh, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20', label: 'Skeptical' },
  interested: { icon: Smile, color: 'text-green-600 bg-green-50 dark:bg-green-900/20', label: 'Interested' },
  demanding: { icon: Frown, color: 'text-red-600 bg-red-50 dark:bg-red-900/20', label: 'Demanding' },
  professional: { icon: Smile, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20', label: 'Professional' },
  satisfied: { icon: Smile, color: 'text-green-600 bg-green-50 dark:bg-green-900/20', label: 'Satisfied' },
  firm: { icon: AlertTriangle, color: 'text-ink-700 bg-ink-100 dark:bg-ink-800', label: 'Firm' },
  disappointed: { icon: Meh, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20', label: 'Disappointed' },
  casual: { icon: Smile, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20', label: 'Casual' },
  rushed: { icon: AlertTriangle, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20', label: 'Rushed' },
  condescending: { icon: Frown, color: 'text-red-600 bg-red-50 dark:bg-red-900/20', label: 'Condescending' },
  distressed: { icon: Frown, color: 'text-red-600 bg-red-50 dark:bg-red-900/20', label: 'Distressed' },
  urgent: { icon: AlertTriangle, color: 'text-red-600 bg-red-50 dark:bg-red-900/20', label: 'Urgent' },
  evasive: { icon: Meh, color: 'text-ink-600 bg-ink-100 dark:bg-ink-800', label: 'Evasive' },
  impatient: { icon: AlertTriangle, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20', label: 'Impatient' },
  hopeful: { icon: Smile, color: 'text-green-600 bg-green-50 dark:bg-green-900/20', label: 'Hopeful' },
  excited: { icon: Smile, color: 'text-green-600 bg-green-50 dark:bg-green-900/20', label: 'Excited' },
};

export function RoleplayModule({ onComplete }: Props) {
  const navigate = useNavigate();
  const { saveModuleScore, candidate } = useAssessment();
  const position = candidate ? getPositionByLabel(candidate.position) : null;
  const roleplayScenarios = position?.roleplayScenarios ?? [];

  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [personality, setPersonality] = useState<Personality>(() => getRandomPersonality('customer'));
  const [currentEmotion, setCurrentEmotion] = useState<string>('angry');
  const [phase, setPhase] = useState<'intro' | 'customer_speaking' | 'listening' | 'feedback' | 'customer_reply'>('intro');
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [recordingStart, setRecordingStart] = useState<number | null>(null);
  const [allFeedback, setAllFeedback] = useState<CoachFeedbackData[]>([]);
  const [coachFeedback, setCoachFeedback] = useState<CoachFeedbackData | null>(null);
  const [emotionTimeline, setEmotionTimeline] = useState<EmotionSnapshot[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [turnCount, setTurnCount] = useState(0);
  const [, setScenarioScores] = useState<number[]>([]);
  const recRef = useRef<RecognitionHandle | null>(null);
  const supported = speechSynthesisSupported() && speechRecognitionSupported();
  const { analytics, startTracking, updateTranscript, stopTracking, reset } = useLiveAnalytics();
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const scenario = roleplayScenarios[scenarioIdx % roleplayScenarios.length];
  const emotion = emotionConfig[currentEmotion] ?? emotionConfig['angry'];
  const EmotionIcon = emotion.icon;

  useEffect(() => () => { stopSpeaking(); recRef.current?.abort(); stopTracking(); }, [stopTracking]);

  const startScenario = async () => {
    const newPersonality = getRandomPersonality('customer');
    setPersonality(newPersonality);
    setCurrentEmotion(scenario?.emotion ?? 'angry');
    setPhase('customer_speaking');
    setMessages([{ role: 'customer', text: scenario?.customerLine ?? "I need help with my account.", emotion: scenario?.emotion, personalityName: newPersonality.name }]);
    const voiceParams = getVoiceParams(newPersonality);
    await speak(scenario?.customerLine ?? "I need help with my account.", { rate: voiceParams.rate, pitch: voiceParams.pitch });
    startListening();
  };

  const startListening = () => {
    setTranscript('');
    setInterim('');
    setPhase('listening');
    setRecordingStart(Date.now());
    reset();
    startTracking();
    if (!supported) {
      setTimeout(() => {
        setTranscript("I understand your concern. Let me look into your account and see what I can do to help resolve this for you.");
        stopListening();
      }, 4000);
      return;
    }
    const rec = createRecognition({
      onResult: (text, isFinal) => {
        if (isFinal) {
          setTranscript(prev => {
            const updated = prev + ' ' + text;
            updateTranscript(updated);
            return updated;
          });
          setInterim('');
        } else {
          setInterim(text);
          updateTranscript(text);
        }
      },
      onEnd: () => { if (phaseRef.current === 'listening') stopListening(); },
      onError: () => stopListening(),
    });
    recRef.current = rec;
    rec?.start();
  };

  const stopListening = () => {
    recRef.current?.stop();
    stopTracking();
    setPhase('feedback');
    const duration = recordingStart ? (Date.now() - recordingStart) / 1000 : 10;
    const full = (transcript + ' ' + interim).trim() || "I understand your concern. Let me help you with that.";
    setMessages(prev => [...prev, { role: 'agent', text: full }]);

    const feedback = generateCoachFeedback({
      transcript: full,
      prompt: scenario?.context ?? 'Customer service roleplay',
      durationSeconds: duration,
      position: position ?? ({} as any),
      seed: scenarioIdx + turnCount + full,
    });
    setCoachFeedback(feedback);

    const fillerCount = countFillerWords(full, FILLER_WORDS);
    const wpm = calculateWPM(full, duration);
    const emotion = analyzeEmotion({
      transcript: full, durationSeconds: duration, fillerCount, wpm, responseScore: feedback.overall, timestamp: Date.now(),
    });
    setEmotionTimeline(prev => [...prev, emotion]);
  };

  const continueRoleplay = async () => {
    const newFeedback = coachFeedback ? [...allFeedback, coachFeedback] : allFeedback;
    setAllFeedback(newFeedback);
    setScenarioScores(prev => [...prev, coachFeedback?.overall ?? 70]);
    setTurnCount(turnCount + 1);

    if (turnCount < 1) {
      // Dynamic customer reply with emotion transition
      const reply = dynamicCustomerReplies[scenarioIdx % dynamicCustomerReplies.length];
      const transitions = emotionTransitions[currentEmotion] ?? ['polite'];
      const newEmotion = transitions[turnCount % transitions.length];
      setCurrentEmotion(newEmotion);

      setPhase('customer_reply');
      setMessages(prev => [...prev, { role: 'customer', text: reply, emotion: newEmotion, personalityName: personality.name }]);
      const voiceParams = getVoiceParams(personality);
      await speak(reply, { rate: voiceParams.rate, pitch: voiceParams.pitch });
      setCoachFeedback(null);
      startListening();
    } else {
      finishScenario(newFeedback);
    }
  };

  const finishScenario = async (allFb: CoachFeedbackData[]) => {

    if (scenarioIdx + 1 < TOTAL_SCENARIOS) {
      setScenarioIdx(scenarioIdx + 1);
      setPhase('intro');
      setTranscript('');
      setInterim('');
      setCoachFeedback(null);
      setMessages([]);
      setTurnCount(0);
      setPersonality(getRandomPersonality('customer'));
    } else {
      const avg = allFb.reduce((a, f) => a + f.overall, 0) / Math.max(allFb.length, 1);
      const emotionSummary = summarizeEmotions([...emotionTimeline]);
      await saveModuleScore(5, 'Customer Service Roleplay', avg, {
        categoryScores: allFb.reduce((acc, f) => { for (const [k, v] of Object.entries(f.categoryScores)) acc[k] = (acc[k] || 0) + v; return acc; }, {} as Record<string, number>),
        strengths: allFb.flatMap(f => f.strengths).slice(0, 6),
        weaknesses: allFb.flatMap(f => f.improvements).slice(0, 6),
        improvements: allFb.flatMap(f => f.coachingTips).slice(0, 6),
        responses: allFb,
        emotionSummary,
        adaptiveData: {
          positionId: position?.id ?? 'general-va',
          personalityUsed: personality.name,
          responseScores: allFb.map(f => f.overall),
          emotionTimeline,
        },
      });
      onComplete(avg, {});
      navigate('/dashboard');
    }
  };

  return (
    <div>
      <ModuleHeader
        icon={<Headset size={22} />}
        title="Module 5: Customer Service Roleplay"
        description="Engage in live AI-driven customer conversations with dynamic personalities and changing emotions. The AI interrupts, asks follow-ups, challenges weak answers, and switches emotions based on your performance."
        instructions={[
          'Click "Start Scenario" to hear the customer speak.',
          'Respond as a professional customer service agent.',
          'The customer changes emotion dynamically — adapt your approach.',
          'You receive instant AI coaching after every response.',
        ]}
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-ink-600 dark:text-ink-300">Scenario {scenarioIdx + 1} of {TOTAL_SCENARIOS}</span>
              <div className="flex items-center gap-2">
                <span className={`badge text-xs ${emotion.color}`}>
                  <EmotionIcon size={12} /> {emotion.label}
                </span>
                <span className={`badge text-xs ${personality.color}`}>
                  <Sparkles size={12} /> {personality.name}
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-ink-50 dark:bg-ink-800/50 p-3 mb-4">
              <p className="text-xs text-ink-500 dark:text-ink-400">{position?.label ?? 'Customer Service'} Roleplay</p>
              <p className="text-sm text-ink-700 dark:text-ink-200 mt-0.5">{scenario?.context ?? 'Handle the customer interaction professionally.'}</p>
            </div>

            {/* Chat */}
            <div className="rounded-2xl bg-ink-50 dark:bg-ink-800/50 p-4 mb-4 min-h-[200px] max-h-[280px] overflow-y-auto scrollbar-thin space-y-3">
              {messages.length === 0 && phase === 'intro' && (
                <div className="text-center py-8 text-ink-400">
                  <Headset size={32} className="mx-auto mb-2" />
                  <p className="text-sm">Click "Start Scenario" to begin the roleplay.</p>
                  <p className="text-xs mt-1">Customer: {personality.name} — {personality.tone}</p>
                </div>
              )}
              {messages.map((m, i) => {
                const mEmotion = emotionConfig[m.emotion ?? 'angry'] ?? emotionConfig['angry'];
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-2.5 ${m.role === 'agent' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      m.role === 'customer' ? 'bg-ink-300 dark:bg-ink-700 text-ink-700 dark:text-ink-200' : 'gradient-lava text-white'
                    }`}>
                      {m.role === 'customer' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                      m.role === 'customer' ? 'bg-white dark:bg-ink-900 text-ink-800 dark:text-ink-100' : 'bg-lava-700 text-white'
                    }`}>
                      {m.text}
                      <div className="flex items-center gap-1.5 mt-1">
                        {m.emotion && <span className={`badge text-[10px] ${mEmotion.color}`}><mEmotion.icon size={8} /> {mEmotion.label}</span>}
                        {m.personalityName && <span className="text-[10px] text-ink-400">{m.personalityName}</span>}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {phase === 'customer_speaking' && (
                <div className="flex gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-ink-300 dark:bg-ink-700 flex items-center justify-center text-ink-700 dark:text-ink-200 shrink-0"><User size={16} /></div>
                  <div className="bg-white dark:bg-ink-900 rounded-2xl"><TypingDots /></div>
                </div>
              )}
            </div>

            {phase === 'intro' && (
              <Button onClick={startScenario} size="lg" className="w-full">Start Scenario</Button>
            )}

            {phase === 'customer_speaking' && (
              <div className="text-center py-2"><VoiceWave active /><p className="text-xs text-ink-500 mt-1">{personality.name} is speaking...</p></div>
            )}

            {phase === 'listening' && (
              <div className="text-center py-4">
                <MicButton active onClick={stopListening} label="Click to stop" />
                <p className="text-sm text-ink-500 dark:text-ink-400 mt-3 italic max-w-2xl mx-auto line-clamp-2">{interim || 'Listening...'}</p>
              </div>
            )}

            <AnimatePresence>
              {phase === 'feedback' && coachFeedback && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-lava-50 dark:bg-lava-950/30">
                    <p className="text-sm text-ink-700 dark:text-ink-200">
                      <strong>Response Score: {Math.round(coachFeedback.overall)}/100</strong> — Emotion: {emotion.label}
                    </p>
                  </div>
                  <CoachFeedback feedback={coachFeedback} />
                  <Button onClick={continueRoleplay} className="w-full">
                    {turnCount < 1 ? 'Continue Conversation' : (scenarioIdx + 1 < TOTAL_SCENARIOS ? 'Next Scenario' : 'Finish Module')} <ArrowRight size={16} />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <LiveAnalyticsPanel analytics={analytics} active={phase === 'listening'} />
          <CallEnvironmentToggle />
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain size={16} className="text-lava-600" />
              <h3 className="font-display text-sm font-bold text-ink-800 dark:text-ink-100">Dynamic Engine</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-ink-500 dark:text-ink-400">Current Emotion</span>
                <span className={`badge ${emotion.color}`}><EmotionIcon size={10} /> {emotion.label}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-500 dark:text-ink-400">Customer</span>
                <span className="text-ink-700 dark:text-ink-200 truncate ml-2" title={personality.name}>{personality.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-500 dark:text-ink-400">Turn</span>
                <span className="text-ink-700 dark:text-ink-200">{turnCount + 1}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-500 dark:text-ink-400">Responses</span>
                <span className="text-ink-700 dark:text-ink-200">{emotionTimeline.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
