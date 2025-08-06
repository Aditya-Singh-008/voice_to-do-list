import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, insertTaskSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const session = await storage.createSession(user.id);
      
      res.cookie("sessionId", session.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: "lax"
      });

      res.json({ user: { id: user.id, username: user.username } });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    const sessionId = req.cookies.sessionId;
    if (sessionId) {
      await storage.deleteSession(sessionId);
    }
    res.clearCookie("sessionId");
    res.json({ message: "Logged out successfully" });
  });

  app.get("/api/auth/me", async (req, res) => {
    const sessionId = req.cookies.sessionId;
    if (!sessionId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const session = await storage.getSession(sessionId);
    if (!session) {
      return res.status(401).json({ message: "Session expired" });
    }

    const user = await storage.getUser(session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    res.json({ user: { id: user.id, username: user.username } });
  });

  // Task routes (protected)
  const requireAuth = async (req: any, res: any, next: any) => {
    const sessionId = req.cookies.sessionId;
    if (!sessionId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const session = await storage.getSession(sessionId);
    if (!session) {
      return res.status(401).json({ message: "Session expired" });
    }

    req.userId = session.userId;
    next();
  };

  app.get("/api/tasks", requireAuth, async (req: any, res) => {
    try {
      const tasks = await storage.getTasks(req.userId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", requireAuth, async (req: any, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask({ ...taskData, userId: req.userId });
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ message: "Invalid task data" });
    }
  });

  app.patch("/api/tasks/:id", requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const task = await storage.getTask(id);
      if (!task || task.userId !== req.userId) {
        return res.status(404).json({ message: "Task not found" });
      }

      const updatedTask = await storage.updateTask(id, updates);
      res.json(updatedTask);
    } catch (error) {
      res.status(400).json({ message: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      const task = await storage.getTask(id);
      if (!task || task.userId !== req.userId) {
        return res.status(404).json({ message: "Task not found" });
      }

      await storage.deleteTask(id);
      res.json({ message: "Task deleted successfully" });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete task" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
