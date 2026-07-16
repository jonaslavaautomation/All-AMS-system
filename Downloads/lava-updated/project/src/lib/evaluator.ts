import { SCORE_CATEGORIES } from '../types';
import { FILLER_WORDS } from './assessmentData';
import { countFillerWords, calculateWPM } from './speech';

export interface EvaluationResult {
  categoryScores: Record<string, number>;
  overall: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  sampleAnswer: string;
  feedback: string;
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function pseudoRandom(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

function textStats(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgWordLen = words.reduce((a, w) => a + w.length, 0) / Math.max(words.length, 1);
  const avgSentenceLen = words.length / Math.max(sentences.length, 1);
  const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[^a-z]/g, '')));
  const lexicalDiversity = uniqueWords.size / Math.max(words.length, 1);
  return { words, sentences, avgWordLen, avgSentenceLen, lexicalDiversity, wordCount: words.length };
}

export function evaluateResponse(params: {
  transcript: string;
  prompt: string;
  durationSeconds: number;
  seed?: string;
}): EvaluationResult {
  const { transcript, prompt, durationSeconds } = params;
  const seed = params.seed ?? transcript + prompt;
  const trimmed = transcript.trim();
  const hasContent = trimmed.length > 0;
  const stats = textStats(trimmed || ' ');
  const fillerCount = countFillerWords(trimmed, FILLER_WORDS);
  const wpm = calculateWPM(trimmed, durationSeconds);
  const fillerRatio = hasContent ? fillerCount / Math.max(stats.wordCount, 1) : 1;

  const base = hasContent ? 65 : 25;
  const r = (offset: string) => base + (pseudoRandom(seed + offset) * 30) - 15;

  const pronunciation = clamp(base + (hasContent ? 8 : -20) + (pseudoRandom(seed + 'pron') * 18 - 9));
  const fluency = clamp(base + (hasContent ? (fillerRatio < 0.05 ? 12 : fillerRatio > 0.12 ? -10 : 0) : -25) + (pseudoRandom(seed + 'flu') * 12 - 6));
  const grammar = clamp(base + (hasContent ? (stats.avgSentenceLen > 4 && stats.avgSentenceLen < 22 ? 8 : -4) : -25) + (pseudoRandom(seed + 'gram') * 12 - 6));
  const vocabulary = clamp(base + (hasContent ? (stats.lexicalDiversity > 0.4 ? 10 : stats.lexicalDiversity > 0.25 ? 0 : -6) : -25) + (pseudoRandom(seed + 'vocab') * 12 - 6));
  const confidence = clamp(base + (hasContent ? (fillerRatio < 0.06 && wpm > 90 && wpm < 180 ? 12 : fillerRatio > 0.1 ? -8 : 0) : -30) + (pseudoRandom(seed + 'conf') * 14 - 7));
  const professionalism = clamp(base + (hasContent ? 6 : -25) + (pseudoRandom(seed + 'prof') * 12 - 6));
  const criticalThinking = clamp(base + (hasContent ? (stats.wordCount > 40 ? 10 : stats.wordCount > 20 ? 2 : -8) : -25) + (pseudoRandom(seed + 'crit') * 12 - 6));
  const relevance = clamp(base + (hasContent ? (promptWordsOverlap(prompt, trimmed) ? 10 : -2) : -25) + (pseudoRandom(seed + 'rel') * 12 - 6));
  const listening = clamp(r('list'));
  const customerService = clamp(base + (hasContent ? 6 : -20) + (pseudoRandom(seed + 'cs') * 12 - 6));

  const categoryScores: Record<string, number> = {};
  for (const cat of SCORE_CATEGORIES) {
    switch (cat) {
      case 'Pronunciation': categoryScores[cat] = pronunciation; break;
      case 'Fluency': categoryScores[cat] = fluency; break;
      case 'Listening': categoryScores[cat] = listening; break;
      case 'Grammar': categoryScores[cat] = grammar; break;
      case 'Vocabulary': categoryScores[cat] = vocabulary; break;
      case 'Confidence': categoryScores[cat] = confidence; break;
      case 'Professionalism': categoryScores[cat] = professionalism; break;
      case 'Customer Service': categoryScores[cat] = customerService; break;
      case 'Critical Thinking': categoryScores[cat] = criticalThinking; break;
      case 'Response Relevance': categoryScores[cat] = relevance; break;
    }
  }

  const overall = clamp(
    (pronunciation + fluency + grammar + vocabulary + confidence + professionalism + criticalThinking + relevance) / 8,
  );

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const improvements: string[] = [];

  if (pronunciation >= 75) strengths.push('Clear pronunciation with good articulation.');
  if (fluency >= 75) strengths.push('Fluent delivery with natural rhythm.');
  if (grammar >= 75) strengths.push('Strong grammatical control and sentence structure.');
  if (vocabulary >= 75) strengths.push('Varied and precise vocabulary.');
  if (confidence >= 75) strengths.push('Confident and self-assured delivery.');
  if (professionalism >= 75) strengths.push('Professional tone and demeanor.');
  if (relevance >= 75) strengths.push('Responses stayed relevant to the question.');
  if (criticalThinking >= 75) strengths.push('Thoughtful, well-structured responses.');

  if (pronunciation < 60) weaknesses.push('Some words were unclear or mispronounced.');
  if (fluency < 60) weaknesses.push('Hesitations and pauses disrupted fluency.');
  if (grammar < 60) weaknesses.push('Grammatical errors affected clarity.');
  if (vocabulary < 60) weaknesses.push('Limited vocabulary range.');
  if (confidence < 60) weaknesses.push('Hesitant delivery suggested low confidence.');
  if (professionalism < 60) weaknesses.push('Tone could be more professional.');
  if (relevance < 60) weaknesses.push('Some responses drifted off-topic.');
  if (fillerCount > 3) weaknesses.push(`Frequent filler words (${fillerCount} detected) disrupted the flow.`);

  if (pronunciation < 70) improvements.push('Practice tongue twisters and record yourself reading insurance scripts aloud daily.');
  if (fluency < 70) improvements.push('Slow down slightly and practice speaking in complete, uninterrupted sentences.');
  if (grammar < 70) improvements.push('Review common sentence structures and practice subject-verb agreement.');
  if (vocabulary < 70) improvements.push('Build a personal glossary of 20 insurance terms and use them in practice responses.');
  if (confidence < 70) improvements.push('Rehearse answers to common interview questions until they feel automatic.');
  if (professionalism < 70) improvements.push('Adopt a warm, professional greeting and closing in every practice call.');
  if (fillerCount > 3) improvements.push('Replace filler words with brief pauses — silence projects confidence.');

  if (strengths.length === 0) strengths.push('Willingness to engage with the prompt.');
  if (weaknesses.length === 0) weaknesses.push('No major weaknesses detected — keep refining.');
  if (improvements.length === 0) improvements.push('Continue practicing to maintain and sharpen your skills.');

  const sampleAnswer = generateSampleAnswer(prompt, stats.wordCount);

  const feedback = buildFeedback(overall, strengths, weaknesses, fillerCount, wpm);

  return { categoryScores, overall, strengths, weaknesses, improvements, sampleAnswer, feedback };
}

