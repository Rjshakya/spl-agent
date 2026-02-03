import { Context, Data, Effect, pipe } from "effect";
import { generateText } from "ai";
import type {
  DatabaseSchema,
  SqlGenerationContext,
} from "../types/sql-agent.js";

// Error types using Data.TaggedError
export class QueryGenerationError extends Data.TaggedError(
  "QueryGenerationError",
)<{
  readonly message: string;
  readonly cause?: unknown;
  readonly step: string;
}> {}

// Define the QueryGeneratorService interface
export interface QueryGeneratorService {
  readonly generateQuery: (
    context: SqlGenerationContext,
  ) => Effect.Effect<GeneratedQuery, QueryGenerationError>;
}

// Output type for the multi-step workflow
export interface GeneratedQuery {
  readonly sql: string;
  readonly plan: QueryPlan;
  readonly suggestedVisualization: "table" | "bar" | "line" | "pie";
  readonly confidence: number;
}

// Query plan structure from reasoning model
export interface QueryPlan {
  readonly goal: string;
  readonly tables: string[];
  readonly columns: string[];
  readonly joins?: Array<{
    from: string;
    to: string;
    on: string;
  }>;
  readonly filters?: string[];
  readonly aggregations?: string[];
  readonly ordering?: string;
  readonly limit?: number;
}

// Schema context for a specific table
export interface TableSchema {
  readonly name: string;
  readonly columns: Array<{
    name: string;
    type: string;
    isNullable: boolean;
  }>;
}

// Create the QueryGeneratorService Tag
export const QueryGeneratorService = Context.GenericTag<QueryGeneratorService>(
  "QueryGeneratorService",
);

// AI model configuration
interface ModelConfig {
  readonly model: string;
  readonly temperature: number;
}

// Step 1: Gather context from the database schema
function gatherContext(
  schema: DatabaseSchema,
  userQuery: string,
): Effect.Effect<
  {
    relevantTables: TableSchema[];
    userQuery: string;
  },
  QueryGenerationError
> {
  return Effect.try({
    try: () => {
      // Analyze user query to find relevant tables
      const queryLower = userQuery.toLowerCase();
      const relevantTables = schema.tables.filter((table) => {
        // Check if table name or any column is mentioned in the query
        const tableMentioned = queryLower.includes(table.name.toLowerCase());
        const columnMentioned = table.columns.some((col) =>
          queryLower.includes(col.name.toLowerCase()),
        );
        return tableMentioned || columnMentioned;
      });

      // If no specific tables found, include all tables
      const tablesToUse =
        relevantTables.length > 0 ? relevantTables : schema.tables;

      return {
        relevantTables: tablesToUse.map((t) => ({
          name: t.name,
          columns: t.columns.map((c) => ({
            name: c.name,
            type: c.type,
            isNullable: c.isNullable,
          })),
        })),
        userQuery,
      };
    },
    catch: (error) =>
      new QueryGenerationError({
        message: "Failed to gather database context",
        cause: error,
        step: "gatherContext",
      }),
  });
}

// Step 2: Structure context into a formatted string
function structureContext(context: {
  relevantTables: TableSchema[];
  userQuery: string;
}): Effect.Effect<
  {
    schemaDescription: string;
    userQuery: string;
  },
  QueryGenerationError
> {
  return Effect.try({
    try: () => {
      const schemaDescription = context.relevantTables
        .map(
          (table) =>
            `Table: ${table.name}\n` +
            table.columns
              .map(
                (col) =>
                  `  - ${col.name} (${col.type}${col.isNullable ? "" : " NOT NULL"})`,
              )
              .join("\n"),
        )
        .join("\n\n");

      return {
        schemaDescription,
        userQuery: context.userQuery,
      };
    },
    catch: (error) =>
      new QueryGenerationError({
        message: "Failed to structure context",
        cause: error,
        step: "structureContext",
      }),
  });
}

// Step 3: Generate query plan using reasoning model
function generatePlan(config: ModelConfig): (context: {
  schemaDescription: string;
  userQuery: string;
}) => Effect.Effect<
  {
    plan: QueryPlan;
    schemaDescription: string;
    userQuery: string;
  },
  QueryGenerationError
