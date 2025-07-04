import * as React from 'react';
import { cn } from '@/shared/components/ui/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot='input'
      className={cn(
        'flex h-10 w-full rounded-md border border-secondary bg-background px-3 py-2 text-sm text-text ring-success file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-secondary/60 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 focus:bg-secondary focus:text-background focus:placeholder:text-transparent',
        className
      )}
      {...props}
    />
  );
}

export { Input };
