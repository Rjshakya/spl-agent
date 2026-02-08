import { Hono } from "hono";
import { HONOVARS } from "../middlewares/auth";
import { Effect } from "effect";
import { getTableColumns, getTables } from "../lib/context-tools";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import { ApiResponse } from "../lib/api-success";
import { SqlQueryGeneratorService } from "../services/sql-query-generator";
import SqlGeneratorWorkflow from "../workflows/sql-generator";
import SqlExecuteWorkflow from "../workflows/sql-executor";
import { ConnectionService } from "../services/connections";

const toolsApi = new Hono<HONOVARS>()
  .post(
    "/getTables",
    zValidator(
      "json",
      z.object({
        connectionId: z.string(),
      }),
    ),
    async (c) => {
      const { connectionId } = c.req.valid("json");
      const connectionService = await ConnectionService();
      const program = Effect.gen(function* () {
        const connection =
          yield* connectionService.getConnectionById(connectionId);
        const tables = yield* getTables(connection.connectionString);
        return tables;
      });
      const tables = await Effect.runPromise(program);
      return c.json(
        ApiResponse({ data: tables, message: "tables list from database" }),
      );
    },
  )
  .post(
    "/getColumnsDetails",
    zValidator(
      "json",
      z.object({
        tableName: z.string(),
        connectionId: z.string(),
      }),
    ),
    async (c) => {
      const { tableName, connectionId } = c.req.valid("json");

      const connectionService = await ConnectionService();
      const program = Effect.gen(function* () {
        const connection =
          yield* connectionService.getConnectionById(connectionId);
        const columns = yield* getTableColumns(
          connection.connectionString,
          tableName,
        );
        return columns;
      });
      const columns = await Effect.runPromise(program);

      return c.json(
        ApiResponse({
          data: columns,
          message: `columns details from table ${tableName}`,
        }),
      );
    },
  )
  .post(
    "/getFullContextOfDatabase",
    zValidator(
      "json",
      z.object({
        connectionId: z.string(),
      }),
    ),
    async (c) => {
      const { connectionId } = c.req.valid("json");

      const connectionService = await ConnectionService();
      const program = Effect.gen(function* () {
        const connection =
          yield* connectionService.getConnectionById(connectionId);

        const tablesWithColumns = yield* getTables(
          connection.connectionString,
        ).pipe(
          Effect.andThen((tables) => {
            const tableColumns = tables.map((t) =>
              getTableColumns(connection.connectionString, t),
            );
            return Effect.all(tableColumns);
          }),
        );
        return tablesWithColumns;
      });

      const tables = await Effect.runPromise(program);

      return c.json(
        ApiResponse({
          data: tables,
          message: "full context about the database , its tables and columns",
        }),
      );
    },
  )
  .post(
    "/sql/generate",
    zValidator(
      "json",
      z.object({
        connectionId: z.string(),
        context: z.string(),
        userQuery: z.string(),
        threadId: z.string(),
      }),
    ),
    async (c) => {
      const { connectionId, context, userQuery, threadId } =
        c.req.valid("json");
      const userId = c.get("userId");

      const connectionService = await ConnectionService();
      const getConnection = Effect.gen(function* () {
        const connection =
          yield* connectionService.getConnectionById(connectionId);
        return connection.connectionString;
      });
      const program = Effect.gen(function* () {
        const connectionString = yield* getConnection;
        const result = yield* SqlQueryGeneratorService.generateSqlQuery({
          connectionString,
          context,
          userId,
          userQuery,
          threadId,
        });
        return result;
      });
      const result = await Effect.runPromise(program);

      return c.json(
        ApiResponse({
          data: result,
          message: "SQL query generated successfully",
        }),
      );
    },
  )
  .post(
    "/workflow/sql/generate",
    zValidator(
      "json",
      z.object({
        connectionId: z.string(),
        userQuery: z.string(),
        threadId: z.string(),
      }),
    ),
    async (c) => {
      const { userQuery, threadId, connectionId } = c.req.valid("json");
      const userId = c.get("userId");

      const result = await SqlGeneratorWorkflow({
        userId,
        userPrompt: userQuery,
        threadId,
        connectionId,
      });

      return c.json(
        ApiResponse({
          data: result,
          message: "SQL generation workflow completed",
        }),
      );
    },
  )
  .post(
    "/workflow/sql/execute",
    zValidator(
      "json",
      z.object({
        connectionId: z.string(),
        sql: z.string(),
      }),
    ),
    async (c) => {
      const { sql, connectionId } = c.req.valid("json");
      const userId = c.get("userId");

      const result = await SqlExecuteWorkflow({
        userId,
        sql,
        connectionId,
      });

      if (!result || !result.success) {
        return c.json(
          ApiResponse({
            data: null,
            message: "Query execution failed",
            error: { message: "failed to execute queries" },
          }),
          400,
        );
      }

      return c.json(
        ApiResponse({
          data: result,
          message: "Query executed successfully",
        }),
      );
    },
  );

export default toolsApi;
