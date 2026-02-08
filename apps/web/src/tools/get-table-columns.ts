import { z } from "zod";
import type { TamboTool } from "@tambo-ai/react";
import client from "@/hc.js";
import { useConnectionStore } from "@/store/connection-store";

export const GetTableColumnsInputSchema = z
  .object({
    tableName: z
      .string()
      .describe("The name of the table to get column details for"),
  })
  .describe("Input for fetching column details of a specific table");

export const GetTableColumnsOutputSchema = z
  .array(
    z.object({
      name: z.string(),
      type: z.string(),
      isNullable: z.boolean(),
      isPrimary: z.boolean(),
    }),
  )
  .describe(
    "Array of column information including name, type, and constraints",
  );

export type GetTableColumnsInput = z.infer<typeof GetTableColumnsInputSchema>;
export type GetTableColumnsOutput = z.infer<typeof GetTableColumnsOutputSchema>;

async function getTableColumnsFunction(
  input: GetTableColumnsInput,
): Promise<GetTableColumnsOutput> {
  const connectionId = useConnectionStore.getState().selectedConnectionId;
  if (!connectionId) throw new Error("No connection is selected");
  const response = await client.api.tools.getColumnsDetails.$post({
    json: {
      connectionId,
      tableName: input.tableName,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch columns: ${error}`);
  }

  const result = await response.json();
  return result.data as GetTableColumnsOutput;
}

export const getTableColumnsTool: TamboTool = {
  name: "getTableColumns",
  description:
    "Get detailed column information for a specific table including data types, nullability, and primary key status. Use this to understand table structure before writing queries.",
  tool: getTableColumnsFunction,
  inputSchema: GetTableColumnsInputSchema,
  outputSchema: GetTableColumnsOutputSchema,
  annotations: {
    tamboStreamableHint: false,
  },
};
