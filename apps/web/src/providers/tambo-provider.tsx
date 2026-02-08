"use client";

import { TamboProvider as TamboProviderPrimitive } from "@tambo-ai/react";
import { sqlResultsComponent } from "@/components/tambo/sql-results";
import { dataChartComponent } from "@/components/tambo/data-chart";
import { queryPermissionComponent } from "@/components/tambo/query-permission-box";
import { generateSqlTool } from "@/tools/generate-sql";
import { executeQueryTool } from "@/tools/execute-query";
import { env } from "@/lib/env";

const components = [
  sqlResultsComponent,
  dataChartComponent,
  queryPermissionComponent,
];
const tools = [generateSqlTool, executeQueryTool];

interface TamboProviderProps {
  children: React.ReactNode;
}

export function TamboProvider({ children }: TamboProviderProps) {
  if (!env.tamboApiKey) {
    console.error(
      "TAMBO_API_KEY is not set. Please set VITE_TAMBO_API_KEY in your .env file.",
    );
  }

  return (
    <TamboProviderPrimitive
      apiKey={env.tamboApiKey}
      components={components}
      tools={tools}
    >
      {children}
    </TamboProviderPrimitive>
  );
}
