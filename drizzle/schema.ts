import { bigint, boolean, integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);

/**
 * Core user table backing the optional Manus OAuth flow.
 * The noodle leaderboard intentionally uses a separate, passwordless nickname identity.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const noodlePlayers = pgTable("noodle_players", {
  id: serial("id").primaryKey(),
  displayName: varchar("displayName", { length: 48 }).notNull(),
  nameKey: varchar("nameKey", { length: 96 }).notNull().unique(),
  loginTokenHash: varchar("loginTokenHash", { length: 64 }).notNull().unique(),
  totalClicks: integer("totalClicks").default(0).notNull(),
  experience: text("experience").notNull(),
  beefClicks: integer("beefClicks").default(0).notNull(),
  chickenClicks: integer("chickenClicks").default(0).notNull(),
  octopusClicks: integer("octopusClicks").default(0).notNull(),
  burnedFingerUnlocked: boolean("burnedFingerUnlocked").default(false).notNull(),
  clickTimestamps: varchar("clickTimestamps", { length: 768 }).default("[]").notNull(),
  antiClickAchievementUnlocked: boolean("antiClickAchievementUnlocked").default(false).notNull(),
  robotChallengeActive: boolean("robotChallengeActive").default(false).notNull(),
  robotConfessionCount: integer("robotConfessionCount").default(0).notNull(),
  robotEaterUnlocked: boolean("robotEaterUnlocked").default(false).notNull(),
  robotIconExpiresAt: bigint("robotIconExpiresAt", { mode: "number" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type NoodlePlayer = typeof noodlePlayers.$inferSelect;
