import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { ProgressRing } from '../ui/ProgressRing';

interface ModuleCompleteProps {
  score: number;
  title: string;
  summary: string;
  isLast: boolean;
  onContinue: () => void;
}

export function ModuleComplete({ score, title, summary, isLast, onContinue }: ModuleCompleteProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card-elevated p-8 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
        className="inline-flex mb-4"
      >
        <CheckCircle2 size={48} className="text-green-600" />
      </motion.div>
      <h2 className="font-display text-2xl font-bold text-ink-800 dark:text-ink-100 mb-2">{title} Complete!</h2>
      <p className="text-ink-600 dark:text-ink-300 mb-6 max-w-md mx-auto">{summary}</p>
      <div className="flex justify-center mb-6">
        <ProgressRing value={score} size={140} label={`${Math.round(score)}`} sublabel="Module Score" color={score >= 70 ? '#16a34a' : '#D32F2F'} />
      </div>
      <Button size="lg" onClick={onContinue}>
        {isLast ? 'View Final Report' : 'Continue to Next Module'} <ArrowRight size={18} />
      </Button>
    </motion.div>
  );
}
