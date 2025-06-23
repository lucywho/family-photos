import * as React from 'react';
import { cn } from '@/components/ui/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'w-full rounded-md border border-[hsl(var(--input-border))] bg-[hsl(var(--input-background))] px-4 py-2 text-sm text-[hsl(var(--input-text))] shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[hsl(var(--input-placeholder))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--focus-ring))] disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
