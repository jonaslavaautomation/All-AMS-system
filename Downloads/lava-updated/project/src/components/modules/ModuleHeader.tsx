import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ModuleHeaderProps {
  icon: ReactNode;
  title: string;
  description: string;
  instructions?: string[];
}

export function ModuleHeader({ icon, title, description, instructions }: ModuleHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-elevated p-6 mb-6"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl gradient-lava flex items-center justify-center text-white shrink-0">
          {icon}
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-800 dark:text-ink-100 mb-1">{title}</h1>
          <p className="text-sm text-ink-600 dark:text-ink-300">{description}</p>
        </div>
      </div>
      {instructions && instructions.length > 0 && (
        <div className="mt-4 p-3 rounded-xl bg-lava-50 dark:bg-lava-950/30 border border-lava-100 dark:border-lava-900/50">
          <ul className="space-y-1.5">
            {instructions.map((ins, i) => (
              <li key={i} className="text-sm text-ink-700 dark:text-ink-200 flex items-start gap-2">
                <span className="text-lava-600 font-bold mt-0.5">{i + 1}.</span>
                {ins}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}
