import { z } from "zod";
import type { TamboTool } from "@tambo-ai/react";
import client from "@/hc.js";

export const ExecuteQueryInputSchema = z
  .object({
    sql: z.string().describe("The SQL query to execute"),
    threadId: z.string().describe("Current thread Id , it is very important"),
  })
  .describe("Input for executing SQL query");

export const ExecuteQueryOutputSchema = z
  .object({
    success: z.boolean(),
    sql: z.string(),
    data: z
      .object({
        rows: z.array(z.object()),
        columns: z.array(z.string()),
        rowCount: z.number(),
      })
      .optional(),
    visualization: z
      .object({
        type: z.enum(["table", "bar", "line"]),
        xKey: z.string().optional(),
        yKey: z.string().optional(),
      })
      .optional(),
    error: z
      .object({
        message: z.string(),
      })
      .optional(),
  })
  .describe("Output of SQL query execution");

export type ExecuteQueryInput = z.infer<typeof ExecuteQueryInputSchema>;
export type ExecuteQueryOutput = z.infer<typeof ExecuteQueryOutputSchema>;

async function executeQueryFunction(
  input: ExecuteQueryInput,
): Promise<ExecuteQueryOutput> {
  const response = await client.api.sql.execute.$post({
    json: { sql: input.sql },
  });

  if (!response.ok) throw new Error("failed to execute query");

  const result = await response.json();
  return result.data as ExecuteQueryOutput;
}

export const executeQueryTool: TamboTool = {
  name: "executeQuery",
  description:
    "Execute a SQL query against the database. Returns data with columns and suggested visualization type (table, bar chart, or line chart). Use after user confirms they want to run a query.",
  tool: executeQueryFunction,
  inputSchema: ExecuteQueryInputSchema,
  outputSchema: ExecuteQueryOutputSchema,
  annotations: {
    tamboStreamableHint: false,
  },
};
