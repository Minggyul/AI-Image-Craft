import { pgTable, text, serial, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  messages: jsonb("messages").notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const generatedImages = pgTable("generated_images", {
  id: serial("id").primaryKey(),
  prompt: text("prompt").notNull(),
  filePath: text("file_path").notNull(),
  conversationId: integer("conversation_id").references(() => conversations.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversations);
export const insertImageSchema = createInsertSchema(generatedImages);

export type Conversation = typeof conversations.$inferSelect;
export type GeneratedImage = typeof generatedImages.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type InsertImage = z.infer<typeof insertImageSchema>;

export type Message = {
  role: "user" | "assistant" | "system" | "function";
  content: string;
  name?: string;
  function_call?: {
    name: string;
    arguments: string;
  };
};