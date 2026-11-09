import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  type AnimationPlaybackControls,
} from 'framer-motion';
import {
  CHIBI_SIZE,
  getIdleDurationMs,
  pickIdleBehavior,
  type CharacterDef,
  type ChibiMode,
  type IdleBehavior,
} from '@/components/chibi/chibiData';
import { cn } from '@/lib/cn';
import { playAnnoyed, playDragEnd, playDragStart, playDragTick, playThrow } from '@/lib/chibiSfx';
import { useReducedMotionSafe } from '@/lib/useReducedMotionSafe';

interface ChibiCharacterProps {
  def: CharacterDef;
  /** Vertical position as a percentage of the viewport height. */
  lanePercent: number;
  initialX: number;
  bounds: { left: number; right: number };
}

/** CSS animation class per idle behaviour. `sit` is an inline transform instead. */
const IDLE_CLASS: Partial<Record<IdleBehavior, string>> = {
  sleep: 'chibi-breathe',
  stretch: 'chibi-stretch-anim',
  wave: 'chibi-wave-anim',
  jump: 'chibi-jump-anim',
  look: 'chibi-look-anim',
  annoyed: 'chibi-shake',
};

const DIALOGUE_VISIBLE_MS = 4500;
const DIALOGUE_COOLDOWN_MS = 3200; // minimum gap between tap-triggered text bubbles
const ANNOY_THROW_AT = 6; // interactions/drag agitation before a throw
const ANNOY_DECAY_MS = 9000;
const DRAG_THRESHOLD_PX = 6;
const NEUVI_IMAGES = [
  '/images/decorations/neuvi.jpg',
  '/images/decorations/neuvii.jpg',
  '/images/decorations/neuviii.jpg',
] as const;

type Projectile = {
  id: number;
  img: string;
  startX: number;
  startY: number;
  dx: number;
  dy: number;
  rot: number;
  scale: number;
};

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

/**
 * A single roaming chibi. A tiny AI state machine walks it across the lower
 * viewport. Clicking shows a tsundere dialogue bubble. Dragging picks it up
 * (with animation/SFX) and pauses roaming; annoy it enough and it throws a
 * random neuvi image.
 */
