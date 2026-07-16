import { evaluateResponse, type EvaluationResult } from './evaluator';
import { FILLER_WORDS } from './assessmentData';
import { countFillerWords } from './speech';
import { type PositionConfig } from './positionBank';

export interface CoachFeedback {
  strengths: string[];
  improvements: string[];
  betterResponse: string;
  expertResponse: string;
  coachingTips: string[];
  pronunciationCorrections: { word: string; suggestion: string }[];
  grammarMistakes: { original: string; correction: string; explanation: string }[];
  vocabularyUpgrades: { original: string; upgraded: string }[];
  fillerWordsUsed: string[];
  categoryScores: Record<string, number>;
  overall: number;
}

export function generateCoachFeedback(params: {
  transcript: string;
  prompt: string;
  durationSeconds: number;
  position: PositionConfig;
  seed?: string;
}): CoachFeedback {
  const { transcript, prompt, durationSeconds, position, seed } = params;
  const evalResult: EvaluationResult = evaluateResponse({
    transcript,
    prompt,
    durationSeconds,
    seed: seed ?? transcript + prompt,
  });

  const trimmed = transcript.trim();
  const lower = trimmed.toLowerCase();
  const fillerCount = countFillerWords(trimmed, FILLER_WORDS);
  const fillerWordsUsed: string[] = FILLER_WORDS.filter((f) => {
    const regex = new RegExp(`\\b${f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    return regex.test(lower);
  });

  // Position-aware better response
  const betterResponse = generateBetterResponse(prompt, trimmed, position, 'better');
  const expertResponse = generateBetterResponse(prompt, trimmed, position, 'expert');

  // Pronunciation corrections (detect difficult words)
  const pronunciationCorrections = detectPronunciationIssues(trimmed, position);

  // Grammar mistakes
  const grammarMistakes = detectGrammarMistakes(trimmed);

  // Vocabulary upgrades
  const vocabularyUpgrades = detectVocabularyUpgrades(trimmed);

  // Coaching tips
  const coachingTips = generateCoachingTips(evalResult, fillerCount, position);

  return {
    strengths: evalResult.strengths,
    improvements: evalResult.improvements,
    betterResponse,
    expertResponse,
    coachingTips,
    pronunciationCorrections,
    grammarMistakes,
    vocabularyUpgrades,
    fillerWordsUsed,
    categoryScores: evalResult.categoryScores,
    overall: evalResult.overall,
  };
}

function generateBetterResponse(prompt: string, _userResponse: string, position: PositionConfig, level: 'better' | 'expert'): string {
  const lower = prompt.toLowerCase();
  const isExpert = level === 'expert';

  if (lower.includes('tell me about yourself')) {
    return isExpert
      ? "I'm a bilingual communication specialist with four years of experience in insurance customer service and administrative support. At my previous role, I handled an average of 60 inbound calls daily, maintained a 94% customer satisfaction score, and reduced average handle time by 12% through process improvements. I specialize in translating complex policy language into clear, empathetic guidance for customers. I'm drawn to this role because it combines my analytical skills with my passion for accessible, human-centered communication."
      : "I'm a dedicated professional with three years of experience in customer service and administrative support. I've handled inbound calls, managed scheduling, and resolved billing inquiries for a busy insurance agency. I pride myself on clear communication and a calm, empathetic approach with every customer.";
  }
  if (lower.includes('difficult customer') || lower.includes('angry customer')) {
    return isExpert
      ? "In my previous role, a customer called upset about a denied claim. I listened without interrupting for 90 seconds, acknowledged their frustration with, 'I can hear how frustrating this has been, and I want to help make it right.' I reviewed the policy details and discovered the claim was missing a single document. I guided them through resubmitting it, set a clear expectation for the 48-hour review window, and followed up the next day. The claim was approved within the week, and the customer later sent a positive survey response. That experience reinforced my belief that empathy paired with concrete next steps turns frustration into loyalty."
      : "In my previous role, a customer called upset about a denied claim. I listened without interrupting, acknowledged their frustration, and reviewed the policy details with them. I discovered the claim was missing documentation, so I guided them through resubmitting it correctly. They appreciated the patience and clarity, and the claim was approved the following week.";
  }
  if (lower.includes('prioritize')) {
    return isExpert
      ? "I start each morning with a two-minute review of my task list, categorizing items using an Eisenhower-style matrix: urgent and important, important but not urgent, urgent but not important, and neither. I tackle urgent high-impact items first, batch similar tasks to preserve flow state, and build in 20% buffer time for unexpected escalations. If two deadlines genuinely conflict, I communicate proactively with stakeholders, present the trade-off, and negotiate a realistic timeline rather than missing a commitment silently."
      : "I start each morning by reviewing my task list and flagging anything with a same-day deadline. I tackle urgent, high-impact items first, batch similar tasks together to stay efficient, and build in buffer time for unexpected calls. If two deadlines conflict, I communicate early with my manager and negotiate a realistic timeline.";
  }
  if (lower.includes('why should we hire')) {
    return isExpert
      ? "You should hire me because I bring a rare combination of communication skill, insurance industry fluency, and genuine enthusiasm for the work. Over the past two years, I've deliberately studied policy terminology, claims workflows, and regulatory compliance — not because I had to, but because I wanted to be the agent customers ask for by name. I'm reliable, I take feedback as a growth tool rather than criticism, and I'm ready to contribute from day one while continuing to sharpen my craft."
      : "You should hire me because I bring a rare combination of communication skill, insurance industry familiarity, and genuine enthusiasm for the work. I've spent the last two years learning policy terminology and claims workflows, and I'm comfortable on the phone with upset customers. I'm reliable, I take feedback well, and I'm ready to contribute from day one.";
  }
  if (lower.includes('not interested') || lower.includes('objection')) {
    return isExpert
      ? "I completely understand — and I appreciate your honesty. Most people I speak with feel exactly the same way before they see what makes us different. Would you be open to a 90-second overview so you can make an informed decision? If it doesn't resonate, I'll be the first to thank you for your time and move on. Fair enough?"
      : "I completely understand — and I appreciate your honesty. May I ask what specifically you're not interested in? Sometimes it's the product, sometimes the timing. If I can understand your situation better, I can either save you time or show you something that might actually fit.";
  }
  if (lower.includes('cancel')) {
    return isExpert
      ? "I completely understand, and I want to make sure this is the right decision for you. Before I process the cancellation, may I ask what prompted it? Sometimes it's a billing concern or a coverage gap we can address in two minutes. If not, I'll process it right away and send you a confirmation. I want to make sure you're not leaving a benefit on the table."
      : "I completely understand, and I want to make sure this is the right decision for you. Before I process the cancellation, may I ask what prompted it? Sometimes it's a billing concern or a coverage gap we can address quickly.";
  }

  // Generic fallback
  return isExpert
    ? `A strong response would directly address the question with a clear opening, a specific quantified example, and a forward-looking takeaway tied to the ${position.label} role. Aim for 4-6 complete sentences delivered at 140-160 WPM with natural pauses at punctuation.`
    : `A stronger response would be 3-5 full sentences that directly answer the question, include a specific example, and end with a forward-looking statement about how you'd apply that experience in the ${position.label} role.`;
}

function detectPronunciationIssues(transcript: string, _position: PositionConfig): { word: string; suggestion: string }[] {
  const corrections: { word: string; suggestion: string }[] = [];
  const difficultWords: Record<string, string> = {
    'liability': 'lye-uh-BILL-ih-tee (emphasis on second syllable)',
    'comprehensive': 'com-pre-HEN-siv (emphasis on second syllable)',
    'deductible': 'duh-DUK-tih-bul (emphasis on second syllable)',
    'specifically': 'spi-SIF-ih-klee (emphasis on second syllable)',
    'probably': 'PRAW-buh-blee (not "prob-uh-lee")',
    'supposedly': 'suh-POZE-ed-lee (not "supposebly")',
    'especially': 'ih-SPESH-uh-lee (emphasis on second syllable)',
    'comfortable': 'KUMF-ter-bul (three syllables, not four)',
    'vegetable': 'VEJ-tuh-bul (three syllables, not four)',
    'entrepreneur': 'ahn-truh-pruh-NUR (emphasis on final syllable)',
  };

  const lower = transcript.toLowerCase();
  for (const [word, suggestion] of Object.entries(difficultWords)) {
    if (lower.includes(word)) {
      corrections.push({ word, suggestion });
    }
  }
  return corrections.slice(0, 3);
}

function detectGrammarMistakes(transcript: string): { original: string; correction: string; explanation: string }[] {
  const mistakes: { original: string; correction: string; explanation: string }[] = [];
  const lower = transcript.toLowerCase();

  const patterns: { pattern: RegExp; original: string; correction: string; explanation: string }[] = [
    { pattern: /\bi\s/g, original: 'i', correction: 'I', explanation: 'The pronoun "I" should always be capitalized.' },
    { pattern: /\bdon't got\b/g, original: "don't got", correction: "don't have", explanation: 'Use "have" instead of "got" for possession.' },
    { pattern: /\bcould of\b/g, original: 'could of', correction: 'could have', explanation: 'It\'s "could have," not "could of."' },
    { pattern: /\bshould of\b/g, original: 'should of', correction: 'should have', explanation: 'It\'s "should have," not "should of."' },
    { pattern: /\bgonna\b/g, original: 'gonna', correction: 'going to', explanation: 'Use "going to" in professional speech.' },
    { pattern: /\bwanna\b/g, original: 'wanna', correction: 'want to', explanation: 'Use "want to" in professional speech.' },
    { pattern: /\byeah\b/g, original: 'yeah', correction: 'yes', explanation: 'Use "yes" in professional contexts.' },
    { pattern: /\bain't\b/g, original: "ain't", correction: "isn't / aren't", explanation: 'Avoid "ain\'t" in professional speech.' },
    { pattern: /\bhisself\b/g, original: 'hisself', correction: 'himself', explanation: 'The correct reflexive is "himself."' },
    { pattern: /\btheir selves\b/g, original: 'their selves', correction: 'themselves', explanation: 'Use "themselves," not "their selves."' },
  ];

  for (const p of patterns) {
    if (p.pattern.test(lower)) {
      mistakes.push({ original: p.original, correction: p.correction, explanation: p.explanation });
    }
  }
  return mistakes.slice(0, 4);
}

function detectVocabularyUpgrades(transcript: string): { original: string; upgraded: string }[] {
  const upgrades: { original: string; upgraded: string }[] = [];
  const lower = transcript.toLowerCase();
  const map: Record<string, string> = {
    'a lot of': 'numerous / several',
    'really good': 'excellent',
    'very bad': 'poor',
    'get': 'obtain / receive',
    'big': 'substantial',
    'small': 'modest',
    'happy': 'pleased / delighted',
    'sad': 'disheartened',
    'thing': 'matter / element',
    'stuff': 'materials / items',
    'show': 'demonstrate / illustrate',
    'help': 'assist / support',
    'make sure': 'ensure',
    'find out': 'determine / ascertain',
    'talk about': 'discuss / address',
    'think about': 'consider / evaluate',
  };
  for (const [simple, pro] of Object.entries(map)) {
    if (lower.includes(simple)) {
      upgrades.push({ original: simple, upgraded: pro });
    }
  }
  return upgrades.slice(0, 4);
}

function generateCoachingTips(evalResult: EvaluationResult, fillerCount: number, position: PositionConfig): string[] {
  const tips: string[] = [];
  if (fillerCount > 2) {
    tips.push(`Replace filler words with brief pauses — silence projects more confidence than "um" or "like." You used ${fillerCount} filler words in this response.`);
  }
  if (evalResult.categoryScores['Confidence'] < 70) {
    tips.push('Practice this answer in front of a mirror or record yourself — confident body language translates to a more confident voice.');
  }
  if (evalResult.categoryScores['Grammar'] < 70) {
    tips.push('Slow down slightly to give yourself time to construct grammatically complete sentences.');
  }
  if (evalResult.categoryScores['Vocabulary'] < 70) {
    tips.push(`Build a personal glossary of 15 ${position.label}-specific terms and practice using them in mock responses.`);
  }
  if (evalResult.categoryScores['Professionalism'] < 70) {
    tips.push('Open with a warm, professional greeting and close with a clear next step or summary statement.');
  }
  if (evalResult.categoryScores['Critical Thinking'] < 70) {
    tips.push('Use the STAR method: Situation, Task, Action, Result. This makes your answers more structured and convincing.');
  }
  // Position-specific tips
  if (position.id === 'cold-caller' || position.id === 'insurance-sales') {
    tips.push('For sales roles, always end with a clear call-to-action or a next-step question that moves the conversation forward.');
  }
  if (position.id === 'customer-service' || position.id === 'insurance-csr') {
    tips.push('For customer service roles, acknowledge the customer\'s emotion before jumping to a solution — empathy first, then resolution.');
  }
  if (tips.length === 0) {
    tips.push('Excellent response — keep practicing to maintain this level of clarity and confidence.');
  }
  return tips.slice(0, 4);
}
