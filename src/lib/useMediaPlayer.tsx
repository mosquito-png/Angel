import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Play, Volume2, VolumeX } from 'lucide-react';
import { PLAYLIST, type Track } from '@/lib/playlist';

const IDLE_TRACK = '/music/idle-music/xiao-BGM.mp3';
const WISH_TRACK = '/music/golden_hour_%28Piano_Instrumental%29.mp3';
const WISH_START_AT = 34;

export type RepeatMode = 'off' | 'all' | 'one';

export interface MediaPlayer {
  track: Track;
  index: number;
  playing: boolean;
  volume: number;
  muted: boolean;
  currentTime: number;
  duration: number;
  playbackError: string | null;
  backgroundMuted: boolean;
  backgroundStatus: 'loading' | 'playing' | 'paused' | 'muted' | 'blocked' | 'error';
  backgroundError: string | null;
  shuffle: boolean;
  repeat: RepeatMode;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  select: (index: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  seekTo: (time: number) => void;
  toggleBackgroundMute: () => void;
  playWishBackground: () => void;
  restoreDefaultBackground: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
}

const MediaPlayerContext = createContext<MediaPlayer | null>(null);

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isAutoplayBlocked(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'NotAllowedError';
}

function pickRandomIndex(length: number, exclude: number): number {
  if (length <= 1) return 0;
  let next = exclude;
  while (next === exclude) next = Math.floor(Math.random() * length);
  return next;
}

export function MusicPlayerProvider({ children }: { children: ReactNode }) {
  const backgroundAudioRef = useRef<HTMLAudioElement>(null);
  const playlistAudioRef = useRef<HTMLAudioElement>(null);
  const backgroundRequestRef = useRef(0);
  const playlistRequestRef = useRef(0);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.7);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [backgroundMuted, setBackgroundMuted] = useState(false);
  const [backgroundStatus, setBackgroundStatus] = useState<MediaPlayer['backgroundStatus']>('loading');
  const [backgroundError, setBackgroundError] = useState<string | null>(null);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>('off');
  const backgroundLoopFromRef = useRef<number | null>(null);

  const startBackground = useCallback(() => {
    const audio = backgroundAudioRef.current;
    if (!audio || playing || backgroundMuted) return;

    const request = ++backgroundRequestRef.current;
    audio.muted = false;
    setBackgroundStatus('loading');
    void audio.play().then(
      () => {
        if (request === backgroundRequestRef.current) {
          setBackgroundStatus('playing');
          setBackgroundError(null);
        }
      },
      (error: unknown) => {
        if (request !== backgroundRequestRef.current) return;
        if (isAutoplayBlocked(error)) {
          setBackgroundStatus('blocked');
          setBackgroundError(null);
          return;
        }
        setBackgroundStatus('error');
        setBackgroundError(`Background music could not play: ${getErrorMessage(error)}`);
      },
    );
  }, [backgroundMuted, playing]);

  const playTrack = useCallback(
    (trackIndex: number) => {
      const audio = playlistAudioRef.current;
      const track = PLAYLIST[trackIndex];
      if (!audio || !track) return;

      ++backgroundRequestRef.current;
      backgroundAudioRef.current?.pause();
      setBackgroundStatus('paused');
      setPlaybackError(null);
      setIndex(trackIndex);
      setCurrentTime(0);
      setDuration(0);

      const request = ++playlistRequestRef.current;
      audio.pause();
      audio.src = track.sourceId;
      audio.load();
      audio.volume = muted ? 0 : volume;
      audio.muted = muted;
      setPlaying(true);

      void audio.play().then(
        () => {
          if (request === playlistRequestRef.current) setPlaybackError(null);
        },
        (error: unknown) => {
          if (request !== playlistRequestRef.current) return;
          setPlaying(false);
          setPlaybackError(`Could not play "${track.title}": ${getErrorMessage(error)}`);
        },
      );
    },
    [muted, volume],
  );

  const togglePlay = useCallback(() => {
    const audio = playlistAudioRef.current;
    if (playing) {
      ++playlistRequestRef.current;
      audio?.pause();
      setPlaying(false);
      return;
    }
    playTrack(index);
  }, [index, playTrack, playing]);

  const select = useCallback(
    (trackIndex: number) => {
      const boundedIndex = Math.max(0, Math.min(trackIndex, PLAYLIST.length - 1));
      playTrack(boundedIndex);
    },
    [playTrack],
  );

  const next = useCallback(() => {
    if (shuffle) {
      select(pickRandomIndex(PLAYLIST.length, index));
      return;
    }
    select((index + 1) % PLAYLIST.length);
  }, [index, select, shuffle]);

  const previous = useCallback(() => {
    // If we're a few seconds in, restart the track (common UX)
    const audio = playlistAudioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    if (shuffle) {
      select(pickRandomIndex(PLAYLIST.length, index));
      return;
    }
    select((index - 1 + PLAYLIST.length) % PLAYLIST.length);
  }, [index, select, shuffle]);

