import { Data, Effect, pipe } from "effect";
import { drizzle } from "drizzle-orm/node-postgres";
import type { InferInsertModel } from "drizzle-orm";
import { and, eq } from "drizzle-orm";
import { connections } from "../db/schema/connections";
import { getAppDB } from "../db/instance.js";
import { DATA_SOURCES, PG_DATA_SOURCE } from "../lib/data-sources";

// Error types using Data.TaggedError
export class ConnectionError extends Data.TaggedError("ConnectionError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

export class DatabaseError extends Data.TaggedError("DatabaseError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

// Define the ConnectionService interface
export interface ConnectionService {
  readonly createConnection: (
    data: InferInsertModel<typeof connections>,
  ) => Effect.Effect<string, ConnectionError>;
  readonly getConnectionById: (
    id: string,
  ) => Effect.Effect<typeof connections.$inferSelect, ConnectionError>;
  readonly getConnectionsByUserId: (
    userId: string,
  ) => Effect.Effect<(typeof connections.$inferSelect)[], ConnectionError>;
  readonly getPgConnectionsOfUser: (
    id: string,
  ) => Effect.Effect<(typeof connections.$inferSelect)[], ConnectionError>;
  readonly deleteConnection: (
    id: string,
  ) => Effect.Effect<string, ConnectionError>;
}

// Implementation factory
export function createConnectionService(
  db: ReturnType<typeof drizzle>,
): ConnectionService {
  return {
    createConnection: (data) =>
      pipe(
        Effect.tryPromise({
          try: async () => {
            const [connection] = await db
              .insert(connections)
              .values(data)
              .returning({ id: connections.id });
            return connection.id;
          },
          catch: (error) =>
            new DatabaseError({
              message: "Failed to create connection",
              cause: error,
            }),
        }),
        Effect.mapError(
          (err) =>
            new ConnectionError({
              message: err.message,
              cause: err.cause,
            }),
        ),
      ),

    getConnectionById: (id) =>
      pipe(
        Effect.tryPromise({
          try: async () => {
            const result = await db
              .select()
              .from(connections)
              .where(eq(connections.id, id))
              .limit(1);
            return result[0];
          },
          catch: (error) =>
            new DatabaseError({
              message: "Failed to get connection",
              cause: error,
            }),
        }),
        Effect.mapError(
          (err) =>
            new ConnectionError({
              message: err.message,
              cause: err.cause,
            }),
        ),
      ),

    getConnectionsByUserId: (userId) =>
      pipe(
        Effect.tryPromise({
          try: async () => {
            return await db
              .select()
              .from(connections)
              .where(eq(connections.userId, userId));
          },
          catch: (error) =>
            new DatabaseError({
              message: "Failed to get user connections",
              cause: error,
            }),
        }),
        Effect.mapError(
          (err) =>
            new ConnectionError({
              message: err.message,
              cause: err.cause,
            }),
        ),
      ),

    deleteConnection: (id) =>
      pipe(
        Effect.tryPromise({
          try: async () => {
            const [connection] = await db
              .delete(connections)
              .where(eq(connections.id, id))
              .returning({ id: connections.id });
            return connection.id;
          },
          catch: (error) =>
            new DatabaseError({
              message: "Failed to delete connection",
              cause: error,
            }),
        }),
        Effect.mapError(
          (err) =>
            new ConnectionError({
              message: err.message,
              cause: err.cause,
            }),
        ),
      ),
    getPgConnectionsOfUser: (userId) =>
      pipe(
        Effect.tryPromise({
          try: async () => {
            return await db
              .select()
              .from(connections)
              .where(
                and(
                  eq(connections.userId, userId),
                  eq(connections.source, PG_DATA_SOURCE),
                ),
              );
          },
          catch: (error) =>
            new DatabaseError({
              message: "Failed to get user connections",
              cause: error,
            }),
        }),
        Effect.mapError(
          (err) =>
            new ConnectionError({
              message: err.message,
              cause: err.cause,
            }),
        ),
      ),
  };
}

export const ConnectionService = async () => {
  const db = await getAppDB();
  return createConnectionService(db);
};
