import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Compass } from 'lucide-react';
import Particles from '@/components/primitives/Particles';
import GoldFrame from '@/components/primitives/GoldFrame';
import AnemoButton from '@/components/primitives/AnemoButton';
import { IMAGES } from '@/lib/images';
import { useReducedMotionSafe } from '@/lib/useReducedMotionSafe';

function useIsDesktop(): boolean {
  // Parallax is limited to larger, hover-capable screens for mobile performance.
  const reducedMotion = useReducedMotionSafe();
  return !reducedMotion && typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const isDesktop = useIsDesktop();
  const reducedMotion = useReducedMotionSafe();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const artLift = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const artDrift = useTransform(scrollYProgress, [0, 1], [0, -60]);

  return (
    <section
      ref={sectionRef}
      id="home"
      aria-label="Birthday greeting"
      className="relative flex min-h-screen items-center overflow-hidden pt-20"
    >
      {/* Layered backdrop */}
      <div aria-hidden="true" className="absolute inset-0">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/background-pg.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(16,23,25,0.72) 0%, rgba(18,58,54,0.62) 58%, rgba(13,43,41,0.78) 82%, #101719 100%)',
          }}
        />
        <div
          className="halo-anemo absolute left-1/2 top-[8%] size-[90vmin] -translate-x-1/2 rounded-full blur-[40px]"
          style={{ animation: reducedMotion ? undefined : 'aurora-breathe 14s ease-in-out infinite' }}
        />
        <img
          src={IMAGES.decorations.mandala}
          alt=""
          className="absolute -right-32 top-16 w-[52rem] opacity-[0.10] spin-slower md:-right-40 lg:w-[64rem]"
        />
        <img
          src={IMAGES.decorations.mandala}
          alt=""
          className="absolute -left-40 bottom-0 w-[40rem] rotate-180 opacity-[0.07] lg:w-[48rem]"
        />
      </div>

      <Particles count={isDesktop ? 24 : 10} seed={11} />
      <Particles count={isDesktop ? 10 : 6} seed={71} className="opacity-60" />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-14 px-6 pb-28 pt-16 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
        {/* Copy */}
        <div className="order-2 text-center lg:order-1 lg:text-left">
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.8 }}
            className="mb-5 flex items-center justify-center gap-3 text-[0.7rem] font-medium uppercase tracking-[0.4em] text-anemo sm:text-xs lg:justify-start"
          >
            <span className="hairline-gold w-10" aria-hidden="true" />
            A five-star wish, carried on the wind
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-5xl font-semibold leading-[1.05] sm:text-6xl lg:text-7xl"
          >
            Happy Birthday,
            <span className="mt-1 block italic">
              <span className="text-gold-gradient text-shadow-anemo">My Favourite Person.</span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.9 }}
            className="mx-auto mt-7 max-w-xl text-base leading-relaxed text-silver sm:text-lg lg:mx-0"
          >
            Even the Vigilant Yaksha has a special message for someone today. A day
            dedicated to the person who makes this world a little brighter.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="mt-10 flex items-center justify-center gap-4 lg:justify-start"
          >
            <AnemoButton href="#corner" ariaLabel="Scroll to Xiao's Corner">
              <Compass className="size-4" aria-hidden="true" />
              Explore
            </AnemoButton>
            <span className="hidden text-xs uppercase tracking-[0.3em] text-silver/60 sm:block">
              scroll to begin ✦
            </span>
          </motion.div>
        </div>

        {/* Artwork */}
        <motion.div
          className="relative order-1 mx-auto w-full max-w-sm lg:order-2 lg:max-w-md"
          style={isDesktop ? { y: artLift, rotate: 0.0 } : undefined}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ delay: 0.35, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            style={isDesktop && !reducedMotion ? { y: artDrift } : undefined}
          >
            <GoldFrame className={reducedMotion ? '' : 'float-y'} innerClassName="bg-jade/30">
              <div className="aspect-[2/3]">
                <img
                  src={IMAGES.xiaoPortrait}
                  alt="A special portrait"
                  className="h-full w-full object-cover"
                  loading="eager"
                />
              </div>
            </GoldFrame>

            {/* Side ribbons */}
            <motion.span
              aria-hidden="true"
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1, duration: 0.8 }}
              className="absolute -right-3 top-8 hidden rounded-l-full border-y border-r-0 border-gold/40 bg-midnight/70 py-3 pl-3 pr-5 text-right backdrop-blur-sm sm:block"
            >
              <span className="block font-display text-sm italic text-gold-bright">
                “Alatus — the Yaksha's name”
              </span>
            </motion.span>
            <motion.span
              aria-hidden="true"
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.25, duration: 0.8 }}
              className="absolute -left-12 bottom-10 hidden rounded-r-full border-y border-l-0 border-anemo/30 bg-midnight/60 py-2.5 pl-5 pr-3 backdrop-blur-sm lg:block"
            >
              <span className="block text-[0.65rem] uppercase tracking-[0.35em] text-anemo-soft">
                Vigilant · Devoted
              </span>
            </motion.span>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom fade into the next section */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-36"
        style={{ background: 'linear-gradient(180deg, transparent, #101719)' }}
      />
    </section>
  );
}
