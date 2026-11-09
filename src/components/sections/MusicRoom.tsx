import {
  ChevronLeft,
  ChevronRight,
  ListMusic,
  Maximize2,
  Minimize2,
  Music2,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useMediaPlayer } from '@/lib/useMediaPlayer';
import { useReducedMotionSafe } from '@/lib/useReducedMotionSafe';
import { FALLBACK_ARTWORK, MUSIC_PLAYER_WALLPAPER, PLAYLIST, getTrackAccent, getTrackArtwork } from '@/lib/playlist';
import { cn } from '@/lib/cn';

/**
 * Cinematic Music Corner — immersive, LofiMusic-inspired layout.
 * - Fullscreen song artwork background (dynamic per track) with crossfade + overlays.
 * - Left playlist sidebar (collapsible / mobile drawer).
 * - Center: large title, artist, subtle visualizer + ambient particles.
 * - Bottom floating glassmorphic controls.
 * Playback uses the shared MediaPlayerProvider so site-wide state is preserved.
 */
export default function MusicRoom() {
  const reducedMotion = useReducedMotionSafe();
  const player = useMediaPlayer();
  const sectionRef = useRef<HTMLElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [artA, setArtA] = useState<string>(getTrackArtwork(player.track));
  const [artB, setArtB] = useState<string>(getTrackArtwork(player.track));
  const [showA, setShowA] = useState(true);
  const [artLoadedKey, setArtLoadedKey] = useState(0);

  const artwork = useMemo(() => getTrackArtwork(player.track), [player.track]);
  const accent = useMemo(() => getTrackAccent(player.index), [player.index]);

  // Dynamic artwork crossfade: preload next artwork, swap layers on load.
  useEffect(() => {
    if (!artwork) return;
    const img = new Image();
    img.decoding = 'async';
    let cancelled = false;
    img.onload = () => {
      if (cancelled) return;
      if (showA) setArtB(artwork);
      else setArtA(artwork);
      setShowA((v) => !v);
      setArtLoadedKey((k) => k + 1);
    };
    img.onerror = () => {
      if (cancelled) return;
      const fallback = artwork === FALLBACK_ARTWORK ? MUSIC_PLAYER_WALLPAPER : FALLBACK_ARTWORK;
      if (showA) setArtB(fallback);
      else setArtA(fallback);
      setShowA((v) => !v);
    };
    img.src = artwork;
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artwork]);

  // Fullscreen tracking
  useEffect(() => {
    const onFs = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const el = sectionRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await el.requestFullscreen();
    } catch {
      /* ignore */
    }
  }, []);

  const formatTime = (t: number) => {
    if (!Number.isFinite(t) || t < 0) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const progressPct =
    player.duration > 0 ? Math.max(0, Math.min(100, (player.currentTime / player.duration) * 100)) : 0;

  const seekFromEvent = (clientX: number) => {
    const rect = progressRef.current?.getBoundingClientRect();
    if (!rect || player.duration <= 0) return;
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    player.seekTo(pct * player.duration);
  };

  // Keyboard shortcuts (scoped to when music section is in view / focused context is safe)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable) return;
      // Only act when the music section is reasonably in view
      const sec = sectionRef.current;
      if (sec) {
        const r = sec.getBoundingClientRect();
        const inView = r.bottom > 80 && r.top < window.innerHeight - 80;
        if (!inView && !isFullscreen) return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        player.togglePlay();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        player.seekTo(Math.min(player.duration || 0, player.currentTime + 5));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        player.seekTo(Math.max(0, player.currentTime - 5));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        player.setVolume(Math.min(1, player.volume + 0.05));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        player.setVolume(Math.max(0, player.volume - 0.05));
      } else if (e.key.toLowerCase() === 'n') {
        player.next();
      } else if (e.key.toLowerCase() === 'p') {
        player.previous();
      } else if (e.key.toLowerCase() === 'm') {
        player.toggleMute();
      } else if (e.key.toLowerCase() === 's' && !e.ctrlKey && !e.metaKey) {
        player.toggleShuffle();
      } else if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.metaKey) {
        player.cycleRepeat();
      } else if (e.key.toLowerCase() === 'f') {
        void toggleFullscreen();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isFullscreen, player, toggleFullscreen]);

  const sidebarContent = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg border border-gold/25 bg-jade/30 text-gold-bright">
            <Music2 className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold tracking-wide text-parchment">Music Corner</p>
            <p className="text-[0.6rem] uppercase tracking-[0.22em] text-anemo/80">A Yaksha&apos;s Sanctuary</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setSidebarOpen(false);
            setMobileDrawerOpen(false);
          }}
          className="rounded-md p-1.5 text-silver/70 transition-colors hover:bg-white/5 hover:text-parchment lg:hidden"
          aria-label="Close playlist"
        >
          <ChevronLeft className="size-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2 [scrollbar-width:thin]">
        <p className="px-2 pb-1 pt-2 text-[0.58rem] uppercase tracking-[0.28em] text-silver/55">Playlist</p>
        <ul className="space-y-0.5" aria-label="Playlist">
          {PLAYLIST.map((t, i) => {
            const isActive = i === player.index;
            const isPlaying = isActive && player.playing;
            return (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => {
                    player.select(i);
                    setMobileDrawerOpen(false);
                  }}
                  aria-current={isActive ? 'true' : undefined}
                  className={cn(
                    'group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-all',
                    isActive
                      ? 'bg-anemo/12 text-parchment shadow-[inset_0_0_0_1px_rgba(70,199,178,0.22),0_0_24px_-10px_rgba(70,199,178,0.35)]'
                      : 'text-silver/85 hover:bg-white/5 hover:text-parchment',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-6 shrink-0 items-center justify-center rounded-md border text-[0.65rem] transition-colors',
                      isActive
                        ? 'border-anemo/40 bg-anemo/15 text-anemo'
                        : 'border-white/10 bg-white/[0.03] text-silver/60 group-hover:border-gold/25 group-hover:text-gold-bright',
                    )}
                    aria-hidden="true"
                  >
                    {isPlaying ? <PlayingBars reducedMotion={reducedMotion} /> : isActive ? <Pause className="size-3" /> : <Play className="ml-0.5 size-3" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn('block truncate text-[0.8rem] leading-snug', isActive && 'font-medium text-parchment')}>
                      {t.title}
                    </span>
                  </span>
                  {isActive && <span className="size-1.5 shrink-0 rounded-full bg-anemo shadow-[0_0_8px_rgba(70,199,178,0.8)]" />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="border-t border-white/10 px-4 py-3 text-[0.58rem] uppercase tracking-[0.2em] text-silver/45">
        {PLAYLIST.length} tracks · {player.shuffle ? 'Shuffle on' : 'In order'}
      </div>
    </div>
  );

  return (
    <section
      ref={sectionRef}
      id="music"
      aria-labelledby="music-title"
      className={cn(
        'relative isolate w-full bg-midnight',
        isFullscreen ? 'h-screen min-h-0 overflow-hidden' : 'min-h-[100svh] overflow-hidden',
      )}
    >
      {/* ── Background: live wallpaper placeholder + dynamic artwork (crossfade) ── */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Live wallpaper base (public/images/xiao/music-player-bg.jpeg) */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url("${MUSIC_PLAYER_WALLPAPER}")`,
          }}
          aria-hidden="true"
        />
        {/* Dynamic song artwork crossfade layers (kept subtle so wallpaper stays clear) */}
        <div
          className={cn(
            'absolute inset-0 bg-cover bg-center transition-opacity duration-[1400ms] ease-out will-change-[opacity]',
            reducedMotion ? 'duration-0' : '',
          )}
          style={{
            backgroundImage: `url("${artA}")`,
            opacity: showA ? 0 : 0,
          }}
          aria-hidden="true"
        />
        <div
          className={cn(
            'absolute inset-0 bg-cover bg-center transition-opacity duration-[1400ms] ease-out will-change-[opacity]',
            reducedMotion ? 'duration-0' : '',
          )}
          style={{
            backgroundImage: `url("${artB}")`,
            opacity: 0,
          }}
          aria-hidden="true"
        />
        {/* Readability overlays removed to keep music-player-bg clearly visible */}
      </div>

      {/* ── Ambient particles (subtle, atmospheric) ─────────────── */}
      {!reducedMotion && (
        <div className="pointer-events-none absolute inset-0 -z-[5] overflow-hidden" aria-hidden="true">
          {Array.from({ length: 14 }).map((_, i) => (
            <span
              key={`${i}-${artLoadedKey}`}
              className="absolute rounded-full bg-anemo/20"
              style={{
                left: `${(i * 7.3) % 100}%`,
                bottom: '-8%',
                width: `${2 + (i % 3)}px`,
                height: `${2 + (i % 3)}px`,
                opacity: 0.35,
                animation: `float-y ${9 + (i % 5) * 2}s ease-in-out ${i * 0.4}s infinite`,
                filter: 'blur(0.5px)',
              }}
            />
          ))}
        </div>
      )}

      <div className={cn('relative flex w-full', isFullscreen ? 'h-full min-h-0' : 'min-h-[100svh]')}>
        {/* ── Desktop sidebar ───────────────────────────────────── */}
        <aside
          className={cn(
            'relative z-30 hidden h-full min-h-0 shrink-0 border-r border-white/10 bg-midnight/40 backdrop-blur-xl transition-[width,opacity] duration-300 lg:block',
            sidebarOpen ? 'w-[280px] opacity-100 xl:w-[320px]' : 'w-0 overflow-hidden border-r-0 opacity-0',
          )}
          aria-label="Playlist sidebar"
        >
          <div className={cn('h-full min-h-0', sidebarOpen ? 'min-w-[280px] xl:min-w-[320px]' : 'min-w-0')}>{sidebarContent}</div>
        </aside>

        {/* Sidebar toggle (desktop) */}
        <button
          type="button"
          onClick={() => setSidebarOpen((v) => !v)}
          className={cn(
            'absolute top-1/2 z-[35] hidden -translate-y-1/2 items-center justify-center rounded-r-lg border border-l-0 border-white/10 bg-midnight/55 py-3 pl-0.5 pr-1 text-silver/80 backdrop-blur-md transition-all hover:bg-midnight/70 hover:text-parchment lg:flex',
            sidebarOpen ? 'left-[280px] xl:left-[320px]' : 'left-0',
          )}
          aria-label={sidebarOpen ? 'Collapse playlist' : 'Expand playlist'}
          aria-expanded={sidebarOpen}
        >
          {sidebarOpen ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
        </button>

        {/* ── Mobile drawer toggle ──────────────────────────────── */}
        <button
          type="button"
          onClick={() => setMobileDrawerOpen(true)}
          className="absolute left-4 top-4 z-[35] flex items-center gap-2 rounded-full border border-white/10 bg-midnight/45 px-3 py-2 text-xs text-parchment backdrop-blur-md lg:hidden"
          aria-label="Open playlist"
        >
          <ListMusic className="size-4 text-anemo" />
          <span className="uppercase tracking-[0.18em]">Playlist</span>
        </button>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileDrawerOpen && (
            <>
              <motion.button
                type="button"
                aria-label="Close playlist"
                className="fixed inset-0 z-[70] bg-black/55 backdrop-blur-[2px] lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileDrawerOpen(false)}
              />
              <motion.aside
                className="fixed inset-y-0 left-0 z-[80] w-[min(86vw,320px)] border-r border-white/10 bg-midnight/85 backdrop-blur-2xl lg:hidden"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                aria-label="Playlist drawer"
              >
                {sidebarContent}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ── Main cinematic area ───────────────────────────────── */}
        <div className={cn('relative flex min-w-0 flex-1 flex-col', isFullscreen ? 'h-full min-h-0 overflow-hidden' : 'min-h-[100svh]')}>
          {/* Top bar actions */}
          <div className="absolute right-4 top-4 z-[40] flex items-center gap-2">
            <button
              type="button"
              onClick={toggleFullscreen}
              className="rounded-full border border-white/10 bg-midnight/35 p-2.5 text-silver/80 backdrop-blur-md transition-colors hover:bg-midnight/55 hover:text-parchment"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              title={isFullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
            >
              {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </button>
          </div>

          {/* Center content */}
          <div className={cn('flex min-h-0 flex-1 flex-col items-center justify-center px-5 text-center sm:px-10', isFullscreen ? 'pb-40 pt-16 sm:pb-44' : 'pb-44 pt-20 sm:pb-48 lg:pb-44')}>
            <AnimatePresence mode="wait">
              <motion.div
                key={player.track.id}
                initial={reducedMotion ? false : { opacity: 0, y: 14, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -8, filter: 'blur(4px)' }}
                transition={{ duration: reducedMotion ? 0.01 : 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="mx-auto flex w-full max-w-4xl flex-col items-center"
              >
                <p className="mb-3 text-[0.62rem] uppercase tracking-[0.38em] text-anemo/85">
                  {player.playing ? 'Now playing' : 'Selected'}
                </p>
                <h2
                  id="music-title"
                  className="font-display text-[clamp(1.9rem,4.6vw,3.9rem)] font-semibold leading-[1.06] tracking-tight text-parchment drop-shadow-[0_10px_40px_rgba(0,0,0,0.55)] [text-wrap:balance]"
                >
                  {player.track.title}
                </h2>
                <p className="mt-3 text-sm italic text-silver/85 sm:text-base">{player.track.artist}</p>

                {/* Subtle visualizer */}
                <div className="mt-8 flex items-end justify-center gap-[3px]" aria-hidden="true">
                  {Array.from({ length: 18 }).map((_, i) => (
                    <span
                      key={i}
                      className="w-[3px] origin-bottom rounded-full"
                      style={{
                        height: `${10 + ((i * 7) % 16)}px`,
                        background: `linear-gradient(180deg, rgba(232,205,146,0.85), ${accent}cc)`,
                        opacity: player.playing ? 0.95 : 0.28,
                        transform: player.playing && !reducedMotion ? `scaleY(${0.35 + ((i % 5) * 0.18)})` : 'scaleY(0.22)',
                        animation: player.playing && !reducedMotion ? `eq-bounce ${0.45 + (i % 4) * 0.12}s ease-in-out ${i * 0.04}s infinite` : 'none',
                      }}
                    />
                  ))}
                </div>

                {player.playbackError && (
                  <p role="status" className="mt-5 max-w-xl rounded-xl border border-gold/20 bg-midnight/45 px-4 py-2 text-xs text-gold-bright/90 backdrop-blur">
                    {player.playbackError}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Bottom floating controls (always pinned in view, incl. fullscreen) ── */}
          <div className={cn('pointer-events-none absolute inset-x-0 bottom-0 z-[40] flex justify-center px-3 pt-6 sm:px-6', isFullscreen ? 'pb-4 sm:pb-5' : 'pb-5 pt-8 sm:pb-7')} style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))' }}>
            <div className="pointer-events-auto w-full max-w-3xl rounded-2xl border border-white/10 bg-midnight/55 px-3 py-3 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl sm:px-5 sm:py-4">
              {/* Progress */}
              <div className="mb-3 flex items-center gap-2 text-[0.68rem] tabular-nums text-silver/75 sm:gap-3">
                <span className="w-9 shrink-0 text-left">{formatTime(player.currentTime)}</span>
                <div
                  ref={progressRef}
                  role="slider"
                  aria-label="Seek"
                  aria-valuemin={0}
                  aria-valuemax={Math.max(0, Math.floor(player.duration || 0))}
                  aria-valuenow={Math.floor(player.currentTime || 0)}
                  tabIndex={0}
                  className="group/seek relative flex h-8 min-w-0 flex-1 cursor-pointer touch-none select-none items-center px-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-anemo/40"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    seekFromEvent(e.clientX);
                  }}
                  onMouseMove={(e) => {
                    if (e.buttons !== 1) return;
                    seekFromEvent(e.clientX);
                  }}
                  onTouchStart={(e) => seekFromEvent(e.touches[0].clientX)}
                  onTouchMove={(e) => seekFromEvent(e.touches[0].clientX)}
                  onKeyDown={(e) => {
                    if (player.duration <= 0) return;
                    if (e.key === 'ArrowLeft') {
                      e.stopPropagation();
                      player.seekTo(Math.max(0, player.currentTime - 5));
                    }
                    if (e.key === 'ArrowRight') {
                      e.stopPropagation();
                      player.seekTo(Math.min(player.duration, player.currentTime + 5));
                    }
                  }}
                >
                  <div className="pointer-events-none relative h-1.5 w-full overflow-visible rounded-full bg-white/12 transition-[height] group-hover/seek:h-2">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full shadow-[0_0_14px_-2px_rgba(70,199,178,0.55)]"
                      style={{
                        width: `${progressPct}%`,
                        background: `linear-gradient(90deg, rgba(70,199,178,0.95), rgba(232,205,146,0.75))`,
                      }}
                    />
                    <div
                      className="absolute top-1/2 size-3.5 -translate-y-1/2 rounded-full border border-gold/50 bg-parchment opacity-0 shadow-[0_0_12px_rgba(201,164,92,0.5)] transition-opacity group-hover/seek:opacity-100"
                      style={{ left: `calc(${progressPct}% - 7px)` }}
                    />
                  </div>
                </div>
                <span className="w-9 shrink-0 text-right">{formatTime(player.duration || 0)}</span>
              </div>

              {/* Transport + extras */}
              <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <IconButton
                    onClick={player.toggleShuffle}
                    label={player.shuffle ? 'Shuffle on' : 'Shuffle off'}
                    active={player.shuffle}
                    title="Shuffle (S)"
                  >
                    <Shuffle className="size-4" />
                  </IconButton>
                  <IconButton onClick={player.previous} label="Previous" title="Previous (P)">
                    <SkipBack className="size-4" />
                  </IconButton>
                  <button
                    type="button"
                    onClick={player.togglePlay}
                    aria-label={player.playing ? 'Pause' : 'Play'}
                    className="mx-0.5 flex size-11 items-center justify-center rounded-full border border-gold/45 bg-gold/12 text-gold-bright shadow-[0_0_28px_-8px_rgba(201,164,92,0.55)] transition-all hover:scale-[1.03] hover:border-gold/70 hover:bg-gold/18 active:scale-95 sm:size-12"
                    title="Play/Pause (Space)"
                  >
                    {player.playing ? <Pause className="size-5" /> : <Play className="ml-0.5 size-5" />}
                  </button>
                  <IconButton onClick={player.next} label="Next" title="Next (N)">
                    <SkipForward className="size-4" />
                  </IconButton>
                  <IconButton
                    onClick={player.cycleRepeat}
                    label={player.repeat === 'off' ? 'Repeat off' : player.repeat === 'all' ? 'Repeat all' : 'Repeat one'}
                    active={player.repeat !== 'off'}
                    title="Repeat (R)"
                  >
                    {player.repeat === 'one' ? <Repeat1 className="size-4" /> : <Repeat className="size-4" />}
                  </IconButton>
                </div>

                <div className="flex min-w-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={player.toggleMute}
                    className="rounded-full p-2 text-silver/80 transition-colors hover:bg-white/5 hover:text-parchment"
                    aria-label={player.muted ? 'Unmute' : 'Mute'}
                    title="Mute (M)"
                  >
                    {player.muted || player.volume === 0 ? (
                      <VolumeX className="size-4" />
                    ) : player.volume < 0.5 ? (
                      <Volume1 className="size-4" />
                    ) : (
                      <Volume2 className="size-4" />
                    )}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round((player.muted ? 0 : player.volume) * 100)}
                    onChange={(e) => {
                      const v = Number(e.target.value) / 100;
                      player.setVolume(v);
                    }}
                    aria-label="Volume"
                    className="h-1.5 w-20 cursor-pointer accent-anemo sm:w-28"
                    title="Volume (↑/↓)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function IconButton({
  onClick,
  label,
  active,
  title,
  children,
}: {
  onClick: () => void;
  label: string;
  active?: boolean;
  title?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={title ?? label}
      className={cn(
        'rounded-full p-2 transition-colors',
        active
          ? 'bg-anemo/15 text-anemo shadow-[0_0_16px_-6px_rgba(70,199,178,0.7)]'
          : 'text-silver/80 hover:bg-white/5 hover:text-parchment',
      )}
    >
      {children}
    </button>
  );
}

function PlayingBars({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <span className="flex items-end gap-[2px]" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-[2px] rounded-full bg-anemo"
          style={{
            height: '10px',
            transformOrigin: 'bottom',
            animation: reducedMotion ? 'none' : `eq-bounce ${0.4 + i * 0.1}s ease-in-out ${i * 0.08}s infinite`,
            opacity: reducedMotion ? 0.7 : 1,
          }}
        />
      ))}
    </span>
  );
}