> {
  return (context) =>
    Effect.tryPromise({
      try: async () => {
        // TODO: Replace with actual AI SDK call
        // const { text } = await generateText({
        //   model: config.model,
        //   system: PLAN_GENERATION_PROMPT,
        //   prompt: `Schema:\n${context.schemaDescription}\n\nUser Query: ${context.userQuery}\n\nGenerate the query plan:`,
        //   temperature: config.temperature,
        // });

        // Mock plan for now
        const plan: QueryPlan = {
          goal: `Retrieve data for: ${context.userQuery}`,
          tables: context.schemaDescription
            .split("Table:")
            .slice(1)
            .map((t) => t.split("\n")[0].trim()),
          columns: ["id", "name", "created_at"],
          limit: 100,
        };

        return {
          plan,
          schemaDescription: context.schemaDescription,
          userQuery: context.userQuery,
        };
      },
      catch: (error) =>
        new QueryGenerationError({
          message: "Failed to generate query plan",
          cause: error,
          step: "generatePlan",
        }),
    });
}

// Step 4: Generate SQL query using the plan
function generateQuery(config: ModelConfig): (context: {
  plan: QueryPlan;
  schemaDescription: string;
  userQuery: string;
}) => Effect.Effect<
  {
    sql: string;
    plan: QueryPlan;
    suggestedVisualization: "table" | "bar" | "line" | "pie";
  },
  QueryGenerationError
> {
  return (context) =>
    Effect.tryPromise({
      try: async () => {
        // TODO: Replace with actual AI SDK call
        // const { text } = await generateText({
        //   model: config.model,
        //   system: SQL_GENERATION_PROMPT,
        //   prompt: `Plan:\n${JSON.stringify(context.plan, null, 2)}\n\nSchema:\n${context.schemaDescription}\n\nGenerate SQL:`,
        //   temperature: 0.1, // Lower temperature for deterministic SQL
        // });

        // Mock SQL for now
        const plan = context.plan;
        const tableName = plan.tables[0] || '"user"';
        const columns = plan.columns.join(", ");
        const limit = plan.limit || 100;

        const sql = `SELECT ${columns} FROM ${tableName} LIMIT ${limit}`;

        // Determine visualization type based on query
        let suggestedVisualization: "table" | "bar" | "line" | "pie" = "table";
        const queryLower = context.userQuery.toLowerCase();
        if (queryLower.includes("count") || queryLower.includes("how many")) {
          if (queryLower.includes("group") || queryLower.includes("by")) {
            suggestedVisualization = "bar";
          }
        } else if (
          queryLower.includes("time") ||
          queryLower.includes("daily") ||
          queryLower.includes("monthly")
        ) {
          suggestedVisualization = "line";
        } else if (
          queryLower.includes("distribution") ||
          queryLower.includes("percentage")
        ) {
          suggestedVisualization = "pie";
        }

        return {
          sql,
          plan: context.plan,
          suggestedVisualization,
        };
      },
      catch: (error) =>
        new QueryGenerationError({
          message: "Failed to generate SQL query",
          cause: error,
          step: "generateQuery",
        }),
    });
}

// Step 5: Validate the generated query
function validateQuery(
  config: ModelConfig,
): (context: {
  sql: string;
  plan: QueryPlan;
  suggestedVisualization: "table" | "bar" | "line" | "pie";
}) => Effect.Effect<GeneratedQuery, QueryGenerationError> {
  return (context) =>
    Effect.tryPromise({
      try: async () => {
        // TODO: Replace with actual AI SDK call
        // const { text } = await generateText({
        //   model: config.model,
        //   system: VALIDATION_PROMPT,
        //   prompt: `SQL Query:\n${context.sql}\n\nValidate this query:`,
        //   temperature: 0.1,
        // });

        // Validate query safety
        const sql = context.sql.trim().toUpperCase();
        const forbiddenKeywords = [
          "INSERT",
          "UPDATE",
          "DELETE",
          "DROP",
          "CREATE",
          "ALTER",
          "TRUNCATE",
          "GRANT",
          "REVOKE",
        ];

        const isSafe =
          sql.startsWith("SELECT") &&
          !forbiddenKeywords.some((keyword) =>
            new RegExp(`\\b${keyword}\\b`, "i").test(sql),
          );

        if (!isSafe) {
          throw new Error("Generated query is not safe (must be SELECT-only)");
        }

        // Calculate confidence score (0-1)
        const confidence = 0.85;

        return {
          sql: context.sql,
          plan: context.plan,
          suggestedVisualization: context.suggestedVisualization,
          confidence,
        };
      },
      catch: (error) =>
        new QueryGenerationError({
          message: "Failed to validate SQL query",
          cause: error,
          step: "validateQuery",
        }),
    });
}

