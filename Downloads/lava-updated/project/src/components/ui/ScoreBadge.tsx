import { type ReactNode } from 'react';

interface ScoreBadgeProps {
  score: number;
  label: string;
  icon?: ReactNode;
}

export function ScoreBadge({ score, label, icon }: ScoreBadgeProps) {
  const color = score >= 80 ? 'text-green-600 bg-green-50 dark:bg-green-900/20'
    : score >= 60 ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/20'
    : 'text-red-600 bg-red-50 dark:bg-red-900/20';

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-ink-50 dark:bg-ink-800/50">
      {icon && <div className="shrink-0">{icon}</div>}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-ink-500 dark:text-ink-400 truncate">{label}</p>
        <p className="font-display font-bold text-lg text-ink-800 dark:text-ink-100">{score}<span className="text-sm text-ink-400">/100</span></p>
      </div>
      <span className={`badge ${color}`}>{score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Work'}</span>
    </div>
  );
}
