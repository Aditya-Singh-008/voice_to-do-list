import { type User, type InsertUser, type Task, type InsertTask, type Session } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Tasks
  getTasks(userId: string): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask & { userId: string }): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;

  // Sessions
  createSession(userId: string): Promise<Session>;
  getSession(id: string): Promise<Session | undefined>;
  deleteSession(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private tasks: Map<string, Task>;
  private sessions: Map<string, Session>;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.sessions = new Map();

    // Create single admin account
    const adminUser: User = {
      id: randomUUID(),
      username: "admin",
      password: "admin123",
    };
    this.users.set(adminUser.id, adminUser);
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Tasks
  async getTasks(userId: string): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => task.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(taskData: InsertTask & { userId: string }): Promise<Task> {
    const id = randomUUID();
    const now = new Date();
    const task: Task = {
      ...taskData,
      id,
      completed: false,
      priority: taskData.priority || "normal",
      reminderDate: taskData.reminderDate || null,
      voiceNoteData: taskData.voiceNoteData || null,
      voiceNoteDuration: taskData.voiceNoteDuration || null,
      createdAt: now,
      updatedAt: now,
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    const updatedTask: Task = {
      ...task,
      ...updates,
      updatedAt: new Date(),
    };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Sessions
  async createSession(userId: string): Promise<Session> {
    const id = randomUUID();
    const session: Session = {
      id,
      userId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };
    this.sessions.set(id, session);
    return session;
  }

  async getSession(id: string): Promise<Session | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;
    
    if (session.expiresAt < new Date()) {
      this.sessions.delete(id);
      return undefined;
    }
    
    return session;
  }

  async deleteSession(id: string): Promise<boolean> {
    return this.sessions.delete(id);
  }
}

export const storage = new MemStorage();
