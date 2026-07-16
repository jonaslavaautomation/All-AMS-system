import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { EmotionSummary } from '../../lib/emotionEngine';

interface Props {
  summary: EmotionSummary;
}

export function EmotionTimeline({ summary }: Props) {
  const data = summary.timeline.map((s, i) => ({
    index: i + 1,
    Confidence: s.confidence,
    Hesitation: s.hesitation,
    Stress: s.stress,
    Energy: s.energy,
  }));

  const trendIcon = summary.trend === 'improving' ? TrendingUp : summary.trend === 'declining' ? TrendingDown : Minus;
  const TrendIcon = trendIcon;

  const emotionCards = [
    { label: 'Confidence', value: summary.avgConfidence, color: 'text-green-600' },
    { label: 'Calmness', value: summary.avgCalmness, color: 'text-blue-600' },
    { label: 'Professionalism', value: summary.avgProfessionalism, color: 'text-purple-600' },
    { label: 'Energy', value: summary.avgEnergy, color: 'text-amber-600' },
    { label: 'Hesitation', value: summary.avgHesitation, color: 'text-orange-600' },
    { label: 'Nervousness', value: summary.avgNervousness, color: 'text-red-600' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-ink-800 dark:text-ink-100">Emotion Analysis</h3>
        <span className={`badge ${summary.trend === 'improving' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : summary.trend === 'declining' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300'}`}>
          <TrendIcon size={12} /> {summary.trend}
        </span>
      </div>

      {data.length === 0 ? (
        <p className="text-sm text-ink-400 text-center py-8">Complete the assessment to see your emotion timeline.</p>
      ) : (
        <>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
            {emotionCards.map((e) => (
              <div key={e.label} className="text-center p-2 rounded-lg bg-ink-50 dark:bg-ink-800/50">
                <p className="text-[10px] text-ink-500 dark:text-ink-400">{e.label}</p>
                <p className={`font-display font-bold text-lg ${e.color}`}>{Math.round(e.value)}</p>
              </div>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="index" tick={{ fontSize: 10, fill: '#6e6e6e' }} label={{ value: 'Response #', position: 'insideBottom', fontSize: 10, offset: -5 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#6e6e6e' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e0e0e0', fontSize: 12 }} />
              <ReferenceLine y={70} stroke="#16a34a" strokeDasharray="3 3" label={{ value: 'Target', fontSize: 10, fill: '#16a34a' }} />
              <Line type="monotone" dataKey="Confidence" stroke="#16a34a" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Hesitation" stroke="#ea580c" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Stress" stroke="#dc2626" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Energy" stroke="#ca8a04" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </motion.div>
  );
}
