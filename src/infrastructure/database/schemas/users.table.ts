import { 
  pgTable, 
  timestamp, 
  uuid, 
  varchar ,
  uniqueIndex,
  index
} from "drizzle-orm/pg-core";
import { userStatusEnum } from "./enums/user-status.enum";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 25 }).notNull(),
  phone: varchar("phone", { length: 13 }).notNull(),
  status: userStatusEnum("status").default("ACTIVE").notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true
  }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true
  })
  .defaultNow()
  .$onUpdate(() => new Date())
  .notNull()
}, (table) => [
  uniqueIndex("users_phone_unique").on(table.phone),
  index("users_status_idx").on(table.status)
]);