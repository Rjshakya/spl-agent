import { Hono } from "hono";
import { getAuth } from "./lib/auth";
import api from "./routes/api";
import { authMiddleware } from "./middlewares/auth";
import { cors } from "hono/cors";
import { env } from "cloudflare:workers";

export const app = new Hono()
  .use(
    cors({
      origin: [env.CLIENT_URL],
      credentials: true,
    }),
  )
  .get("/", (c) => {
    return c.text("Hello Hono!");
  })
  .on(["POST", "GET"], "/api/auth/*", async (c) => {
    const auth = await getAuth();
    return auth.handler(c.req.raw);
  })
  .use(authMiddleware)
  .route("/api", api);

export default { fetch: app.fetch } as ExportedHandler;
