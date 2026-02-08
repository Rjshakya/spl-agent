import { z } from "zod";
import type { TamboTool } from "@tambo-ai/react";
import client from "@/hc.js";

export const GenerateSqlToolInputSchema = z
  .object({
    prompt: z
      .string()
      .describe("Natural language description of the SQL query to generate"),
    threadId: z.string().describe("Current thread Id , it is very important"),
  })
  .describe("Input for generating SQL query from natural language");

export const GenerateSqlToolOutputSchema = z
  .string()
  .describe("The generated SQL query");

export type GenerateSqlToolInput = z.infer<typeof GenerateSqlToolInputSchema>;
export type GenerateSqlToolOutput = z.infer<typeof GenerateSqlToolOutputSchema>;

async function generateSqlFunction(
  input: GenerateSqlToolInput,
): Promise<GenerateSqlToolOutput> {
  const response = await client.api.sql.generate.$post({
    json: { prompt: input.prompt, threadId: input.threadId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to generate SQL: ${error}`);
  }

  const data = await response.json();
  const clean = data.data.query.replaceAll(/\\n/g, " ");
  console.log(clean);
  return clean;
}

export const generateSqlTool: TamboTool = {
  name: "generateSql",
  description:
    "Generate a SQL query from natural language description. This tool converts user's natural language queries question into a proper SQL query that can be executed against the user's database. use it to generate db related queries.",
  tool: generateSqlFunction,
  inputSchema: GenerateSqlToolInputSchema,
  outputSchema: GenerateSqlToolOutputSchema,
  annotations: {
    tamboStreamableHint: false,
  },
};
