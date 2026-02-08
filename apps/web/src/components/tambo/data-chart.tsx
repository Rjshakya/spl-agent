import { z } from "zod";
import type { TamboComponent } from "@tambo-ai/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.js";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis } from "recharts";

export const DataChartPropsSchema = z
  .object({
    type: z
      .enum(["bar", "line"])
      .optional()
      .describe("Chart type: bar or line"),
    data: z.array(z.object()).optional().describe("Array of data objects"),
    xKey: z
      .string()
      .optional()
      .describe("Column name for X-axis (categorical)"),
    yKey: z.string().optional().describe("Column name for Y-axis (numeric)"),
    title: z.string().optional().describe("Chart title"),
  })
  .describe("Display data as bar or line chart");

export type DataChartProps = z.infer<typeof DataChartPropsSchema>;

function DataChart({ type, data, xKey, yKey = "", title }: DataChartProps) {
  const chartConfig: ChartConfig = {
    [yKey]: {
      label: yKey,
      color: "hsl(var(--chart-1))",
    },
  };

  if (!type || !data || !xKey || !yKey || !title) return null;

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {title || "Data Visualization"}
          </CardTitle>
          <Badge variant="outline" className="text-xs capitalize">
            {type} Chart
          </Badge>
        </div>
        <CardDescription>Showing {data.length} data points</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-75 w-full">
          {type === "bar" ? (
            <BarChart accessibilityLayer data={data}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey={xKey}
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey={yKey} fill={`var(--color-${yKey})`} radius={4} />
            </BarChart>
          ) : (
            <LineChart accessibilityLayer data={data}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey={xKey}
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey={yKey}
                stroke={`var(--color-${yKey})`}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export const dataChartComponent: TamboComponent = {
  component: DataChart,
  name: "DataChart",
  description:
    "Display data visualization as bar or line chart. Use for aggregations, time series, or comparisons from SQL queries.",
  propsSchema: DataChartPropsSchema,
};

export { DataChart };
