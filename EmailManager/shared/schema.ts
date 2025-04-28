import { pgTable, text, serial, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User account and settings
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  emailAddress: text("email_address").notNull(),
  settings: jsonb("settings").default({}).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  emailAddress: true,
  displayName: true,
});

// Email server configurations
export const emailServers = pgTable("email_servers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  serverType: text("server_type").notNull(), // gmail, outlook, custom
  imapServer: text("imap_server"),
  imapPort: integer("imap_port"),
  smtpServer: text("smtp_server"),
  smtpPort: integer("smtp_port"),
  useSSL: boolean("use_ssl").default(true),
  credentials: jsonb("credentials").default({}),
});

export const insertEmailServerSchema = createInsertSchema(emailServers).pick({
  userId: true,
  serverType: true,
  imapServer: true,
  imapPort: true,
  smtpServer: true,
  smtpPort: true,
  useSSL: true,
  credentials: true,
});

// Emails
export const emails = pgTable("emails", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  messageId: text("message_id").notNull(),
  from: text("from").notNull(),
  fromName: text("from_name"),
  to: text("to").notNull(),
  subject: text("subject"),
  body: text("body"),
  bodyHtml: text("body_html"),
  received: timestamp("received").notNull(),
  read: boolean("read").default(false),
  starred: boolean("starred").default(false),
  folder: text("folder").default("inbox"),
  categories: jsonb("categories").default([]),
  labels: jsonb("labels").default([]),
  attachments: jsonb("attachments").default([]),
});

export const insertEmailSchema = createInsertSchema(emails).pick({
  userId: true,
  messageId: true,
  from: true,
  fromName: true,
  to: true,
  subject: true,
  body: true,
  bodyHtml: true,
  received: true,
  folder: true,
  categories: true,
  labels: true,
  attachments: true,
});

// Email categories (auto-detected)
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  icon: text("icon"),
  rules: jsonb("rules").default([]),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  userId: true,
  name: true,
  color: true,
  icon: true,
  rules: true,
});

// Quick reply templates
export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  subject: text("subject"),
  body: text("body").notNull(),
});

export const insertTemplateSchema = createInsertSchema(templates).pick({
  userId: true,
  name: true,
  subject: true,
  body: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type EmailServer = typeof emailServers.$inferSelect;
export type InsertEmailServer = z.infer<typeof insertEmailServerSchema>;

export type Email = typeof emails.$inferSelect;
export type InsertEmail = z.infer<typeof insertEmailSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
