import { RotateCcw } from 'lucide-react';
import AnemoButton from '@/components/primitives/AnemoButton';

export interface FooterProps {
  onReplayIntro: () => void;
}

export default function Footer({ onReplayIntro }: FooterProps) {
  return (
    <footer className="relative border-t border-gold/15 bg-midnight/80 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-6 text-center">
        <span
          aria-hidden="true"
          className="block size-5 opacity-90"
          style={{
            clipPath: 'polygon(50% 0, 63% 37%, 100% 50%, 63% 63%, 50% 100%, 37% 63%, 0 50%, 37% 37%)',
            background: 'linear-gradient(135deg, #e8cd92, #c9a45c)',
          }}
        />
        <p className="font-display text-lg italic text-silver">
          Crafted on the wind — one of a kind, for one of a kind.
        </p>
        <AnemoButton variant="ghost" onClick={onReplayIntro} ariaLabel="Replay the five-star wish opening animation">
          <RotateCcw className="size-4" aria-hidden="true" />
          Replay the wish
        </AnemoButton>
        <p className="text-[0.65rem] uppercase tracking-[0.3em] text-silver/60">
          A Yaksha's Birthday Wish · fan-inspired, non-commercial
        </p>
      </div>
    </footer>
  );
}
