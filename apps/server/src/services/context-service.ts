import { Data, Effect } from "effect";
import { FilePart, ModelMessage, tool, ToolLoopAgent } from "ai";
import z from "zod";
import { getAppDB } from "../db/instance";
import { eq } from "drizzle-orm";
import { userFilesTable } from "../db/schema/user-files";
import { CONTEXT_GATHERING_PROMPT } from "../prompts/context-service-prompts";
import { getOpenRouter } from "../lib/openrouter";
import { ColumnInfo, getTableColumns, getTables } from "../lib/context-tools";
import { getMessages, saveMessages } from "../lib/message-history";

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
// Step 2: Context Gathering Agent
// ============================================================================

export const getContextAgent = (connectionString: string, model?: string) => {
  const agent = new ToolLoopAgent({
    model: openrouter.chat(model ?? "moonshotai/kimi-k2.5"),
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
  threadId: string,
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
      let messages = await getMessages({
        agent: "getContextAgent",
        threadId,
      });

      if (messages) {
        messages = [
          ...messages,
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
        ];
      } else {
        messages = [
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
        ];
      }
      const { text } = await agent.generate({
        prompt: messages,
      });

      await saveMessages({
        agent: "getContextAgent",
        messages: [...messages, { role: "system", content: text }],
        threadId,
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
    threadId: string,
  ) => Effect.Effect<{ schemaContext: string }, DatabaseContextError>;
}

export function createDatabaseContextService(): DatabaseContextService {
  return {
    getTables,
    getTableColumns,
    getContext,
  };
}

export const DatabaseContextService = { ...createDatabaseContextService() };
