import { OpenAIEmbeddings } from '@langchain/openai';
import { IGDBGame, VectorDBGame } from '../model/games.model';

export class ConvertorService {
  public static async convertIGDBGameToVectorDBGame(
    igdbGame: IGDBGame
  ): Promise<VectorDBGame> {
    let gameDescriptionToEmbedParts = [];
    gameDescriptionToEmbedParts.push(`Game Name: ${igdbGame.name}`);
    if (igdbGame.summary) {
      gameDescriptionToEmbedParts.push(`Game Summary: ${igdbGame.summary}`);
    }
    if (igdbGame.storyline) {
      gameDescriptionToEmbedParts.push(`Game Storyline: ${igdbGame.storyline}`);
    }
    if (igdbGame.keywords && igdbGame.keywords.length > 0) {
      gameDescriptionToEmbedParts.push(
        `Game Keywords: ${igdbGame.keywords
          .map((keyword) => keyword.name)
          .join(',')}`
      );
    }
    if (igdbGame.themes && igdbGame.themes.length > 0) {
      gameDescriptionToEmbedParts.push(
        `Game Themes: ${igdbGame.themes.map((theme) => theme.name).join(',')}`
      );
    }
    const gameDescriptionToEmbed = gameDescriptionToEmbedParts.join('\n');

    const embeddings = new OpenAIEmbeddings({
      modelName: 'text-embedding-3-small',
    });

    const gameDescriptionToEmbedded = [0];
    // const gameDescriptionToEmbedded = await embeddings.embedQuery(
    //   gameDescriptionToEmbed
    // );

    const vectorGame: VectorDBGame = {
      igdb_game_id: igdbGame.id,
      name: igdbGame.name,
      created_at: igdbGame.created_at,
      updated_at: igdbGame.updated_at,
      first_release_date: igdbGame.first_release_date,
      game_description: gameDescriptionToEmbed,
      game_description_embedding: gameDescriptionToEmbedded,
      genre_ids: igdbGame.genres.map((genre) => genre.id),
      platform_ids: igdbGame.platforms.map((platform) => platform.id),
      region_ids: igdbGame.release_dates.map(
        (release_dates) => release_dates.release_region.id
      ),
      similar_games_ids: igdbGame.similar_games,
    };

    return vectorGame;
  }
}
