import { z } from "zod";
import type { TamboComponent } from "@tambo-ai/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.js";
import { Badge } from "@/components/ui/badge.js";
import { Separator } from "@/components/ui/separator.js";

export const SqlResultsPropsSchema = z
  .object({
    sql: z.string(),
    columns: z.array(z.string()),
    data: z.array(z.any()),
    executionTime: z.number().optional(),
    rowCount: z.number().optional(),
  })
  .describe("Display SQL query results in a styled data table");

export type SqlResultsProps = z.infer<typeof SqlResultsPropsSchema>;

function SqlResults({
  sql,
  columns,
  data,
  executionTime,
  rowCount,
}: SqlResultsProps) {
  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Query Results</CardTitle>
          <div className="flex gap-2">
            {executionTime && (
              <Badge variant="outline" className="text-xs">
                {executionTime.toFixed(2)}ms
              </Badge>
            )}
            {rowCount !== undefined && (
              <Badge variant="secondary" className="text-xs">
                {rowCount} rows
              </Badge>
            )}
          </div>
        </div>
        <CardDescription className="font-mono text-xs">
          <code className="bg-muted px-2 py-1 rounded">{sql}</code>
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                {columns.map((column) => (
                  <th
                    key={column}
                    className="text-left py-2 px-3 font-medium text-muted-foreground"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b last:border-0">
                  {columns.map((column) => (
                    <td key={`${rowIndex}-${column}`} className="py-2 px-3">
                      {formatValue(row[column])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "—";
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (value instanceof Date) {
    return value.toLocaleDateString();
  }
  return String(value);
}

export const sqlResultsComponent: TamboComponent = {
  component: SqlResults,
  name: "SqlResults",
  description:
    "Display SQL query results in a data table. Use for tabular data output from database queries.",
  propsSchema: SqlResultsPropsSchema,
};

export { SqlResults };
