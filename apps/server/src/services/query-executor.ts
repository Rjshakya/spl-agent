import { Data, Effect, pipe } from "effect";
import { createDB } from "../db/instance.js";

// Error types
export class ValidationError extends Data.TaggedError("ValidationError")<{
  readonly message: string;
  readonly step: "validation" | "limit-check";
}> {}

export class ExecutionError extends Data.TaggedError("ExecutionError")<{
  readonly message: string;
  readonly cause?: unknown;
  readonly step: "connection" | "execution";
}> {}

// Interfaces
export interface QueryResult {
  rows: Record<string, unknown>[];
  columns: string[];
  rowCount: number;
}

export interface VisualizationConfig {
  type: "table" | "bar" | "line";
  xKey?: string;
  yKey?: string;
}

// Validation: Check if query is SELECT-only
export function validateQuery(
  sql: string,
): Effect.Effect<{ sql: string; success: boolean }, ValidationError> {
  return Effect.try({
    try: () => {
      const upperSql = sql.trim().toUpperCase();

      // Must start with SELECT
      if (!upperSql.startsWith("SELECT")) {
        throw new Error("Query must start with SELECT");
      }

      // Forbidden keywords
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
          throw new Error(`Query contains forbidden keyword: ${keyword}`);
        }
      }

      return { sql, success: true };
    },
    catch: (error) =>
      new ValidationError({
        message: error instanceof Error ? error.message : "Invalid query",
        step: "validation",
      }),
  });
}

// Add LIMIT 20 if not present
export function ensureLimit(sql: string): string {
  const upperSql = sql.trim().toUpperCase();

  // Check if LIMIT already exists
  if (upperSql.includes("LIMIT")) {
    return sql;
  }

  // Remove trailing semicolon if present
  const cleanSql = sql.replace(/;\s*$/, "");

  // Add LIMIT 20
  return `${cleanSql} LIMIT 20`;
}

// Execute the query
export function executeQuery(
  sql: string,
  connectionString: string,
): Effect.Effect<QueryResult, ExecutionError> {
  return Effect.gen(function* () {
    const db = yield* Effect.tryPromise({
      try: () => createDB(connectionString),
      catch: (error) =>
        new ExecutionError({
          message: "Failed to connect to database",
          cause: error,
          step: "connection",
        }),
    });

    const result = yield* Effect.tryPromise({
      try: async () => {
        const queryResult = await db.execute(sql);
        const rows = queryResult.rows as Record<string, unknown>[];

        // Extract columns from first row
        const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

        return {
          rows,
          columns,
          rowCount: rows.length,
        };
      },
      catch: (error) => {
        return new ExecutionError({
          message: "we failed to execute queries",
          cause: error,
          step: "execution",
        });
      },
    });

    return result;
  });
}

// Determine visualization type based on data
export function determineVisualization(
  columns: string[],
  rows: Record<string, unknown>[],
): Effect.Effect<VisualizationConfig, never> {
  return Effect.sync(() => {
    if (rows.length === 0 || columns.length === 0) {
      return { type: "table" };
    }

    const firstRow = rows[0];

    // Find numeric columns
    const numericCols = columns.filter((col) => {
      const value = firstRow[col];
      return typeof value === "number";
    });

    // Find categorical columns (string or date)
    const categoricalCols = columns.filter((col) => {
      const value = firstRow[col];
      return (
        typeof value === "string" ||
        value instanceof Date ||
        !numericCols.includes(col)
      );
    });

    // Need at least one of each for charts
    if (numericCols.length === 0 || categoricalCols.length === 0) {
      return { type: "table" };
    }

    // Check for date-like column
    const dateCol = categoricalCols.find((col) => {
      const value = firstRow[col];
      if (value instanceof Date) return true;
      if (typeof value === "string") {
        // Simple date detection - check if it looks like a date string
        const dateRegex = /^\d{4}-\d{2}-\d{2}|^\d{2}\/\d{2}\/\d{4}/;
        return dateRegex.test(value);
      }
      return false;
    });

    if (dateCol) {
      return {
        type: "line",
        xKey: dateCol,
        yKey: numericCols[0],
      };
    }

    // Default to bar chart
    return {
      type: "bar",
      xKey: categoricalCols[0],
      yKey: numericCols[0],
    };
  });
}

// Service definition
export interface QueryExecutorService {
  readonly validateQuery: (
    sql: string,
  ) => Effect.Effect<{ sql: string; success: boolean }, ValidationError>;
  readonly ensureLimit: (sql: string) => string;
  readonly executeQuery: (
    sql: string,
    connectionString: string,
  ) => Effect.Effect<QueryResult, ExecutionError>;
  readonly determineVisualization: (
    columns: string[],
    rows: Record<string, unknown>[],
  ) => Effect.Effect<VisualizationConfig, never>;
}

export function createQueryExecutorService(): QueryExecutorService {
  return {
    validateQuery,
    ensureLimit,
    executeQuery,
    determineVisualization,
  };
}

export const QueryExecutorService = { ...createQueryExecutorService() };
