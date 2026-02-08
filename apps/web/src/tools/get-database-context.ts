import { z } from "zod";
import type { TamboTool } from "@tambo-ai/react";
import client from "@/hc.js";
import { useConnectionStore } from "@/store/connection-store";

export const GetDatabaseContextInputSchema = z
  .object({
    // connectionId: z
    //   .string()
    //   .describe("The ID of the database connection to use"),
  })
  .describe(
    "Input for fetching full database context including all tables and columns",
  );

export const GetDatabaseContextOutputSchema = z
  .object({
    tables: z.array(z.string()).describe("List of all table names"),
    columns: z
      .array(
        z.array(
          z.object({
            name: z.string(),
            type: z.string(),
            isNullable: z.boolean(),
            isPrimary: z.boolean(),
          }),
        ),
      )
      .describe("Column details for each table"),
  })
  .describe("Complete database schema context");

export type GetDatabaseContextInput = z.infer<
  typeof GetDatabaseContextInputSchema
>;
export type GetDatabaseContextOutput = z.infer<
  typeof GetDatabaseContextOutputSchema
>;

async function getDatabaseContextFunction(): Promise<GetDatabaseContextOutput> {
// input: GetDatabaseContextInput,
  const connectionId = useConnectionStore.getState().selectedConnectionId;
  if (!connectionId) throw new Error("No connection is selected");
  const response = await client.api.tools.getFullContextOfDatabase.$post({
    json: { connectionId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch database context: ${error}`);
  }

  const result = await response.json();
  const data = result.data as Array<
    Array<{
      name: string;
      type: string;
      isNullable: boolean;
      isPrimary: boolean;
    }>
  >;

  // Transform the data into the expected format
  // First array is tables, rest are column details for each table
  const tables: string[] = (data[0] as unknown as string[]) || [];
  const columns: Array<
    Array<{
      name: string;
      type: string;
      isNullable: boolean;
      isPrimary: boolean;
    }>
  > = data.slice(1) || [];

  return {
    tables,
    columns,
  };
}

export const getDatabaseContextTool: TamboTool = {
  name: "getDatabaseContext",
  description:
    "Retrieve complete database context including all tables and their column details. Use this for comprehensive schema understanding before complex queries.",
  tool: getDatabaseContextFunction,
  inputSchema: GetDatabaseContextInputSchema,
  outputSchema: GetDatabaseContextOutputSchema,
  annotations: {
    tamboStreamableHint: false,
  },
};
