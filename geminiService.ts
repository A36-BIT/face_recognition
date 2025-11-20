
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is missing");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeImage = async (base64Image: string): Promise<AnalysisResult[]> => {
  const ai = getAiClient();
  
  // Clean base64 string if it contains metadata header
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          },
          {
            text: "请分析这张图片中的所有人物。请按照从左到右的顺序，逐一分析每个人的性别（gender）和准确的数字年龄（age）。同时提供一个简短的特征描述（description，例如'左边的男士'，'穿红衣的小女孩'）以便区分。输出中文。请直接返回JSON数组格式。"
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              gender: { type: Type.STRING },
              age: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            required: ["gender", "age", "description"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as AnalysisResult[];

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
