import { z } from "zod";
import type { TamboTool } from "@tambo-ai/react";
import client from "@/hc.js";
import { useConnectionStore } from "@/store/connection-store";

export const GetDatabaseTablesInputSchema = z
  .object({})
  .describe("Input for fetching database table names");

export const GetDatabaseTablesOutputSchema = z
  .array(z.string())
  .describe("Array of table names in the database");

export type GetDatabaseTablesInput = z.infer<
  typeof GetDatabaseTablesInputSchema
>;
export type GetDatabaseTablesOutput = z.infer<
  typeof GetDatabaseTablesOutputSchema
>;

async function getDatabaseTablesFunction(
  // input: GetDatabaseTablesInput,
): Promise<GetDatabaseTablesOutput> {
  const connectionId = useConnectionStore.getState().selectedConnectionId;
  if (!connectionId) throw new Error("No connection is selected");
  const response = await client.api.tools.getTables.$post({
    json: { connectionId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch tables: ${error}`);
  }

  const result = await response.json();
  return result.data as GetDatabaseTablesOutput;
}

export const getDatabaseTablesTool: TamboTool = {
  name: "getDatabaseTables",
  description:
    "Retrieve all table names from the connected database. Use this to explore what tables are available before querying.",
  tool: getDatabaseTablesFunction,
  inputSchema: GetDatabaseTablesInputSchema,
  outputSchema: GetDatabaseTablesOutputSchema,
  annotations: {
    tamboStreamableHint: false,
  },
};
