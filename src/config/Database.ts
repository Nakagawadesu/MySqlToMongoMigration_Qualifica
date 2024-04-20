import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";
import Logger from "../Helpers/Logger";

dotenv.config();

const log = new Logger();

class Database {
  private client: MongoClient;
  private moogoString: string;
  private databaseName: string;

  constructor({
    moogoString,
    databaseName,
  }: {
    moogoString: string;
    databaseName: string;
  }) {
    this.moogoString = process.env.MONGO_STRING || "";
    this.databaseName = process.env.MONGO_DATABASE || "";
    try {
      this.client = new MongoClient(this.moogoString, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
      });
      log.info(
        `Client created , database name: ${this.databaseName} , moogoString: ${this.moogoString}`
      );
    } catch (error) {
      log.info(
        ` database name: ${this.databaseName} , moogoString: ${this.moogoString}`
      );
      log.error("Error creating client", error);
      throw error;
    }
  }
  private static instance: Database;

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database({
        moogoString: process.env.MONGO_STRING || "",
        databaseName: process.env.MONGO_DATABASE || "",
      });
    }
    log.info("Database instance retrieved");
    return Database.instance;
  }
  public connect = async () => {
    try {
      await this.client.connect();
      log.success("Connected to database");
    } catch (error) {
      log.error("Error connecting to database", error);
    }
  };

  public getCollection = (collectionName: string) => {
    return this.client.db(this.databaseName).collection(collectionName);
  };

  async close(): Promise<void> {
    try {
      await this.client.close();
      log.success("MongoDB connection closed");
    } catch (error) {
      log.error(new Error("Error closing MongoDB connection:"));
      throw error;
    }
  }

  getClient(): MongoClient {
    return this.client;
  }
}

export default Database;
