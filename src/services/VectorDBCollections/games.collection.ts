import { DataType } from '@zilliz/milvus2-sdk-node';

export const GAME_COLLECTION_NAME = 'games';
export const GAME_VECTOR_DIMENSION = 1536; // Adjust based on your embedding model (e.g., 1536 for OpenAI text-embedding-ada-002)

export const collectionSchema = {
  collection_name: GAME_COLLECTION_NAME,
  description: 'Text documents with metadata and vector embeddings',
  fields: [
    {
      name: 'id',
      description: 'ID field',
      data_type: DataType.Int64,
      is_primary_key: true,
      autoID: true,
    },
    {
      name: 'igdb_game_id',
      description: 'External igdb game id',
      data_type: DataType.Int32,
      max_length: 100,
    },
    {
      name: 'name',
      description: 'Game name',
      data_type: DataType.VarChar,
      max_length: 255,
    },
    {
      name: 'created_at',
      description: 'Creation timestamp',
      data_type: DataType.Int64,
    },
    {
      name: 'updated_at',
      description: 'Updated timestamp',
      data_type: DataType.Int64,
    },
    {
      name: 'first_release_date',
      description: 'Game first release timestamp',
      data_type: DataType.Int64,
    },
    {
      name: 'genre_ids',
      description: 'Game genre IDs',
      data_type: DataType.Array,
      element_type: DataType.Int64,
      max_capacity: 100,
    },
    {
      name: 'platform_ids',
      description: 'Game platform IDs',
      data_type: DataType.Array,
      element_type: DataType.Int64,
      max_capacity: 100,
    },
    {
      name: 'region_ids',
      description: 'Game relesae regions IDs',
      data_type: DataType.Array,
      element_type: DataType.Int64,
      max_capacity: 100,
    },
    {
      name: 'similar_games_ids',
      description: 'Similar games IGDB IDs',
      data_type: DataType.Array,
      element_type: DataType.Int64,
      max_capacity: 100,
    },
    {
      name: 'game_description',
      description: 'Game description: summary, storyline, themes and keywords',
      data_type: DataType.VarChar,
      max_length: 65535,
    },
    {
      name: 'game_description_embedding',
      description: 'Game description embedding vector',
      data_type: DataType.FloatVector,
      dim: GAME_VECTOR_DIMENSION,
    },
  ],
};
