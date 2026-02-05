import { Context, Data, Effect } from "effect";
import { Output, stepCountIs, tool, ToolLoopAgent } from "ai";
import z from "zod";
import { createDB } from "../db/instance.js";
import {
  getTables,
  getTableColumns,
  getContextAgent,
} from "./context-service.js";
import { getOpenRouter } from "../lib/openrouter.js";
import { SQL_GENERATOR_PROMPT } from "./sql-generator-prompts.js";

// Error types
export class SqlQueryGeneratorError extends Data.TaggedError(
  "SqlQueryGeneratorError",
)<{
  readonly message: string;
  readonly cause?: unknown;
  readonly step: string;
}> {}

// OpenRouter setup
const openrouter = getOpenRouter();

// ============================================================================
// Tool Definitions
// ============================================================================

/**
 * Tool to get all tables from the database
 */
const getTablesTool = (connectionString: string) =>
  tool({
    title: "getTables",
    description: "Retrieve all table names from the PostgreSQL database",
    inputSchema: z.object({}),
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
const getColumnsTool = (connectionString: string) =>
  tool({
    title: "getColumns",
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

/**
 * Tool to get context from the context agent (subagent)
 */
const getContextTool = (connectionString: string) =>
  tool({
    title: "getContext",
    description:
      "Delegate to a specialized context agent to explore the database schema in depth. Use this when you need additional schema information beyond the provided context, especially when dealing with errors or complex queries.",
    inputSchema: z.object({
      userQuery: z.string().describe("The user query to gather context for"),
    }),
    execute: async ({ userQuery }, { abortSignal }) => {
      const agent = getContextAgent(connectionString);
      const result = await agent.generate({
        prompt: `Please explore the database schema to understand how to answer this query: "${userQuery}"`,
        abortSignal,
      });
      return { context: result.text };
    },
    outputSchema: z.object({
      context: z.string(),
    }),
  });

/**
 * Tool to test the generated SQL query
 */
const testQueryTool = (connectionString: string) =>
  tool({
    title: "testQuery",
    description:
      "Test a generated SQL query by executing it (with LIMIT 1 for safety). Returns whether the test passed and any error message if it failed. YOU MUST CALL THIS TOOL AND RECEIVE A PASSING RESULT BEFORE OUTPUTTING YOUR FINAL ANSWER.",
    inputSchema: z.object({
      query: z.string().describe("The SQL query to test"),
    }),
    execute: async ({ query }) => {
      try {
        const db = await createDB(connectionString);

        // Test the query with LIMIT 1 for safety
        const testQuery = query.replace(/;\s*$/, " LIMIT 1;");

        await db.execute(testQuery);

        return {
          testPassed: true,
          query: query,
        };
      } catch (error) {
        return {
          testPassed: false,
          error: error instanceof Error ? error.message : String(error),
          query: query,
        };
      }
    },
    outputSchema: z.object({
      testPassed: z.boolean(),
      error: z.string().optional(),
      query: z.string(),
    }),
  });

// ============================================================================
// SQL Query Generator Agent
// ============================================================================

/**
 * Input parameters for SQL generation
 */
export interface SqlGeneratorInput {
  connectionString: string;
  userId: string;
  context: string;
  userQuery: string;
}

/**
 * Output structure for SQL generation
 */
export interface SqlGeneratorOutput {
  query: string;
}

/**
 *
 * SQL AGENT
 */

const getSQLAgent = (input: SqlGeneratorInput) => {
  const agent = new ToolLoopAgent({
    model: openrouter.chat("openai/gpt-4o"),
    tools: {
      getTables: getTablesTool(input.connectionString),
      getColumns: getColumnsTool(input.connectionString),
      getContext: getContextTool(input.connectionString),
      testQuery: testQueryTool(input.connectionString),
    },
    toolChoice: "auto",
    instructions: {
      role: "system",
      content: SQL_GENERATOR_PROMPT,
    },
    output: Output.object({
      schema: z.object({
        query: z.string().describe("The generated and tested SQL query"),
      }),
    }),
    stopWhen: stepCountIs(30), // Allow up to 30 steps for retries
  });

  return agent;
};

/**
 * Generate SQL query using the agent
 */
export function generateSqlQuery(
  input: SqlGeneratorInput,
): Effect.Effect<SqlGeneratorOutput, SqlQueryGeneratorError> {
  return Effect.tryPromise({
    try: async () => {
      const agent = getSQLAgent(input);

      const { output } = await agent.generate({
        prompt: `
## Context (Database Schema):
${input.context}

## User Query:
"${input.userQuery}"

## Instructions:
Generate a SQL query to answer the user's question. Remember to:
1. Use the provided context as your primary schema reference
2. Test your query using the testQuery tool
3. Only output the final result when the test passes
4. If the test fails, analyze the error and retry with fixes or additional context gathering`,
      });

      return output as SqlGeneratorOutput;
    },
    catch: (error) =>
      new SqlQueryGeneratorError({
        message: "Failed to generate SQL query",
        cause: error,
        step: "generateSqlQuery/agent",
      }),
  });
}

// ============================================================================
// Service Definition
// ============================================================================

export interface SqlQueryGeneratorService {
  readonly generateSqlQuery: (
    input: SqlGeneratorInput,
  ) => Effect.Effect<SqlGeneratorOutput, SqlQueryGeneratorError>;
}

export const SqlQueryGeneratorService =
  Context.GenericTag<SqlQueryGeneratorService>("SqlQueryGeneratorService");

export function createSqlQueryGeneratorService(): SqlQueryGeneratorService {
  return {
    generateSqlQuery,
  };
}

// Convenience function to use the service
export function generateSqlQueryWithService(
  input: SqlGeneratorInput,
): Effect.Effect<
  SqlGeneratorOutput,
  SqlQueryGeneratorError,
  SqlQueryGeneratorService
> {
  return Effect.gen(function* () {
    const service = yield* SqlQueryGeneratorService;
    return yield* service.generateSqlQuery(input);
  });
}
