import * as React from 'react';
import { cn } from '@/components/ui/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--focus-ring))] disabled:pointer-events-none disabled:opacity-50 my-4',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-text hover:bg-primaryHover focus:bg-primaryHover',
        destructive:
          'bg-destructive text-textDestructive shadow-sm hover:bg-primaryHover focus:bg-primaryHover focus:text-destructive',
        secondary:
          'bg-secondary text-primary hover:bg-primaryHover hover:text-secondary focus:bg-primaryHover focus:text-secondary ',
        ghost: 'hover:bg-backgroundSecondary hover:text-text',
        link: 'text-secondary underline-offset-4 hover:underline hover:text-primary',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
