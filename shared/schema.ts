import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const highscores = pgTable("highscores", {
  id: serial("id").primaryKey(),
  playerName: text("player_name").notNull(),
  score: integer("score").notNull(),
  wave: integer("wave").notNull(),
  enemiesDefeated: integer("enemies_defeated").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertHighscoreSchema = createInsertSchema(highscores).pick({
  playerName: true,
  score: true,
  wave: true,
  enemiesDefeated: true,
});

export type InsertHighscore = z.infer<typeof insertHighscoreSchema>;
export type Highscore = typeof highscores.$inferSelect;
