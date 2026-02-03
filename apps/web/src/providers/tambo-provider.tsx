"use client";

import { TamboProvider as TamboProviderPrimitive } from "@tambo-ai/react";
import { sqlResultsComponent } from "@/components/tambo/sql-results.js";
import { dataChartComponent } from "@/components/tambo/data-chart.js";
import { executeSqlTool } from "@/tools/execute-sql.js";

const TAMBO_API_KEY = import.meta.env.VITE_TAMBO_API_KEY || "";

const components = [sqlResultsComponent, dataChartComponent];

const tools = [executeSqlTool];

interface TamboProviderProps {
  children: React.ReactNode;
}

export function TamboProvider({ children }: TamboProviderProps) {
  if (!TAMBO_API_KEY) {
    console.error(
      "TAMBO_API_KEY is not set. Please set VITE_TAMBO_API_KEY in your .env file.",
    );
  }

  return (
    <TamboProviderPrimitive
      apiKey={TAMBO_API_KEY}
      components={components}
      tools={tools}
    >
      {children}
    </TamboProviderPrimitive>
  );
}
