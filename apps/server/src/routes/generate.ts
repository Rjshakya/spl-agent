import { Hono } from "hono";
import { HONOVARS } from "../middlewares/auth";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import SqlGeneratorWorkflow from "../workflows/sql-generator";
import { ApiResponse } from "../lib/api-success";

export const SqlGenerationApi = new Hono<HONOVARS>().post(
  "/",
  zValidator("json", z.object({ prompt: z.string(), threadId: z.string() })),
  async (c) => {
    const { prompt, threadId } = c.req.valid("json");
    const userId = c.get("userId");

    const data = await SqlGeneratorWorkflow({
      userId,
      userPrompt: prompt,
      threadId: threadId,
    });
    return c.json(ApiResponse({ data, message: "sql generated" }));
  },
);
