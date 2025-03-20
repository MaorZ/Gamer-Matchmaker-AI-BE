import {
  and,
  BuilderOperator,
  BuilderOperatorNarrow,
  fields,
  limit,
  or,
  request,
  sort,
  where,
} from 'ts-apicalypse';
import {
  GameGenre,
  GameStatus,
  GameTheme,
  GameType,
  IGDBGame,
} from '../model/games.model';

type apiCalypsePipeOperator<T> =
  | BuilderOperator<T, T>
  | BuilderOperatorNarrow<T, unknown>;

export class IDGBService {
  private static instance: IDGBService;
  private twitchAppAccessToken: string;
  private twitchClientId: string;
  private igdbBaseUrl: string;

  private constructor() {
    this.twitchAppAccessToken = process.env.TWITCH_APP_ACCESS_TOKEN!;
    this.twitchClientId = process.env.TWITCH_CLIENT_ID!;
    this.igdbBaseUrl = process.env.IGDB_BASE_URL!;
  }

  public static getInstance(): IDGBService {
    if (!IDGBService.instance) {
      IDGBService.instance = new IDGBService();
    }
    return IDGBService.instance;
  }

  private async igdbRequest<T extends object>(
    apiPath: string,
    calypsePipeOperators: apiCalypsePipeOperator<T>[]
  ): Promise<T[]> {
    try {
      const calypseReq = request<T>().pipe(...calypsePipeOperators);
      console.log(`Calypse Request: ${calypseReq.toApicalypseString()}`);
      const res = await calypseReq.execute(`${this.igdbBaseUrl}/${apiPath}`, {
        headers: {
          Accept: 'application/json',
          'Client-ID': this.twitchClientId,
          Authorization: `Bearer ${this.twitchAppAccessToken}`,
        },
      });

      return res.data as T[];
    } catch (error) {
      // Handle or rethrow error
      console.error('API request failed:', error);
      throw error;
    }
  }

  public async gamesForEmbedding(): Promise<IGDBGame[]> {
    return this.igdbRequest<IGDBGame>('games', [
      fields([
        'id',
        'name',
        'game_status.status',
        'game_type.type',
        'platforms.name',
        'genres.name',
        'release_dates.platform.name',
        'release_dates.release_region.region',
        'created_at',
        'updated_at',
        'first_release_date',
        'similar_games',
        'storyline',
        'summary',
        'keywords.name',
        'themes.name',
      ]),
      sort('created_at'),
      and(
        // Need to be Released
        or(
          // or: have status of Released/Alpha/Beta/Early Access
          or(
            where('game_status', '=', 0), // Released
            where('game_status', '=', 2), // Alpha
            where('game_status', '=', 3), // Beta
            where('game_status', '=', 4) // Early Access
          ),
          // or: have atlast one releases for one region or platform
          or(and(where('release_dates', '!=', null)))
        ),
        // Need to be of type Main Game/Remake/Remaster
        or(
          where('game_type', '=', 0), // Main Game
          where('game_type', '=', 8), // Remake
          where('game_type', '=', 9) // Remaster
        )
      ),
      limit(1),
    ]);
  }

  public async gameStatuses(): Promise<GameStatus[]> {
    return this.igdbRequest<GameStatus>('game_statuses', [
      fields(['id', 'status']),
      limit(100),
    ]);
  }

  public async gameTypes(): Promise<GameType[]> {
    return this.igdbRequest<GameType>('game_types', [
      fields(['id', 'type']),
      limit(100),
    ]);
  }

  public async gameGenres(): Promise<GameGenre[]> {
    return this.igdbRequest<GameGenre>('genres', [
      fields(['id', 'name']),
      limit(100),
    ]);
  }

  public async gameThemes(): Promise<GameTheme[]> {
    return this.igdbRequest<GameTheme>('themes', [
      fields(['id', 'name']),
      limit(100),
    ]);
  }
}
