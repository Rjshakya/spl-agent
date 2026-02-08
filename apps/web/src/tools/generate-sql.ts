import { z } from "zod";
import type { TamboTool } from "@tambo-ai/react";
import client from "@/hc.js";
import { useConnectionStore } from "@/store/connection-store";

export const GenerateSqlInputSchema = z
  .object({
    // connectionId: z
    //   .string()
    //   .describe("The ID of the database connection to use"),
    context: z
      .string()
      .describe("Database schema context to help generate the query"),
    userQuery: z
      .string()
      .describe("Natural language description of the SQL query to generate"),
    threadId: z.string().describe("Current conversation thread ID"),
  })
  .describe("Input for generating SQL query with provided context");

export const GenerateSqlOutputSchema = z
  .object({
    query: z.string().describe("The generated SQL query"),
  })
  .describe("Generated SQL query result");

export type GenerateSqlInput = z.infer<typeof GenerateSqlInputSchema>;
export type GenerateSqlOutput = z.infer<typeof GenerateSqlOutputSchema>;

async function generateSqlFunction(
  input: GenerateSqlInput,
): Promise<GenerateSqlOutput> {
  const connectionId = useConnectionStore.getState().selectedConnectionId;
  if (!connectionId) throw new Error("No connection is selected");
  const response = await client.api.tools.sql.generate.$post({
    json: {
      connectionId,
      context: input.context,
      userQuery: input.userQuery,
      threadId: input.threadId,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to generate SQL: ${error}`);
  }

  const result = await response.json();
  return result.data as GenerateSqlOutput;
}

export const generateSqlTool: TamboTool = {
  name: "generateSql",
  description:
    "Generate a SQL query from natural language using provided database context. Use this when you have context about the database schema and want to create a query.",
  tool: generateSqlFunction,
  inputSchema: GenerateSqlInputSchema,
  outputSchema: GenerateSqlOutputSchema,
  annotations: {
    tamboStreamableHint: false,
  },
};
