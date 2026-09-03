import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({ open, onOpenChange, children, className }: DialogProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => onOpenChange(false)}
      />
      {/* Modal Card */}
      <div
        className={cn(
          'relative z-50 w-full max-w-lg rounded-2xl border border-neutral-800 bg-[#12141F] p-6 shadow-2xl text-neutral-100 animate-in zoom-in-95 duration-150',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col space-y-1.5 text-left mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function DialogTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn('text-base font-bold text-white tracking-tight', className)} {...props}>
      {children}
    </h2>
  );
}

export function DialogDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-xs text-neutral-400', className)} {...props}>
      {children}
    </p>
  );
}

export function DialogClose({ onClick, className }: { onClick?: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'absolute right-4 top-4 rounded-lg p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-colors cursor-pointer',
        className
      )}
    >
      <X className="w-4 h-4" />
      <span className="sr-only">Close</span>
    </button>
  );
}
