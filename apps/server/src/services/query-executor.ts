import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "cloudflare:workers";
import * as schema from "../db/schema/auth-schema.js";
import type { DatabaseSchema, QueryResponse } from "../types/sql-agent.js";

// Initialize database connection
let db: ReturnType<typeof drizzle> | null = null;

function getDB() {
  if (!db) {
    const connectionString =
      env.DATABASE_URL || env.HYPERDRIVE_DEV?.connectionString;
    if (!connectionString) {
      throw new Error("DATABASE_URL not configured");
    }
    db = drizzle(connectionString, { schema });
  }
  return db;
}

/**
 * Execute a SQL query and format the response
 */
export async function executeQuery(
  sql: string,
  visualizationType: "table" | "bar" | "line" | "pie",
): Promise<QueryResponse> {
  const startTime = Date.now();
  const db = getDB();

  // Execute raw query
  const result = await db.execute(sql);
  const executionTime = Date.now() - startTime;

  // Extract columns and data
  const columns = result.fields?.map((f) => f.name) || [];
  const data = result.rows || [];
  const rowCount = data.length;

  // Build response
  const response: QueryResponse = {
    sql,
    data: data as Record<string, unknown>[],
    columns,
    executionTime,
    rowCount,
    componentType: visualizationType === "table" ? "SqlResults" : "DataChart",
  };

  // Add chart configuration if needed
  if (visualizationType !== "table" && data.length > 0) {
    response.chartConfig = buildChartConfig(data, columns, visualizationType);
  }

  return response;
}

/**
 * Build chart configuration based on data shape
 */
function buildChartConfig(
  data: unknown[],
  columns: string[],
  type: "bar" | "line" | "pie",
): NonNullable<QueryResponse["chartConfig"]> {
  // For single numeric column with categories
  const numericColumns = columns.filter((col) => isNumericColumn(data, col));
  const stringColumns = columns.filter((col) => isStringColumn(data, col));
  const dateColumns = columns.filter((col) => isDateColumn(data, col));

  let xKey: string;
  let yKey: string;

  if (type === "line" && dateColumns.length > 0) {
    // Time series: use date column as x-axis
    xKey = dateColumns[0];
    yKey = numericColumns[0] || columns[1];
  } else if (type === "pie" && stringColumns.length > 0) {
    // Pie chart: use string column as labels
    xKey = stringColumns[0];
    yKey = numericColumns[0] || columns[1];
  } else {
    // Bar chart or fallback
    xKey = stringColumns[0] || columns[0];
    yKey = numericColumns[0] || columns[1] || columns[0];
  }

  return {
    type,
    xKey,
    yKey,
    title:
      type === "line"
        ? "Trend Over Time"
        : type === "pie"
          ? "Distribution"
          : "Data Comparison",
    xLabel: xKey,
    yLabel: yKey,
  };
}

/**
 * Check if a column contains numeric values
 */
function isNumericColumn(data: unknown[], column: string): boolean {
  if (data.length === 0) return false;
  const value = (data[0] as Record<string, unknown>)?.[column];
  return typeof value === "number" || !isNaN(Number(value));
}

/**
 * Check if a column contains string values
 */
function isStringColumn(data: unknown[], column: string): boolean {
  if (data.length === 0) return false;
  const value = (data[0] as Record<string, unknown>)?.[column];
  return typeof value === "string";
}

/**
 * Check if a column contains date values
 */
function isDateColumn(data: unknown[], column: string): boolean {
  if (data.length === 0) return false;
  const value = (data[0] as Record<string, unknown>)?.[column];
  if (typeof value !== "string") return false;
  // Check if it looks like a date
  return /\d{4}-\d{2}-\d{2}/.test(value) || !isNaN(Date.parse(value));
}

/**
 * Get database schema for SQL generation context
 */
export async function getDatabaseSchema(): Promise<DatabaseSchema> {
  // Return hardcoded schema based on your auth-schema.ts
  // In production, you might introspect the database
  return {
    tables: [
      {
        name: "user",
        columns: [
          { name: "id", type: "text", isNullable: false, isPrimary: true },
          { name: "name", type: "text", isNullable: false },
          { name: "email", type: "text", isNullable: false },
          { name: "email_verified", type: "boolean", isNullable: false },
          { name: "image", type: "text", isNullable: true },
          { name: "created_at", type: "timestamp", isNullable: false },
          { name: "updated_at", type: "timestamp", isNullable: false },
        ],
      },
      {
        name: "session",
        columns: [
          { name: "id", type: "text", isNullable: false, isPrimary: true },
          { name: "expires_at", type: "timestamp", isNullable: false },
          { name: "token", type: "text", isNullable: false },
          { name: "created_at", type: "timestamp", isNullable: false },
          { name: "updated_at", type: "timestamp", isNullable: false },
          { name: "ip_address", type: "text", isNullable: true },
          { name: "user_agent", type: "text", isNullable: true },
          {
            name: "user_id",
            type: "text",
            isNullable: false,
            foreignKey: { table: "user", column: "id" },
          },
        ],
      },
      {
        name: "account",
        columns: [
          { name: "id", type: "text", isNullable: false, isPrimary: true },
          { name: "account_id", type: "text", isNullable: false },
          { name: "provider_id", type: "text", isNullable: false },
          {
            name: "user_id",
            type: "text",
            isNullable: false,
            foreignKey: { table: "user", column: "id" },
          },
          { name: "access_token", type: "text", isNullable: true },
          { name: "refresh_token", type: "text", isNullable: true },
          { name: "id_token", type: "text", isNullable: true },
          {
            name: "access_token_expires_at",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "refresh_token_expires_at",
            type: "timestamp",
            isNullable: true,
          },
          { name: "scope", type: "text", isNullable: true },
          { name: "password", type: "text", isNullable: true },
          { name: "created_at", type: "timestamp", isNullable: false },
          { name: "updated_at", type: "timestamp", isNullable: false },
        ],
      },
      {
        name: "verification",
        columns: [
          { name: "id", type: "text", isNullable: false, isPrimary: true },
          { name: "identifier", type: "text", isNullable: false },
          { name: "value", type: "text", isNullable: false },
          { name: "expires_at", type: "timestamp", isNullable: false },
          { name: "created_at", type: "timestamp", isNullable: false },
          { name: "updated_at", type: "timestamp", isNullable: false },
        ],
      },
    ],
  };
}
