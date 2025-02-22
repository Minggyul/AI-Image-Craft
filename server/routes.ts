import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { generateImagePrompt } from "./lib/openai";
import { generateImage } from "./lib/stability";
import { insertConversationSchema, insertImageSchema, type Message } from "@shared/schema";

export async function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  app.post("/api/conversations", async (req, res) => {
    try {
      const conversation = await storage.createConversation({
        messages: [],
        createdAt: new Date(),
      });
      res.json(conversation);
    } catch (error) {
      console.error('Error creating conversation:', error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  app.get("/api/conversations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const conversation = await storage.getConversation(Number(id));
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  app.post("/api/conversations/:id/messages", async (req, res) => {
    try {
      const { id } = req.params;
      if (!req.body.message || typeof req.body.message !== 'object') {
        return res.status(400).json({ error: "Invalid message format" });
      }

      const { message } = req.body as { message: Message };
      console.log('Received message:', JSON.stringify(message, null, 2));

      const conversation = await storage.getConversation(Number(id));
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      const messages = [...(conversation.messages as Message[]), message];
      console.log('Current messages:', JSON.stringify(messages, null, 2));

      let aiResponse;
      try {
        aiResponse = await generateImagePrompt(messages);
        console.log('AI Response:', JSON.stringify(aiResponse, null, 2));
      } catch (error) {
        console.error('Error generating image prompt:', error);
        return res.status(500).json({ 
          error: `Failed to generate image prompt: ${error instanceof Error ? error.message : 'Unknown error'}` 
        });
      }

      if (!aiResponse) {
        return res.status(500).json({ error: 'No response received from AI' });
      }

      messages.push(aiResponse);

      if (aiResponse.function_call) {
        console.log('Function call detected:', JSON.stringify(aiResponse.function_call, null, 2));
        try {
          const { prompt } = JSON.parse(aiResponse.function_call.arguments);
          console.log('Generating image with prompt:', prompt);

          const imagePath = await generateImage(prompt);
          console.log('Image generated:', imagePath);

          await storage.saveGeneratedImage({
            prompt,
            filePath: imagePath,
            conversationId: Number(id),
            createdAt: new Date(),
          });

          messages.push({
            role: "function",
            name: "generate_image",
            content: JSON.stringify({ imagePath }),
          });
        } catch (error) {
          console.error('Error in image generation process:', error);
          return res.status(500).json({ 
            error: `Failed to generate or save image: ${error instanceof Error ? error.message : 'Unknown error'}` 
          });
        }
      }

      const updatedConversation = await storage.updateConversationMessages(
        Number(id),
        messages
      );

      res.json(updatedConversation);
    } catch (error) {
      console.error('Error processing message:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to process message" 
      });
    }
  });

  app.get("/api/conversations/:id/images", async (req, res) => {
    try {
      const { id } = req.params;
      const images = await storage.getGeneratedImages(Number(id));
      res.json(images);
    } catch (error) {
      console.error('Error fetching images:', error);
      res.status(500).json({ error: "Failed to fetch images" });
    }
  });

  return httpServer;
}