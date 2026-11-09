import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useReducedMotionSafe } from '@/lib/useReducedMotionSafe';
import { cn } from '@/lib/cn';

export interface AnemoButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'gold' | 'ghost';
  className?: string;
  ariaLabel?: string;
}

/**
 * Signature button: antique-gold caps pill with jade glow on hover.
 * Renders as an anchor when `href` is provided (for in-page navigation).
 */
export default function AnemoButton({
  children,
  href,
  onClick,
  variant = 'gold',
  className,
  ariaLabel,
}: AnemoButtonProps) {
  const reducedMotion = useReducedMotionSafe();

  const base = cn(
    'inline-flex items-center justify-center gap-2 rounded-full font-sans text-xs sm:text-sm',
    'font-medium uppercase tracking-[0.22em] transition-colors duration-300 select-none',
    variant === 'gold'
      ? 'border border-gold/60 bg-gold/10 px-7 py-3 text-gold-bright hover:bg-gold/20 hover:shadow-[0_0_36px_-8px_rgba(201,164,92,0.7)]'
      : 'px-5 py-2 text-silver hover:text-anemo text-shadow-anemo',
    className,
  );

  const motionProps = reducedMotion
    ? {}
    : {
        whileHover: { scale: 1.04 },
        whileTap: { scale: 0.96 },
      };

  if (href) {
    return (
      <motion.a href={href} onClick={onClick} className={base} aria-label={ariaLabel} {...motionProps}>
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button type="button" onClick={onClick} className={base} aria-label={ariaLabel} {...motionProps}>
      {children}
    </motion.button>
  );
}
