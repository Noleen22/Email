import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertEmailServerSchema, insertCategorySchema, insertTemplateSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // User registration and auth
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      // Don't send password back to client
      const { password, ...userWithoutPassword } = user;
      
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      return res.status(500).json({ message: "Could not create user" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // In a real application, you'd use proper authentication with sessions or tokens
      // Don't send password back to client
      const { password: _, ...userWithoutPassword } = user;
      
      return res.status(200).json({ 
        user: userWithoutPassword,
        message: "Login successful" 
      });
    } catch (error) {
      return res.status(500).json({ message: "Login failed" });
    }
  });

  // Email server configuration
  app.get("/api/email-servers", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Valid userId is required" });
      }
      
      const servers = await storage.getEmailServers(userId);
      return res.status(200).json(servers);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch email servers" });
    }
  });

  app.post("/api/email-servers", async (req: Request, res: Response) => {
    try {
      const serverData = insertEmailServerSchema.parse(req.body);
      const server = await storage.createEmailServer(serverData);
      return res.status(201).json(server);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid server data", errors: error.errors });
      }
      return res.status(500).json({ message: "Could not create email server" });
    }
  });

  app.put("/api/email-servers/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Valid id is required" });
      }
      
      const updatedServer = await storage.updateEmailServer(id, req.body);
      
      if (!updatedServer) {
        return res.status(404).json({ message: "Email server not found" });
      }
      
      return res.status(200).json(updatedServer);
    } catch (error) {
      return res.status(500).json({ message: "Failed to update email server" });
    }
  });

  app.delete("/api/email-servers/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Valid id is required" });
      }
      
      const success = await storage.deleteEmailServer(id);
      
      if (!success) {
        return res.status(404).json({ message: "Email server not found" });
      }
      
      return res.status(200).json({ message: "Email server deleted" });
    } catch (error) {
      return res.status(500).json({ message: "Failed to delete email server" });
    }
  });

  // Email management
  app.get("/api/emails", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      const folder = req.query.folder as string | undefined;
      const category = req.query.category as string | undefined;
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Valid userId is required" });
      }
      
      const emails = await storage.getEmails(userId, folder, category);
      return res.status(200).json(emails);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch emails" });
    }
  });

  app.get("/api/emails/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Valid id is required" });
      }
      
      const email = await storage.getEmail(id);
      
      if (!email) {
        return res.status(404).json({ message: "Email not found" });
      }
      
      return res.status(200).json(email);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch email" });
    }
  });

  app.patch("/api/emails/:id/read", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { read } = req.body;
      
      if (isNaN(id) || typeof read !== 'boolean') {
        return res.status(400).json({ message: "Valid id and read status are required" });
      }
      
      const email = await storage.markEmailRead(id, read);
      
      if (!email) {
        return res.status(404).json({ message: "Email not found" });
      }
      
      return res.status(200).json(email);
    } catch (error) {
      return res.status(500).json({ message: "Failed to update email read status" });
    }
  });

  app.patch("/api/emails/:id/star", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { starred } = req.body;
      
      if (isNaN(id) || typeof starred !== 'boolean') {
        return res.status(400).json({ message: "Valid id and starred status are required" });
      }
      
      const email = await storage.markEmailStarred(id, starred);
      
      if (!email) {
        return res.status(404).json({ message: "Email not found" });
      }
      
      return res.status(200).json(email);
    } catch (error) {
      return res.status(500).json({ message: "Failed to update email starred status" });
    }
  });

  app.patch("/api/emails/:id/folder", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { folder } = req.body;
      
      if (isNaN(id) || !folder) {
        return res.status(400).json({ message: "Valid id and folder are required" });
      }
      
      const email = await storage.moveEmailToFolder(id, folder);
      
      if (!email) {
        return res.status(404).json({ message: "Email not found" });
      }
      
      return res.status(200).json(email);
    } catch (error) {
      return res.status(500).json({ message: "Failed to move email to folder" });
    }
  });

  // Categories
  app.get("/api/categories", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Valid userId is required" });
      }
      
      const categories = await storage.getCategories(userId);
      return res.status(200).json(categories);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req: Request, res: Response) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      return res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      return res.status(500).json({ message: "Could not create category" });
    }
  });

  app.put("/api/categories/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Valid id is required" });
      }
      
      const updatedCategory = await storage.updateCategory(id, req.body);
      
      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      return res.status(200).json(updatedCategory);
    } catch (error) {
      return res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Valid id is required" });
      }
      
      const success = await storage.deleteCategory(id);
      
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      return res.status(200).json({ message: "Category deleted" });
    } catch (error) {
      return res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Templates
  app.get("/api/templates", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Valid userId is required" });
      }
      
      const templates = await storage.getTemplates(userId);
      return res.status(200).json(templates);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.post("/api/templates", async (req: Request, res: Response) => {
    try {
      const templateData = insertTemplateSchema.parse(req.body);
      const template = await storage.createTemplate(templateData);
      return res.status(201).json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid template data", errors: error.errors });
      }
      return res.status(500).json({ message: "Could not create template" });
    }
  });

  app.put("/api/templates/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Valid id is required" });
      }
      
      const updatedTemplate = await storage.updateTemplate(id, req.body);
      
      if (!updatedTemplate) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      return res.status(200).json(updatedTemplate);
    } catch (error) {
      return res.status(500).json({ message: "Failed to update template" });
    }
  });

  app.delete("/api/templates/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Valid id is required" });
      }
      
      const success = await storage.deleteTemplate(id);
      
      if (!success) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      return res.status(200).json({ message: "Template deleted" });
    } catch (error) {
      return res.status(500).json({ message: "Failed to delete template" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
