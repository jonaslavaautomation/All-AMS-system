import { motion } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';

interface MicButtonProps {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}

export function MicButton({ active, onClick, disabled, label }: MicButtonProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <motion.button
        onClick={onClick}
        disabled={disabled}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-elevated transition-colors ${
          active ? 'bg-lava-700 text-white' : 'bg-white dark:bg-ink-800 text-lava-700 border-2 border-lava-200 dark:border-lava-900'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {active && (
          <motion.span
            className="absolute inset-0 rounded-full bg-lava-500"
            initial={{ opacity: 0.4, scale: 1 }}
            animate={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
        {active ? <Mic size={32} className="relative z-10" /> : <MicOff size={32} />}
      </motion.button>
      {label && <span className="text-sm font-medium text-ink-600 dark:text-ink-300">{label}</span>}
    </div>
  );
}
