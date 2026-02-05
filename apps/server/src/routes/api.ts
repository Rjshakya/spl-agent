import { Hono } from "hono";
import { connectionApi } from "./connection.js";

const api = new Hono()

  .get("/health", (c) => {
    return c.json({ status: "ok", service: "sql-agent" });
  })
  .route("/connection", connectionApi);

export default api;
