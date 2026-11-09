import { useMemo, type CSSProperties } from 'react';
import { mulberry32 } from '@/lib/seededRandom';
import { cn } from '@/lib/cn';

export interface ParticlesProps {
  /** Number of particles before reduced-motion / mobile adjustments. */
  count?: number;
  seed?: number;
  className?: string;
  /** Deterministic return of results — change to reshuffle a field. */
  fieldKey?: string | number;
}

/**
 * Lightweight floating Anemo particle field.
 * Pure CSS transform/opacity animations on absolutely positioned dots;
 * the loop runs on the compositor so it stays cheap on mobile.
 * Under `prefers-reduced-motion` the particles render as static embers.
 */
export default function Particles({
  count = 22,
  seed = 7,
  className,
  fieldKey,
}: ParticlesProps) {
  const particles = useMemo(() => {
    const random = mulberry32(seed * 7919 + 17);
    return Array.from({ length: count }, (_, i) => {
      const gold = random() > 0.45;
      return {
        id: `${seed}-${i}`,
        left: random() * 100,
        top: 45 + random() * 60, // start below the fold so the drift reads as wind
        size: 2 + random() * 3.5,
        delay: random() * 24,
        duration: 16 + random() * 22,
        drift: (random() - 0.5) * 90,
        opacity: 0.25 + random() * 0.4,
        color: gold ? 'bg-gold/80' : 'bg-anemo/80',
        glow: gold ? 'shadow-[0_0_8px_2px_rgba(201,164,92,0.35)]' : 'shadow-[0_0_9px_2px_rgba(70,199,178,0.4)]',
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, seed, fieldKey]);

  return (
    <div aria-hidden="true" className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      {particles.map((p) => (
        <span
          key={p.id}
          className={cn('anemo-particle absolute rounded-full', p.color, p.glow)}
          style={
            {
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              '--particle-drift': `${p.drift}px`,
              '--particle-opacity': p.opacity,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
