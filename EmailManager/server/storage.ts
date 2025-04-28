import {
  users, emails, emailServers, categories, templates,
  type User, type InsertUser,
  type Email, type InsertEmail,
  type EmailServer, type InsertEmailServer,
  type Category, type InsertCategory,
  type Template, type InsertTemplate
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserSettings(id: number, settings: Record<string, any>): Promise<User | undefined>;

  // Email server operations
  getEmailServers(userId: number): Promise<EmailServer[]>;
  getEmailServer(id: number): Promise<EmailServer | undefined>;
  createEmailServer(server: InsertEmailServer): Promise<EmailServer>;
  updateEmailServer(id: number, server: Partial<EmailServer>): Promise<EmailServer | undefined>;
  deleteEmailServer(id: number): Promise<boolean>;

  // Email operations
  getEmails(userId: number, folder?: string, category?: string): Promise<Email[]>;
  getEmail(id: number): Promise<Email | undefined>;
  createEmail(email: InsertEmail): Promise<Email>;
  updateEmail(id: number, updates: Partial<Email>): Promise<Email | undefined>;
  deleteEmail(id: number): Promise<boolean>;
  markEmailRead(id: number, read: boolean): Promise<Email | undefined>;
  markEmailStarred(id: number, starred: boolean): Promise<Email | undefined>;
  moveEmailToFolder(id: number, folder: string): Promise<Email | undefined>;

  // Category operations
  getCategories(userId: number): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<Category>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;

  // Template operations
  getTemplates(userId: number): Promise<Template[]>;
  getTemplate(id: number): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(id: number, template: Partial<Template>): Promise<Template | undefined>;
  deleteTemplate(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private emailServers: Map<number, EmailServer>;
  private emails: Map<number, Email>;
  private categories: Map<number, Category>;
  private templates: Map<number, Template>;
  private counters: {
    userId: number;
    emailServerId: number;
    emailId: number;
    categoryId: number;
    templateId: number;
  };

  constructor() {
    this.users = new Map();
    this.emailServers = new Map();
    this.emails = new Map();
    this.categories = new Map();
    this.templates = new Map();
    this.counters = {
      userId: 1,
      emailServerId: 1,
      emailId: 1,
      categoryId: 1,
      templateId: 1,
    };

    // Initialize with default categories
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Add some default categories that would be automatically created for each user
    const defaultCategories = [
      { name: 'Classes', color: '#2196F3', icon: 'school' },
      { name: 'Administration', color: '#FFC107', icon: 'admin_panel_settings' },
      { name: 'Events', color: '#4CAF50', icon: 'event' },
      { name: 'Important', color: '#FF5252', icon: 'priority_high' },
    ];
    
    // Add some default templates
    const defaultTemplates = [
      { 
        name: 'Assignment Extension Request', 
        subject: 'Request for Assignment Extension',
        body: 'Dear Professor,\n\nI am writing to request an extension for the assignment due on [DATE]. Due to [REASON], I would appreciate if I could have until [NEW DATE] to complete the assignment.\n\nThank you for your consideration.\n\nBest regards,\n[YOUR NAME]'
      },
      {
        name: 'Office Hours Appointment',
        subject: 'Office Hours Appointment Request',
        body: 'Hello Professor,\n\nI would like to schedule an appointment during your office hours on [DATE/TIME] to discuss [TOPIC].\n\nPlease let me know if this time works for you.\n\nThank you,\n[YOUR NAME]'
      }
    ];
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.counters.userId++;
    const user: User = { ...insertUser, id, settings: {} };
    this.users.set(id, user);
    
    // Create default categories for the user
    this.createCategory({
      userId: id,
      name: 'Classes',
      color: '#2196F3',
      icon: 'school',
      rules: [{ field: 'from', operator: 'contains', value: 'professor' }]
    });
    
    this.createCategory({
      userId: id,
      name: 'Administration',
      color: '#FFC107',
      icon: 'admin_panel_settings',
      rules: [{ field: 'from', operator: 'contains', value: 'admin' }]
    });
    
    this.createCategory({
      userId: id,
      name: 'Events',
      color: '#4CAF50',
      icon: 'event',
      rules: [{ field: 'subject', operator: 'contains', value: 'event' }]
    });
    
    return user;
  }

  async updateUserSettings(id: number, settings: Record<string, any>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = {
      ...user,
      settings: {
        ...user.settings,
        ...settings
      }
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Email server operations
  async getEmailServers(userId: number): Promise<EmailServer[]> {
    return Array.from(this.emailServers.values()).filter(
      (server) => server.userId === userId
    );
  }

  async getEmailServer(id: number): Promise<EmailServer | undefined> {
    return this.emailServers.get(id);
  }

  async createEmailServer(server: InsertEmailServer): Promise<EmailServer> {
    const id = this.counters.emailServerId++;
    const emailServer: EmailServer = { ...server, id };
    this.emailServers.set(id, emailServer);
    return emailServer;
  }

  async updateEmailServer(id: number, updates: Partial<EmailServer>): Promise<EmailServer | undefined> {
    const server = await this.getEmailServer(id);
    if (!server) return undefined;
    
    const updatedServer = { ...server, ...updates };
    this.emailServers.set(id, updatedServer);
    return updatedServer;
  }

  async deleteEmailServer(id: number): Promise<boolean> {
    return this.emailServers.delete(id);
  }

  // Email operations
  async getEmails(userId: number, folder?: string, category?: string): Promise<Email[]> {
    let emails = Array.from(this.emails.values()).filter(
      (email) => email.userId === userId
    );
    
    if (folder) {
      emails = emails.filter((email) => email.folder === folder);
    }
    
    if (category) {
      emails = emails.filter((email) => {
        const categories = email.categories as string[];
        return categories.includes(category);
      });
    }
    
    // Sort by received date, newest first
    return emails.sort((a, b) => {
      const dateA = new Date(a.received).getTime();
      const dateB = new Date(b.received).getTime();
      return dateB - dateA;
    });
  }

  async getEmail(id: number): Promise<Email | undefined> {
    return this.emails.get(id);
  }

  async createEmail(email: InsertEmail): Promise<Email> {
    const id = this.counters.emailId++;
    const newEmail: Email = { 
      ...email, 
      id, 
      read: false, 
      starred: false 
    };
    this.emails.set(id, newEmail);
    return newEmail;
  }

  async updateEmail(id: number, updates: Partial<Email>): Promise<Email | undefined> {
    const email = await this.getEmail(id);
    if (!email) return undefined;
    
    const updatedEmail = { ...email, ...updates };
    this.emails.set(id, updatedEmail);
    return updatedEmail;
  }

  async deleteEmail(id: number): Promise<boolean> {
    return this.emails.delete(id);
  }

  async markEmailRead(id: number, read: boolean): Promise<Email | undefined> {
    return this.updateEmail(id, { read });
  }

  async markEmailStarred(id: number, starred: boolean): Promise<Email | undefined> {
    return this.updateEmail(id, { starred });
  }

  async moveEmailToFolder(id: number, folder: string): Promise<Email | undefined> {
    return this.updateEmail(id, { folder });
  }

  // Category operations
  async getCategories(userId: number): Promise<Category[]> {
    return Array.from(this.categories.values()).filter(
      (category) => category.userId === userId
    );
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.counters.categoryId++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  async updateCategory(id: number, updates: Partial<Category>): Promise<Category | undefined> {
    const category = await this.getCategory(id);
    if (!category) return undefined;
    
    const updatedCategory = { ...category, ...updates };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Template operations
  async getTemplates(userId: number): Promise<Template[]> {
    return Array.from(this.templates.values()).filter(
      (template) => template.userId === userId
    );
  }

  async getTemplate(id: number): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    const id = this.counters.templateId++;
    const newTemplate: Template = { ...template, id };
    this.templates.set(id, newTemplate);
    return newTemplate;
  }

  async updateTemplate(id: number, updates: Partial<Template>): Promise<Template | undefined> {
    const template = await this.getTemplate(id);
    if (!template) return undefined;
    
    const updatedTemplate = { ...template, ...updates };
    this.templates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  async deleteTemplate(id: number): Promise<boolean> {
    return this.templates.delete(id);
  }
}

export const storage = new MemStorage();
