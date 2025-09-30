import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { users, highscores, type User, type InsertUser, type Highscore, type InsertHighscore } from "@shared/schema";
import { eq, desc } from 'drizzle-orm';

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Highscore methods
  addHighscore(highscore: InsertHighscore): Promise<Highscore>;
  getTopHighscores(limit?: number): Promise<Highscore[]>;
  getAllHighscores(): Promise<Highscore[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private highscores: Map<number, Highscore>;
  currentUserId: number;
  currentHighscoreId: number;

  constructor() {
    this.users = new Map();
    this.highscores = new Map();
    this.currentUserId = 1;
    this.currentHighscoreId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async addHighscore(insertHighscore: InsertHighscore): Promise<Highscore> {
    const id = this.currentHighscoreId++;
    const highscore: Highscore = {
      ...insertHighscore,
      id,
      createdAt: new Date(),
    };
    this.highscores.set(id, highscore);
    return highscore;
  }

  async getTopHighscores(limit: number = 10): Promise<Highscore[]> {
    return Array.from(this.highscores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  async getAllHighscores(): Promise<Highscore[]> {
    return Array.from(this.highscores.values())
      .sort((a, b) => b.score - a.score);
  }
}

export class DbStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set');
    }
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    this.db = drizzle(pool);
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async addHighscore(insertHighscore: InsertHighscore): Promise<Highscore> {
    const result = await this.db.insert(highscores).values(insertHighscore).returning();
    return result[0];
  }

  async getTopHighscores(limit: number = 10): Promise<Highscore[]> {
    return await this.db
      .select()
      .from(highscores)
      .orderBy(desc(highscores.score))
      .limit(limit);
  }

  async getAllHighscores(): Promise<Highscore[]> {
    return await this.db
      .select()
      .from(highscores)
      .orderBy(desc(highscores.score));
  }
}

// Use DbStorage if DATABASE_URL is available, otherwise use MemStorage
export const storage = process.env.DATABASE_URL ? new DbStorage() : new MemStorage();
