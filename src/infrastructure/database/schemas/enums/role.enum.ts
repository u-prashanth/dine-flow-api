import { pgEnum } from "drizzle-orm/pg-core";

export const adminRoleEnum = pgEnum("admin_role", [
  "SUPER_ADMIN",
  "STAFF"
]);