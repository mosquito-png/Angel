import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface GoldFrameProps {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  ornaments?: boolean;
}

/**
 * Ornate antique-gold frame with subtle Anemo halo — used for portraits,
 * album art and any "framed" moment in the design system.
 */
export default function GoldFrame({
  children,
  className,
  innerClassName,
  ornaments = true,
}: GoldFrameProps) {
  return (
    <div
      className={cn(
        'group relative rounded-2xl p-px',
        'bg-gradient-to-b from-gold/70 via-gold/20 to-gold/5',
        'shadow-[0_0_70px_-25px_rgba(70,199,178,0.55),0_18px_50px_-25px_rgba(0,0,0,0.8)]',
        className,
      )}
    >
      <div className={cn('relative h-full w-full overflow-hidden rounded-2xl bg-jade/45', innerClassName)}>
        {children}
      </div>

      {ornaments && (
        <>
          {(['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2'] as const).map(
            (pos) => (
              <span
                key={pos}
                aria-hidden="true"
                className={cn(
                  'pointer-events-none absolute z-10 size-4 rotate-45 border border-gold/60 border-r-0 border-b-0 bg-transparent',
                  pos.endsWith('right-2') ? 'scale-x-[-1]' : '',
                  pos.startsWith('bottom') ? 'scale-y-[-1]' : '',
                  pos.endsWith('right-2') && pos.startsWith('bottom') ? 'scale-[-1]' : '',
                  pos,
                )}
              />
            ),
          )}
        </>
      )}
    </div>
  );
}
