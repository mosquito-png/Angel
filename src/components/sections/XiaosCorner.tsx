import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SectionHeading from '@/components/primitives/SectionHeading';
import GoldFrame from '@/components/primitives/GoldFrame';
import { useReducedMotionSafe } from '@/lib/useReducedMotionSafe';
import { cn } from '@/lib/cn';

interface ChibiCard {
  image: string;
  name: string;
  mood: string;
  tsundereLine: string;
}

const CARDS: ChibiCard[] = [
  {
    image: '/images/chibis/chibi-6.png',
    name: 'On Watch',
    mood: 'Hover to approach',
    tsundereLine:
      'Hmph. Do not misunderstand. I simply happened to be guarding this very shelf when you arrived.',
  },
  {
    image: '/images/chibis/chibi-5.png',
    name: 'Almond Tofu',
    mood: 'Hover carefully',
    tsundereLine:
      "…It's not like I made extra. There was leftover. Eat it before I change my mind.",
  },
  {
    image: '/images/chibis/chibi-4.png',
    name: 'Piggyback Patrol',
    mood: 'Hover at your own risk',
    tsundereLine:
      'Hold tight. If you fall, I will catch you. Do not ask how I know that.',
  },
  {
    image: '/images/chibis/chibi-3.png',
    name: 'Karmic Nuisance',
    mood: 'Hover briefly',
    tsundereLine:
      'This armor itches. And you keep smiling at me like that. Stop it. …Fine. Continue.',
  },
  {
    image: '/images/chibis/chibi-6.png',
    name: 'Secretly Soft',
    mood: 'Hover · quiet please',
    tsundereLine:
      'You are warm. …Mention this to anyone and I will deny all of it.',
  },
];

/**
 * Xiao's Corner — tsundere chibi gallery. Images are 1:1 placeholder slots
 * (see ASSETS.md); the dialogue popover holds placeholder lines only.
 */
export default function XiaosCorner() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotionSafe();

  /* Close the speech bubble on Escape or clicks outside the section cards */
  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenIndex(null);
    };
    const onClick = (event: MouseEvent) => {
      if (!sectionRef.current?.contains(event.target as Node)) setOpenIndex(null);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onClick);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onClick);
    };
  }, [openIndex]);

  return (
    <section ref={sectionRef} id="corner" aria-labelledby="corner-title" className="relative overflow-hidden py-24 sm:py-32">
      <div aria-hidden="true" className="absolute inset-0">
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(201,164,92,0.5), transparent)' }}
        />
        <div
          className="absolute left-[-10%] top-1/4 size-[46rem] rounded-full"
          style={{ background: 'radial-gradient(closest-side, rgba(18,58,54,0.55), transparent 70%)' }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 sm:px-8">
        <SectionHeading
          eyebrow="Xiao's Corner"
          title="Small Yaksha, Big Feelings"
          sub="Five moods of the Vigilant Yaksha. Tap a card — if you must — and hear what he will absolutely deny saying."
        />

        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-5">
          {CARDS.map((card, index) => {
            const isOpen = openIndex === index;
            return (
              <li key={card.name} className="relative">
                <motion.button
                  type="button"
                  aria-expanded={isOpen}
                  aria-label={`${card.name} — show Xiao's remark`}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  initial={{ opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{
                    duration: reducedMotion ? 0.01 : 0.6,
                    delay: reducedMotion ? 0 : index * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={cn(
                    'group block w-full text-left transition-transform duration-300',
                    !reducedMotion && 'hover:-translate-y-1.5',
                    isOpen && '-translate-y-1.5',
                  )}
                >
                  <GoldFrame
                    className={cn(
                      'transition-shadow duration-300',
                      'group-hover:shadow-[0_0_60px_-18px_rgba(70,199,178,0.75)]',
                      isOpen && 'shadow-[0_0_60px_-18px_rgba(70,199,178,0.75)]',
                    )}
                    innerClassName="bg-jade/25"
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={card.image}
                        alt={`Chibi artwork placeholder — ${card.name}; replace ${card.image}`}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06] group-focus-visible:scale-[1.06]"
                        loading="lazy"
                      />
                    </div>
                  </GoldFrame>

                  <div className="mt-3 text-center">
                    <p className="font-display text-lg font-semibold text-parchment">{card.name}</p>
                    <p className="mt-0.5 text-[0.65rem] uppercase tracking-[0.25em] text-silver/70">
                      {card.mood}
                    </p>
                  </div>
                </motion.button>

                {/* Tsundere speech bubble */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.94 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: reducedMotion ? 0.01 : 0.3, ease: 'easeOut' }}
                      className="absolute bottom-full left-1/2 z-20 mb-3 w-60 -translate-x-1/2 sm:w-64"
                    >
                      <div
                        role="status"
                        className="rounded-2xl border border-gold/30 bg-jade-deep/95 p-4 text-sm leading-relaxed text-parchment shadow-[0_18px_50px_-15px_rgba(0,0,0,0.9)] backdrop-blur"
                      >
                        <p className="mb-2 text-[0.6rem] uppercase tracking-[0.3em] text-anemo">
                          Xiao said something. Allegedly.
                        </p>
                        {card.tsundereLine}
                        <span
                          aria-hidden="true"
                          className="absolute -bottom-2 left-1/2 size-4 -translate-x-1/2 rotate-45 border-b border-r border-gold/30 bg-jade-deep/95"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
