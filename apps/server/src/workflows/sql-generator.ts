import { Data, Effect, pipe, Schedule } from "effect";
import { DatabaseContextService } from "../services/context-service";
import { ConnectionService } from "../services/connections";
import { SqlQueryGeneratorService } from "../services/sql-query-generator";

type SqlGeneratorWorkflowInput = {
  userId: string;
  userPrompt: string;
  threadId: string;
};

export class SqlGeneratorWorkflowError extends Data.TaggedError(
  "SqlGeneratorWorkflowError",
)<{
  readonly message: string;
  readonly cause?: unknown;
  readonly step: string;
}> {}

const SqlGeneratorWorkflow = async (input: SqlGeneratorWorkflowInput) => {
  const { userId, userPrompt, threadId } = input;
  const retryPolicy = Schedule.exponential("200 millis");
  const retry = Effect.retry(retryPolicy);
  const timeOut = Effect.timeout("10 minutes");

  const connectionService = await ConnectionService();
  const contextService = DatabaseContextService.getContext;
  const sqlGenService = SqlQueryGeneratorService;

  const userConnection = await Effect.runPromise(
    connectionService
      .getPgConnectionsOfUser(userId)
      .pipe(Effect.map((data) => data[0].connectionString)),
  );

  const generateContext = Effect.tryPromise({
    try: async () => {
      const res = await Effect.runPromise(
        contextService(userConnection, userPrompt, userId, threadId),
      );

      console.log(res.schemaContext);
      return res.schemaContext;
    },
    catch: (e) => {
      throw new Error("");
    },
  }).pipe(
    Effect.mapError(
      (e) =>
        new SqlGeneratorWorkflowError({
          message: "failed to generateContext",
          cause: e,
          step: "generateContext",
        }),
    ),
    retry,
    timeOut,
  );

  const generateSql = (context: string) =>
    Effect.tryPromise({
      try: async () => {
        const output = await Effect.runPromise(
          sqlGenService.generateSqlQuery({
            connectionString: userConnection,
            context,
            userId,
            userQuery: userPrompt,
            threadId,
          }),
        );

        return output;
      },
      catch: (e) => {
        return e;
      },
    }).pipe(
      retry,
      Effect.mapError(
        (e) =>
          new SqlGeneratorWorkflowError({
            message: "failed to generate query",
            step: "generateSql",
            cause: e,
          }),
      ),
      timeOut,
    );

  const program = pipe(generateContext, Effect.andThen(generateSql));
  const result = await Effect.runPromise(program);
  return result;
};

export default SqlGeneratorWorkflow;
