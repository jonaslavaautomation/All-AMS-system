import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  VolumeX, Building, Phone, Keyboard, Printer, Users, Radio, Briefcase, Volume2,
} from 'lucide-react';
import { CALL_ENVIRONMENTS, type CallEnvironmentType, playCallEnvironment, stopCallEnvironment, isCallEnvironmentSupported } from '../../lib/callEnvironment';

const iconMap: Record<string, any> = {
  VolumeX, Building, Phone, Keyboard, Printer, Users, Radio, Briefcase,
};

interface Props {
  onToggle?: (active: boolean) => void;
}

export function CallEnvironmentToggle({ onToggle }: Props) {
  const [enabled, setEnabled] = useState(false);
  const [selected, setSelected] = useState<CallEnvironmentType>('office');
  const [volume, setVolume] = useState(0.15);
  const supported = isCallEnvironmentSupported();

  useEffect(() => {
    if (enabled && supported) {
      playCallEnvironment(selected, volume);
    } else {
      stopCallEnvironment();
    }
    onToggle?.(enabled);
    return () => stopCallEnvironment();
  }, [enabled, selected, volume, supported, onToggle]);

  if (!supported) return null;

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Volume2 size={16} className="text-lava-600" />
          <h3 className="font-display text-sm font-bold text-ink-800 dark:text-ink-100">Call Center Environment</h3>
        </div>
        <button
          onClick={() => setEnabled(!enabled)}
          className={`relative w-10 h-6 rounded-full transition-colors ${enabled ? 'bg-lava-600' : 'bg-ink-300 dark:bg-ink-700'}`}
          aria-label="Toggle call environment"
        >
          <motion.span
            className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-soft"
            animate={{ left: enabled ? '20px' : '2px' }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
      </div>

      {enabled && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-3"
        >
          <div className="grid grid-cols-4 gap-2">
            {CALL_ENVIRONMENTS.filter((e) => e.id !== 'none').map((env) => {
              const Icon = iconMap[env.icon] ?? VolumeX;
              return (
                <button
                  key={env.id}
                  onClick={() => setSelected(env.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                    selected === env.id
                      ? 'border-lava-500 bg-lava-50 dark:bg-lava-950/30 text-lava-700 dark:text-lava-400'
                      : 'border-ink-200 dark:border-ink-700 text-ink-500 hover:border-lava-300'
                  }`}
                >
                  <Icon size={16} />
                  <span className="text-[10px] font-medium">{env.label}</span>
                </button>
              );
            })}
          </div>

          <div>
            <label className="flex items-center justify-between text-xs text-ink-500 dark:text-ink-400 mb-1">
              <span>Volume</span>
              <span>{Math.round(volume * 100)}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full accent-lava-600"
            />
          </div>

          <p className="text-xs text-ink-400 flex items-center gap-1.5">
            <Volume2 size={12} />
            Realistic background sounds train you to focus despite distractions.
          </p>
        </motion.div>
      )}
    </div>
  );
}
