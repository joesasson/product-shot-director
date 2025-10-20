
import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const getMimeType = (base64: string): string | null => {
  const match = base64.match(/^data:(image\/[a-z]+);base64,/);
  return match ? match[1] : 'image/jpeg'; // fallback
};

const cleanBase64 = (base64: string): string => {
  return base64.split(',')[1];
};

export const analyzeProductImage = async (imageBase64: string): Promise<string[]> => {
  const mimeType = getMimeType(imageBase64);
  if (!mimeType) throw new Error('Invalid image format');

  const imagePart = {
    inlineData: {
      mimeType,
      data: cleanBase64(imageBase64),
    },
  };

  const textPart = {
    text: "Analyze this product image. Identify the main product. Generate exactly 10 creative and distinct shot ideas for a professional photoshoot. The ideas should be concise, one-sentence descriptions suitable for a text-to-image prompt. Focus on composition, lighting, and environment."
  };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ideas: {
              type: Type.ARRAY,
              description: "An array of 10 creative shot ideas.",
              items: {
                type: Type.STRING
              }
            }
          }
        },
      }
    });

    const jsonText = response.text;
    const result = JSON.parse(jsonText);

    if (result && Array.isArray(result.ideas)) {
        return result.ideas.slice(0, 10); // Ensure only 10 ideas are returned
    } else {
        throw new Error("Invalid response format from Gemini API");
    }

  } catch (error) {
    console.error("Error analyzing product image:", error);
    throw new Error("Failed to get shot ideas from Gemini API.");
  }
};

export const generateShotIdea = async (
  imageBase64: string, 
  prompt: string, 
  aspectRatio: string, 
  stylePreset: string
): Promise<string | null> => {
  const mimeType = getMimeType(imageBase64);
  if (!mimeType) throw new Error('Invalid image format');
  
  const imagePart = {
    inlineData: {
      data: cleanBase64(imageBase64),
      mimeType: mimeType,
    },
  };
  
  let fullPrompt = `Using the provided product image as a reference for the main subject, generate a new image based on this concept: "${prompt}".`;

  if (stylePreset && stylePreset.toLowerCase() !== 'default') {
    fullPrompt += ` The image should have a ${stylePreset.toLowerCase()} style.`;
  }
  
  let ratioTerm = 'square (1:1)';
  if (aspectRatio === '3:4') ratioTerm = 'portrait (3:4)';
  if (aspectRatio === '16:9') ratioTerm = 'landscape (16:9)';
  
  fullPrompt += ` The image must have a ${ratioTerm} aspect ratio.`;

  const textPart = {
    text: fullPrompt,
  };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
      }
    }
    return null;

  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error(`Failed to generate image for prompt: "${prompt}"`);
  }
};
