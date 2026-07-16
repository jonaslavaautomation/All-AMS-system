import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
  startAt: number | null;
  running?: boolean;
  className?: string;
}

export function Timer({ startAt, running = true, className = '' }: TimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startAt || !running) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startAt) / 1000));
    }, 500);
    return () => clearInterval(interval);
  }, [startAt, running]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  return (
    <div className={`inline-flex items-center gap-1.5 font-mono text-sm text-ink-600 dark:text-ink-300 ${className}`}>
      <Clock size={14} />
      <span>{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>
    </div>
  );
}
