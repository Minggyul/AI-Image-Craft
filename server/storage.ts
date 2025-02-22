import { Conversation, InsertConversation, GeneratedImage, InsertImage, Message } from "@shared/schema";

export interface IStorage {
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversation(id: number): Promise<Conversation | undefined>;
  updateConversationMessages(id: number, messages: Message[]): Promise<Conversation>;
  saveGeneratedImage(image: InsertImage): Promise<GeneratedImage>;
  getGeneratedImages(conversationId: number): Promise<GeneratedImage[]>;
}

export class MemStorage implements IStorage {
  private conversations: Map<number, Conversation>;
  private images: Map<number, GeneratedImage>;
  private currentConversationId: number;
  private currentImageId: number;

  constructor() {
    this.conversations = new Map();
    this.images = new Map();
    this.currentConversationId = 1;
    this.currentImageId = 1;
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const id = this.currentConversationId++;
    const newConversation: Conversation = {
      id,
      messages: conversation.messages ?? [],
      createdAt: new Date(),
    };
    this.conversations.set(id, newConversation);
    return newConversation;
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async updateConversationMessages(id: number, messages: Message[]): Promise<Conversation> {
    const conversation = this.conversations.get(id);
    if (!conversation) {
      throw new Error("Conversation not found");
    }
    const updatedConversation: Conversation = {
      ...conversation,
      messages: messages,  // Explicitly assign messages array
    };
    this.conversations.set(id, updatedConversation);
    return updatedConversation;
  }

  async saveGeneratedImage(image: InsertImage): Promise<GeneratedImage> {
    const id = this.currentImageId++;
    const newImage: GeneratedImage = {
      id,
      prompt: image.prompt,
      filePath: image.filePath,
      conversationId: image.conversationId ?? null, // Handle nullable conversationId
      createdAt: new Date(),
    };
    this.images.set(id, newImage);
    return newImage;
  }

  async getGeneratedImages(conversationId: number): Promise<GeneratedImage[]> {
    return Array.from(this.images.values()).filter(
      (image) => image.conversationId === conversationId
    );
  }
}

export const storage = new MemStorage();