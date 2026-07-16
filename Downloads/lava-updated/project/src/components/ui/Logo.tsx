import { Flame } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { box: 'w-8 h-8', icon: 16, text: 'text-base' },
    md: { box: 'w-10 h-10', icon: 20, text: 'text-lg' },
    lg: { box: 'w-14 h-14', icon: 28, text: 'text-2xl' },
  };
  const s = sizes[size];
  return (
    <div className="flex items-center gap-2.5">
      <div className={`${s.box} rounded-xl gradient-lava flex items-center justify-center shadow-soft`}>
        <Flame size={s.icon} className="text-white" strokeWidth={2.5} />
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-display font-bold ${s.text} text-ink-800 dark:text-ink-100 tracking-tight`}>LAVA</span>
          <span className="text-[10px] text-ink-500 dark:text-ink-400 font-medium tracking-wide uppercase">Skills Simulator</span>
        </div>
      )}
    </div>
  );
}
