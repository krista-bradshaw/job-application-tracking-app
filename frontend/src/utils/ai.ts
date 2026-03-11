import { GoogleGenAI, Type } from '@google/genai';

export interface ExtractedJobDetails {
  title: string;
  company: string;
  level: string;
}

export const extractJobDetailsFromImage = async (base64Image: string, apiKey: string): Promise<ExtractedJobDetails> => {
  if (!apiKey) {
    throw new Error('API key is required');
  }

  // Strip data:image/png;base64, prefix if present
  const base64Data = base64Image.replace(/^data:image\/(png|jpeg|webp);base64,/, '');
  const mimeType = base64Image.match(/^data:image\/(png|jpeg|webp);base64,/)?.[1] 
    ? `image/${base64Image.match(/^data:image\/(png|jpeg|webp);base64,/)?.[1]}` 
    : 'image/jpeg';

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Analyze this screenshot of a job posting.
    Extract the following information:
    1. Job Title
    2. Company Name
    3. Job Level (Infer if not explicit, e.g., "Internship", "Entry", "Mid", "Senior", "Lead", "Manager". Return exactly one of these strings, or an empty string if it cannot be determined.)

    Return the final output matching the exact schema provided.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            { 
              inlineData: {
                data: base64Data,
                mimeType: mimeType
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: 'The job title',
            },
            company: {
              type: Type.STRING,
              description: 'The company name',
            },
            level: {
              type: Type.STRING,
              description: 'The inferred job level matching one of: Internship, Entry, Mid, Senior, Lead, Manager. Empty string if unknown.',
            },
          },
          required: ['title', 'company', 'level'],
        },
      }
    });

    const textResponse = response.text;
    if (!textResponse) {
        throw new Error("No response from AI");
    }

    const parsed: ExtractedJobDetails = JSON.parse(textResponse);
    return parsed;
  } catch (error) {
    console.error('Error extracting job details:', error);
    throw new Error('Failed to parse image. Please try again or fill the details manually.');
  }
};
