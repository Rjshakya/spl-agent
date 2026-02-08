import { Data, Effect, pipe, Schedule } from "effect";
import { ConnectionService } from "../services/connections";
import { QueryExecutorService } from "../services/query-executor";

type SqlExecuteInput = {
  userId: string;
  sql: string;
  connectionId?: string;
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
  const { userId, sql, connectionId } = input;

  // Config
  const retryPolicy = Schedule.exponential("200 millis");
  const timeOut = Effect.timeout("10 minutes");

  const connectionService = await ConnectionService();
  const executorService = QueryExecutorService;

  const connection = Effect.gen(function* () {
    if (connectionId) {
      const getConnection =
        yield* connectionService.getConnectionById(connectionId);
      return getConnection.connectionString;
    }
    const getUserConnections =
      yield* connectionService.getPgConnectionsOfUser(userId);
    return getUserConnections[0].connectionString;
  });

  const execute = Effect.gen(function* () {
    const validQuery = yield* executorService
      .validateQuery(sql)
      .pipe(Effect.andThen((q) => executorService.ensureLimit(q.sql)));

    const connectionString = yield* Effect.retry(connection, retryPolicy).pipe(
      timeOut,
    );

    const queryResult = yield* executorService.executeQuery(
      validQuery,
      connectionString,
    );
    const visualization = yield* executorService.determineVisualization(
      queryResult.columns,
      queryResult.rows,
    );

    return {
      success: true,
      sql: validQuery,
      data: {
        rows: queryResult.rows,
        columns: queryResult.columns,
        rowCount: queryResult.rowCount,
      },
      visualization,
    };
  })

  return Effect.runPromise(execute)
};

export default SqlExecuteWorkflow;
