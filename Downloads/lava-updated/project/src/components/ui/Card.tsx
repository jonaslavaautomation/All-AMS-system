import { type HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ elevated, className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${elevated ? 'card-elevated' : 'card'} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Card.displayName = 'Card';