  const toggleMute = useCallback(() => setMuted((m) => !m), []);
  const setVolume = useCallback((value: number) => {
    const boundedVolume = Math.max(0, Math.min(1, value));
    setVolumeState(boundedVolume);
    if (boundedVolume > 0) setMuted(false);
  }, []);
  const seekTo = useCallback((time: number) => {
    const audio = playlistAudioRef.current;
    if (audio && Number.isFinite(time)) {
      audio.currentTime = Math.max(0, Math.min(time, audio.duration || 0));
    }
  }, []);
  const toggleBackgroundMute = useCallback(() => {
    const audio = backgroundAudioRef.current;
    if (!backgroundMuted && (backgroundStatus === 'blocked' || backgroundStatus === 'error')) {
      setBackgroundError(null);
      startBackground();
      return;
    }

    const nextMuted = !backgroundMuted;
    if (audio) audio.muted = nextMuted;
    setBackgroundMuted(nextMuted);
  }, [backgroundMuted, backgroundStatus, startBackground]);

  const toggleShuffle = useCallback(() => setShuffle((s) => !s), []);
  const cycleRepeat = useCallback(() => {
    setRepeat((r) => (r === 'off' ? 'all' : r === 'all' ? 'one' : 'off'));
  }, []);

  const restoreDefaultBackground = useCallback(() => {
    const bg = backgroundAudioRef.current;
    if (!bg) return;
    ++backgroundRequestRef.current;
    bg.pause();
    backgroundLoopFromRef.current = null;
    bg.loop = true;
    // Reset to the idle background track that plays on launch.
    if (bg.src !== new URL(IDLE_TRACK, window.location.origin).href) {
      bg.src = IDLE_TRACK;
      bg.load();
    } else {
      try {
        bg.currentTime = 0;
      } catch {
        /* ignore */
      }
    }
    setBackgroundError(null);
    if (backgroundMuted) {
      bg.muted = true;
      setBackgroundStatus('muted');
      return;
    }
    bg.muted = false;
    setBackgroundStatus('loading');
    const request = backgroundRequestRef.current;
    void bg.play().then(
      () => {
        if (request === backgroundRequestRef.current) {
          setBackgroundStatus('playing');
          setBackgroundError(null);
        }
      },
      (error: unknown) => {
        if (request !== backgroundRequestRef.current) return;
        if (isAutoplayBlocked(error)) {
          setBackgroundStatus('blocked');
          setBackgroundError(null);
          return;
        }
        setBackgroundStatus('error');
        setBackgroundError(`Background music could not play: ${getErrorMessage(error)}`);
      },
    );
  }, [backgroundMuted]);

  const playWishBackground = useCallback(() => {
    const bg = backgroundAudioRef.current;
    const pl = playlistAudioRef.current;
    // Stop playlist music and switch background to the wish track.
    ++playlistRequestRef.current;
    if (pl) {
      pl.pause();
      pl.removeAttribute('src');
      pl.load();
    }
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setPlaybackError(null);

    if (!bg) return;
    ++backgroundRequestRef.current;
    bg.pause();
    backgroundLoopFromRef.current = WISH_START_AT;
    // Disable native loop; we loop back to WISH_START_AT on end/timeupdate.
    bg.loop = false;
    bg.src = WISH_TRACK;
    bg.load();

    const applyStartAndPlay = () => {
      try {
        if (bg.currentTime < WISH_START_AT) bg.currentTime = WISH_START_AT;
      } catch {
        /* ignore */
      }
      // The wish is an explicit user action: unmute and play.
      setBackgroundMuted(false);
      bg.muted = false;
      setBackgroundStatus('loading');
      const request = backgroundRequestRef.current;
      void bg.play().then(
        () => {
          if (request === backgroundRequestRef.current) {
            setBackgroundStatus('playing');
            setBackgroundError(null);
          }
        },
        (error: unknown) => {
          if (request !== backgroundRequestRef.current) return;
          if (isAutoplayBlocked(error)) {
            setBackgroundStatus('blocked');
            setBackgroundError(null);
            return;
          }
          setBackgroundStatus('error');
          setBackgroundError(`Wish music could not play: ${getErrorMessage(error)}`);
        },
      );
    };

    if (bg.readyState >= 1) {
      applyStartAndPlay();
    } else {
      bg.addEventListener('loadedmetadata', applyStartAndPlay, { once: true });
    }
  }, [backgroundMuted]);

  useEffect(() => {
    const audio = backgroundAudioRef.current;
    if (!audio) return;
    audio.loop = true;
    audio.volume = 0.25;

    return () => {
      ++backgroundRequestRef.current;
      audio.pause();
    };
  }, []);

  useEffect(() => {
    const audio = backgroundAudioRef.current;
    if (!audio) return;

    if (playing) {
      ++backgroundRequestRef.current;
      audio.pause();
      setBackgroundStatus('paused');
    } else if (backgroundMuted) {
      audio.muted = true;
      setBackgroundStatus('muted');
    } else if (audio.paused) {
      startBackground();
    } else {
      setBackgroundStatus('playing');
    }
  }, [backgroundMuted, playing, startBackground]);

