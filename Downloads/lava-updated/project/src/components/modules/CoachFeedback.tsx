import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, PenLine, Award, Lightbulb, Mic, BookCheck, BookOpen } from 'lucide-react';
import type { CoachFeedback as CoachFeedbackData } from '../../lib/coachEngine';

interface Props {
  feedback: CoachFeedbackData;
}

export function CoachFeedback({ feedback }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Strengths */}
      <div className="rounded-xl border border-green-200 dark:border-green-900/40 bg-green-50 dark:bg-green-900/10 p-4">
        <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase mb-2 flex items-center gap-1.5">
          <CheckCircle2 size={14} /> Strengths
        </p>
        <ul className="space-y-1.5">
          {feedback.strengths.map((s, i) => (
            <li key={i} className="text-sm text-ink-700 dark:text-ink-200 flex items-start gap-2">
              <CheckCircle2 size={12} className="text-green-600 mt-1 shrink-0" /> {s}
            </li>
          ))}
        </ul>
      </div>

      {/* Improvement Areas */}
      <div className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 p-4">
        <p className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase mb-2 flex items-center gap-1.5">
          <AlertCircle size={14} /> Improvement Areas
        </p>
        <ul className="space-y-1.5">
          {feedback.improvements.map((s, i) => (
            <li key={i} className="text-sm text-ink-700 dark:text-ink-200 flex items-start gap-2">
              <AlertCircle size={12} className="text-red-600 mt-1 shrink-0" /> {s}
            </li>
          ))}
        </ul>
      </div>

      {/* Better Response */}
      <div className="rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/10 p-4">
        <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase mb-2 flex items-center gap-1.5">
          <PenLine size={14} /> Better Response
        </p>
        <p className="text-sm text-ink-700 dark:text-ink-200 italic leading-relaxed">"{feedback.betterResponse}"</p>
      </div>

      {/* Expert Response */}
      <div className="rounded-xl border border-purple-200 dark:border-purple-900/40 bg-purple-50 dark:bg-purple-900/10 p-4">
        <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase mb-2 flex items-center gap-1.5">
          <Award size={14} /> Expert Response
        </p>
        <p className="text-sm text-ink-700 dark:text-ink-200 italic leading-relaxed">"{feedback.expertResponse}"</p>
      </div>

      {/* Coaching Tips */}
      <div className="rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/10 p-4">
        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase mb-2 flex items-center gap-1.5">
          <Lightbulb size={14} /> Coaching Tips
        </p>
        <ul className="space-y-1.5">
          {feedback.coachingTips.map((s, i) => (
            <li key={i} className="text-sm text-ink-700 dark:text-ink-200 flex items-start gap-2">
              <Lightbulb size={12} className="text-amber-600 mt-1 shrink-0" /> {s}
            </li>
          ))}
        </ul>
      </div>

      {/* Pronunciation Corrections */}
      {feedback.pronunciationCorrections.length > 0 && (
        <div className="rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-800/50 p-4">
          <p className="text-xs font-semibold text-ink-700 dark:text-ink-200 uppercase mb-2 flex items-center gap-1.5">
            <Mic size={14} /> Pronunciation Corrections
          </p>
          <ul className="space-y-1.5">
            {feedback.pronunciationCorrections.map((c, i) => (
              <li key={i} className="text-sm text-ink-700 dark:text-ink-200">
                <strong className="text-lava-700 dark:text-lava-400">"{c.word}"</strong> — {c.suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Grammar Mistakes */}
      {feedback.grammarMistakes.length > 0 && (
        <div className="rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-800/50 p-4">
          <p className="text-xs font-semibold text-ink-700 dark:text-ink-200 uppercase mb-2 flex items-center gap-1.5">
            <BookCheck size={14} /> Grammar Mistakes
          </p>
          <ul className="space-y-1.5">
            {feedback.grammarMistakes.map((m, i) => (
              <li key={i} className="text-sm text-ink-700 dark:text-ink-200">
                <span className="line-through text-red-600">"{m.original}"</span> → <span className="text-green-700 dark:text-green-400 font-semibold">"{m.correction}"</span>
                <p className="text-xs text-ink-500 mt-0.5">{m.explanation}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Vocabulary Upgrades */}
      {feedback.vocabularyUpgrades.length > 0 && (
        <div className="rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-800/50 p-4">
          <p className="text-xs font-semibold text-ink-700 dark:text-ink-200 uppercase mb-2 flex items-center gap-1.5">
            <BookOpen size={14} /> Suggested Vocabulary Upgrades
          </p>
          <ul className="space-y-1.5">
            {feedback.vocabularyUpgrades.map((v, i) => (
              <li key={i} className="text-sm text-ink-700 dark:text-ink-200">
                <span className="text-ink-500">"{v.original}"</span> → <span className="text-blue-700 dark:text-blue-400 font-semibold">"{v.upgraded}"</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}
