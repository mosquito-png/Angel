import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SectionHeading from '@/components/primitives/SectionHeading';
import Particles from '@/components/primitives/Particles';
import { useMediaPlayer } from '@/lib/useMediaPlayer';
import { useReducedMotionSafe } from '@/lib/useReducedMotionSafe';

const WISH_MESSAGE =
  "Happy Birthdayyy!! 🥹❤️ I hope your day is filled with so much happiness, laughter, love, and all the little things that make you smile. You genuinely deserve the sweetest and happiest things in life, and I hope this new year brings you countless beautiful memories, endless reasons to smile, and everything your heart has been wishing for. I'm honestly really glad our paths crossed, and getting to know you has been such a lovely little part of my life. And honestly, if I were there with you today, I'd probably be in the kitchen making all your favourite dishes, just to see you enjoy them and smile hehe. I'd make sure you got your favourite food, your favourite dessert, and probably way too much of everything because it's your birthday and you deserve it. 🥹 I wish I could be there to make your day a little more special, annoy you a little, make you laugh, and just spend some time with you. I hope you always stay this adorable, keep smiling that pretty smile, and never run out of reasons to be happy. Here's to more random conversations, silly moments, late-night talks, and memories that we'll look back on and smile about. Have the most wonderful birthday everrr, birthday girl!! ❤️🎂✨";

const LANTERN_SRC = '/images/decorations/Item_Xiao_Lantern.webp';
const LANTERN_COUNT = 120;

