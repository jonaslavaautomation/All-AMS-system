export type Position =
  | 'Insurance VA'
  | 'Cold Caller'
  | 'Customer Service Representative'
  | 'Appointment Setter'
  | 'SDR / Sales Development Rep'
  | 'Executive Assistant'
  | 'General Virtual Assistant'
  | 'Insurance CSR'
  | 'Insurance Sales Agent'
  | 'Receptionist'
  | 'Technical Support'
  | 'Medical VA'
  | 'Real Estate VA'
  | 'E-commerce VA'
  | 'Social Media VA'
  | 'Bookkeeper'
  | 'Data Entry Specialist';

export const POSITIONS: Position[] = [
  'Insurance CSR',
  'Insurance Sales Agent',
  'Cold Caller',
  'SDR / Sales Development Rep',
  'Appointment Setter',
  'Executive Assistant',
  'General Virtual Assistant',
  'Customer Service Representative',
  'Receptionist',
  'Technical Support',
  'Medical VA',
  'Real Estate VA',
  'E-commerce VA',
  'Social Media VA',
  'Bookkeeper',
  'Data Entry Specialist',
];

export type AssessmentStatus = 'in_progress' | 'completed' | 'abandoned';

export type EnglishLevel =
  | 'Beginner'
  | 'Elementary'
  | 'Intermediate'
  | 'Upper Intermediate'
  | 'Advanced'
  | 'Professional';

export interface Candidate {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  position: Position;
  created_at: string;
}

export interface Assessment {
  id: string;
  candidate_id: string;
  status: AssessmentStatus;
  current_module: number;
  overall_score: number;
  communication_score: number;
  listening_score: number;
  pronunciation_score: number;
  grammar_score: number;
  vocabulary_score: number;
  customer_service_score: number;
  cold_calling_score: number;
  insurance_comm_score: number;
  english_level: string | null;
  recommendation: string | null;
  started_at: string;
  completed_at: string | null;
  created_at: string;
}

export interface ModuleScore {
  id: string;
  assessment_id: string;
  module_number: number;
  module_name: string;
  score: number;
  details: ModuleDetails;
  created_at: string;
}

export interface ModuleDetails {
  categoryScores?: Record<string, number>;
  strengths?: string[];
  weaknesses?: string[];
  improvements?: string[];
  sampleAnswer?: string;
  // Modules store heterogeneous response records here (simple prompt/transcript objects in
  // some modules, richer coach-feedback objects in others), so this is intentionally loose.
  responses?: unknown[];
  emotionSummary?: { timeline?: unknown[] };
  adaptiveData?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface LeaderboardEntry {
  id: string;
  candidate_id: string;
  assessment_id: string;
  candidate_name: string;
  position: string;
  overall_score: number;
  english_level: string | null;
  completed_at: string;
}

export interface Badge {
  id: string;
  candidate_id: string;
  badge_type: string;
  badge_name: string;
  description: string | null;
  awarded_at: string;
}

export interface ScoreCategory {
  key: string;
  label: string;
  score: number;
}

export const MODULES = [
  { number: 1, name: 'Listening Comprehension', icon: 'Headphones', estimated: '8 min' },
  { number: 2, name: 'Pronunciation Assessment', icon: 'Mic', estimated: '6 min' },
  { number: 3, name: 'Reading Aloud', icon: 'BookOpen', estimated: '5 min' },
  { number: 4, name: 'Conversation Simulation', icon: 'MessageCircle', estimated: '10 min' },
  { number: 5, name: 'Customer Service Roleplay', icon: 'Headset', estimated: '10 min' },
  { number: 6, name: 'Listening + Note Taking', icon: 'PenLine', estimated: '7 min' },
  { number: 7, name: 'Insurance Communication', icon: 'ShieldCheck', estimated: '8 min' },
] as const;

export const SCORE_CATEGORIES = [
  'Pronunciation',
  'Fluency',
  'Listening',
  'Grammar',
  'Vocabulary',
  'Confidence',
  'Professionalism',
  'Customer Service',
  'Critical Thinking',
  'Response Relevance',
  'Problem Solving',
  'Empathy',
  'Tone',
  'Communication',
  'Insurance Knowledge',
  'Cold Calling Skills',
  'Appointment Setting Skills',
  'Persuasion',
  'Technical Knowledge',
  'Data Accuracy',
  'Attention to Detail',
  'Medical Knowledge',
  'Real Estate Knowledge',
  'E-commerce Knowledge',
  'Social Media Knowledge',
  'Financial Accuracy',
  'Time Management',
  'Tone Consistency',
  'Energy Level',
  'Confidentiality',
] as const;

export const CORE_SCORE_CATEGORIES = [
  'Listening',
  'Pronunciation',
  'Grammar',
  'Vocabulary',
  'Confidence',
  'Professionalism',
  'Critical Thinking',
  'Customer Service',
  'Problem Solving',
  'Empathy',
  'Tone',
  'Communication',
] as const;

export function getEnglishLevel(score: number): EnglishLevel {
  if (score < 30) return 'Beginner';
  if (score < 45) return 'Elementary';
  if (score < 60) return 'Intermediate';
  if (score < 75) return 'Upper Intermediate';
  if (score < 88) return 'Advanced';
  return 'Professional';
}

export function getRecommendation(scores: {
  overall: number;
  pronunciation: number;
  customerService: number;
  coldCalling: number;
  insurance: number;
}): string {
  const { overall, pronunciation, customerService, coldCalling, insurance } = scores;
  if (overall >= 85) return 'Outstanding candidate — ready for all VA roles including specialized Insurance positions.';
  if (customerService >= 80 && pronunciation >= 70) return 'Ready for Customer Service and Appointment Setting roles.';
  if (coldCalling >= 75) return 'Recommended for Cold Calling and Outbound Sales VA positions.';
  if (insurance >= 75) return 'Strong Insurance Communication — recommended for Insurance VA roles.';
  if (pronunciation < 60) return 'Needs Pronunciation Improvement before client-facing roles.';
  if (insurance < 60) return 'Needs Additional Insurance Training before specialized Insurance VA roles.';
  if (overall >= 60) return 'Solid foundation — recommended for General Virtual Assistant and Administrative roles.';
  return 'Needs additional training across multiple communication areas before deployment.';
}

export type HiringRecommendation =
  | 'Ready for Customer Service'
  | 'Ready for Cold Calling'
  | 'Ready for Insurance CSR'
  | 'Ready for Appointment Setting'
  | 'Ready for Executive Assistant'
  | 'Ready for General VA'
  | 'Requires Additional Coaching'
  | 'Needs Pronunciation Improvement'
  | 'Needs Additional Training';

export interface HiringReport {
  overallScore: number;
  englishProficiency: string;
  communicationLevel: string;
  listeningAbility: number;
  pronunciation: number;
  confidence: number;
  grammar: number;
  vocabulary: number;
  professionalism: number;
  roleReadiness: number;
  strengths: string[];
  areasToImprove: string[];
  recommendedLearningPath: string[];
  hiringRecommendation: HiringRecommendation;
  recommendationText: string;
}

export interface AdaptiveSessionData {
  positionId: string;
  difficultyLevel: number;
  difficultyHistory: number[];
  personalityUsed: string;
  responseScores: number[];
  followUpCount: number;
  emotionTimeline: Array<{
    timestamp: number;
    confidence: number;
    hesitation: number;
    stress: number;
    energy: number;
  }>;
}
