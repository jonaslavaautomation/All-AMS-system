export type DifficultyLevel = 1 | 2 | 3 | 4;

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  1: 'Beginner',
  2: 'Intermediate',
  3: 'Advanced',
  4: 'Expert',
};

export const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  1: 'text-green-600 bg-green-50 dark:bg-green-900/20',
  2: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  3: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
  4: 'text-lava-700 bg-lava-50 dark:bg-lava-950/40',
};

export interface PerformanceSnapshot {
  responseScore: number;
  grammarScore: number;
  confidenceScore: number;
  pronunciationScore: number;
  listeningScore: number;
  fillerWordRatio: number;
  wpm: number;
}

export interface AdaptiveState {
  level: DifficultyLevel;
  history: PerformanceSnapshot[];
  trend: 'improving' | 'stable' | 'declining';
  speakingSpeed: number;
  vocabularyTier: 'simple' | 'standard' | 'professional';
  followUpProbability: number;
}

export function createAdaptiveState(): AdaptiveState {
  return {
    level: 2,
    history: [],
    trend: 'stable',
    speakingSpeed: 1.0,
    vocabularyTier: 'standard',
    followUpProbability: 0.2,
  };
}

export function updateAdaptiveState(state: AdaptiveState, snapshot: PerformanceSnapshot): AdaptiveState {
  const history = [...state.history, snapshot].slice(-5);
  const avgRecent = history.slice(-3).reduce((a, s) => a + s.responseScore, 0) / Math.min(history.length, 3);
  const avgOlder = history.slice(0, -1).slice(-3).reduce((a, s) => a + s.responseScore, 0) / Math.max(history.slice(0, -1).slice(-3).length, 1);

  let trend: AdaptiveState['trend'] = 'stable';
  if (avgRecent - avgOlder > 5) trend = 'improving';
  else if (avgRecent - avgOlder < -5) trend = 'declining';

  let level = state.level;
  if (avgRecent >= 80 && state.level < 4) level = (state.level + 1) as DifficultyLevel;
  else if (avgRecent < 45 && state.level > 1) level = (state.level - 1) as DifficultyLevel;

  const speakingSpeed = level <= 1 ? 0.85 : level === 2 ? 0.95 : level === 3 ? 1.05 : 1.15;
  const vocabularyTier: AdaptiveState['vocabularyTier'] = level <= 1 ? 'simple' : level <= 2 ? 'standard' : level <= 3 ? 'professional' : 'professional';
  const followUpProbability = level >= 3 ? 0.5 : level === 2 ? 0.25 : 0.1;

  return { level, history, trend, speakingSpeed, vocabularyTier, followUpProbability };
}

export function selectAdaptiveQuestion(
  pool: string[],
  _state: AdaptiveState,
  asked: Set<string>,
): string {
  const available = pool.filter((q) => !asked.has(q));
  const source = available.length > 0 ? available : pool;

  const idx = Math.floor(Math.random() * source.length);
  return source[idx];
}

export function shouldAskFollowUp(state: AdaptiveState): boolean {
  return Math.random() < state.followUpProbability;
}

export interface MemoryEntry {
  question: string;
  answer: string;
  questionIdx: number;
}

export function generateFollowUp(_lastResponse: string, _state: AdaptiveState): string {
  const followUps = [
    "Can you tell me more about that?",
    "What made you approach it that way?",
    "Can you give me a specific example?",
    "How did that situation make you feel?",
    "What would you do differently next time?",
    "Walk me through your thought process there.",
    "Why do you think that approach worked?",
    "What was the outcome of that situation?",
    "How would you handle that differently if it happened again?",
    "What did you learn from that experience?",
  ];
  return followUps[Math.floor(Math.random() * followUps.length)];
}

export function generateMemoryReferencedQuestion(
  _pool: string[],
  _asked: Set<string>,
  memory: MemoryEntry[],
): string {
  if (memory.length === 0) return '';
  const prevMemory = memory[memory.length - 1];
  const templates = [
    `You mentioned earlier that ${prevMemory.answer.toLowerCase().slice(0, 80)}. Can you elaborate on how that experience prepared you for this role?`,
    `Building on what you said about ${prevMemory.question.toLowerCase().replace(/\?$/, '')} — how would you apply that in a real work scenario?`,
    `Earlier you talked about your background. How does that connect to why you're interested in this position?`,
    `You shared an interesting point earlier. Can you connect that to how you'd handle a difficult customer?`,
    `Going back to what you mentioned — how would you apply that same approach to a team setting?`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

export function shouldUseMemory(memory: MemoryEntry[], questionIdx: number): boolean {
  return memory.length >= 2 && questionIdx >= 3 && Math.random() < 0.4;
}

export function getDifficultyContext(state: AdaptiveState): {
  instruction: string;
  speedLabel: string;
} {
  const instructions: Record<DifficultyLevel, string> = {
    1: 'Simple vocabulary, slower pace, supportive tone.',
    2: 'Standard professional conversation.',
    3: 'Professional vocabulary, faster pace, follow-up questions likely.',
    4: 'Complex scenarios, rapid pace, unexpected challenges.',
  };
  const speeds: Record<DifficultyLevel, string> = {
    1: 'Slow (0.85x)',
    2: 'Normal (0.95x)',
    3: 'Brisk (1.05x)',
    4: 'Fast (1.15x)',
  };
  return { instruction: instructions[state.level], speedLabel: speeds[state.level] };
}
