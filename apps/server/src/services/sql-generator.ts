import { generateText } from "ai";
// You'll need to add the appropriate provider package, e.g., @ai-sdk/openai or createOpenRouter
import type {
  DatabaseSchema,
  SqlGenerationContext,
} from "../types/sql-agent.js";

// You'll need to configure this with your OpenRouter API key
// Example using OpenAI provider with OpenRouter base URL:
// import { createOpenAI } from "@ai-sdk/openai";
// const openrouter = createOpenAI({
//   baseURL: "https://openrouter.ai/api/v1",
//   apiKey: process.env.OPEN_ROUTER_API_KEY,
// });

const SYSTEM_PROMPT = `You are an expert SQL query generator for PostgreSQL.

Your task is to convert natural language questions into safe, read-only SQL queries.

IMPORTANT RULES:
1. ONLY generate SELECT queries - never INSERT, UPDATE, DELETE, DROP, CREATE, ALTER, or TRUNCATE
2. Use the provided database schema to generate accurate queries
3. Always use explicit column names, never SELECT *
4. Use table aliases for better readability (e.g., u for user, s for session)
5. Handle date/time queries appropriately using PostgreSQL date functions
6. Use proper JOIN syntax when querying across tables
7. Add LIMIT clauses for potentially large result sets (default to 100)
8. Use COALESCE for handling NULL values when appropriate

SCHEMA CONTEXT:
The database has the following tables:
- user: id, name, email, email_verified, image, created_at, updated_at
- session: id, expires_at, token, created_at, updated_at, ip_address, user_agent, user_id
- account: id, account_id, provider_id, user_id, access_token, refresh_token, id_token, access_token_expires_at, refresh_token_expires_at, scope, password, created_at, updated_at
- verification: id, identifier, value, expires_at, created_at, updated_at

RELATIONSHIPS:
- user has many sessions (user.id = session.user_id)
- user has many accounts (user.id = account.user_id)

When the user asks for data that would be best visualized as:
- A table with rows/columns - generate a standard SELECT query
- A bar chart - generate a query with GROUP BY and COUNT/SUM aggregations
- A line chart - generate a query with time-based GROUP BY (e.g., daily/monthly)
- A pie chart - generate a query showing proportions (e.g., percentage breakdown)

Respond ONLY with the SQL query, no explanation. If you cannot generate a safe query, respond with "ERROR: <reason>"`;

export interface GeneratedSql {
  sql: string;
  suggestedVisualization: "table" | "bar" | "line" | "pie";
}

export async function generateSql(
  userQuery: string,
  schema: DatabaseSchema,
): Promise<GeneratedSql> {
  // TODO: Configure your AI provider here
  // Example:
  // const { text } = await generateText({
  //   model: openrouter("anthropic/claude-3.5-sonnet"),
  //   system: SYSTEM_PROMPT,
  //   prompt: `User question: ${userQuery}\n\nGenerate the SQL query:`,
  //   temperature: 0.1, // Low temperature for deterministic SQL
  // });

  // For now, returning a placeholder implementation
  // You should replace this with actual AI SDK integration

  // Simple keyword-based routing for demo purposes
  const query = userQuery.toLowerCase();
  let sql: string;
  let suggestedVisualization: "table" | "bar" | "line" | "pie" = "table";

  if (query.includes("count") || query.includes("how many")) {
    if (query.includes("user")) {
      sql = `SELECT COUNT(*) as count FROM "user"`;
      suggestedVisualization = "table";
    } else if (query.includes("session")) {
      sql = `SELECT COUNT(*) as count FROM session`;
      suggestedVisualization = "table";
    } else {
      sql = `SELECT COUNT(*) as total_count FROM "user"`;
      suggestedVisualization = "table";
    }
  } else if (
    query.includes("over time") ||
    query.includes("daily") ||
    query.includes("monthly")
  ) {
    sql = `SELECT DATE(created_at) as date, COUNT(*) as count FROM "user" GROUP BY DATE(created_at) ORDER BY date DESC LIMIT 30`;
    suggestedVisualization = "line";
  } else if (query.includes("group") || query.includes("by")) {
    if (query.includes("email verified")) {
      sql = `SELECT email_verified, COUNT(*) as count FROM "user" GROUP BY email_verified`;
      suggestedVisualization = "pie";
    } else {
      sql = `SELECT DATE(created_at) as date, COUNT(*) as count FROM "user" GROUP BY DATE(created_at) ORDER BY date DESC LIMIT 10`;
      suggestedVisualization = "bar";
    }
  } else {
    // Default: list users
    sql = `SELECT id, name, email, email_verified, created_at FROM "user" ORDER BY created_at DESC LIMIT 10`;
    suggestedVisualization = "table";
  }

  return { sql, suggestedVisualization };
}

export function buildSchemaDescription(schema: DatabaseSchema): string {
  return schema.tables
    .map(
      (table) =>
        `Table: ${table.name}\nColumns: ${table.columns
          .map(
            (col) =>
              `${col.name} (${col.type}${col.isNullable ? "" : " NOT NULL"})`,
          )
          .join(", ")}`,
    )
    .join("\n\n");
}

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

  // Check for forbidden keywords
  for (const keyword of forbiddenKeywords) {
    const regex = new RegExp(`\\b${keyword}\\b", "i"`);
    if (regex.test(upperSql)) {
      return false;
    }
  }

  // Must start with SELECT
  return upperSql.startsWith("SELECT");
}
