export interface GameType {
  id: number;
  type: string;
}

export interface GameStatus {
  id: number;
  status: string;
}

export interface GamePlatform {
  id: number;
  name: string;
  abbreviation: string;
  generation: number;
}

export interface GameGenre {
  id: number;
  name: string;
  slug: string;
}

export interface GameRegion {
  id: number;
  region: string;
}

export interface GameReleaseDate {
  date: string;
  date_format: { format: string };
  platform: GamePlatform;
  release_region: GameRegion;
  status: { name: string; description: string };
}

export interface GameKeyword {
  id: number;
  name: string;
}

export interface GameTheme {
  id: number;
  name: string;
}

export interface IGDBGame {
  id: number;
  name: string;
  game_status: GameStatus;
  game_type: GameType;
  release_dates: GameReleaseDate[];
  parent_game: number;
  platforms: GamePlatform[];
  genres: GameGenre[];
  hypes: number; // Number of follows a game gets before release
  created_at: number;
  first_release_date: number;
  keywords: GameKeyword[];
  similar_games: number[];
  slug: string;
  storyline: string;
  summary: string;
  themes: GameTheme[];
  updated_at: number;
}

export interface VectorDBGame {
  // Primary key (auto-generated)
  id?: number;

  // Required fields
  igdb_game_id: number;
  name: string;
  game_description: string;
  game_description_embedding: number[];

  // Optional fields
  first_release_date?: number;
  genre_ids?: number[];
  platform_ids?: number[];
  region_ids?: number[];
  similar_games_ids?: number[];

  // Metadata timestamps
  created_at?: number;
  updated_at?: number;
}
