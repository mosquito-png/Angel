import { useEffect, useMemo, useState } from 'react';
import ChibiCharacter from '@/components/chibi/ChibiCharacter';
import { getActiveCharacters } from '@/components/chibi/chibiData';

const SMALL_BREAKPOINT = 768;

/**
 * Viewport-fixed companion layer. The container never captures pointer
 * events so page content beneath stays fully interactive; only each chibi
 * button re-enables hit-testing for itself. Chibis sit under the navbar
 * (z-40) and the wish intro (z-50).
 */
export default function ChibiSystem() {
  const [viewport, setViewport] = useState({ width: 1440, height: 900 });

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const isMobile = viewport.width < SMALL_BREAKPOINT;
  const characters = useMemo(() => getActiveCharacters(isMobile), [isMobile]);

  return (
    <div className="pointer-events-none fixed inset-0 z-20" role="presentation">
      {characters.map((def, index) => {
        const spread = (index + 0.5) / characters.length;
        const initialX = Math.max(
          24,
          Math.min(viewport.width - 96, viewport.width * spread),
        );
        return (
          <ChibiCharacter
            key={def.id}
            def={def}
            lanePercent={isMobile ? def.laneMobile : def.laneDesktop}
            initialX={initialX}
            bounds={{ left: 0, right: viewport.width }}
          />
        );
      })}
    </div>
  );
}
