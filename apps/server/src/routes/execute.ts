import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import { HONOVARS } from "../middlewares/auth";
import SqlExecuteWorkflow from "../workflows/sql-executor";
import { ApiResponse } from "../lib/api-success";

export const SqlExecutionApi = new Hono<HONOVARS>().post(
  "/",
  zValidator("json", z.object({ sql: z.string() })),
  async (c) => {
    const { sql } = c.req.valid("json");
    const userId = c.get("userId");

    const result = await SqlExecuteWorkflow({ userId, sql });

    if (result?.success) {
      return c.json(
        ApiResponse({ data: result, message: "Query executed successfully" }),
        200,
      );
    } else {
      return c.json(
        ApiResponse({
          data: result,
          message: "Query execution failed",
          error: "Query execution failed",
        }),
        400,
      );
    }
  },
);

export default SqlExecutionApi;
