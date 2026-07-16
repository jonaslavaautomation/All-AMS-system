import type { ModuleScore, HiringReport, HiringRecommendation } from '../types';
import { getEnglishLevel, getRecommendation } from '../types';
import { getPositionByLabel, type PositionConfig } from './positionBank';

export interface FinalScores {
  overall_score: number;
  communication_score: number;
  listening_score: number;
  pronunciation_score: number;
  grammar_score: number;
  vocabulary_score: number;
  customer_service_score: number;
  cold_calling_score: number;
  insurance_comm_score: number;
}

export function computeFinalScores(moduleScores: ModuleScore[]): {
  scores: FinalScores;
  englishLevel: string;
  recommendation: string;
} {
  const getModule = (n: number) => moduleScores.find(m => m.module_number === n);

  const listening = getModule(1)?.score ?? 0;
  const pronunciation = getModule(2)?.score ?? 0;
  const reading = getModule(3)?.score ?? 0;
  const conversation = getModule(4)?.score ?? 0;
  const roleplay = getModule(5)?.score ?? 0;
  const noteTaking = getModule(6)?.score ?? 0;
  const insurance = getModule(7)?.score ?? 0;

  const avgCategory = (moduleNum: number, cats: string[]): number => {
    const ms = getModule(moduleNum);
    if (!ms || !ms.details.categoryScores) return 0;
    const vals = cats.map(c => (ms.details.categoryScores as any)[c]).filter((v: any) => v != null);
    if (vals.length === 0) return ms.score;
    return vals.reduce((a: number, b: number) => a + b, 0) / vals.length;
  };

  const grammar = Math.round((avgCategory(4, ['Grammar']) + avgCategory(2, ['Grammar']) + avgCategory(3, ['Grammar'])) / 3);
  const vocabulary = Math.round((avgCategory(4, ['Vocabulary']) + avgCategory(2, ['Vocabulary']) + avgCategory(3, ['Vocabulary']) + avgCategory(7, ['Vocabulary'])) / 4);
  const communication = Math.round((conversation + roleplay + reading) / 3);
  const customerService = Math.round((roleplay + avgCategory(5, ['Customer Service', 'Professionalism'])) / 2);
  const coldCalling = Math.round(roleplay * 0.5 + conversation * 0.5);
  const insuranceComm = Math.round(insurance);
  const listeningScore = Math.round((listening + noteTaking) / 2);
  const pronunciationScore = Math.round((pronunciation + avgCategory(3, ['Pronunciation'])) / 2);

  const overall = Math.round(
    (listeningScore + pronunciationScore + grammar + vocabulary + communication + customerService + insuranceComm) / 7,
  );

  const scores: FinalScores = {
    overall_score: overall,
    communication_score: communication,
    listening_score: listeningScore,
    pronunciation_score: pronunciationScore,
    grammar_score: grammar,
    vocabulary_score: vocabulary,
    customer_service_score: customerService,
    cold_calling_score: coldCalling,
    insurance_comm_score: insuranceComm,
  };

  const englishLevel = getEnglishLevel(overall);
  const recommendation = getRecommendation({
    overall,
    pronunciation: pronunciationScore,
    customerService,
    coldCalling,
    insurance: insuranceComm,
  });

  return { scores, englishLevel, recommendation };
}

export function generateHiringReport(moduleScores: ModuleScore[], positionLabel: string): HiringReport {
  const { scores, englishLevel } = computeFinalScores(moduleScores);
  const position = getPositionByLabel(positionLabel);

  const roleReadiness = computeRoleReadiness(scores, position);

  const allStrengths = moduleScores.flatMap(m => m.details.strengths ?? []).slice(0, 6);
  const allWeaknesses = moduleScores.flatMap(m => m.details.weaknesses ?? []).slice(0, 6);

  const hiringRecommendation = determineHiringRecommendation(scores, roleReadiness, position);
  const recommendationText = getRecommendation({
    overall: scores.overall_score,
    pronunciation: scores.pronunciation_score,
    customerService: scores.customer_service_score,
    coldCalling: scores.cold_calling_score,
    insurance: scores.insurance_comm_score,
  });

  return {
    overallScore: scores.overall_score,
    englishProficiency: englishLevel,
    communicationLevel: getCommunicationLevel(scores.communication_score),
    listeningAbility: scores.listening_score,
    pronunciation: scores.pronunciation_score,
    confidence: Math.round(moduleScores.reduce((a, m) => a + ((m.details.categoryScores as any)?.Confidence ?? 0), 0) / Math.max(moduleScores.length, 1)),
    grammar: scores.grammar_score,
    vocabulary: scores.vocabulary_score,
    professionalism: Math.round(moduleScores.reduce((a, m) => a + ((m.details.categoryScores as any)?.Professionalism ?? 0), 0) / Math.max(moduleScores.length, 1)),
    roleReadiness,
    strengths: allStrengths,
    areasToImprove: allWeaknesses,
    recommendedLearningPath: position?.recommendedLearningPath ?? [],
    hiringRecommendation,
    recommendationText,
  };
}

function computeRoleReadiness(scores: FinalScores, position: PositionConfig | null): number {
  if (!position) return scores.overall_score;
  const weights = position.scoringWeights;
  let weightedSum = 0;
  let weightTotal = 0;
  for (const [cat, weight] of Object.entries(weights)) {
    let val: number;
    if (cat in scores) {
      val = scores[cat as keyof FinalScores] as number;
    } else {
      val = scores.overall_score;
    }
    weightedSum += val * weight;
    weightTotal += weight;
  }
  return Math.round(weightedSum / Math.max(weightTotal, 1));
}

function determineHiringRecommendation(
  scores: FinalScores,
  roleReadiness: number,
  position: PositionConfig | null,
): HiringRecommendation {
  if (scores.pronunciation_score < 55) return 'Needs Pronunciation Improvement';
  if (roleReadiness < 50) return 'Needs Additional Training';
  if (roleReadiness < 65) return 'Requires Additional Coaching';

  if (!position) return 'Ready for General VA';
  switch (position.id) {
    case 'insurance-csr':
    case 'insurance-sales':
      return 'Ready for Insurance CSR';
    case 'cold-caller':
      return 'Ready for Cold Calling';
    case 'appointment-setter':
      return 'Ready for Appointment Setting';
    case 'executive-assistant':
      return 'Ready for Executive Assistant';
    case 'customer-service':
    case 'receptionist':
    case 'technical-support':
      return 'Ready for Customer Service';
    default:
      return 'Ready for General VA';
  }
}

function getCommunicationLevel(score: number): string {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Strong';
  if (score >= 55) return 'Developing';
  return 'Needs Improvement';
}
