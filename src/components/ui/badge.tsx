import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/components/ui/utils';

const badgeVariants = cva(
  'inline-flex rounded-full px-2.5 py-0.5 text-xs text-center font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-primary text-text hover:bg-primary/80',
        secondary: 'bg-secondary text-primary hover:bg-secondary/80',
        outline:
          'text-foreground border border-input hover:bg-primary/50 hover:text-accent-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