export default function ChibiCharacter({
  def,
  lanePercent,
  initialX,
  bounds,
}: ChibiCharacterProps) {
  const reducedMotion = useReducedMotionSafe();
  const [mode, setMode] = useState<ChibiMode>('idle');
  const [facing, setFacing] = useState<1 | -1>(def.startFacing);
  const [idleBehavior, setIdleBehavior] = useState<IdleBehavior>('stand');
  const [dialogue, setDialogue] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);

  const modeRef = useRef<ChibiMode>('idle');
  const facingRef = useRef<1 | -1>(def.startFacing);
  const animRef = useRef<AnimationPlaybackControls | null>(null);
  const tickRef = useRef<number>(0);
  const dialogueCloseRef = useRef<number>(0);
  const lineIndexRef = useRef<number>(0);
  const lastDialogueAtRef = useRef<number>(0);
  const isFirstRun = useRef(true);

  const ai = useRef<null | {
    idle(behavior?: IdleBehavior): void;
    walk(dir?: 1 | -1): void;
    turn(): void;
    next(): void;
  }>(null);

  const x = useMotionValue(initialX);
  const dragY = useMotionValue(0);
  const dragScale = useMotionValue(1);
  const dragRotate = useMotionValue(0);

  // Drag bookkeeping
  const pointerIdRef = useRef<number | null>(null);
  const dragStartClient = useRef<{ x: number; y: number } | null>(null);
  const dragOrigin = useRef<{ x: number; y: number }>({ x: initialX, y: 0 });
  const didDragRef = useRef(false);
  const lastTickSoundRef = useRef(0);

  // Annoyance
  const annoyanceRef = useRef(0);
  const annoyDecayRef = useRef<number>(0);
  const projectileSeq = useRef(0);

  const setModeBoth = (nextMode: ChibiMode) => {
    modeRef.current = nextMode;
    setMode(nextMode);
  };

  const stopMove = useCallback(() => {
    animRef.current?.stop();
    animRef.current = null;
  }, []);

  const getViewportY = useCallback(() => {
    if (typeof window === 'undefined') return 0;
    return (window.innerHeight * lanePercent) / 100 + dragY.get();
  }, [lanePercent, dragY]);

  const spawnProjectile = useCallback(() => {
    const id = ++projectileSeq.current;
    const img = pickRandom(NEUVI_IMAGES);
    const startX = x.get();
    const startY = getViewportY();
    const dir = facingRef.current * -1 || (Math.random() < 0.5 ? 1 : -1);
    const dx = dir * (120 + Math.random() * 200);
    // land and linger in view (bias upward but keep on-screen when possible)
    const rawDy = -(70 + Math.random() * 150);
    const minY = 24 - startY;
    const maxY = (typeof window !== 'undefined' ? window.innerHeight : 900) - startY - 96;
    const dy = Math.max(minY, Math.min(maxY, rawDy));
    const rot = dir * (18 + Math.random() * 34);
    const scale = 0.95 + Math.random() * 0.35;
    setProjectiles((prev) => [...prev.slice(-5), { id, img, startX, startY, dx, dy, rot, scale }]);
    playThrow();
    window.setTimeout(() => {
      setProjectiles((prev) => prev.filter((p) => p.id !== id));
    }, 3200);
  }, [x, getViewportY]);

  const bumpAnnoyance = useCallback(
    (amount: number) => {
      if (annoyDecayRef.current) window.clearTimeout(annoyDecayRef.current);
      annoyanceRef.current += amount;
      if (annoyanceRef.current >= ANNOY_THROW_AT) {
        annoyanceRef.current = 0;
        setIdleBehavior('annoyed');
        setDialogue(pickRandom(def.dialogue));
        setModeBoth(modeRef.current === 'dragging' ? 'dragging' : 'interacting');
        playAnnoyed();
        spawnProjectile();
        // close dialogue after a bit (if not still dragging)
        if (dialogueCloseRef.current) window.clearTimeout(dialogueCloseRef.current);
        dialogueCloseRef.current = window.setTimeout(() => {
          setDialogue(null);
          if (modeRef.current === 'interacting') {
            setModeBoth('idle');
            ai.current?.idle('stand');
          }
        }, 2600);
      } else if (annoyanceRef.current >= ANNOY_THROW_AT - 2) {
        playAnnoyed();
      }
      annoyDecayRef.current = window.setTimeout(() => {
        annoyanceRef.current = Math.max(0, annoyanceRef.current - 2);
      }, ANNOY_DECAY_MS);
    },
    [def.dialogue, spawnProjectile],
  );

  /* ── AI state machine ────────────────────────────────────────────── */
  useEffect(() => {
    const scheduleNext = (fn: () => void, ms: number) => {
      if (tickRef.current) window.clearTimeout(tickRef.current);
      tickRef.current = window.setTimeout(() => {
        tickRef.current = 0;
        fn();
      }, ms);
    };
    const roamable =
      !reducedMotion && bounds.right - bounds.left > CHIBI_SIZE * 2;

    function walk(dir?: 1 | -1) {
      if (modeRef.current === 'dragging') return;
      if (!roamable || bounds.right <= bounds.left + CHIBI_SIZE * 2) {
        idle('stand');
        return;
      }
      const direction = dir ?? (Math.random() < 0.5 ? 1 : -1);
      facingRef.current = direction;
      setFacing(direction);
      setModeBoth('walking');

      const edge = bounds.left + 8;
      const farEdge = bounds.right - CHIBI_SIZE - 8;
      const span = farEdge - edge;
      const distance = Math.min(span * 0.55, 90 + Math.random() * 260);
      const rawTarget = direction === 1 ? x.get() + distance : x.get() - distance;
      const target = Math.max(edge, Math.min(farEdge, rawTarget));
      const actual = Math.abs(target - x.get());
      if (actual < 10) {
        idle('stand');
        return;
      }

      animRef.current = animate(x, target, {
        duration: actual / def.speed,
        ease: 'linear',
        onComplete: () => {
          animRef.current = null;
          if (modeRef.current === 'walking') next();
        },
      });
    }

    function idle(behavior?: IdleBehavior) {
      if (modeRef.current === 'dragging') return;
      setModeBoth('idle');
      const picked = behavior ?? pickIdleBehavior(def.idleWeights);
      setIdleBehavior(picked);
      if (!roamable) return;
      scheduleNext(next, getIdleDurationMs(picked));
    }

    function turn() {
      if (modeRef.current === 'dragging') return;
      setModeBoth('turning');
      if (!roamable) return;
      scheduleNext(() => walk((facingRef.current * -1) as 1 | -1), 640 + Math.random() * 520);
    }

    function next() {
      if (modeRef.current === 'dragging') return;
      const roll = Math.random();
      if (roll < 0.55) {
        walk();
      } else if (roll < 0.72) {
        turn();
      } else {
        idle();
      }
    }

    ai.current = { idle, walk, turn, next };

    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    stopMove();
    if (modeRef.current !== 'dragging') {
      setModeBoth('idle');
      setIdleBehavior('stand');
      scheduleNext(() => idle('stand'), 380);
    }

    return () => {
      stopMove();
      if (tickRef.current) window.clearTimeout(tickRef.current);
      tickRef.current = 0;
    };
  }, [def, bounds.left, bounds.right, reducedMotion, x, stopMove]);

  useEffect(() => {
    const delay = window.setTimeout(
      () => ai.current?.idle(),
      300 + Math.random() * 1200,
    );
    return () => window.clearTimeout(delay);
  }, []);

  /* ── Dialogue helpers ───────────────────────────────────────────── */
  const closeDialogue = useCallback(() => {
    if (dialogueCloseRef.current) {
      window.clearTimeout(dialogueCloseRef.current);
      dialogueCloseRef.current = 0;
    }
    setDialogue(null);
    if (modeRef.current === 'interacting') {
      setModeBoth('idle');
      ai.current?.idle('stand');
    }
  }, []);

  const handleInteract = useCallback(() => {
    if (isDragging || didDragRef.current) return;
    // Always count taps toward annoyance (so multi-tap throws still work),
    // but rate-limit the dialogue bubble to avoid constant text spam.
    bumpAnnoyance(1);

    const now = performance.now();
    if (now - lastDialogueAtRef.current < DIALOGUE_COOLDOWN_MS) return;
    lastDialogueAtRef.current = now;

    if (dialogueCloseRef.current) window.clearTimeout(dialogueCloseRef.current);
    if (tickRef.current) {
      window.clearTimeout(tickRef.current);
      tickRef.current = 0;
    }
    stopMove();

    const line = def.dialogue[lineIndexRef.current % def.dialogue.length];
    lineIndexRef.current += 1;
    setDialogue(line);
    setModeBoth('interacting');
    dialogueCloseRef.current = window.setTimeout(closeDialogue, DIALOGUE_VISIBLE_MS);
  }, [def.dialogue, closeDialogue, isDragging, stopMove, bumpAnnoyance]);

  useEffect(() => {
    if (!dialogue) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeDialogue();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dialogue, closeDialogue]);

  useEffect(
    () => () => {
      window.clearTimeout(dialogueCloseRef.current);
      window.clearTimeout(annoyDecayRef.current);
    },
    [],
  );

  /* ── Dragging ───────────────────────────────────────────────────── */
  const finishDrag = useCallback(
    (commit: boolean) => {
      if (pointerIdRef.current == null) return;
      pointerIdRef.current = null;
      dragStartClient.current = null;
      if (didDragRef.current) {
        playDragEnd();
        bumpAnnoyance(1);
      }
      setIsDragging(false);
      animate(dragScale, 1, { type: 'spring', stiffness: 340, damping: 18 });
      animate(dragRotate, 0, { type: 'spring', stiffness: 260, damping: 16 });
      animate(dragY, 0, { type: 'spring', stiffness: 220, damping: 20 });

      if (commit && didDragRef.current) {
        // resume roaming from new X, back to lane
        setModeBoth('idle');
        ai.current?.idle('stand');
      } else if (modeRef.current === 'dragging') {
        setModeBoth('idle');
        ai.current?.idle('stand');
      }
      // allow click suppression to clear after pointerup sequence
      window.setTimeout(() => {
        didDragRef.current = false;
      }, 0);
    },
    [bumpAnnoyance, dragRotate, dragScale, dragY],
  );

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    pointerIdRef.current = e.pointerId;
    dragStartClient.current = { x: e.clientX, y: e.clientY };
    dragOrigin.current = { x: x.get(), y: dragY.get() };
    didDragRef.current = false;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (pointerIdRef.current !== e.pointerId || !dragStartClient.current) return;
    const dx = e.clientX - dragStartClient.current.x;
    const dy = e.clientY - dragStartClient.current.y;
    const dist = Math.hypot(dx, dy);

    if (!didDragRef.current && dist >= DRAG_THRESHOLD_PX) {
      didDragRef.current = true;
      // start drag
      if (tickRef.current) {
        window.clearTimeout(tickRef.current);
        tickRef.current = 0;
      }
      if (dialogueCloseRef.current) {
        window.clearTimeout(dialogueCloseRef.current);
        dialogueCloseRef.current = 0;
      }
      setDialogue(null);
      stopMove();
      setIsDragging(true);
      setModeBoth('dragging');
      playDragStart();
      animate(dragScale, 1.12, { type: 'spring', stiffness: 420, damping: 14 });
    }

    if (didDragRef.current) {
      const edge = bounds.left + 8;
      const farEdge = Math.max(edge + 10, bounds.right - CHIBI_SIZE - 8);
      const nextX = Math.max(edge, Math.min(farEdge, dragOrigin.current.x + dx));
      const minY = -((window.innerHeight * lanePercent) / 100) + 12;
      const maxY = window.innerHeight - (window.innerHeight * lanePercent) / 100 - CHIBI_SIZE - 12;
      const nextY = Math.max(minY, Math.min(maxY, dragOrigin.current.y + dy));
      x.set(nextX);
      dragY.set(nextY);
      // face drag direction
      if (Math.abs(dx) > 2) {
        const f = dx > 0 ? 1 : -1;
        facingRef.current = f;
        setFacing(f);
      }
      const wobble = Math.max(-14, Math.min(14, dx * 0.08 + dy * 0.03));
      dragRotate.set(wobble);
      const now = performance.now();
      if (now - lastTickSoundRef.current > 140 && dist > 14) {
        lastTickSoundRef.current = now;
        playDragTick();
        bumpAnnoyance(0.18);
      }
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (pointerIdRef.current !== e.pointerId) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    finishDrag(true);
  };

  const onPointerCancel = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (pointerIdRef.current !== e.pointerId) return;
    finishDrag(true);
  };

  const sleepy = mode === 'idle' && idleBehavior === 'sleep';
  const bodyClass =
    mode === 'dragging'
      ? null
      : mode === 'interacting'
        ? 'chibi-reaction'
        : mode === 'walking'
          ? 'chibi-bob'
          : IDLE_CLASS[idleBehavior] ?? null;

  return (
    <>
      {/* Thrown neuvi projectiles (viewport-anchored within the roaming layer) */}
      <AnimatePresence>
        {projectiles.map((p) => (
          <motion.img
            key={p.id}
            src={p.img}
            alt=""
            aria-hidden="true"
            className="pointer-events-none fixed z-30 h-16 w-16 rounded-xl border border-gold/45 object-cover shadow-[0_16px_34px_rgba(0,0,0,0.6)] sm:h-20 sm:w-20"
            style={{ left: 0, top: 0 }}
            initial={{ x: p.startX - 32, y: p.startY - 32, opacity: 0, scale: 0.45, rotate: 0 }}
            animate={{
              x: [p.startX - 32, p.startX - 32 + p.dx, p.startX - 32 + p.dx, p.startX - 32 + p.dx],
              y: [p.startY - 32, p.startY - 32 + p.dy, p.startY - 32 + p.dy, p.startY - 32 + p.dy + 6],
              opacity: [0, 1, 1, 0],
              scale: [0.45, p.scale, p.scale, p.scale * 0.92],
              rotate: [0, p.rot * 0.6, p.rot, p.rot],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 2.8,
              times: [0, 0.18, 0.82, 1],
              ease: [0.2, 0.8, 0.2, 1],
            }}
            draggable={false}
          />
        ))}
      </AnimatePresence>

      <motion.div
        className="pointer-events-none absolute left-0"
        style={{ x, y: dragY, top: `${lanePercent}%` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="relative -translate-x-1/2">
          <AnimatePresence>
            {dialogue && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.97 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="absolute bottom-[calc(100%+14px)] left-1/2 w-56 -ml-28 max-w-[70vw]"
              >
                <div
                  role="status"
                  className="relative rounded-2xl border border-gold/30 bg-jade-deep/95 px-4 py-3 text-xs leading-relaxed text-parchment shadow-[0_18px_45px_-12px_rgba(0,0,0,0.92)] backdrop-blur"
                >
                  <p className="mb-1 text-[0.58rem] uppercase tracking-[0.3em] text-anemo">
                    {def.name}
                  </p>
                  {dialogue}
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-2 left-1/2 size-4 -translate-x-1/2 rotate-45 border-b border-r border-gold/30 bg-jade-deep/95"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {sleepy && !isDragging && (
            <div
              aria-hidden="true"
              className="absolute -top-5 right-2 select-none font-hand text-base font-semibold leading-none text-gold-bright"
            >
              <span className="chibi-zzz" style={{ animationDelay: '0ms' }}>z</span>
              <span className="chibi-zzz ml-0.5 inline-block" style={{ animationDelay: '350ms' }}>z</span>
              <span className="chibi-zzz ml-0.5 inline-block" style={{ animationDelay: '700ms' }}>z</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleInteract}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
            aria-label={`${def.ariaLabel}. Drag to move; annoy them too much and they may throw something.`}
            className={cn(
              'pointer-events-auto block select-none touch-none',
              isDragging ? 'cursor-grabbing' : 'cursor-grab',
            )}
          >
            <motion.div
              style={{ scaleX: facing, scale: dragScale, rotate: dragRotate }}
              className="origin-center transition-[filter] duration-150"
            >
              <div className={cn('origin-bottom', bodyClass)}>
                {/* Drag wiggle layer */}
                <motion.div
                  animate={
                    isDragging && !reducedMotion
                      ? { y: [0, -2, 0, 2, 0], rotateZ: [0, -1.5, 0, 1.5, 0] }
                      : { y: 0, rotateZ: 0 }
                  }
                  transition={
                    isDragging && !reducedMotion
                      ? { duration: 0.35, repeat: Infinity, ease: 'easeInOut' }
                      : { duration: 0.2 }
                  }
                  className="origin-bottom"
                >
                  <div
                    className={cn(
                      'origin-bottom',
                      idleBehavior === 'sit' && mode === 'idle' && !isDragging && 'scale-y-[0.82] scale-x-110',
                    )}
                  >
                    <img
                      src={def.image}
                      alt=""
                      width={CHIBI_SIZE}
                      height={CHIBI_SIZE}
                      draggable={false}
                      className={cn(
                        'h-auto w-18 drop-shadow-[0_10px_16px_rgba(4,10,9,0.65)]',
                        mode === 'interacting' &&
                          'drop-shadow-[0_0_18px_rgba(201,164,92,0.9)]',
                        isDragging &&
                          'drop-shadow-[0_18px_26px_rgba(4,10,9,0.75)] drop-shadow-[0_0_14px_rgba(70,199,178,0.35)]',
                      )}
                    />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </button>
        </div>
      </motion.div>
    </>
  );
}
