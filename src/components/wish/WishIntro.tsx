import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';

const INTRO_VIDEO = '/wishing-animation-intro.mp4';

export interface WishIntroProps {
  reducedMotion: boolean;
  onComplete: () => void;
}

export default function WishIntro({ reducedMotion, onComplete }: WishIntroProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [needsInteraction, setNeedsInteraction] = useState(false);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  const finish = useCallback(() => onCompleteRef.current(), []);

  useEffect(() => {
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') finish();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [finish]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const attemptPlay = async () => {
      try {
        // Attempt playback with sound. Browsers often require a user gesture for
        // unmuted autoplay, so we fall back to an explicit "tap to begin" prompt.
        video.muted = false;
        video.volume = 1;
        await video.play();
        setNeedsInteraction(false);
      } catch {
        setNeedsInteraction(true);
      }
    };

    if (video.readyState >= 2) {
      setReady(true);
      void attemptPlay();
    } else {
      const onReady = () => {
        setReady(true);
        void attemptPlay();
      };
      video.addEventListener('loadeddata', onReady, { once: true });
      video.addEventListener('canplay', onReady, { once: true });
      return () => {
        video.removeEventListener('loadeddata', onReady);
        video.removeEventListener('canplay', onReady);
      };
    }
  }, []);

  const handlePlayClick = async () => {
    const video = videoRef.current;
    if (!video) {
      finish();
      return;
    }
    try {
      video.muted = false;
      video.volume = 1;
      await video.play();
      setNeedsInteraction(false);
    } catch {
      // If playback still fails, don't trap the user.
      finish();
    }
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Intro video"
      className="fixed inset-0 z-50 overflow-hidden bg-[#050b0c]"
      exit={{ opacity: 0, transition: { duration: reducedMotion ? 0.01 : 0.6, ease: 'easeOut' } }}
    >
      <div aria-hidden="true" className="absolute inset-0 bg-black" />

      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover bg-black"
        src={INTRO_VIDEO}
        playsInline
        autoPlay
        preload="auto"
        onEnded={finish}
        onError={() => {
          setFailed(true);
          setNeedsInteraction(true);
        }}
      />

      {/* Subtle vignette/frame */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 50%, transparent 55%, rgba(0,0,0,0.45) 100%)',
        }}
      />

      {/* Skip control (always available) */}
      <motion.button
        type="button"
        onClick={finish}
        aria-label="Skip intro video"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.92 }}
        transition={{ delay: 0.15, duration: reducedMotion ? 0.01 : 0.35 }}
        whileHover={reducedMotion ? undefined : { opacity: 1, scale: 1.03 }}
        className="absolute right-4 top-4 z-10 rounded-full border border-gold/45 bg-midnight/70 px-4 py-2 text-[0.68rem] uppercase tracking-[0.28em] text-gold-bright backdrop-blur-sm transition-colors hover:border-gold hover:text-parchment sm:right-7 sm:top-7"
      >
        Skip ✦
      </motion.button>

      {/* Interaction fallback (autoplay-with-sound blocked / error) */}
      <AnimatePresence>
        {(needsInteraction || failed) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.01 : 0.3 }}
            className="absolute inset-0 z-10 flex items-center justify-center px-6"
            style={{
              background:
                'linear-gradient(to top, rgba(5,11,12,0.78), rgba(5,11,12,0.35), rgba(5,11,12,0.55))',
            }}
          >
            <div className="flex flex-col items-center gap-4 text-center">
              <p className="max-w-md font-display text-sm text-silver/90 sm:text-base">
                {failed
                  ? 'The intro video could not be loaded. You can continue to the site.'
                  : 'Tap to begin the wish with sound.'}
              </p>
              <div className="flex items-center gap-3">
                {!failed && (
                  <button
                    type="button"
                    onClick={handlePlayClick}
                    className="inline-flex items-center gap-2 rounded-full border border-gold/60 bg-gold/15 px-6 py-3 text-[0.72rem] uppercase tracking-[0.22em] text-gold-bright transition-colors hover:border-gold hover:bg-gold/20"
                  >
                    <Volume2 className="size-4" aria-hidden="true" />
                    Begin with sound
                  </button>
                )}
                <button
                  type="button"
                  onClick={finish}
                  className="rounded-full border border-silver/25 bg-midnight/40 px-5 py-3 text-[0.72rem] uppercase tracking-[0.22em] text-silver transition-colors hover:border-gold/50 hover:text-parchment"
                >
                  {failed ? 'Enter site' : 'Skip intro'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading hint (very brief) */}
      {!ready && !failed && (
        <div className="pointer-events-none absolute inset-x-0 bottom-8 z-10 text-center">
          <span className="text-[0.62rem] uppercase tracking-[0.28em] text-silver/55">
            Loading intro…
          </span>
        </div>
      )}
    </motion.div>
  );
}
