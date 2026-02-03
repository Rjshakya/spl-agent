import { z } from "zod";
import type { TamboTool } from "@tambo-ai/react";

export const ExecuteSqlToolInputSchema = z
  .object({
    query: z.string(),
    visualizationType: z
      .enum(["table", "bar", "line", "pie", "auto"])
      .default("auto"),
  })
  .describe("Input for executing natural language SQL queries");

export const ExecuteSqlToolOutputSchema = z
  .object({
    sql: z.string(),
    data: z.array(z.any()),
    columns: z.array(z.string()),
    componentType: z.enum(["SqlResults", "DataChart"]),
    chartConfig: z
      .object({
        type: z.enum(["bar", "line", "pie"]),
        xKey: z.string(),
        yKey: z.string(),
        title: z.string().optional(),
        xLabel: z.string().optional(),
        yLabel: z.string().optional(),
      })
      .optional(),
    executionTime: z.number().optional(),
    rowCount: z.number().optional(),
  })
  .describe("Output of SQL query execution with data and visualization config");

export type ExecuteSqlToolInput = z.infer<typeof ExecuteSqlToolInputSchema>;
export type ExecuteSqlToolOutput = z.infer<typeof ExecuteSqlToolOutputSchema>;

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8787";

async function executeSqlFunction(
  input: ExecuteSqlToolInput,
): Promise<ExecuteSqlToolOutput> {
  const response = await fetch(`${API_URL}/api/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to execute SQL: ${error}`);
  }

  return await response.json();
}

export const executeSqlTool: TamboTool = {
  name: "executeSql",
  description:
    "Execute a natural language query against the database. Converts user's question to SQL, executes it safely, and returns structured data. Use this tool when the user asks questions about data, statistics, or needs information from the database. The tool will automatically choose the appropriate visualization (table or chart) based on the data characteristics.",
  tool: executeSqlFunction,
  inputSchema: ExecuteSqlToolInputSchema,
  outputSchema: ExecuteSqlToolOutputSchema,
  annotations: {
    tamboStreamableHint: false,
  },
};
