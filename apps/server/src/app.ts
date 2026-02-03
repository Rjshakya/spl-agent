import { Hono } from "hono";
import { getAuth } from "./lib/auth";
import api from "./routes/sql-agent";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.on(["POST", "GET"], "/api/auth/*", async (c) => {
  const auth = await getAuth();
  return auth.handler(c.req.raw);
});

app.route("/api", api);

export default app;
