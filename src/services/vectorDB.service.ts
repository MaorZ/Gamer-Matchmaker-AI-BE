import {
  DataType,
  InsertReq,
  MilvusClient,
  RowData,
} from '@zilliz/milvus2-sdk-node';
import {
  collectionSchema,
  GAME_COLLECTION_NAME as GAMES_COLLECTION_NAME,
  GAME_VECTOR_DIMENSION,
} from './VectorDBCollections/games.collection';
import { VectorDBGame } from '../model/games.model';

export class VectorDbService {
  private static instance: VectorDbService;
  private connectionOpen = false;
  private milvusClient: MilvusClient;

  private constructor() {
    this.milvusClient = new MilvusClient({
      address: 'localhost:19530', // Change this if your Milvus is hosted elsewhere
      ssl: false, // Set to true if using SSL
    });
    this.connectionOpen = true;
  }

  public static getInstance(): VectorDbService {
    if (!VectorDbService.instance) {
      VectorDbService.instance = new VectorDbService();
    }
    return VectorDbService.instance;
  }

  public async dispose() {
    console.log('VectorDBService dispose...');
    if (this.connectionOpen) {
      console.log('VectorDBService Closing connection');
      await this.milvusClient.closeConnection();
    }
  }

  public async getAllCollections() {
    try {
      // List all collections
      const response = await this.milvusClient.listCollections();
      console.log(response);

      if (response.status.code !== 0) {
        throw new Error(
          `Failed to list collections: ${response.status.reason}`
        );
      }

      console.log('Successfully retrieved collections');
      console.log('------------------------------');
      console.log('Collections:');

      console.log(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  public async createGamesCollection(shouldOverrideExistingCollection = false) {
    try {
      // Collection parameters
      const METRIC_TYPE = 'COSINE'; // Other options: 'L2', 'IP' (Inner Product)
      const INDEX_TYPE = 'HNSW'; // Other options: 'IVF_FLAT', 'FLAT', etc.

      // Check if collection already exists
      const hasCollection = await this.milvusClient.hasCollection({
        collection_name: GAMES_COLLECTION_NAME,
      });

      if (hasCollection.status.code === 0 && hasCollection.value === true) {
        if (!shouldOverrideExistingCollection) {
          console.log(
            `Collection ${GAMES_COLLECTION_NAME} already exists. Stopping creation...`
          );
          return;
        }

        console.log(
          `Collection ${GAMES_COLLECTION_NAME} already exists. Dropping it to recreate...`
        );
        await this.milvusClient.dropCollection({
          collection_name: GAMES_COLLECTION_NAME,
        });
      }

      // Create collection
      const createResult = await this.milvusClient.createCollection(
        collectionSchema
      );
      console.log('Create collection result:', createResult);

      // Create index on vector field
      const indexParams = {
        collection_name: GAMES_COLLECTION_NAME,
        field_name: 'game_description_embedding',
        extra_params: {
          index_type: INDEX_TYPE,
          metric_type: METRIC_TYPE,
          params: JSON.stringify({
            M: 8, // Number of neighbors for HNSW (adjust as needed)
            efConstruction: 200, // Higher values give more accurate but slower indexing
          }),
        },
      };

      const indexResult = await this.milvusClient.createIndex(indexParams);
      console.log('Create index result:', indexResult);

      // Load collection into memory
      const loadResult = await this.milvusClient.loadCollection({
        collection_name: GAMES_COLLECTION_NAME,
      });
      console.log('Load collection result:', loadResult);

      console.log(
        `Collection ${GAMES_COLLECTION_NAME} created successfully with metadata fields and vector field.`
      );

      return {
        status: 'success',
        message: `Collection ${GAMES_COLLECTION_NAME} is ready for use.`,
      };
    } catch (error) {
      console.error('Error creating Milvus collection:', error);
      return {
        status: 'error',
        message: error || 'Unknown error occurred',
      };
    }
  }

  public async insertGameRecord(gameData: VectorDBGame): Promise<void> {
    try {
      // Validate vector dimensions
      if (
        gameData.game_description_embedding.length !== GAME_VECTOR_DIMENSION
      ) {
        throw new Error(
          `Game description embedding must have exactly ${GAME_VECTOR_DIMENSION} dimensions`
        );
      }

      const rowData: RowData = {};

      // Manually transfer each property to ensure proper typing
      Object.entries(gameData).forEach(([key, value]) => {
        rowData[key] = value;
      });

      // Prepare data for insertion in the format Milvus expects
      const insertData: InsertReq = {
        collection_name: GAMES_COLLECTION_NAME,
        fields_data: [rowData],
      };

      // Insert the record
      const insertResult = await this.milvusClient.insert(insertData);

      // Check if insertion was successful
      if (!insertResult.status.code) {
        // Return the inserted ID if available, otherwise return a success message
        const insertedId = insertResult.IDs;
        console.log('Inserted Result: ', insertResult);
        console.log('Inserted ID: ', insertedId);
      } else {
        throw new Error(
          `Failed to insert game record: ${insertResult.status.reason}`
        );
      }
    } catch (error) {
      console.error('Error inserting game record:', error);
      throw error;
    }
  }

  public async getAllRecordsFromGamesCollection() {
    try {
      // Load the collection
      await this.milvusClient.loadCollection({
        collection_name: GAMES_COLLECTION_NAME,
      });

      // Retrieve all records using query
      const results = await this.milvusClient.query({
        collection_name: GAMES_COLLECTION_NAME,
        expr: 'id >= 0', // This will match all records
        output_fields: ['*'], // Retrieves all fields
      });

      // Process results
      const records = results.data;

      return records;
    } catch (error) {
      console.error('Error retrieving records:', error);
      throw error;
    } finally {
      // Clean up resources
      await this.milvusClient.releaseCollection({
        collection_name: GAMES_COLLECTION_NAME,
      });
    }
  }

  public async deleteGameById(igdb_id: number): Promise<void> {
    try {
      // Load the collection
      await this.milvusClient.loadCollection({
        collection_name: GAMES_COLLECTION_NAME,
      });

      // Delete the game by ID
      const result = await this.milvusClient.deleteEntities({
        collection_name: GAMES_COLLECTION_NAME,
        expr: `igdb_game_id == ${igdb_id}`,
      });

      console.log('delete res: ', result);

      // Verify deletion
      if (result.delete_cnt === '0') {
        throw new Error(`Game with ID ${igdb_id} not found`);
      }

      console.log(`Successfully deleted game with ID ${igdb_id}`);
    } catch (error) {
      console.error(`Failed to delete game with ID ${igdb_id}:`, error);
      throw error;
    } finally {
      // Clean up resources
      await this.milvusClient.releaseCollection({
        collection_name: GAMES_COLLECTION_NAME,
      });
    }
  }
}
