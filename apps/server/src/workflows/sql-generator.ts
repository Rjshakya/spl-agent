import { Data, Effect, pipe, Schedule } from "effect";
import { DatabaseContextService } from "../services/context-service";
import { ConnectionService } from "../services/connections";
import { SqlQueryGeneratorService } from "../services/sql-query-generator";

type SqlGeneratorWorkflowInput = {
  userId: string;
  userPrompt: string;
  threadId: string;
  connectionId?: string;
};

export class SqlGeneratorWorkflowError extends Data.TaggedError(
  "SqlGeneratorWorkflowError",
)<{
  readonly message: string;
  readonly cause?: unknown;
  readonly step: string;
}> {}

const SqlGeneratorWorkflow = async (input: SqlGeneratorWorkflowInput) => {
  const { userId, userPrompt, threadId, connectionId } = input;

  const retryPolicy = Schedule.exponential("200 millis");
  const timeOut = Effect.timeout("10 minutes");

  const connectionService = await ConnectionService();
  const contextService = DatabaseContextService.getContext;
  const sqlGenService = SqlQueryGeneratorService;

  const getConnectionString = Effect.gen(function* () {
    if (connectionId) {
      const getConnection =
        yield* connectionService.getConnectionById(connectionId);
      return getConnection.connectionString;
    }

    const userConnections =
      yield* connectionService.getPgConnectionsOfUser(userId);
    return userConnections[0].connectionString;
  });
  const program = Effect.gen(function* () {
    const connectionString = yield* getConnectionString;

    const context = yield* contextService(
      connectionString,
      userPrompt,
      userId,
      threadId,
    );

    const generateSql = yield* Effect.retry(
      sqlGenService.generateSqlQuery({
        connectionString,
        context: context.schemaContext,
        threadId,
        userId,
        userQuery: userPrompt,
      }),
      retryPolicy,
    ).pipe(timeOut);

    return generateSql;
  });

  return Effect.runPromise(program);
};

export default SqlGeneratorWorkflow;
