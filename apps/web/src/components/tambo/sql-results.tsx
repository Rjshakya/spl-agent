import { z } from "zod";
import type { TamboComponent } from "@tambo-ai/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect } from "react";

export const SqlResultsPropsSchema = z
  .object({
    sql: z.string().optional().describe("The executed SQL query"),
    columns: z
      .array(z.string())
      .optional()
      .describe("Column names array from the query result"),
    data: z.array(z.any()).optional().describe("Array of row objects"),
    rowCount: z.number().optional().describe("Number of rows returned"),
  })
  .describe("Display SQL query results in a styled data table");

export type SqlResultsProps = z.infer<typeof SqlResultsPropsSchema>;

function SqlResults({ sql, columns, data, rowCount }: SqlResultsProps) {
  useEffect(() => {
    console.log(data);
  }, [data]);

  if (!sql || !columns || !data || !rowCount) return null;
  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Query Results</CardTitle>
          {rowCount !== undefined && (
            <Badge variant="secondary" className="text-xs">
              {rowCount} rows
            </Badge>
          )}
        </div>
        <CardDescription className="font-mono text-xs">
          <code className="bg-muted px-2 py-1 rounded">{sql}</code>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {columns &&
                columns?.length > 0 &&
                columns?.map?.((column) => (
                  <TableHead key={column}>{column}</TableHead>
                ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data &&
              data?.length > 0 &&
              data?.map?.((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column) => (
                    <TableCell key={`${rowIndex}-${column}`}>
                      {formatValue(row?.[column])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
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
    return value?.toLocaleDateString();
  }
  return String(value);
}

export const sqlResultsComponent: TamboComponent = {
  component: SqlResults,
  name: "Table",
  description:
    "Display SQL query results in a data table. Use for tabular data output from database queries.",
  propsSchema: SqlResultsPropsSchema,
};

export { SqlResults };
