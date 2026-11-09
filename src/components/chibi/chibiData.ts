/**
 * Data for the roaming Xiao chibi companion layer.
 * Names, dialogue and idle-behaviour weights are easily tweakable here
 * without touching the state machine or rendering code.
 */
export type IdleBehavior =
  | 'stand'
  | 'sit'
  | 'sleep'
  | 'stretch'
  | 'wave'
  | 'jump'
  | 'look'
  | 'annoyed';

export type ChibiMode = 'walking' | 'turning' | 'idle' | 'interacting' | 'dragging';
export interface CharacterDef {
  id: string;
  image: string;
  name: string;
  ariaLabel: string;
  /** Walking speed in px per second. */
  speed: number;
  /** Vertical lanes as a percentage of viewport height (top of the sprite). */
  laneDesktop: number;
  laneMobile: number;
  /** 'all' renders on mobile too; 'desktop' renders on ≥768px only. */
  appearsOn: 'all' | 'desktop';
  startFacing: 1 | -1;
  dialogue: string[];
  idleWeights: Partial<Record<IdleBehavior, number>>;
}

/** Rendered width of a roaming sprite, in px. */
export const CHIBI_SIZE = 72;

/**
 * Placeholders come from public/images/chibis/ (1:1 slots, see ASSETS.md).
 * Swap the file at that path for real chibi artwork of the same ratio.
 */
export const CHIBI_CHARACTERS: CharacterDef[] = [
  {
    id: 'xiao-watch',
    image: '/images/chibis/chibi-1.png',
    name: 'Xiao · On Watch',
    ariaLabel: 'Roaming chibi Xiao — tap to hear him say something',
    speed: 30,
    laneDesktop: 78,
    laneMobile: 72,
    appearsOn: 'all',
    startFacing: -1,
    dialogue: [
      '…What are you doing way down here. The other lanterns are prettier. Not that it matters to me.',
      "Hmph. Do not follow me. …Fine. Walk a little closer, then. It's dangerous when you wander alone.",
      'You again. Fine. Since you insist, I will patrol a bit closer to your side of the screen.',
      'I guard this edge of the screen. Uninvited. The same way you walked into my heart.',
      'Wait. The sky is louder tonight. Stand behind me until it passes.',
    ],
    idleWeights: { stand: 2.2, sit: 1.2, sleep: 0.8, stretch: 0.6, jump: 0.9, look: 1.1, annoyed: 0.7 },
  },
  {
    id: 'xiao-off-duty',
    image: '/images/chibis/chibi-3.png',
    name: 'Xiao · Off Duty',
    ariaLabel: 'Roaming off-duty Xiao — tap to catch him off guard',
    speed: 24,
    laneDesktop: 88,
    laneMobile: 88,
    appearsOn: 'desktop',
    startFacing: 1,
    dialogue: [
      'Tch. You caught me slacking. Whatever you think you saw, it never happened.',
      'These minor injuries are nothing. Do not look at me with that soft expression.',
      'Almond tofu. One bowl. It fell off a plate. I am merely the messenger. Eat it.',
      'If you keep smiling at me like that, I will keep walking. …Sooner or later.',
      'Do not tell a single soul that I stayed this long.',
    ],
    idleWeights: { stand: 1.8, sit: 1.6, sleep: 1.4, stretch: 1, wave: 0.4, look: 0.9, annoyed: 0.9 },
  },
];

export function getActiveCharacters(isMobile: boolean): CharacterDef[] {
  return isMobile
    ? CHIBI_CHARACTERS.filter((character) => character.appearsOn === 'all')
    : CHIBI_CHARACTERS;
}

/**
 * Weighted random pick of the next idle behaviour.
 * Weights of 0 (or missing) exclude the behaviour entirely.
 */
export function pickIdleBehavior(
  weights: Partial<Record<IdleBehavior, number>>,
): IdleBehavior {
  const pool = (Object.keys(weights) as IdleBehavior[]).filter(
    (behavior) => (weights[behavior] ?? 0) > 0,
  );
  const total = pool.reduce((sum, behavior) => sum + (weights[behavior] ?? 0), 0);
  if (total <= 0) return 'stand';

  let roll = Math.random() * total;
  for (const behavior of pool) {
    roll -= weights[behavior] ?? 0;
    if (roll <= 0) return behavior;
  }
  return 'stand';
}

/** How long (ms) each idle behaviour holds before the AI picks again. */
export function getIdleDurationMs(behavior: IdleBehavior): number {
  switch (behavior) {
    case 'stand':
      return 2600 + Math.random() * 2600;
    case 'sit':
      return 3200 + Math.random() * 2800;
    case 'sleep':
      return 5200 + Math.random() * 3200;
    case 'stretch':
      return 2500 + Math.random() * 1000;
    case 'wave':
      return 2200 + Math.random() * 1000;
    case 'jump':
      return 2800 + Math.random() * 1400;
    case 'look':
      return 2600 + Math.random() * 1600;
    case 'annoyed':
      return 1500 + Math.random() * 800;
  }
}