type Lantern = {
  id: number;
  left: number; // %
  size: number; // px
  duration: number; // s
  delay: number; // s (negative to prefill)
  drift: number; // px
  swayDur: number; // s
  opacity: number;
  blur: number;
};

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function LanternField({ active }: { active: boolean }) {
  const reducedMotion = useReducedMotionSafe();
  const lanterns = useMemo<Lantern[]>(() => {
    const rand = mulberry32(20260417);
    return Array.from({ length: LANTERN_COUNT }, (_, id) => {
      const duration = 10 + rand() * 14; // 10-24s
      return {
        id,
        left: rand() * 100,
        size: 18 + rand() * 34, // 18-52px
        duration,
        delay: -rand() * duration, // spread across flight
        drift: (rand() - 0.5) * 90,
        swayDur: 2.8 + rand() * 3.6,
        opacity: 0.45 + rand() * 0.45,
        blur: rand() < 0.25 ? 1 : 0,
      };
    });
  }, []);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="lantern-field"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[5] overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.01 : 1.2 }}
        >
          <style>{`
            @keyframes xiao-lantern-rise {
              0% { transform: translate3d(0, 0, 0); }
              100% { transform: translate3d(var(--drift), -125vh, 0); }
            }
            @keyframes xiao-lantern-sway {
              0%, 100% { margin-left: 0px; }
              50% { margin-left: 14px; }
            }
          `}</style>
          {lanterns.map((l) => (
            <img
              key={l.id}
              src={LANTERN_SRC}
              alt=""
              loading="eager"
              decoding="async"
              className="absolute bottom-[-12vh] select-none"
              style={{
                left: `${l.left}%`,
                width: `${l.size}px`,
                height: 'auto',
                opacity: l.opacity,
                filter: l.blur ? 'blur(0.6px)' : undefined,
                ['--drift' as string]: `${l.drift}px`,
                animation: reducedMotion
                  ? undefined
                  : `xiao-lantern-rise ${l.duration}s linear ${l.delay}s infinite, xiao-lantern-sway ${l.swayDur}s ease-in-out ${l.delay}s infinite`,
                willChange: reducedMotion ? undefined : 'transform',
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * One Last Wish — the sealed envelope. Clicking it reveals the birthday
 * message and plays the wish background music (golden hour, from 34s, looping).
 */
export default function OneLastWish() {
  const [unsealed, setUnsealed] = useState(false);
  const reducedMotion = useReducedMotionSafe();
  const { playWishBackground, restoreDefaultBackground } = useMediaPlayer();

  const handleUnseal = () => {
    setUnsealed(true);
    playWishBackground();
  };

  const handleSealBack = () => {
    setUnsealed(false);
    restoreDefaultBackground();
  };

  return (
    <section id="wish" aria-labelledby="wish-title" className="relative min-h-[95vh] overflow-hidden py-28 sm:py-36">
      {/* Vertigo backdrop, darkest section of the site */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(90% 70% at 50% 45%, #0d2b29 0%, #101719 55%, #0a0f10 100%)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 size-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: 'conic-gradient(from 90deg, rgba(201,164,92,0.05), transparent 25%, rgba(70,199,178,0.06) 50%, transparent 75%, rgba(201,164,92,0.05))',
          animation: reducedMotion ? undefined : 'spin-slow 80s linear infinite',
        }}
      />
      <Particles count={18} seed={93} />
      <LanternField active={unsealed} />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 text-center sm:px-8">
        <SectionHeading
          eyebrow="One Last Wish"
          title="Sealed Until the Right Hour"
          className="z-10"
        />

        <AnimatePresence mode="wait">
          {!unsealed ? (
            <motion.div
              key="envelope"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.92, filter: 'blur(6px)', transition: { duration: 0.45 } }}
              className="z-10"
            >
              <p className="mb-10 max-w-xl text-sm leading-relaxed text-silver sm:text-base">
                Beneath the wind, beneath the years, one wish waits for you alone.
                Yaksha&apos;s word is iron — unseal it when you are ready.
              </p>

              <button
                type="button"
                onClick={handleUnseal}
                aria-expanded={unsealed}
                className="group relative inline-block outline-none"
                aria-label="Unseal the last wish"
              >
                {/* Envelope */}
                <svg
                  viewBox="0 0 220 140"
                  className="mx-auto w-56 transition-transform duration-500 group-hover:-translate-y-1.5 sm:w-72"
                  role="img"
                >
                  <defs>
                    <linearGradient id="envBody" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#123a36" />
                      <stop offset="1" stopColor="#0d2b29" />
                    </linearGradient>
                    <linearGradient id="envSeal" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#e8cd92" />
                      <stop offset="1" stopColor="#9c7a3f" />
                    </linearGradient>
                  </defs>
                  {/* flap */}
                  <path d="M10 52 L110 8 L210 52 L110 96 Z" fill="#1a4a44" stroke="#c9a45c" strokeWidth="1.2" opacity="0.95" />
                  {/* body */}
                  <rect x="10" y="52" width="200" height="78" rx="4" fill="url(#envBody)" stroke="#c9a45c" strokeWidth="1.2" />
                  {/* fold shadows */}
                  <path d="M10 130 L110 96 L210 130" fill="none" stroke="#46c7b2" strokeOpacity="0.35" strokeWidth="1" />
                  {/* wax seal */}
                  <circle cx="110" cy="92" r="17" fill="url(#envSeal)" />
                  <path
                    d="M110,82 L113.8,88.6 L122,88.6 L115,93.6 L120,101 L110,96.4 L100,101 L105,93.6 L98,88.6 L106.2,88.6 Z"
                    fill="#101719"
                    opacity="0.75"
                  />
                  <circle cx="110" cy="92" r="20" fill="none" stroke="#e8cd92" strokeOpacity="0.4" className="pulse-soft" />
                </svg>

                <span className="mt-2 inline-block text-[0.65rem] uppercase tracking-[0.35em] text-gold/80 transition-colors group-hover:text-gold-bright">
                  Unseal the wish
                </span>
                <span
                  aria-hidden="true"
                  className="absolute -inset-10 -z-10 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100"
                  style={{ background: 'radial-gradient(closest-side, rgba(201,164,92,0.22), transparent 70%)' }}
                />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, y: 26, scale: 0.94, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: reducedMotion ? 0.01 : 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="z-10 w-full"
            >
              {/* reveal bloom */}
              <motion.span
                aria-hidden="true"
                initial={{ scale: 0.2, opacity: 0.9 }}
                animate={{ scale: 3.2, opacity: 0 }}
                transition={{ duration: 1.4, ease: 'easeOut' }}
                className="absolute left-1/2 top-24 -z-10 size-40 -translate-x-1/2 rounded-full"
                style={{ background: 'radial-gradient(closest-side, rgba(201,164,92,0.7), transparent 70%)' }}
              />

              <div className="rounded-3xl border border-gold/40 bg-jade-deep/80 px-7 py-10 shadow-[0_0_90px_-20px_rgba(201,164,92,0.4)] backdrop-blur sm:px-12 sm:py-12">
                <span
                  aria-hidden="true"
                  className="mx-auto mb-6 block size-8"
                  style={{
                    clipPath: 'polygon(50% 0, 63% 37%, 100% 50%, 63% 63%, 50% 100%, 37% 63%, 0 50%, 37% 37%)',
                    background: 'linear-gradient(135deg, #e8cd92, #c9a45c)',
                  }}
                />
                <h3 className="font-display text-2xl font-semibold text-gold-gradient sm:text-3xl">
                  For you, on your day
                </h3>
                <p className="mx-auto mt-6 max-w-2xl whitespace-pre-line text-left text-sm leading-relaxed text-silver sm:text-base">
                  {WISH_MESSAGE}
                </p>
                <button
                  type="button"
                  onClick={handleSealBack}
                  className="mt-8 rounded-full border border-gold/40 px-6 py-2.5 text-[0.65rem] uppercase tracking-[0.3em] text-gold-bright transition-colors hover:bg-gold/10"
                >
                  Seal it back
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
