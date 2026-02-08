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
import { useMemo } from "react";

// Flat structure matching executeSql tool output
export const SqlResultsPropsSchema = z
  .object({
    success: z
      .boolean()
      .optional()
      .describe("Whether query executed successfully"),
    sql: z.string().optional().describe("The executed SQL query"),
    rows: z
      .any()
      .optional()
      .describe(
        "It is rows , from data.rows, that you will get from tool call result. Return the array , not string.",
      ),
    columns: z.array(z.string()).optional().describe("Column names"),
    rowCount: z.number().optional().describe("Number of rows returned"),
  })
  .describe("Display SQL query results in a styled data table");

export type SqlResultsProps = z.infer<typeof SqlResultsPropsSchema>;

function SqlResults({
  success,
  sql,
  rows,
  columns,
  rowCount,
}: SqlResultsProps) {
  const parsedRows = useMemo(() => {
    if (!rows) return;
    const _rows = JSON.parse(rows);
    return _rows;
  }, [rows]);

  if (!success || !sql || !columns || !rows) return null;
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
      <CardContent className="">
        <Table className=" no-scrollbar" style={{ scrollbarWidth: "none" }}>
          <TableHeader>
            <TableRow>
              {columns &&
                columns?.length > 0 &&
                columns?.map?.((column) => (
                  <TableHead key={column}>{column}</TableHead>
                ))}
            </TableRow>
          </TableHeader>
          <TableBody className="">
            {rows &&
              parsedRows &&
              parsedRows?.length > 0 &&
              parsedRows?.map?.(
                (row: Record<string, unknown>, rowIndex: number) => (
                  <TableRow className="" key={rowIndex}>
                    {columns.map((column) => (
                      <TableCell key={`${rowIndex}-${column}`}>
                        {formatValue(row?.[column])}
                      </TableCell>
                    ))}
                  </TableRow>
                ),
              )}
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
