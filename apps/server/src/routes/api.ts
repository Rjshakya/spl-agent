import { Hono } from "hono";
import { connectionApi } from "./connection.js";
import { SqlGenerationApi } from "./generate.js";
import { SqlExecutionApi } from "./execute.js";
import toolsApi from "./tools.js";

const api = new Hono()

  .get("/health", (c) => {
    return c.json({ status: "ok", service: "sql-agent" });
  })
  .route("/connection", connectionApi)
  .route("/sql/generate", SqlGenerationApi)
  .route("/sql/execute", SqlExecutionApi)
  .route("/tools", toolsApi);

export default api;
