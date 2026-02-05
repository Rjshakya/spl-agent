import { createMiddleware } from "hono/factory";
import { getAuth } from "../lib/auth";

export type HONOVARS = {
  Variables: { userId: string; sessionId: string };
};
export const authMiddleware = createMiddleware(async (c, next) => {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    c.set("userId", null);
    c.set("sessionId", null);
    return c.json({ message: "Unauthorized Access" }, 400);
  }
  c.set("userId", session.user.id);
  c.set("sessionId", session.session.id);
  await next();
});
