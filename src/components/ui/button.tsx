import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-orange-500',
        destructive:
          'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 hover:border-red-500/50 shadow-xs',
        outline:
          'border border-neutral-800 bg-[#12141F]/80 text-neutral-300 hover:bg-[#1A1E2E] hover:text-white hover:border-neutral-700 shadow-xs',
        secondary:
          'bg-[#191D2C] text-neutral-200 border border-neutral-800/80 hover:bg-[#22283C] hover:text-white shadow-xs',
        ghost:
          'text-neutral-400 hover:bg-white/5 hover:text-neutral-200',
        link:
          'text-amber-400 underline-offset-4 hover:underline p-0 h-auto font-medium',
        glow:
          'bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500 text-white shadow-md shadow-purple-600/30 hover:brightness-110 border border-purple-400/30',
      },
      size: {
        default: 'h-9 px-3.5 py-2',
        sm: 'h-7 rounded-md px-2.5 text-[11px]',
        lg: 'h-10 rounded-xl px-5 text-sm',
        icon: 'h-8 w-8 p-0 rounded-lg',
        iconSm: 'h-7 w-7 p-0 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
