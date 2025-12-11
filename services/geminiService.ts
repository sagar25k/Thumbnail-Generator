import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * Generates an image based on a text prompt and style.
 * Uses 'gemini-2.5-flash-image' as the "Nano Banana" engine.
 */
export const generateImageFromText = async (
  userPrompt: string,
  styleDescription: string,
  aspectRatio: string = '1:1'
): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing");

  const fullPrompt = `${userPrompt}. Style: ${styleDescription}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: fullPrompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio
        }
      }
    });

    // Extract image from response
    // The model returns an inlineData part for the generated image
    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) throw new Error("No content generated");

    const imagePart = parts.find(p => p.inlineData);
    
    if (imagePart && imagePart.inlineData) {
      return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
    }

    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    throw error;
  }
};

/**
 * Analyzes an uploaded image to describe it, then generates a new image based on that description + style.
 * "The Nano Banana Workflow"
 */
export const transformImageStyle = async (
  imageBase64: string,
  mimeType: string,
  styleDescription: string,
  aspectRatio: string = '1:1'
): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing");

  // Step 1: Analyze the image using a vision-capable text model
  const analysisPrompt = "Describe the visual composition, subject, and lighting of this image in detail so it can be recreated.";
  
  // Clean base64 string if it contains data URI prefix
  const base64Data = imageBase64.replace(/^data:.+;base64,/, '');

  try {
    const analysisResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { 
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          { text: analysisPrompt }
        ]
      }
    });

    const description = analysisResponse.text;
    if (!description) throw new Error("Failed to analyze source image");

    // Step 2: Generate new image using the description + new style
    return await generateImageFromText(description, styleDescription, aspectRatio);

  } catch (error) {
    console.error("Nano Banana Workflow Error:", error);
    throw error;
  }
};

/**
 * Edits an existing image based on a text prompt using the model's native editing capabilities.
 */
export const editImageWithPrompt = async (
  imageBase64: string,
  mimeType: string,
  prompt: string,
  aspectRatio: string = '1:1'
): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing");

  const base64Data = imageBase64.replace(/^data:.+;base64,/, '');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio
        }
      }
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) throw new Error("No content generated");

    const imagePart = parts.find(p => p.inlineData);
    
    if (imagePart && imagePart.inlineData) {
      return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
    }

    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Gemini Image Edit Error:", error);
    throw error;
  }
};