// System prompts for AI generation
const PLAN_GENERATION_PROMPT = `You are an expert database query planner.

Your task is to analyze a user's natural language question and create a structured query plan for a PostgreSQL database.

The plan should include:
1. Goal: What the query aims to achieve
2. Tables: Which tables need to be queried
3. Columns: Which columns are needed
4. Joins: Any table relationships to use (if applicable)
5. Filters: WHERE conditions to apply
6. Aggregations: GROUP BY and aggregation functions (if needed)
7. Ordering: Sort order
8. Limit: Maximum rows to return

Respond with a JSON object matching the QueryPlan structure. Be specific and accurate based on the schema provided.`;

const SQL_GENERATION_PROMPT = `You are an expert PostgreSQL query generator.

Generate a safe, read-only SELECT query based on the provided query plan.

IMPORTANT RULES:
1. ONLY generate SELECT queries - never INSERT, UPDATE, DELETE, DROP, CREATE, ALTER, or TRUNCATE
2. Use the provided plan and schema to generate accurate queries
3. Always use explicit column names, never SELECT *
4. Use table aliases for better readability
5. Handle date/time queries appropriately using PostgreSQL date functions
6. Use proper JOIN syntax when querying across tables
7. Add LIMIT clauses for potentially large result sets
8. Use COALESCE for handling NULL values when appropriate

Respond ONLY with the SQL query, no explanation.`;

const VALIDATION_PROMPT = `You are a SQL query validator.

Your task is to validate that a generated SQL query:
1. Is syntactically correct
2. Only uses SELECT statements (no modifications)
3. Uses tables and columns that exist in the schema
4. Is optimized and safe to run

Respond with a confidence score (0-1) and any warnings or errors.`;

// Implementation factory
export function createQueryGeneratorService(
  config: ModelConfig,
): QueryGeneratorService {
  return {
    generateQuery: (context) =>
      pipe(
        // Step 1: Gather context
        gatherContext(context.schema, context.userQuery),
        // Step 2: Structure context
        Effect.flatMap(structureContext),
        // Step 3: Generate plan
        Effect.flatMap(generatePlan(config)),
        // Step 4: Generate SQL
        Effect.flatMap(generateQuery(config)),
        // Step 5: Validate query
        Effect.flatMap(validateQuery(config)),
      ),
  };
}

// Convenience function to run the query generation workflow
export function generateQueryWithContext(
  context: SqlGenerationContext,
): Effect.Effect<GeneratedQuery, QueryGenerationError, QueryGeneratorService> {
  return Effect.gen(function* () {
    const service = yield* QueryGeneratorService;
    return yield* service.generateQuery(context);
  });
}

// Alternative: Sequential workflow using Effect.gen for more control
export function generateQueryWorkflow(
  context: SqlGenerationContext,
  config: ModelConfig,
): Effect.Effect<GeneratedQuery, QueryGenerationError> {
  return Effect.gen(function* () {
    // Step 1: Gather context
    const gatheredContext = yield* gatherContext(
      context.schema,
      context.userQuery,
    );

    // Step 2: Structure context
    const structuredContext = yield* structureContext(gatheredContext);

    // Step 3: Generate plan
    const planContext = yield* generatePlan(config)(structuredContext);

    // Step 4: Generate SQL
    const sqlContext = yield* generateQuery(config)(planContext);

    // Step 5: Validate
    const validatedResult = yield* validateQuery(config)(sqlContext);

    return validatedResult;
  });
}

// Helper to determine if a query is read-only
export function isReadOnlyQuery(sql: string): boolean {
  const upperSql = sql.trim().toUpperCase();
  const forbiddenKeywords = [
    "INSERT",
    "UPDATE",
    "DELETE",
    "DROP",
    "CREATE",
    "ALTER",
    "TRUNCATE",
    "GRANT",
    "REVOKE",
    "EXECUTE",
    "EXEC",
  ];

  for (const keyword of forbiddenKeywords) {
    const regex = new RegExp(`\\b${keyword}\\b`, "i");
    if (regex.test(upperSql)) {
      return false;
    }
  }

  return upperSql.startsWith("SELECT");
}
