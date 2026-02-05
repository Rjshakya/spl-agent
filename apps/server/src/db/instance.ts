import { env } from "cloudflare:workers";
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

export const createDB = async (connectionString: string) => {
  return drizzle(connectionString);
};

export const getAppDB = async () => {
  return drizzle(env.HYPERDRIVE_DEV.connectionString);
};
