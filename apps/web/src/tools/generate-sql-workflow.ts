import { z } from "zod";
import type { TamboTool } from "@tambo-ai/react";
import client from "@/hc";
import { useConnectionStore } from "@/store/connection-store";

export const GenerateSqlWorkflowInputSchema = z
  .object({
    userQuery: z
      .string()
      .describe("Natural language description of the SQL query to generate"),
    threadId: z.string().describe("Current conversation thread ID"),
  })
  .describe("Input for generating SQL query with automatic context gathering");

export const GenerateSqlWorkflowOutputSchema = z
  .object({
    query: z.string().describe("The generated SQL query"),
  })
  .describe("Generated SQL query result");

export type GenerateSqlWorkflowInput = z.infer<
  typeof GenerateSqlWorkflowInputSchema
>;
export type GenerateSqlWorkflowOutput = z.infer<
  typeof GenerateSqlWorkflowOutputSchema
>;

async function generateSqlWorkflowFunction(
  input: GenerateSqlWorkflowInput,
): Promise<GenerateSqlWorkflowOutput> {
  const connectionId = useConnectionStore.getState().selectedConnectionId;
  if (!connectionId) throw new Error("No connection is selected");
  const response = await client.api.tools.workflow.sql.generate.$post({
    json: {
      connectionId,
      userQuery: input.userQuery,
      threadId: input.threadId,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to generate SQL: ${error}`);
  }

  const result = await response.json();
  return result.data as GenerateSqlWorkflowOutput;
}

export const generateSqlWorkflowTool: TamboTool = {
  name: "generateSqlWorkflow",
  description:
    "Generate a SQL query from natural language with automatic database context discovery. Use this when you want the system to automatically explore the database schema and generate an appropriate query.",
  tool: generateSqlWorkflowFunction,
  inputSchema: GenerateSqlWorkflowInputSchema,
  outputSchema: GenerateSqlWorkflowOutputSchema,
  annotations: {
    tamboStreamableHint: false,
  },
};