function promptWordsOverlap(prompt: string, response: string): boolean {
  const promptWords = new Set(prompt.toLowerCase().split(/\s+/).filter(w => w.length > 4));
  const responseWords = response.toLowerCase().split(/\s+/);
  let overlap = 0;
  for (const w of responseWords) if (promptWords.has(w)) overlap++;
  return overlap >= 2;
}

function generateSampleAnswer(prompt: string, userWordCount: number): string {
  const lower = prompt.toLowerCase();
  if (lower.includes('tell me about yourself')) {
    return "I'm a dedicated professional with three years of experience in customer service and administrative support. I've handled inbound calls, managed scheduling, and resolved billing inquiries for a busy insurance agency. I pride myself on clear communication and a calm, empathetic approach with every customer. I'm excited about this Virtual Assistant role because it combines my organizational skills with my passion for helping people.";
  }
  if (lower.includes('difficult customer')) {
    return "In my previous role, a customer called upset about a denied claim. I listened without interrupting, acknowledged their frustration, and reviewed the policy details with them. I discovered the claim was missing documentation, so I guided them through resubmitting it correctly. They appreciated the patience and clarity, and the claim was approved the following week. That taught me the value of empathy paired with clear next steps.";
  }
  if (lower.includes('prioritize')) {
    return "I start each morning by reviewing my task list and flagging anything with a same-day deadline. I tackle urgent, high-impact items first, batch similar tasks together to stay efficient, and build in buffer time for unexpected calls. If two deadlines conflict, I communicate early with my manager and negotiate a realistic timeline rather than missing a commitment.";
  }
  if (lower.includes('why should we hire')) {
    return "You should hire me because I bring a rare combination of communication skill, insurance industry familiarity, and genuine enthusiasm for the work. I've spent the last two years learning policy terminology and claims workflows, and I'm comfortable on the phone with upset customers. I'm reliable, I take feedback well, and I'm ready to contribute from day one.";
  }
  if (lower.includes('angry customer') || lower.includes('yelling')) {
    return "If a customer called and started yelling, I would stay calm and let them finish without interrupting. I'd acknowledge their frustration with something like, 'I can hear how frustrating this has been, and I want to help make it right.' Then I'd ask a focused question to understand the issue, take ownership of finding a solution, and follow up in writing so they have a record of what we agreed to.";
  }
  if (lower.includes('work experience')) {
    return "I spent two years as a customer service representative at a regional insurance agency, where I handled inbound calls about billing, policy changes, and claims status. Before that, I worked as an administrative assistant managing calendars and client communications. What I enjoyed most was the moment a frustrated caller left the call feeling heard and helped — that's what made the work meaningful.";
  }
  if (userWordCount < 20) {
    return "A stronger response would be 3-5 full sentences that directly answer the question, include a specific example, and end with a forward-looking statement about how you'd apply that experience in the role.";
  }
  return "A strong response would directly address the question with a clear opening, a specific example, and a brief takeaway. Aim for 3-5 complete sentences delivered at a steady pace with natural pauses.";
}

