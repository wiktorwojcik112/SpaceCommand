import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertHighscoreSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Highscore API routes
  
  // GET /api/highscores - Get top 10 highscores
  app.get("/api/highscores", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const highscores = await storage.getTopHighscores(limit);
      res.json(highscores);
    } catch (error) {
      console.error("Error fetching highscores:", error);
      res.status(500).json({ error: "Failed to fetch highscores" });
    }
  });

  // POST /api/highscores - Submit a new highscore
  app.post("/api/highscores", async (req, res) => {
    try {
      const validatedData = insertHighscoreSchema.parse(req.body);
      try {
        const newHighscore = await storage.addHighscore(validatedData);
        res.status(201).json(newHighscore);
      } catch (dbError) {
        console.error("Database error submitting highscore:", dbError);
        res.status(500).json({ error: "Failed to save highscore" });
      }
    } catch (validationError) {
      console.error("Validation error:", validationError);
      res.status(400).json({ error: "Invalid highscore data" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