  useEffect(() => {
    const audio = playlistAudioRef.current;
    if (audio) {
      audio.volume = volume;
      audio.muted = muted;
    }
  }, [muted, volume]);

  const handleTrackEnded = useCallback(() => {
    const audio = playlistAudioRef.current;
    if (repeat === 'one' && audio) {
      audio.currentTime = 0;
      void audio.play().catch(() => setPlaying(false));
      return;
    }
    if (shuffle) {
      select(pickRandomIndex(PLAYLIST.length, index));
      return;
    }
    if (index < PLAYLIST.length - 1) {
      playTrack(index + 1);
      return;
    }
    if (repeat === 'all') {
      playTrack(0);
      return;
    }
    setPlaying(false);
  }, [index, playTrack, repeat, select, shuffle]);

  const player: MediaPlayer = useMemo(
    () => ({
      track: PLAYLIST[index],
      index,
      playing,
      volume,
      muted,
      currentTime,
      duration,
      playbackError,
      backgroundMuted,
      backgroundStatus,
      backgroundError,
      shuffle,
      repeat,
      togglePlay,
      next,
      previous,
      select,
      setVolume,
      toggleMute,
      seekTo,
      toggleBackgroundMute,
      playWishBackground,
      restoreDefaultBackground,
      toggleShuffle,
      cycleRepeat,
    }),
    [
      index,
      playing,
      volume,
      muted,
      currentTime,
      duration,
      playbackError,
      backgroundMuted,
      backgroundStatus,
      backgroundError,
      shuffle,
      repeat,
      togglePlay,
      next,
      previous,
      select,
      setVolume,
      toggleMute,
      seekTo,
      toggleBackgroundMute,
      playWishBackground,
      restoreDefaultBackground,
      toggleShuffle,
      cycleRepeat,
    ],
  );

  const backgroundButtonLabel =
    backgroundStatus === 'blocked'
      ? 'Enable background music'
      : backgroundStatus === 'error'
        ? 'Retry background music'
        : backgroundMuted
          ? 'Unmute background music'
          : 'Mute background music';
  const BackgroundIcon =
    backgroundStatus === 'blocked' || backgroundStatus === 'error'
      ? Play
      : backgroundMuted
        ? VolumeX
        : Volume2;

  const providerScreenReader =
    backgroundStatus === 'blocked'
      ? 'Background music is waiting for permission. Use the corner button to start it.'
      : backgroundError ?? '';

  return (
    <MediaPlayerContext.Provider value={player}>
      {children}
      <audio
        ref={backgroundAudioRef}
        src={IDLE_TRACK}
        loop
        preload="auto"
        onPlay={() => setBackgroundStatus(backgroundMuted ? 'muted' : 'playing')}
        onEnded={() => {
          const from = backgroundLoopFromRef.current;
          const audio = backgroundAudioRef.current;
          if (from != null && audio) {
            try {
              audio.currentTime = from;
              void audio.play().catch(() => {});
            } catch {
              /* ignore */
            }
          }
        }}
        onTimeUpdate={(event) => {
          const from = backgroundLoopFromRef.current;
          const audio = event.currentTarget;
          if (from != null && Number.isFinite(audio.duration) && audio.duration > 0) {
            // Safety: if native looping/end behaves unexpectedly, jump back to `from`.
            if (audio.currentTime >= audio.duration - 0.25) {
              audio.currentTime = from;
            }
          }
        }}
        onError={(event) => {
          if (event.currentTarget.error?.code === MediaError.MEDIA_ERR_ABORTED) return;
          const code = event.currentTarget.error?.code;
          const message = code ? `audio error ${code}` : 'the audio file could not be loaded';
          setBackgroundStatus('error');
          setBackgroundError(`Background music could not be loaded: ${message}.`);
        }}
      />
      <audio
        ref={playlistAudioRef}
        preload="none"
        aria-hidden="true"
        onPlay={() => setPlaying(true)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onEnded={handleTrackEnded}
        onError={() => {
          const track = PLAYLIST[index];
          setPlaying(false);
          setPlaybackError(`Could not load "${track.title}". Check that the MP3 file is available.`);
        }}
      />
      <button
        type="button"
        onClick={toggleBackgroundMute}
        aria-label={backgroundButtonLabel}
        aria-pressed={backgroundMuted}
        title={backgroundError ?? backgroundButtonLabel}
        className="fixed bottom-5 right-5 z-[60] flex size-12 items-center justify-center rounded-full border border-gold/50 bg-midnight/90 text-gold-bright shadow-lg backdrop-blur transition-colors hover:border-gold hover:bg-jade-deep"
      >
        <BackgroundIcon className="size-5" aria-hidden="true" />
      </button>
      <span className="sr-only" aria-live="polite">
        {providerScreenReader}
      </span>
    </MediaPlayerContext.Provider>
  );
}

export function useMediaPlayer(): MediaPlayer {
  const player = useContext(MediaPlayerContext);
  if (!player) throw new Error('useMediaPlayer must be used within MusicPlayerProvider');
  return player;
}
