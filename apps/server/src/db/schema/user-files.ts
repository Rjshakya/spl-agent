import * as t from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { v7 } from "uuid";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const userFilesTable = t.pgTable("user_files", {
  id: t
    .text("id")
    .primaryKey()
    .$default(() => v7()),
  userId: t
    .text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  fileUrl: t.text("file_url").notNull(),
  type: t.text("type").notNull(),
  mediaType: t.text("media_type").notNull(),
  createdAt: t.timestamp("created_at").defaultNow().notNull(),
  updatedAt: t
    .timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const userFilesRelations = relations(userFilesTable, ({ one }) => ({
  user: one(user, { fields: [userFilesTable.userId], references: [user.id] }),
}));

export const createUserFilesInsertSchema = createInsertSchema(userFilesTable);
export const createUserFilesSelectSchema = createSelectSchema(userFilesTable);
