/**
 * Single source of truth for every artwork slot.
 * To replace a placeholder, overwrite the file at the listed `/public/...`
 * path (keeping the aspect ratio documented in ASSETS.md) and nothing
 * else in the app needs to change.
 */
export const IMAGES = {
  /** Hero portrait — public/images/decorations/her.jpeg */
  xiaoPortrait: '/images/decorations/her.jpeg',

  /** Chibi energies — ratio 1:1 · public/images/chibis/ */
  chibis: [
    '/images/chibis/chibi-1.svg',
    '/images/chibis/chibi-2.svg',
    '/images/chibis/chibi-3.svg',
    '/images/chibis/chibi-4.svg',
    '/images/chibis/chibi-5.svg',
  ],

  /** Scrapbook placeholders — polaroids 4:5, vintage frames 3:2 · public/images/scrapbook/ */
  scrapbook: {
    polaroids: [
      '/images/scrapbook/polaroid-1.svg',
      '/images/scrapbook/polaroid-2.svg',
      '/images/scrapbook/polaroid-3.svg',
      '/images/scrapbook/polaroid-4.svg',
    ],
    vintage: [
      '/images/scrapbook/vintage-1.svg',
      '/images/scrapbook/vintage-2.svg',
    ],
  },

  /** Our Journey memories — public/images/our-journey/ */
  ourJourney: [
    '/images/our-journey/genshin%20(1).jpeg',
    '/images/our-journey/genshin%20(2).jpeg',
    '/images/our-journey/genshin%20(3).jpeg',
    '/images/our-journey/genshin%20(4).jpeg',
  ],

  /** Decorations · public/images/decorations/ */
  decorations: {
    mandala: '/images/decorations/mandala-gold.svg',
    albumArt: '/images/xiao/music-player-bg.jpeg',
  },
} as const;
