import { type ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed';
    const sizes = { sm: 'px-4 py-2 text-sm', md: 'px-6 py-3 text-sm', lg: 'px-8 py-4 text-base' };
    const variants = {
      primary: 'bg-lava-700 text-white shadow-soft hover:bg-lava-800',
      secondary: 'bg-white dark:bg-ink-800 text-ink-800 dark:text-ink-100 border border-ink-200 dark:border-ink-700 shadow-soft hover:bg-ink-50 dark:hover:bg-ink-700',
      ghost: 'text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800',
      danger: 'bg-red-600 text-white shadow-soft hover:bg-red-700',
    };
    return (
      <button ref={ref} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';
