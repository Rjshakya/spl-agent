import { Context, Data, Effect, pipe } from "effect";
import { drizzle } from "drizzle-orm/node-postgres";
import type { InferInsertModel } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { connections } from "../db/schema/connections.js";

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
  ) => Effect.Effect<void, ConnectionError>;
  readonly getConnectionById: (
    id: string,
  ) => Effect.Effect<typeof connections.$inferSelect, ConnectionError>;
  readonly getConnectionsByUserId: (
    userId: string,
  ) => Effect.Effect<(typeof connections.$inferSelect)[], ConnectionError>;
  readonly deleteConnection: (
    id: string,
  ) => Effect.Effect<void, ConnectionError>;
}

// Create the ConnectionService Tag using Effect 3.x API
export const ConnectionService = Context.GenericTag<ConnectionService>("ConnectionService");

// Implementation factory
export function createConnectionService(
  db: ReturnType<typeof drizzle>,
): ConnectionService {
  return {
    createConnection: (data) =>
      pipe(
        Effect.tryPromise({
          try: async () => {
            await db.insert(connections).values(data);
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
            return result[0]
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
            await db.delete(connections).where(eq(connections.id, id));
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
  };
}

// Convenience functions that work with the service
export function createConnection(
  data: InferInsertModel<typeof connections>,
): Effect.Effect<void, ConnectionError, ConnectionService> {
  return Effect.gen(function* () {
    const service = yield* ConnectionService;
    return yield* service.createConnection(data);
  });
}

export function getConnectionById(
  id: string,
): Effect.Effect<
  typeof connections.$inferSelect | null,
  ConnectionError,
  ConnectionService
> {
  return Effect.gen(function* () {
    const service = yield* ConnectionService;
    return yield* service.getConnectionById(id);
  });
}

export function getConnectionsByUserId(
  userId: string,
): Effect.Effect<
  (typeof connections.$inferSelect)[],
  ConnectionError,
  ConnectionService
> {
  return Effect.gen(function* () {
    const service = yield* ConnectionService;
    return yield* service.getConnectionsByUserId(userId);
  });
}

export function deleteConnection(
  id: string,
): Effect.Effect<void, ConnectionError, ConnectionService> {
  return Effect.gen(function* () {
    const service = yield* ConnectionService;
    return yield* service.deleteConnection(id);
  });
}
