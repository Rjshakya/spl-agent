import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { env } from "node:process";

export const getOpenRouter = () =>
  createOpenRouter({
    apiKey: env.OPEN_ROUTER_API_KEY,
  });
