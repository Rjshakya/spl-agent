/**
 * SQL Agent types shared between frontend and backend
 */

export interface QueryRequest {
  query: string;
  visualizationType?: "table" | "bar" | "line" | "pie" | "auto";
}

export interface QueryResponse {
  sql: string;
  data: Record<string, unknown>[];
  columns: string[];
  componentType: "SqlResults" | "DataChart";
  chartConfig?: {
    type: "bar" | "line" | "pie";
    xKey: string;
    yKey: string;
    title?: string;
    xLabel?: string;
    yLabel?: string;
  };
  executionTime?: number;
  rowCount?: number;
}

export interface DatabaseSchema {
  tables: {
    name: string;
    columns: {
      name: string;
      type: string;
      isNullable: boolean;
      isPrimary?: boolean;
      foreignKey?: {
        table: string;
        column: string;
      };
    }[];
  }[];
}

export interface SqlGenerationContext {
  schema: DatabaseSchema;
  userQuery: string;
  history?: string[];
}
