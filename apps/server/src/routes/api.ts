import { Hono } from "hono";
import { connectionApi } from "./connection.js";
import { SqlGenerationApi } from "./generate.js";
import { SqlExecutionApi } from "./execute.js";

const api = new Hono()

  .get("/health", (c) => {
    return c.json({ status: "ok", service: "sql-agent" });
  })
  .route("/connection", connectionApi)
  .route("/sql/generate", SqlGenerationApi)
  .route("/sql/execute", SqlExecutionApi);

export default api;
