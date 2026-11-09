export interface Track {
  id: string;
  title: string;
  artist: string;
  /** Primary artwork URL for this track (album cover). Used as the cinematic background. */
  coverUrl: string;
  /** Optional higher-quality/alternate artwork; falls back to coverUrl. */
  artworkUrl?: string;
  sourceId: string;
}

const AUDIO_FILES = [
  '[Nhạc_Trung]_Đêm_Đom_đóm_và_Em_(Bản_0.9x)_-_AniFace_夜，萤火虫和你_-_AniFace.mp3',
  'Before_spring_ends.mp3',
  'Chàng_Trai_Bất_Tử.mp3',
  'Columbina_Leitmotif_Battle_Theme_(V1)_Genshin_Impact_6.3_OST.mp3',
  'Columbina_Leitmotif_Battle_Theme_(V4)_Genshin_Impact_6.3_OST.mp3',
  "Columbina's_Lullaby_Genshin_Impact_Ver._6.0_Luna_I_OST.mp3",
  'Genshin_Impact_OST_-_Northland_Bank_(Slowed).mp3',
  'golden_hour_(Piano_Instrumental).mp3',
  "Guhua's_Legacy.mp3",
  'HEAVENLY_JUMPSTYLE_(Slowed).mp3',
  'Infinite_Cosmodynamics.mp3',
  'Into_the_Yonder_and_Water.mp3',
  'Jade_Chimes.mp3',
  'JAWNY_-_Honeypie_Animation_MV_(Full_Version_by_SeanWay_Studio)_animation_@JAWNY.mp3',
  "Lovers'_Oath.mp3",
  'Mountainborn_Gale.mp3',
  "Night's_Whispering_Breath.mp3",
  'Nod-Krai_Main_Theme_Live_Performance_Genshin_Impact_GenshinImpact_NodKrai.mp3',
  'Spider_Thread_Monopoly_ー_Sasakure_K_Instrumental.mp3',
  "Varka_Demo_Theme,_with_Tentative_Lyrics_(The_Northerly_Wind's_Return_The_Code_of_Chivalry).mp3",
  "Xuanlian's_Wavering_Light.mp3",
  "young_and_beautiful_but_you're_in_a_ballroom_(sped_up).mp3",
  "💧_Fontaine_⚖️_-_Nymphs'_Tea_Party_(ft._Traveler)_[原神_Genshin_Impact_Music_+_Exploration].mp3",
  '楽音_(Sasane)_-_Mosi_Mosi_(Lyrics).mp3',
];

/** Cinematic live wallpaper placeholder for the Music Corner background. */
export const MUSIC_PLAYER_WALLPAPER = '/images/xiao/music-player-bg.jpeg';
/** Fallback artwork used when a track has no dedicated cover. */
export const DEFAULT_ARTWORK = MUSIC_PLAYER_WALLPAPER;
/** Secondary fallback (richer texture) if the primary fails to load. */
export const FALLBACK_ARTWORK = '/images/decorations/CD-img.jpeg';

/** Resolve the best artwork URL for a track. */
export function getTrackArtwork(track: Track): string {
  return track.artworkUrl || track.coverUrl || DEFAULT_ARTWORK;
}

/** Simple deterministic hue accent per track for atmospheric fallback styling. */
export function getTrackAccent(index: number): string {
  // Jade/teal/gold-biased hues for Xiao aesthetic
  const hues = [168, 162, 175, 155, 182, 170, 160, 45, 165, 190, 172, 158, 178, 150, 166, 174, 163, 180, 168, 176, 164, 152, 170, 185];
  return `hsl(${hues[index % hues.length]} 45% 42%)`;
}

export const PLAYLIST: Track[] = AUDIO_FILES.map((fileName) => ({
  id: fileName,
  title: fileName.replace(/\.mp3$/i, '').replace(/_/g, ' '),
  artist: 'Music Room playlist',
  coverUrl: DEFAULT_ARTWORK,
  sourceId: `/music/${encodeURIComponent(fileName)}`,
}));
