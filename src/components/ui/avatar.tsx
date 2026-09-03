import * as React from 'react';
import { cn } from '../../lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt = '', fallback, children, ...props }, ref) => {
    const [hasError, setHasError] = React.useState(false);

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-white/10 bg-[#1A1D2B] text-neutral-300 items-center justify-center font-semibold text-xs select-none',
          className
        )}
        {...props}
      >
        {src && !hasError ? (
          <img
            src={src}
            alt={alt}
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
            className="aspect-square h-full w-full object-cover"
          />
        ) : fallback ? (
          <span>{fallback}</span>
        ) : (
          children
        )}
      </div>
    );
  }
);
Avatar.displayName = 'Avatar';
