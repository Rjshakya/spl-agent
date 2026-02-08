import { Data, Effect, pipe, Schedule } from "effect";
import { ConnectionService } from "../services/connections";
import { QueryExecutorService } from "../services/query-executor";

type SqlExecuteInput = {
  userId: string;
  sql: string;
};

export class SqlExecuteWorkflowError extends Data.TaggedError(
  "SqlExecuteWorkflowError",
)<{
  readonly message: string;
  readonly cause?: unknown;
  readonly step: string;
}> {}

export interface ExecuteResult {
  success: boolean;
  sql: string;
  data?: {
    rows: Record<string, unknown>[];
    columns: string[];
    rowCount: number;
  };
  visualization?: {
    type: "table" | "bar" | "line";
    xKey?: string;
    yKey?: string;
  };
  error?: {
    message: string;
  };
}

const SqlExecuteWorkflow = async (input: SqlExecuteInput) => {
  const { userId, sql } = input;

  // Config
  const retryPolicy = Schedule.exponential("200 millis");
  const retry = Effect.retry(retryPolicy);
  const timeOut = Effect.timeout("10 minutes");

  const connectionService = await ConnectionService();
  const executorService = QueryExecutorService;

  // Step 1: Validate query (SELECT only)
  const validateStep = Effect.tryPromise({
    try: async () => {
      const result = await Effect.runPromise(
        executorService.validateQuery(sql),
      );
      if (result.success) return result.sql;
      throw new Error("sql validation error");
    },
    catch: (e) => {
      return new SqlExecuteWorkflowError({
        message: e instanceof Error ? e.message : "Query validation failed",
        cause: e,
        step: "validation",
      });
    },
  }).pipe(timeOut);

  // Step 2: Ensure LIMIT clause
  const addLimitStep = (originalSql: string) =>
    Effect.sync(() => {
      return executorService.ensureLimit(originalSql);
    });

  // Step 3: Get user connection
  const getConnectionStep = Effect.tryPromise({
    try: async () => {
      const connections = await Effect.runPromise(
        connectionService.getPgConnectionsOfUser(userId),
      );
      if (connections.length === 0) {
        throw new Error("No database connections found");
      }
      return connections[0].connectionString;
    },
    catch: (e) =>
      new SqlExecuteWorkflowError({
        message: "Failed to get database connection",
        cause: e,
        step: "getConnection",
      }),
  }).pipe(retry, timeOut);

  // Step 4: Execute query
  const executeStep = ({
    connectionString,
    finalSql,
  }: {
    finalSql: string;
    connectionString: string;
  }) =>
    Effect.tryPromise({
      try: async () => {
        const result = await Effect.runPromise(
          executorService.executeQuery(finalSql, connectionString),
        );
        return result;
      },
      catch: (e) => {
        throw new SqlExecuteWorkflowError({
          message: "we failed to execute queries",
          cause: e,
          step: "execution",
        });
      },
    }).pipe(retry, timeOut);

  // Step 5: Determine visualization
  const visualizationStep = ({
    columns,
    rows,
  }: {
    columns: string[];
    rows: Record<string, unknown>[];
  }) =>
    Effect.tryPromise({
      try: async () => {
        const viz = await Effect.runPromise(
          executorService.determineVisualization(columns, rows),
        );
        return viz;
      },
      catch: () => {
        // If visualization fails, return table as default
        return { type: "table" as const };
      },
    });

  const runWorkflow = Effect.gen(function* () {
    const validatedQuery = yield* validateStep;
    const QueryWithLimitClause = yield* addLimitStep(validatedQuery);
    const connection = yield* getConnectionStep;
    const queryResult = yield* executeStep({
      finalSql: QueryWithLimitClause,
      connectionString: connection,
    });
    const visualization = yield* visualizationStep({
      columns: queryResult.columns,
      rows: queryResult.rows,
    });
    return {
      success: true,
      sql: QueryWithLimitClause,
      data: {
        rows: queryResult.rows,
        columns: queryResult.columns,
        rowCount: queryResult.rowCount,
      },
      visualization,
    };
  });

  return Effect.runPromise(runWorkflow).catch(console.log);
};

export default SqlExecuteWorkflow;
