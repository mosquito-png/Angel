import { motion } from 'framer-motion';
import { useReducedMotionSafe } from '@/lib/useReducedMotionSafe';
import { cn } from '@/lib/cn';

export interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  sub?: string;
  align?: 'center' | 'left';
  className?: string;
}

/** Shared section header with hairlines, eyebrow and gold serif title. */
export default function SectionHeading({
  eyebrow,
  title,
  sub,
  align = 'center',
  className,
}: SectionHeadingProps) {
  const reducedMotion = useReducedMotionSafe();
  const centered = align === 'center';

  return (
    <motion.header
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: reducedMotion ? 0.01 : 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={cn('mb-10 md:mb-14', centered ? 'text-center' : 'text-left', className)}
    >
      <p
        className={cn(
          'mb-3 flex items-center gap-3 text-[0.7rem] sm:text-xs font-medium uppercase tracking-[0.35em] text-gold/90',
          centered && 'justify-center',
        )}
      >
        <span className="hairline-gold w-8 sm:w-12" aria-hidden="true" />
        {eyebrow}
        <span className="hairline-gold w-8 sm:w-12" aria-hidden="true" />
      </p>
      <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-parchment">
        {title}
      </h2>
      {sub && (
        <p className={cn('mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-silver', centered && 'mx-auto')}>
          {sub}
        </p>
      )}
    </motion.header>
  );
}
