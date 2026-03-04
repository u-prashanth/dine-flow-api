import { 
  index, 
  pgTable, 
  timestamp, 
  uniqueIndex, 
  uuid, 
  varchar 
} from "drizzle-orm/pg-core";
import { adminRoleEnum } from "./enums/role.enum";
import { userStatusEnum } from "./enums/user-status.enum";

export const admins = pgTable("admins", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 25 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: adminRoleEnum("role").notNull(),
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
  uniqueIndex("admins_email_unique").on(table.email),
  index("admins_role_idx").on(table.role),
  index("admins_status_idx").on(table.status)
]);