import { motion } from 'framer-motion';
import { Gauge, Mic, Clock, VolumeX, Sparkles, BookCheck, Mic2, Brain, Activity, Zap } from 'lucide-react';
import type { LiveAnalytics } from '../../hooks/useLiveAnalytics';

interface Props {
  analytics: LiveAnalytics;
  active: boolean;
}

export function LiveAnalyticsPanel({ analytics, active }: Props) {
  const metrics = [
    { icon: Gauge, label: 'WPM', value: analytics.wpm, ideal: analytics.idealWpm, color: analytics.wpm >= 120 && analytics.wpm <= 170 ? 'text-green-600' : 'text-amber-600' },
    { icon: Clock, label: 'Speaking Time', value: `${analytics.speakingTime.toFixed(1)}s`, color: 'text-blue-600' },
    { icon: VolumeX, label: 'Silence', value: `${analytics.silenceDuration.toFixed(1)}s`, color: analytics.silenceDuration > 3 ? 'text-red-600' : 'text-ink-500' },
    { icon: Sparkles, label: 'Confidence', value: analytics.confidence, color: analytics.confidence >= 70 ? 'text-green-600' : 'text-amber-600' },
    { icon: BookCheck, label: 'Grammar', value: analytics.grammarAccuracy, color: analytics.grammarAccuracy >= 70 ? 'text-green-600' : 'text-amber-600' },
    { icon: Mic2, label: 'Pronunciation', value: analytics.pronunciationScore, color: 'text-purple-600' },
    { icon: Brain, label: 'Vocabulary', value: analytics.vocabularyScore, color: 'text-blue-600' },
    { icon: Activity, label: 'Sentence Complexity', value: analytics.sentenceComplexity, color: 'text-ink-600' },
    { icon: Zap, label: 'Energy', value: analytics.energyLevel, color: analytics.energyLevel >= 70 ? 'text-green-600' : 'text-amber-600' },
  ];

  return (
    <div className={`card p-4 transition-opacity ${active ? 'opacity-100' : 'opacity-60'}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-2 h-2 rounded-full ${active ? 'bg-lava-600 animate-pulse' : 'bg-ink-300'}`} />
        <h3 className="font-display text-sm font-bold text-ink-800 dark:text-ink-100">Live Speech Analytics</h3>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {metrics.map((m) => (
          <div key={m.label} className="text-center p-2 rounded-lg bg-ink-50 dark:bg-ink-800/50">
            <m.icon size={14} className={`mx-auto mb-1 ${m.color}`} />
            <p className="text-[10px] text-ink-500 dark:text-ink-400 truncate" title={m.label}>{m.label}</p>
            <motion.p
              key={m.value}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className={`font-display font-bold text-sm ${m.color}`}
            >
              {m.value}
            </motion.p>
          </div>
        ))}
      </div>

      {/* Filler words */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] text-ink-500 dark:text-ink-400 font-semibold uppercase">Filler Words:</span>
        <span className={`badge text-xs ${analytics.fillerWords > 3 ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300'}`}>
          <Mic size={10} /> {analytics.fillerWords} detected
        </span>
        {analytics.fillerWordsList.slice(0, 4).map((w) => (
          <span key={w} className="badge bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs">"{w}"</span>
        ))}
      </div>

      {/* Highlighted transcript */}
      {analytics.highlightedTranscript && (
        <div className="mt-3 p-2 rounded-lg bg-ink-50 dark:bg-ink-800/50 max-h-20 overflow-y-auto scrollbar-thin">
          <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
            {analytics.highlightedTranscript.split('**').map((part, i) =>
              i % 2 === 1
                ? <mark key={i} className="bg-amber-200 dark:bg-amber-900/40 text-ink-800 dark:text-ink-100 px-0.5 rounded">{part}</mark>
                : <span key={i}>{part}</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
