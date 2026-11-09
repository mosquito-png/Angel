# A Yaksha's Birthday Wish 💚

An immersive, Genshin-inspired (Xiao / Anemo) interactive birthday experience.
Built with **React + Vite + TypeScript + Tailwind CSS v4 + Framer Motion + Lucide React**.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-checks (tsc -b) + production build to dist/
npm run preview  # serve the production build locally
```

## What's inside (milestone 1)

- **Five-star wish intro** — cinematic opening animation (ember → wind spirits →
  shooting star → golden star burst → character reveal → wish texts) with Skip
  (button or Escape), reduced-motion path, and a **Replay the Wish** control in
  the footer.
- **Homepage / Hero** — layered Dark Yaksha backdrop, floating Anemo particles,
  floating + scroll-parallax portrait, greeting copy, Explore button.
- **Navbar** — active-section tracking (IntersectionObserver), smooth anchor
  scrolling, jade-glow underline, mobile hamburger drawer (Escape + focus).
- **Xiao's Corner** — five tsundere chibi cards with hover glow and speech
  bubbles (placeholder lines).
- **Our Journey** — scrapbook with polaroids, vintage frames, ruled paper, page
  flip navigation and *preview-only* editable notes (they reset on refresh).
- **Music Room** — persistent local MP3 player for `public/music/`, with track
  selection, playback controls, seeking, and volume. The Xiao track in
  `public/music/idle-music/` loops as background audio and pauses while a
  playlist song plays; use the floating corner button to mute or enable it.
  Browsers that block autoplay can start it from that button.
- **Drawing Room, Our Diary, One Last Wish** — themed placeholders, clearly
  labelled; no fake backend behaviour.

## Replacing the placeholder artwork

See [ASSETS.md](ASSETS.md) — every slot is a fixed-ratio container mapped to a
file under `public/images/{xiao,chibis,scrapbook,decorations}/`. Overwrite the
file (keep the ratio) or edit the one-line map in `src/lib/images.ts`.
Regenerate the placeholder art with `node scripts/generate-placeholders.mjs`.

## Project layout

```
src/
  components/
    primitives/   Particles · GoldFrame · AnemoButton · SectionHeading
    wish/         WishIntro (five-star opening)
    layout/       Navbar · Footer
    sections/     Hero · XiaosCorner · OurJourney · MusicRoom
                  DrawingRoom · OurDiary · OneLastWish
  lib/            images map · nav · playlist · useMediaPlayer · helpers
  index.css       Dark Yaksha design tokens + keyframes
public/images/    placeholder artwork slots
```

Accessibility: keyboard-reachable controls with gold focus rings, skip link,
aria labels on icon buttons, semantic sections, `prefers-reduced-motion` respected
throughout.
