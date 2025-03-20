import { OpenAI } from '@langchain/openai';
import { ChatOpenAI } from '@langchain/openai';
import * as dotenv from 'dotenv';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { IDGBService } from './services/igdb.service';
import { DataType, MilvusClient } from '@zilliz/milvus2-sdk-node';
import { VectorDbService } from './services/vectorDB.service';
import { GAME_VECTOR_DIMENSION } from './services/VectorDBCollections/games.collection';
import { ConvertorService } from './services/convertor.service';

// Load environment variables
dotenv.config();
const igdbService = IDGBService.getInstance();
const vdbService = VectorDbService.getInstance();

const chatOpenAI = async () => {
  console.log('Starting test app... using GPT-4o');
  const model = new ChatOpenAI({ model: 'gpt-4o' });
  const messages = [
    new SystemMessage('Translate the following from English into Italian'),
    new HumanMessage('Have a good day'),
  ];
  console.log('System message: ', messages[0].content);
  console.log('Human message: ', messages[1].content);
  const res = await model.invoke(messages);
  console.log('Result is: ', res.content);
};

const igdbQuery = async () => {
  // const gameTypes = await igdbService.gameTypes();
  // const gameStatuses = await igdbService.gameStatuses();
  // const gameThemes = await igdbService.gameThemes();
  // console.log(gameThemes);
  // const gameGenres = await igdbService.gameGenres();
  // console.log(gameGenres);
  const gamesForEmbedding = await igdbService.gamesForEmbedding();
  console.log(JSON.stringify(gamesForEmbedding, null, '\t'));
  console.log('Converted Games: ');
  console.log(
    await ConvertorService.convertIGDBGameToVectorDBGame(gamesForEmbedding[0])
  );
};

const insertGameToVectorDB = async () => {
  await vdbService.insertGameRecord({
    created_at: Date.now(),
    updated_at: Date.now(),
    igdb_game_id: 123456,
    name: 'The Legend of Zelda: Breath of the Wild',
    game_description:
      'Step into a world of discovery, exploration, and adventure in The Legend of Zelda: Breath of the Wild.',
    game_description_embedding: new Array(GAME_VECTOR_DIMENSION).fill(0.1), // Replace with actual embedding
    first_release_date: 1488499200000, // March 3, 2017
    genre_ids: [5, 31, 12], // Example genre IDs
    platform_ids: [41, 130], // Example platform IDs
    region_ids: [1, 2, 3], // Example region IDs
    similar_games_ids: [1881, 7346, 26226], // Example similar game IDs
  });
};

const getGamesFromVectorDB = async () => {
  try {
    const records = await vdbService.getAllRecordsFromGamesCollection();
    console.log(`Games in collection:`);
    console.table(records);
  } catch (error) {
    console.log(`Failed to get Games in collection: ${error}`);
  }
};

async function main() {
  igdbQuery();
  // await insertGameToVectorDB();
  // await vdbService.deleteGameById(123456);
  // await getGamesFromVectorDB();
  await dispose();
}

async function dispose() {
  console.log('Disposing app...');
  await vdbService.dispose();
}

process.on('SIGTERM', async () => {
  await dispose();
  process.exit(0);
});

main().catch(console.error);
