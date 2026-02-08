"use client";

import { TamboProvider as TamboProviderPrimitive } from "@tambo-ai/react";
import { sqlResultsComponent } from "@/components/tambo/sql-results";
import { dataChartComponent } from "@/components/tambo/data-chart";
import { queryPermissionComponent } from "@/components/tambo/query-permission-box";
import { getDatabaseTablesTool } from "@/tools/get-database-tables";
import { getTableColumnsTool } from "@/tools/get-table-columns";
import { getDatabaseContextTool } from "@/tools/get-database-context";
import { generateSqlTool } from "@/tools/generate-sql";
import { generateSqlWorkflowTool } from "@/tools/generate-sql-workflow";
import { executeSqlTool } from "@/tools/execute-sql";
import { env } from "@/lib/env";

const components = [
  sqlResultsComponent,
  dataChartComponent,
  queryPermissionComponent,
];

const tools = [
  getDatabaseTablesTool,
  getTableColumnsTool,
  getDatabaseContextTool,
  generateSqlTool,
  generateSqlWorkflowTool,
  executeSqlTool,
];

interface TamboProviderProps {
  children: React.ReactNode;
}

export function TamboProvider({ children }: TamboProviderProps) {
  // const { data } = authClient.useSession();
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
      // userToken={data?.session?.token}
      // additionalHeaders={{Authorization: `Bearer ${data?.session.token}`}}
    >
      {children}
    </TamboProviderPrimitive>
  );
}
