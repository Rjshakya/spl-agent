import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { user } from "./auth-schema.js";
import { v7 } from "uuid";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const connections = pgTable(
  "connections",
  {
    id: text("id")
      .primaryKey()
      .$default(() => v7()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    connectionString: text("connection_string").notNull(),
    source: text("source").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("connections_userId_idx").on(table.userId)],
);

export const connectionRelations = relations(connections, ({ one }) => ({
  user: one(user, {
    fields: [connections.userId],
    references: [user.id],
  }),
}));

export const connectionInsertSchema = createInsertSchema(connections);
export const connectionSelectSchema = createSelectSchema(connections);
