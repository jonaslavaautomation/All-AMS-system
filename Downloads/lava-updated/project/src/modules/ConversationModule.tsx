import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, ArrowRight, Eye, Sparkles, Bot, User, Brain, Zap,
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
import { createRecognition, speak, speechRecognitionSupported, stopSpeaking, type RecognitionHandle } from '../lib/speech';
import {
  createAdaptiveState, updateAdaptiveState, selectAdaptiveQuestion,
  shouldAskFollowUp, generateFollowUp, generateMemoryReferencedQuestion, shouldUseMemory,
  getDifficultyContext,
  DIFFICULTY_LABELS, DIFFICULTY_COLORS, type AdaptiveState, type PerformanceSnapshot, type MemoryEntry,
} from '../lib/adaptiveEngine';
import { getRandomPersonality, getVoiceParams, getTransitionLine as getTransition, type Personality } from '../lib/personalityEngine';
import { generateCoachFeedback, type CoachFeedback as CoachFeedbackData } from '../lib/coachEngine';
import { analyzeEmotion, summarizeEmotions, type EmotionSnapshot } from '../lib/emotionEngine';
import { getPositionByLabel } from '../lib/positionBank';
import { useLiveAnalytics } from '../hooks/useLiveAnalytics';
import { countFillerWords, calculateWPM } from '../lib/speech';
import { FILLER_WORDS } from '../lib/assessmentData';

interface Props {
  onComplete: (score: number, details: any) => void;
}

interface ChatMessage {
  role: 'ai' | 'user';
  text: string;
  personalityName?: string;
}

const TOTAL_QUESTIONS = 10;

