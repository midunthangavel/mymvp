import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-colors focus:outline-none select-none tracking-tight whitespace-nowrap',
  {
    variants: {
      variant: {
        default:
          'border-amber-500/40 bg-amber-500/10 text-amber-300 shadow-xs',
        secondary:
          'border-neutral-800 bg-[#161926] text-neutral-300',
        destructive:
          'border-red-500/30 bg-red-500/10 text-red-400',
        outline:
          'border-neutral-700/80 text-neutral-300 bg-transparent',
        success:
          'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
        sky:
          'border-sky-500/40 bg-sky-500/10 text-sky-300',
        ondc:
          'border-amber-600/50 bg-gradient-to-r from-amber-500/15 to-orange-500/15 text-amber-300 font-bold uppercase tracking-wider text-[9px]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
