import { z } from "zod";
import type { TamboTool } from "@tambo-ai/react";
import client from "@/hc";
import { useConnectionStore } from "@/store/connection-store";

export const ExecuteSqlInputSchema = z
  .object({
    // connectionId: z
    //   .string()
    //   .describe("The ID of the database connection to use"),
    sql: z.string().describe("The SQL query to execute"),
    threadId: z.string().describe("Current conversation thread ID"),
  })
  .describe("Input for executing SQL query");

// Flat structure - no nesting for easier model understanding
export const ExecuteSqlOutputSchema = z
  .object({
    success: z.boolean().describe("Whether the query executed successfully"),
    sql: z.string().describe("The executed SQL query"),
    rows: z.array(z.any()).optional().describe("Query result rows"),
    columns: z.array(z.string()).optional().describe("Column names"),
    rowCount: z.number().optional().describe("Number of rows returned"),
    type: z
      .enum(["table", "bar", "line"])
      .optional()
      .describe("Visualization type recommendation"),
    xKey: z.string().optional().describe("Column for X-axis (for charts)"),
    yKey: z.string().optional().describe("Column for Y-axis (for charts)"),
  })
  .describe(
    "Query execution result with flat structure for easy component rendering",
  );

export type ExecuteSqlInput = z.infer<typeof ExecuteSqlInputSchema>;
export type ExecuteSqlOutput = z.infer<typeof ExecuteSqlOutputSchema>;

async function executeSqlFunction(
  input: ExecuteSqlInput,
): Promise<ExecuteSqlOutput> {
  const connectionId = useConnectionStore.getState().selectedConnectionId;
  if (!connectionId) throw new Error("No connection is selected");
  const { sql } = input;
  const response = await client.api.tools.workflow.sql.execute.$post({
    json: { connectionId, sql },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to execute query: ${error}`);
  }

  const result = await response.json();
  const data = result.data;

  console.log(data);

  // Flatten the structure for easier model understanding
  return {
    success: data.success,
    sql: data.sql,
    rows: data.data?.rows,
    columns: data.data?.columns,
    rowCount: data.data?.rowCount,
    type: data.visualization?.type,
    xKey: data.visualization?.xKey,
    yKey: data.visualization?.yKey,
  } as ExecuteSqlOutput;
}

export const executeSqlTool: TamboTool = {
  name: "executeSql",
  description:
    "Execute a SQL query against the database. Returns data with suggested visualization type. All properties are at top level (flat structure) for easy access. Use after user confirms they want to run a query.",
  tool: executeSqlFunction,
  inputSchema: ExecuteSqlInputSchema,
  outputSchema: ExecuteSqlOutputSchema,
  annotations: {
    tamboStreamableHint: false,
  },
};