export function ConversationModule({ onComplete }: Props) {
  const navigate = useNavigate();
  const { saveModuleScore, candidate } = useAssessment();
  const position = candidate ? getPositionByLabel(candidate.position) : null;
  const questionPool = position?.interviewQuestions ?? [];

  const [adaptive, setAdaptive] = useState<AdaptiveState>(createAdaptiveState());
  const [personality, setPersonality] = useState<Personality>(() => getRandomPersonality('recruiter'));
  const [qIdx, setQIdx] = useState(0);
  const [askedQuestions, setAskedQuestions] = useState<Set<string>>(new Set());
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [isFollowUp, setIsFollowUp] = useState(false);
  const [phase, setPhase] = useState<'intro' | 'asking' | 'listening' | 'feedback'>('intro');
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [recordingStart, setRecordingStart] = useState<number | null>(null);
  const [coachFeedback, setCoachFeedback] = useState<CoachFeedbackData | null>(null);
  const [allFeedback, setAllFeedback] = useState<CoachFeedbackData[]>([]);
  const [emotionTimeline, setEmotionTimeline] = useState<EmotionSnapshot[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [followUpCount, setFollowUpCount] = useState(0);
  const [aiMemory, setAiMemory] = useState<MemoryEntry[]>([]);
  const [memoryUsed, setMemoryUsed] = useState(false);
  const recRef = useRef<RecognitionHandle | null>(null);
  const supported = speechRecognitionSupported();
  const { analytics, startTracking, updateTranscript, stopTracking, reset } = useLiveAnalytics();
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  useEffect(() => () => { stopSpeaking(); recRef.current?.abort(); stopTracking(); }, [stopTracking]);

  const askQuestion = async () => {
    setPhase('asking');
    let question: string;
    let usedMemory = false;

    if (isFollowUp && messages.length > 0) {
      question = generateFollowUp(transcript || 'your response', adaptive);
    } else if (shouldUseMemory(aiMemory, qIdx) && questionPool.length > 0) {
      question = generateMemoryReferencedQuestion(questionPool, askedQuestions, aiMemory);
      usedMemory = true;
    } else {
      question = selectAdaptiveQuestion(questionPool, adaptive, askedQuestions);
      setAskedQuestions(prev => new Set([...prev, question]));
    }
    setMemoryUsed(usedMemory);
    setCurrentQuestion(question);

    const transition = !isFollowUp && !usedMemory ? getTransition(personality) : '';
    const fullText = transition ? `${transition} ${question}` : question;
    setMessages(prev => [...prev, { role: 'ai', text: fullText, personalityName: personality.name }]);
    const voiceParams = getVoiceParams(personality);
    await speak(fullText, { rate: voiceParams.rate, pitch: voiceParams.pitch });
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
        setTranscript('I have three years of experience in customer service and I enjoy helping people resolve their issues.');
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
    const full = (transcript + ' ' + interim).trim() || 'I have experience working with customers and handling calls.';
    setMessages(prev => [...prev, { role: 'user', text: full }]);

    const feedback = generateCoachFeedback({
      transcript: full,
      prompt: currentQuestion,
      durationSeconds: duration,
      position: position ?? ({} as any),
      seed: qIdx + full,
    });
    setCoachFeedback(feedback);

    // Emotion analysis
    const fillerCount = countFillerWords(full, FILLER_WORDS);
    const wpm = calculateWPM(full, duration);
    const emotion = analyzeEmotion({
      transcript: full,
      durationSeconds: duration,
      fillerCount,
      wpm,
      responseScore: feedback.overall,
      timestamp: Date.now(),
    });
    setEmotionTimeline(prev => [...prev, emotion]);

    // Update adaptive state
    const snapshot: PerformanceSnapshot = {
      responseScore: feedback.overall,
      grammarScore: feedback.categoryScores['Grammar'] ?? 70,
      confidenceScore: feedback.categoryScores['Confidence'] ?? 70,
      pronunciationScore: feedback.categoryScores['Pronunciation'] ?? 70,
      listeningScore: feedback.categoryScores['Listening'] ?? 70,
      fillerWordRatio: full ? fillerCount / full.split(/\s+/).length : 0,
      wpm,
    };
    setAdaptive(updateAdaptiveState(adaptive, snapshot));

    setAiMemory(prev => [...prev, { question: currentQuestion, answer: full, questionIdx: qIdx }]);
  };

  const nextQuestion = async () => {
    const newFeedback = coachFeedback ? [...allFeedback, coachFeedback] : allFeedback;
    setAllFeedback(newFeedback);

    // Decide whether to ask a follow-up
    const askFollowUp = !isFollowUp && shouldAskFollowUp(adaptive) && qIdx < TOTAL_QUESTIONS - 1;
    if (askFollowUp) {
      setFollowUpCount(followUpCount + 1);
      setIsFollowUp(true);
      setPhase('intro');
      setTranscript('');
      setInterim('');
      setCoachFeedback(null);
      // Keep same personality for follow-up
    } else if (qIdx + 1 < TOTAL_QUESTIONS) {
      setQIdx(qIdx + 1);
      setIsFollowUp(false);
      setPhase('intro');
      setTranscript('');
      setInterim('');
      setCoachFeedback(null);
      // New personality for next question
      setPersonality(getRandomPersonality('recruiter'));
    } else {
      // Finish module
      const avgScore = newFeedback.reduce((a, f) => a + f.overall, 0) / Math.max(newFeedback.length, 1);
      const emotionSummary = summarizeEmotions([...emotionTimeline]);
      await saveModuleScore(4, 'Conversation Simulation', avgScore, {
        categoryScores: newFeedback.reduce((acc, f) => {
          for (const [k, v] of Object.entries(f.categoryScores)) acc[k] = (acc[k] || 0) + v;
          return acc;
        }, {} as Record<string, number>),
        strengths: newFeedback.flatMap(f => f.strengths).slice(0, 6),
        weaknesses: newFeedback.flatMap(f => f.improvements).slice(0, 6),
        improvements: newFeedback.flatMap(f => f.coachingTips).slice(0, 6),
        responses: newFeedback,
        adaptiveData: {
          positionId: position?.id ?? 'general-va',
          difficultyLevel: adaptive.level,
          difficultyHistory: adaptive.history.map(() => adaptive.level),
          personalityUsed: personality.name,
          responseScores: newFeedback.map(f => f.overall),
          followUpCount,
          emotionTimeline,
        },
        emotionSummary,
      });
      onComplete(avgScore, {});
      navigate('/dashboard');
    }
  };

  const difficultyCtx = getDifficultyContext(adaptive);

  return (
    <div>
      <ModuleHeader
        icon={<MessageCircle size={22} />}
        title="Module 4: Conversation Simulation"
        description="An adaptive AI voice interviewer asks position-specific questions. The AI adjusts difficulty based on your performance, changes personalities, and provides instant coaching after every response."
        instructions={[
          'Click "Ask Question" to hear the AI interviewer speak.',
          'Respond using your microphone — the AI adapts to your performance.',
          'You receive instant AI coaching after every response.',
          'Tip: Maintain eye contact with your screen as if it were a camera.',
        ]}
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-ink-600 dark:text-ink-300">
                Question {qIdx + 1} of {TOTAL_QUESTIONS}
                {isFollowUp && <span className="text-lava-600 ml-1">• Follow-up</span>}
                {memoryUsed && <span className="text-blue-600 ml-1">• AI Memory</span>}
              </span>
              <div className="flex items-center gap-2">
                <span className={`badge text-xs ${DIFFICULTY_COLORS[adaptive.level]}`}>
                  <Brain size={12} /> {DIFFICULTY_LABELS[adaptive.level]}
                </span>
                <span className={`badge text-xs ${personality.color}`}>
                  <Sparkles size={12} /> {personality.name}
                </span>
              </div>
            </div>

            {/* Chat area */}
            <div className="rounded-2xl bg-ink-50 dark:bg-ink-800/50 p-4 mb-4 min-h-[200px] max-h-[280px] overflow-y-auto scrollbar-thin space-y-3">
              {messages.length === 0 && phase === 'intro' && (
                <div className="text-center py-8 text-ink-400">
                  <Bot size={32} className="mx-auto mb-2" />
                  <p className="text-sm">Click "Ask Question" to begin the interview.</p>
                  <p className="text-xs mt-1">AI Personality: {personality.name} — {personality.tone}</p>
                </div>
              )}
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    m.role === 'ai' ? 'gradient-lava text-white' : 'bg-ink-300 dark:bg-ink-700 text-ink-700 dark:text-ink-200'
                  }`}>
                    {m.role === 'ai' ? <Bot size={16} /> : <User size={16} />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.role === 'ai' ? 'bg-white dark:bg-ink-900 text-ink-800 dark:text-ink-100' : 'bg-lava-700 text-white'
                  }`}>
                    {m.text}
                    {m.personalityName && <p className="text-[10px] text-ink-400 mt-1">— {m.personalityName}</p>}
                  </div>
                </motion.div>
              ))}
              {phase === 'asking' && (
                <div className="flex gap-2.5">
                  <div className="w-8 h-8 rounded-full gradient-lava flex items-center justify-center text-white shrink-0"><Bot size={16} /></div>
                  <div className="bg-white dark:bg-ink-900 rounded-2xl"><TypingDots /></div>
                </div>
              )}
            </div>

            {/* Eye contact reminder */}
            {(phase === 'listening' || phase === 'intro') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/40 mb-4"
              >
                <Eye size={16} className="text-amber-600" />
                <p className="text-xs text-amber-700 dark:text-amber-400">Eye contact reminder: Look at your screen as if it were the interviewer's camera.</p>
              </motion.div>
            )}

            {phase === 'intro' && (
              <Button onClick={askQuestion} size="lg" className="w-full">
                <Sparkles size={18} /> {isFollowUp ? 'Ask Follow-up' : 'Ask Question'} {qIdx + 1}
              </Button>
            )}

            {phase === 'asking' && (
              <div className="text-center py-4">
                <VoiceWave active />
                <p className="text-sm text-ink-500 dark:text-ink-400 mt-2">{personality.name} is speaking...</p>
              </div>
            )}

            {phase === 'listening' && (
              <div className="text-center py-4">
                <MicButton active onClick={stopListening} label="Click to stop recording" />
                <p className="text-sm text-ink-500 dark:text-ink-400 mt-3 italic max-w-2xl mx-auto line-clamp-2">{interim || 'Listening to your response...'}</p>
              </div>
            )}

            <AnimatePresence>
              {phase === 'feedback' && coachFeedback && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-lava-50 dark:bg-lava-950/30">
                    <p className="text-sm text-ink-700 dark:text-ink-200">
                      <strong>Score: {Math.round(coachFeedback.overall)}/100</strong> — Difficulty: {DIFFICULTY_LABELS[adaptive.level]} • {difficultyCtx.speedLabel}
                    </p>
                  </div>
                  <CoachFeedback feedback={coachFeedback} />
                  <Button onClick={nextQuestion} className="w-full">
                    {qIdx + 1 < TOTAL_QUESTIONS || (!isFollowUp && shouldAskFollowUp(adaptive)) ? 'Next Question' : 'Finish Module'} <ArrowRight size={16} />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>

        {/* Sidebar: live analytics + environment */}
        <div className="space-y-4">
          <LiveAnalyticsPanel analytics={analytics} active={phase === 'listening'} />
          <CallEnvironmentToggle />
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={16} className="text-lava-600" />
              <h3 className="font-display text-sm font-bold text-ink-800 dark:text-ink-100">Adaptive Engine</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-ink-500 dark:text-ink-400">Difficulty</span>
                <span className={`badge ${DIFFICULTY_COLORS[adaptive.level]}`}>{DIFFICULTY_LABELS[adaptive.level]}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-500 dark:text-ink-400">Trend</span>
                <span className="text-ink-700 dark:text-ink-200 capitalize">{adaptive.trend}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-500 dark:text-ink-400">Speaking Speed</span>
                <span className="text-ink-700 dark:text-ink-200">{difficultyCtx.speedLabel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-500 dark:text-ink-400">Follow-ups</span>
                <span className="text-ink-700 dark:text-ink-200">{followUpCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-500 dark:text-ink-400">Responses</span>
                <span className="text-ink-700 dark:text-ink-200">{emotionTimeline.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-500 dark:text-ink-400">AI Memory</span>
                <span className="text-ink-700 dark:text-ink-200">{aiMemory.length} answers</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