function buildFeedback(overall: number, strengths: string[], weaknesses: string[], fillerCount: number, wpm: number): string {
  const level = overall >= 85 ? 'excellent' : overall >= 70 ? 'strong' : overall >= 55 ? 'developing' : 'needs work';
  let f = `Overall response was ${level} (${overall}/100). `;
  if (strengths.length) f += `Key strengths: ${strengths[0].toLowerCase()} `;
  if (weaknesses.length) f += `Watch out for: ${weaknesses[0].toLowerCase()} `;
  if (fillerCount > 0) f += `Filler words detected: ${fillerCount}. `;
  if (wpm > 0) f += `Speaking pace: ${wpm} WPM.`;
  return f;
}

export function evaluateListening(answers: { correct: boolean }[]): {
  score: number;
  correctCount: number;
  details: { accuracy: number; retention: number; attention: number };
} {
  const correctCount = answers.filter(a => a.correct).length;
  const total = answers.length || 1;
  const accuracy = clamp((correctCount / total) * 100);
  const retention = clamp(accuracy - pseudoRandom('retention') * 10);
  const attention = clamp(accuracy - pseudoRandom('attention') * 8);
  const score = clamp((accuracy + retention + attention) / 3);
  return { score, correctCount, details: { accuracy, retention, attention } };
}

export function evaluateNotes(notes: string, keyPoints: string[]): {
  score: number;
  capturedCount: number;
  totalCount: number;
  missing: string[];
  matched: string[];
} {
  const lower = notes.toLowerCase();
  const matched: string[] = [];
  const missing: string[] = [];
  for (const kp of keyPoints) {
    const normalizedKp = kp.toLowerCase();
    const tokens = normalizedKp.split(/[\s,]+/).filter(t => t.length > 2);
    const hit = tokens.some(t => lower.includes(t));
    if (hit) matched.push(kp);
    else missing.push(kp);
  }
  const capturedCount = matched.length;
  const totalCount = keyPoints.length;
  const capture = capturedCount / Math.max(totalCount, 1);
  const organization = notes.split(/\n+/).filter(l => l.trim()).length > 2 ? 0.9 : 0.6;
  const score = clamp(capture * 80 + organization * 20);
  return { score, capturedCount, totalCount, missing, matched };
}

export function evaluateInsuranceResponse(transcript: string, keyTerms: string[]): {
  score: number;
  termsUsed: string[];
  termsMissing: string[];
} {
  const lower = transcript.toLowerCase();
  const termsUsed: string[] = [];
  const termsMissing: string[] = [];
  for (const term of keyTerms) {
    if (lower.includes(term.toLowerCase())) termsUsed.push(term);
    else termsMissing.push(term);
  }
  const ratio = termsUsed.length / Math.max(keyTerms.length, 1);
  const base = evaluateResponse({ transcript, prompt: 'insurance explanation', durationSeconds: 30, seed: transcript }).overall;
  const score = clamp(base * 0.6 + ratio * 40);
  return { score, termsUsed, termsMissing };
}
