import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const ANALYSIS_MODEL = "gemini-3.1-flash-lite-preview";
export const IMAGE_MODEL = "gemini-3.1-flash-image-preview";

export interface RedecorationSuggestion {
  style: string;
  colorPalette: string[];
  keyChanges: string[];
  furnitureSuggestions: string[];
  lightingAdvice: string;
  imagePrompt: string;
}

export async function analyzeRoom(imageData: string): Promise<RedecorationSuggestion> {
  const response = await ai.models.generateContent({
    model: ANALYSIS_MODEL,
    contents: [
      {
        parts: [
          {
            inlineData: {
              data: imageData.split(",")[1],
              mimeType: "image/jpeg",
            },
          },
          {
            text: `Analyze this room and provide redecoration suggestions. 
            IMPORTANT: Provide all text fields in Romanian.
            Return the response in JSON format with the following structure:
            {
              "style": "string (in Romanian)",
              "colorPalette": ["string (color names in Romanian)"],
              "keyChanges": ["string (in Romanian)"],
              "furnitureSuggestions": ["string (in Romanian)"],
              "lightingAdvice": "string (in Romanian)",
              "imagePrompt": "A detailed prompt for generating a high-quality, 400-degree cylindrical panorama of this room redecorated in the suggested style. The prompt should specify 'cylindrical panorama', 'wide angle', 'no watermark', and 'photorealistic'. Keep the imagePrompt in English for better model performance."
            }`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          style: { type: Type.STRING },
          colorPalette: { type: Type.ARRAY, items: { type: Type.STRING } },
          keyChanges: { type: Type.ARRAY, items: { type: Type.STRING } },
          furnitureSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          lightingAdvice: { type: Type.STRING },
          imagePrompt: { type: Type.STRING },
        },
        required: ["style", "colorPalette", "keyChanges", "furnitureSuggestions", "lightingAdvice", "imagePrompt"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function generatePanorama(prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: IMAGE_MODEL,
    contents: {
      parts: [
        {
          text: `${prompt}. The image MUST be a seamless 400-degree cylindrical panorama. Ultra-wide aspect ratio. No watermarks. Photorealistic 8k resolution.`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "8:1", // Wide for panorama
        imageSize: "4K",
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image generated");
}
