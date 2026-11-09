# Asset slots — how to replace the placeholders

Every artwork slot in the site maps to a real file under `public/images/`.
**Overwrite the file at the path below (keep the filename and aspect ratio) and
the layout will adapt automatically** — every slot uses a fixed-ratio container
with `object-cover`, so a real photo/artwork can never break the layout.

To regenerate the placeholder art at any time:
`node scripts/generate-placeholders.mjs`

The central replacement map lives in `src/lib/images.ts`.

## Xiao · hero portrait — `public/images/xiao/`

| File                 | Ratio | Used for                                    |
| -------------------- | ----- | ------------------------------------------- |
| `xiao-portrait.svg`  | 2:3   | Wish-intro reveal + homepage hero portrait  |

Recommended: a full-body she-artwork cutout with transparent or dark
background, ≥ 1200 × 1800 px, PNG works best (name it `xiao-portrait.png`
and update the single path in `src/lib/images.ts`).

## Chibis — `public/images/chibis/` (all 1:1, square)

| File         | Card in Xiao's Corner |
| ------------ | --------------------- |
| `Chibi-1.jpg` | On Watch              |
| `Chibi-2.jpg` | Almond Tofu           |
| `Chibi-3.jpg` | Piggyback Patrol      |
| `Chibi-4.jpg` | Karmic Nuisance       |
| `Chibi-5.jpg` | Secretly Soft         |

## Scrapbook — `public/images/scrapbook/`

| File            | Ratio | Used for                              |
| --------------- | ----- | ------------------------------------- |
| `polaroid-1..4.svg` | 4:5 | Polaroid memory slots, Our Journey   |
| `vintage-1..2.svg`  | 3:2 | Vintage framed photos, Our Journey   |

## Decorations — `public/images/decorations/`

| File               | Ratio | Used for                          |
| ------------------ | ----- | --------------------------------- |
| `mandala-gold.svg` | 1:1   | Hero backdrop ornament            |
| *(removed)*        | —     | Music Room uses the live wallpaper + per-track artwork (see `src/lib/playlist.ts`) |

If you prefer not to touch code, simply overwrite the `.svg` file and rename
your file to the same name (e.g. replace `xiao-portrait.svg` content with any
SVG/PNG converted copy). All paths stay constant.
