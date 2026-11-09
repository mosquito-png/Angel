import { useState } from 'react';
import { Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import SectionHeading from '@/components/primitives/SectionHeading';
import { IMAGES } from '@/lib/images';
import { useReducedMotionSafe } from '@/lib/useReducedMotionSafe';
import { cn } from '@/lib/cn';

interface MemoryItem {
  image: string;
  caption: string;
  tilt: number;
}
interface JourneyPage {
  chapter: string;
  title: string;
  note: string;
  polaroids: MemoryItem[];
  vintage?: MemoryItem;
  tape?: boolean;
}

const PAGES: JourneyPage[] = [
  {
    chapter: 'Prologue',
    title: 'The day the wind stopped',
    note: '“If one day, I lose everything and find myself despised by the whole world... would you still stay by my side?”',
    polaroids: [
      { image: IMAGES.ourJourney[0], caption: 'A moment worth keeping close.', tilt: -3 },
      { image: IMAGES.ourJourney[1], caption: 'Almond tofu, three plates. Two were his.', tilt: 2.5 },
    ],
    vintage: { image: IMAGES.ourJourney[2], caption: 'The path we keep retracing', tilt: 1 },
    tape: true,
  },
  {
    chapter: 'Chapter II',
    title: 'Small hours, loud hearts',
    note: '“The best thing to hold onto in life is each other.”',
    polaroids: [
      { image: IMAGES.scrapbook.polaroids[2], caption: 'Two a.m., one umbrella, zero regrets.', tilt: 2 },
      { image: IMAGES.scrapbook.polaroids[3], caption: 'The photo he asked to keep.', tilt: -2 },
    ],
    tape: true,
  },
  {
    chapter: 'Chapter III',
    title: 'Quiet joys',
    note: '“If I know what love is, it is because of you.”',
    polaroids: [
      { image: IMAGES.scrapbook.polaroids[0], caption: 'Stolen quality time, framed.', tilt: 1.5 },
    ],
    vintage: { image: IMAGES.scrapbook.vintage[1], caption: 'An evening worth keeping', tilt: -1.5 },
  },
  {
    chapter: 'Chapter IV',
    title: 'One more memory',
    note: 'A little more of us, kept here.',
    polaroids: [
      { image: IMAGES.ourJourney[3], caption: 'A page saved for this moment.', tilt: -2 },
    ],
    tape: true,
  },
];

function EditableNote({ initialText, noteKey }: { initialText: string; noteKey: string }) {
  return (
    <p
      key={noteKey}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      className="mt-5 cursor-text rounded border border-transparent px-1 font-hand text-2xl leading-snug text-[#2c3b38] outline-none focus:border-dotted focus:border-[#2c3b38]/40"
    >
      {initialText}
    </p>
  );
}

function Polaroid({ item, shapeClass }: { item: MemoryItem; shapeClass: string }) {
  return (
    <figure
      className={cn("group relative bg-[#fbf7ee] p-3 pb-4 shadow-[0_14px_38px_-14px_rgba(0,0,0,0.55)]", shapeClass)}
      style={{ transform: `rotate(${item.tilt}deg)` }}
    >
      <span
        aria-hidden="true"
        className="tape-strip absolute -top-3 left-1/2 z-10 h-6 w-24 -translate-x-1/2 -rotate-3"
      />
      <div className={cn('relative overflow-hidden bg-[#223231]', shapeClass==='aspect-[4/5]' ? 'aspect-[4/5]' : 'aspect-[3/2]')}>
        <img
          src={item.image}
          alt={item.caption}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>
      <figcaption className="mt-2 text-center font-hand text-xl leading-tight text-[#41504b]">
        {item.caption}
      </figcaption>
    </figure>
  );
}

/**
 * Our Journey — scrapbook pages with polaroids, vintage frames, ruled
 * notebook paper and preview-only editable notes. Flip navigation between
 * three placeholder pages; real memories are supplied in a future phase.
 */
export default function OurJourney() {
  const reducedMotion = useReducedMotionSafe();
  const [[page, direction], setPage] = useState<[number, number]>([0, 0]);
  const current = PAGES[page];

  const goTo = (next: number) => {
    if (next === page || next < 0 || next >= PAGES.length) return;
    setPage([next, next > page ? 1 : -1]);
  };

  return (
    <section id="journey" aria-labelledby="journey-title" className="relative py-24 sm:py-32">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(18,58,54,0.35) 20%, rgba(13,43,41,0.65) 50%, rgba(18,58,54,0.35) 80%, transparent 100%)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 sm:px-8">
        <SectionHeading
          eyebrow="Our Journey"
          title="A Scrapbook of Small Eternities"
          sub="Every polaroid is a slot waiting for a real memory. The notes you type are pencil marks — preview only, they reset on refresh."
        />

        {/* Flip controls */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => goTo(page - 1)}
            disabled={page === 0}
            aria-label="Previous scrapbook page"
            className="rounded-full border border-gold/40 p-2.5 text-gold-bright transition-colors enabled:hover:border-gold enabled:hover:bg-gold/10 disabled:opacity-30"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-2.5" role="tablist" aria-label="Scrapbook pages">
            {PAGES.map((p, index) => (
              <button
                key={p.chapter}
                role="tab"
                aria-selected={index === page}
                aria-label={`Go to page ${index + 1}: ${p.title}`}
                onClick={() => goTo(index)}
                className={cn(
                  'h-2.5 rounded-full transition-all duration-300',
                  index === page
                    ? 'w-8 bg-gradient-to-r from-anemo to-gold'
                    : 'w-2.5 bg-silver/30 hover:bg-silver/60',
                )}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => goTo(page + 1)}
            disabled={page === PAGES.length - 1}
            aria-label="Next scrapbook page"
            className="rounded-full border border-gold/40 p-2.5 text-gold-bright transition-colors enabled:hover:border-gold enabled:hover:bg-gold/10 disabled:opacity-30"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        </div>

        {/* Page surface */}
        <div className="relative min-h-[30rem]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.article
              key={page}
              custom={direction}
              initial={{ opacity: 0, x: direction * 60, rotate: direction * 1.4 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              exit={{ opacity: 0, x: direction * -60, rotate: direction * -1.2 }}
              transition={{ duration: reducedMotion ? 0.01 : 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="scrapbook-paper relative rounded-sm border border-gold/25 p-6 sm:p-10"
              style={{ transformOrigin: 'left center' }}
            >
              {/* Spiral binding */}
              <div
                aria-hidden="true"
                className="absolute inset-y-6 left-2 hidden flex-col gap-5 sm:flex"
              >
                {Array.from({ length: 9 }).map((_, i) => (
                  <span key={i} className="size-2.5 rounded-full bg-[#2c3b38]/25 shadow-inner" />
                ))}
              </div>

              <header className="relative sm:pl-10">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-[#8a7a52]">
                  {current.chapter}
                </p>
                <h3 id="journey-title" className="mt-1 font-display text-2xl font-semibold text-[#26413c] sm:text-3xl">
                  {current.title}
                </h3>
              </header>

              <div className="relative mt-8 grid gap-8 sm:pl-10 md:grid-cols-[1.2fr_1fr]">
                <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
                  {current.polaroids.map((item) => (
                    <Polaroid key={item.image + item.tilt} item={item} shapeClass="aspect-[4/5]" />
                  ))}
                </div>

                <div className="flex flex-col justify-between gap-6">
                  {current.vintage && (
                    <Polaroid item={current.vintage} shapeClass="aspect-[3/2]" />
                  )}
                  <div>
                    <p className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.25em] text-[#8a7a52]">
                      <Save className="size-3.5" aria-hidden="true" />
                      Notice from the archivist
                    </p>
                    <EditableNote initialText={current.note} noteKey={String(page)} />
                  </div>
                </div>
              </div>
            </motion.article>
          </AnimatePresence>
        </div>

        <p role="note" className="mx-auto mt-8 max-w-2xl rounded-xl border border-gold/20 bg-bone/60 px-5 py-3 text-center text-xs leading-relaxed text-silver/80">
          ✎ Edits to the handwriting are <strong className="text-gold-bright">temporary</strong> — they live only on this page load and reset when you refresh. Persistent memories arrive with connected storage in a future phase.
        </p>
      </div>
    </section>
  );
}
