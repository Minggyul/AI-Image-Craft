import OpenAI from "openai";
import { Message } from "@shared/schema";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateImagePrompt(messages: Message[]) {
  try {
    console.log('Processing messages for image prompt generation:', messages);

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a creative assistant that helps generate detailed image prompts in English. Convert user descriptions into vivid, specific prompts that work well with image generation. Focus on visual details and artistic style. Always use the generate_image function to create the final prompt. Respond in English even if the user's input is in a different language.",
        },
        ...messages.map(msg => ({
          role: msg.role === "function" ? "assistant" : msg.role as any,
          content: msg.content,
        })),
      ],
      functions: [
        {
          name: "generate_image",
          description: "Generate an image based on the refined prompt",
          parameters: {
            type: "object",
            properties: {
              prompt: {
                type: "string",
                description: "The refined image generation prompt in English"
              }
            },
            required: ["prompt"]
          }
        }
      ],
      function_call: { name: "generate_image" }
    });

    console.log('OpenAI Response:', JSON.stringify(response.choices[0].message, null, 2));

    if (!response.choices[0].message) {
      throw new Error("OpenAI returned an empty response");
    }

    const message = response.choices[0].message;
    return {
      role: message.role,
      content: message.content ?? "",
      function_call: message.function_call,
    } as Message;
  } catch (error) {
    console.error('Error in generateImagePrompt:', error);
    throw new Error(`Failed to generate image prompt: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}