import { Hono } from "hono";
import { getAuth } from "./lib/auth";
import api from "./routes/api";
import { authMiddleware } from "./middlewares/auth";

const app = new Hono();

app
  .get("/", (c) => {
    return c.text("Hello Hono!");
  })
  .on(["POST", "GET"], "/api/auth/*", async (c) => {
    const auth = await getAuth();
    return auth.handler(c.req.raw);
  })
  .use(authMiddleware)
  .route("/api", api);

export default app;
