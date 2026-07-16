export interface EmotionSnapshot {
  timestamp: number;
  confidence: number;
  hesitation: number;
  calmness: number;
  stress: number;
  nervousness: number;
  professionalism: number;
  energy: number;
}

export interface EmotionSummary {
  avgConfidence: number;
  avgHesitation: number;
  avgCalmness: number;
  avgStress: number;
  avgNervousness: number;
  avgProfessionalism: number;
  avgEnergy: number;
  trend: 'improving' | 'stable' | 'declining';
  timeline: EmotionSnapshot[];
}

export function analyzeEmotion(params: {
  transcript: string;
  durationSeconds: number;
  fillerCount: number;
  wpm: number;
  responseScore: number;
  timestamp: number;
}): EmotionSnapshot {
  const { transcript, fillerCount, wpm, responseScore, timestamp } = params;
  const trimmed = transcript.trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
  const fillerRatio = wordCount > 0 ? fillerCount / wordCount : 0;

  // Hesitation: high filler ratio + low WPM + long pauses (approximated by low WPM)
  const hesitation = clamp(
    fillerRatio * 200 + (wpm < 100 ? 30 : 0) + (wpm > 180 ? 10 : 0),
  );

  // Confidence: inverse of hesitation, aligned with response score
  const confidence = clamp(responseScore - hesitation * 0.3);

  // Calmness: moderate WPM, low filler
  const calmness = clamp(
    100 - hesitation * 0.5 - (wpm > 180 ? 15 : 0) - (wpm < 80 ? 20 : 0),
  );

  // Stress: high WPM or very low WPM + high filler
  const stress = clamp(
    (wpm > 180 ? 25 : 0) + (wpm < 80 ? 20 : 0) + fillerRatio * 150,
  );

  // Nervousness: combination of hesitation and stress
  const nervousness = clamp(hesitation * 0.6 + stress * 0.4);

  // Professionalism: aligned with response score, reduced by nervousness
  const professionalism = clamp(responseScore - nervousness * 0.2);

  // Energy: WPM-based with some variance
  const energy = clamp(
    wpm >= 120 && wpm <= 170 ? 80 : wpm < 120 ? 50 : 65,
  );

  return { timestamp, confidence, hesitation, calmness, stress, nervousness, professionalism, energy };
}

export function summarizeEmotions(timeline: EmotionSnapshot[]): EmotionSummary {
  if (timeline.length === 0) {
    return {
      avgConfidence: 0, avgHesitation: 0, avgCalmness: 0, avgStress: 0,
      avgNervousness: 0, avgProfessionalism: 0, avgEnergy: 0, trend: 'stable', timeline: [],
    };
  }
  const avg = (key: keyof EmotionSnapshot) =>
    timeline.reduce((a, s) => a + (s[key] as number), 0) / timeline.length;

  const firstHalf = timeline.slice(0, Math.ceil(timeline.length / 2));
  const secondHalf = timeline.slice(Math.ceil(timeline.length / 2));
  const firstConf = firstHalf.reduce((a, s) => a + s.confidence, 0) / Math.max(firstHalf.length, 1);
  const secondConf = secondHalf.reduce((a, s) => a + s.confidence, 0) / Math.max(secondHalf.length, 1);

  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  if (secondConf - firstConf > 5) trend = 'improving';
  else if (secondConf - firstConf < -5) trend = 'declining';

  return {
    avgConfidence: avg('confidence'),
    avgHesitation: avg('hesitation'),
    avgCalmness: avg('calmness'),
    avgStress: avg('stress'),
    avgNervousness: avg('nervousness'),
    avgProfessionalism: avg('professionalism'),
    avgEnergy: avg('energy'),
    trend,
    timeline,
  };
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}
