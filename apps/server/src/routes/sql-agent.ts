import { Hono } from "hono";
import { generateSql, isReadOnlyQuery } from "../services/sql-generator.js";
import { executeQuery, getDatabaseSchema } from "../services/query-executor.js";
import type { QueryRequest, QueryResponse } from "../types/sql-agent.js";

const api = new Hono();

api.post("/query", async (c) => {
  try {
    const body = await c.req.json<QueryRequest>();
    const { query, visualizationType = "auto" } = body;

    if (!query || typeof query !== "string") {
      return c.json({ error: "Query is required" }, 400);
    }

    // Get database schema for context
    const schema = await getDatabaseSchema();

    // Generate SQL using AI (Vercel AI SDK)
    const { sql, suggestedVisualization } = await generateSql(query, schema);

    // Validate that it's a read-only query
    if (!isReadOnlyQuery(sql)) {
      return c.json(
        { error: "Only SELECT queries are allowed for security reasons" },
        403,
      );
    }

    // Determine final visualization type
    const finalVisualization =
      visualizationType === "auto" ? suggestedVisualization : visualizationType;

    // Execute the SQL query
    const result: QueryResponse = await executeQuery(sql, finalVisualization);

    return c.json(result);
  } catch (error) {
    console.error("Error executing query:", error);
    return c.json(
      {
        error: "Failed to execute query",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});

// Health check endpoint
api.get("/health", (c) => {
  return c.json({ status: "ok", service: "sql-agent" });
});

export default api;
