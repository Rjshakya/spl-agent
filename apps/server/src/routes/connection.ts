import { Hono } from "hono";
import { HONOVARS } from "../middlewares/auth";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import { connectionInsertSchema } from "../db/schema/connections";
import { ConnectionService } from "../services/connections";
import { Effect } from "effect";
import { ApiResponse } from "../lib/api-success";
import { DATA_SOURCES } from "../lib/data-sources";

export const connectionApi = new Hono<HONOVARS>()
  .post(
    "/",
    zValidator(
      "json",
      connectionInsertSchema.extend({
        source: z.enum(DATA_SOURCES),
      }),
    ),
    async (c) => {
      const params = c.req.valid("json");
      const service = await ConnectionService();

      const connection = await Effect.runPromise(
        service.createConnection(params),
      );

      return c.json(
        ApiResponse({ data: connection, message: "connection created" }),
        200,
      );
    },
  )
  .get("/my", async (c) => {
    const userId = c.get("userId");
    const service = await ConnectionService();
    const data = await Effect.runPromise(
      service.getConnectionsByUserId(userId),
    );

    return c.json(ApiResponse({ data, message: "user connections" }), 200);
  })
  .get(
    "/:connectionId",
    zValidator("param", z.object({ connectionId: z.string() })),
    async (c) => {
      const { connectionId } = c.req.valid("param");
      const service = await ConnectionService();
      const data = await Effect.runPromise(
        service.getConnectionById(connectionId),
      );
      return c.json(ApiResponse({ data, message: "connections" }), 200);
    },
  )
  .delete(
    "/:connectionId",
    zValidator("param", z.object({ connectionId: z.string() })),
    async (c) => {
      const { connectionId } = c.req.valid("param");
      const service = await ConnectionService();
      const data = await Effect.runPromise(
        service.deleteConnection(connectionId),
      );
      return c.json(ApiResponse({ data, message: "connection deleted" }), 200);
    },
  );
