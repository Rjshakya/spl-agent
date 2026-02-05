import { Context, Data, Effect, pipe } from "effect";
import { FilePart, tool, ToolLoopAgent } from "ai";
import z from "zod";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { env } from "cloudflare:workers";
import { createDB, getAppDB } from "../db/instance.js";
import { connections } from "../db/schema/connections.js";
import { and, eq } from "drizzle-orm";
import { userFilesTable } from "../db/schema/user-files.js";
import { CONTEXT_GATHERING_PROMPT } from "./context-service-prompts.js";
import { getOpenRouter } from "../lib/openrouter.js";

// Error types
export class DatabaseContextError extends Data.TaggedError(
  "DatabaseContextError",
)<{
  readonly message: string;
  readonly cause?: unknown;
  readonly step: string;
}> {}

// OpenRouter setup
const openrouter = getOpenRouter();

// ============================================================================
// Step 1: Database Introspection Functions
// ============================================================================

/**
 * Get all tables from a PostgreSQL database
 */
export function getTables(
  connectionString: string,
): Effect.Effect<string[], DatabaseContextError> {
  return Effect.gen(function* () {
    const db = yield* Effect.tryPromise({
      try: () => createDB(connectionString),
      catch: (error) =>
        new DatabaseContextError({
          message: "Failed to create database connection",
          cause: error,
          step: "getTables/createDB",
        }),
    });

    const result = yield* Effect.tryPromise({
      try: async () => {
        const tables = await db.execute(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
          ORDER BY table_name
        `);
        return (tables.rows as Array<{ table_name: string }>).map(
          (row) => row.table_name,
        );
      },
      catch: (error) =>
        new DatabaseContextError({
          message: "Failed to fetch tables from database",
          cause: error,
          step: "getTables/query",
        }),
    });

    return result;
  });
}

/**
 * Interface for column information
 */
export interface ColumnInfo {
  name: string;
  type: string;
  isNullable: boolean;
  isPrimary: boolean;
  foreignKey?: {
    table: string;
    column: string;
  };
}

/**
 * Get all columns and their types for a specific table
 */
export function getTableColumns(
  connectionString: string,
  tableName: string,
): Effect.Effect<ColumnInfo[], DatabaseContextError> {
  return Effect.gen(function* () {
    const db = yield* Effect.tryPromise({
      try: () => createDB(connectionString),
      catch: (error) =>
        new DatabaseContextError({
          message: "Failed to create database connection",
          cause: error,
          step: "getTableColumns/createDB",
        }),
    });

    // Get column information
    const columnsResult = yield* Effect.tryPromise({
      try: async () => {
        const columns = await db.execute(`
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default
          FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = '${tableName}'
          ORDER BY ordinal_position
        `);
        return columns.rows as Array<{
          column_name: string;
          data_type: string;
          is_nullable: string;
          column_default: string | null;
        }>;
      },
      catch: (error) =>
        new DatabaseContextError({
          message: `Failed to fetch columns for table ${tableName}`,
          cause: error,
          step: "getTableColumns/columns",
        }),
    });

    // Get primary key information
    const primaryKeysResult = yield* Effect.tryPromise({
      try: async () => {
        const primaryKeys = await db.execute(`
          SELECT kcu.column_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          WHERE tc.constraint_type = 'PRIMARY KEY'
          AND tc.table_name = '${tableName}'
        `);
        return (primaryKeys.rows as Array<{ column_name: string }>).map(
          (row) => row.column_name,
        );
      },
      catch: (error) =>
        new DatabaseContextError({
          message: `Failed to fetch primary keys for table ${tableName}`,
          cause: error,
          step: "getTableColumns/primaryKeys",
        }),
    });

    // Get foreign key information
    const foreignKeysResult = yield* Effect.tryPromise({
      try: async () => {
        const foreignKeys = await db.execute(`
          SELECT
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
          WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name = '${tableName}'
        `);
        return foreignKeys.rows as Array<{
          column_name: string;
          foreign_table_name: string;
          foreign_column_name: string;
        }>;
      },
      catch: (error) =>
        new DatabaseContextError({
          message: `Failed to fetch foreign keys for table ${tableName}`,
          cause: error,
          step: "getTableColumns/foreignKeys",
        }),
    });

    // Combine all information
    const primaryKeySet = new Set(primaryKeysResult);
    const foreignKeyMap = new Map(
      foreignKeysResult.map((fk) => [
        fk.column_name,
        { table: fk.foreign_table_name, column: fk.foreign_column_name },
      ]),
    );

    const columns: ColumnInfo[] = columnsResult.map((col) => ({
      name: col.column_name,
      type: col.data_type,
      isNullable: col.is_nullable === "YES",
      isPrimary: primaryKeySet.has(col.column_name),
      foreignKey: foreignKeyMap.get(col.column_name),
    }));

    return columns;
  });
}

// ============================================================================
// Step 2: Tool Definitions for the Agent
// ============================================================================

/**
 * Tool to get all tables from the database
 */
const getTablesTool = (connectionString: string) =>
  tool({
    title: "getTables",
    description: "Retrieve all table names from the PostgreSQL database",
    inputSchema: z.object({}), // No input needed
    execute: async () => {
      const effect = getTables(connectionString);
      const result = await Effect.runPromise(effect);
      return { tables: result };
    },
    outputSchema: z.object({
      tables: z.array(z.string()),
    }),
  });

/**
 * Tool to get columns for a specific table
 */
const getTableColumnsTool = (connectionString: string) =>
  tool({
    title: "getTableColumns",
    description:
      "Retrieve all columns and their types for a specific table. Returns column name, data type, nullability, primary key status, and foreign key relationships.",
    inputSchema: z.object({
      tableName: z.string().describe("The name of the table to inspect"),
    }),
    execute: async ({ tableName }) => {
      const effect = getTableColumns(connectionString, tableName);
      const result = await Effect.runPromise(effect);
      return { columns: result };
    },
    outputSchema: z.object({
      columns: z.array(
        z.object({
          name: z.string(),
          type: z.string(),
          isNullable: z.boolean(),
          isPrimary: z.boolean(),
          foreignKey: z
            .object({
              table: z.string(),
              column: z.string(),
            })
            .optional(),
        }),
      ),
    }),
  });

// ============================================================================
// Step 3: Context Gathering Agent
// ============================================================================


export const getContextAgent = (connectionString: string, model?: string) => {
  const agent = new ToolLoopAgent({
    model: openrouter.chat(model ?? "openai/gpt-4o-mini"),
    tools: {
      getTables: getTablesTool(connectionString),
      getTableColumns: getTableColumnsTool(connectionString),
    },
    toolChoice: "auto",
    instructions: {
      role: "system",
      content: CONTEXT_GATHERING_PROMPT,
    },
  });

  return agent;
};

/**
 * Get database context using a context agent
 * This function explores the database schema intelligently based on the user query
 */
export function getContext(
  connectionString: string,
  userQuery: string,
  userId: string,
): Effect.Effect<
  {
    schemaContext: string;
  },
  DatabaseContextError
> {
  return Effect.tryPromise({
    try: async () => {
      const appDB = await getAppDB();
      const files = await appDB
        .select()
        .from(userFilesTable)
        .where(eq(userFilesTable.userId, userId));

      const mapFiles = files.map((f) => ({
        type: f.type as FilePart["type"],
        data: new URL(f.fileUrl),
        mediaType: f.mediaType,
      }));

      // Create the agent with database introspection tools
      const agent = getContextAgent(connectionString);

      // Run the agent with the user query
      const { text } = await agent.generate({
        prompt: [
          {
            role: "user",
            content: `
            User Query: "${userQuery}"

            <instructions>
              For extra context about user's db and its business, user may also attach some files with this message.
              Please explore the database schema to gather context for generating a SQL query to answer this question. 
              Start by getting the list of tables, then inspect the relevant tables to understand their structure and relationships.
            <instructions>
            `,
          },
          {
            role: "user",
            content: mapFiles,
          },
        ],
      });

      return {
        schemaContext: text,
      };
    },
    catch: (error) =>
      new DatabaseContextError({
        message: "Failed to gather database context using agent",
        cause: error,
        step: "getContext/agent",
      }),
  });
}

// ============================================================================
// Service Definition
// ============================================================================

export interface DatabaseContextService {
  readonly getTables: (
    connectionString: string,
  ) => Effect.Effect<string[], DatabaseContextError>;
  readonly getTableColumns: (
    connectionString: string,
    tableName: string,
  ) => Effect.Effect<ColumnInfo[], DatabaseContextError>;
  readonly getContext: (
    connectionString: string,
    userQuery: string,
    userId: string,
  ) => Effect.Effect<{ schemaContext: string }, DatabaseContextError>;
}

export const DatabaseContextService =
  Context.GenericTag<DatabaseContextService>("DatabaseContextService");

export function createDatabaseContextService(): DatabaseContextService {
  return {
    getTables,
    getTableColumns,
    getContext,
  };
}

// Convenience functions to use the service
export function getTablesWithService(
  connectionString: string,
): Effect.Effect<string[], DatabaseContextError, DatabaseContextService> {
  return Effect.gen(function* () {
    const service = yield* DatabaseContextService;
    return yield* service.getTables(connectionString);
  });
}

export function getTableColumnsWithService(
  connectionString: string,
  tableName: string,
): Effect.Effect<ColumnInfo[], DatabaseContextError, DatabaseContextService> {
  return Effect.gen(function* () {
    const service = yield* DatabaseContextService;
    return yield* service.getTableColumns(connectionString, tableName);
  });
}

export function getContextWithService(
  connectionString: string,
  userQuery: string,
  userId: string,
): Effect.Effect<
  { schemaContext: string },
  DatabaseContextError,
  DatabaseContextService
> {
  return Effect.gen(function* () {
    const service = yield* DatabaseContextService;
    return yield* service.getContext(connectionString, userQuery, userId);
  });
}
