import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import WishIntro from '@/components/wish/WishIntro';
import ChibiSystem from '@/components/chibi/ChibiSystem';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';
import XiaosCorner from '@/components/sections/XiaosCorner';
import OurJourney from '@/components/sections/OurJourney';
import MusicRoom from '@/components/sections/MusicRoom';
import OneLastWish from '@/components/sections/OneLastWish';
import { MusicPlayerProvider } from '@/lib/useMediaPlayer';
import { useReducedMotionSafe } from '@/lib/useReducedMotionSafe';

export default function App() {
  const [introVisible, setIntroVisible] = useState(true);
  const [introKey, setIntroKey] = useState(0);
  const reducedMotion = useReducedMotionSafe();

  const replayIntro = () => {
    window.scrollTo({ top: 0 });
    setIntroKey((key) => key + 1);
    setIntroVisible(true);
  };

  return (
    <MusicPlayerProvider>
      <>
        <a href="#main" className="skip-link">
          Skip to content
        </a>

        <ChibiSystem />

        <AnimatePresence>
          {introVisible && (
            <WishIntro
              key={introKey}
              reducedMotion={reducedMotion}
              onComplete={() => setIntroVisible(false)}
            />
          )}
        </AnimatePresence>

        <Navbar />
        <main id="main">
          <Hero />
          <XiaosCorner />
          <OurJourney />
          <MusicRoom />
          <OneLastWish />
        </main>
        <Footer onReplayIntro={replayIntro} />
      </>
    </MusicPlayerProvider>
  );
}
