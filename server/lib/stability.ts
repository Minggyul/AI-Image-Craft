import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function generateImage(prompt: string): Promise<string> {
  try {
    console.log('Calling Stability API with prompt:', prompt);

    const response = await fetch("https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: prompt,
            weight: 1
          }
        ],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        steps: 30,
        samples: 1
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Stability API error response:", error);
      throw new Error(`Stability API error: ${response.status} - ${error}`);
    }

    console.log('Received response from Stability API');
    const responseData = await response.json();
    console.log('Response data:', JSON.stringify(responseData, null, 2));

    if (!responseData.artifacts?.[0]?.base64) {
      console.error('Invalid response format:', responseData);
      throw new Error("No image data received from Stability API");
    }

    const base64Image = responseData.artifacts[0].base64;
    console.log('Successfully received base64 image data');

    // Save image to local filesystem
    const filename = `generated_${Date.now()}.png`;
    const filepath = path.join(__dirname, "../../public/images", filename);

    console.log('Saving image to:', filepath);
    await fs.promises.mkdir(path.dirname(filepath), { recursive: true });
    await fs.promises.writeFile(filepath, Buffer.from(base64Image, "base64"));
    console.log('Image saved successfully');

    return `/images/${filename}`;
  } catch (error) {
    console.error("Image generation failed:", error);
    throw error;
  }
}