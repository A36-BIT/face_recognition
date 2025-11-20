// src/services/geminiService.ts
import { AnalysisResult } from '../types';

export const analyzeImage = async (base64Image: string): Promise<AnalysisResult[]> => {
  // 移除 Data URL 前缀
  const base64Data = base64Image.split(',')[1];
  const mimeType = base64Image.split(';')[0].split(':')[1];

  const prompt = `
    分析这张图片中的所有人物。
    对于每个人物，请提供：
    1. 性别 (Gender) - 使用中文 (男/女)
    2. 预估年龄 (Age) - 使用数字范围 (例如 25-30岁)
    3. 简短的外貌描述 (Description) - 使用中文，不超过10个字 (例如：戴眼镜，黑色短发)
    
    请严格以 JSON 数组格式返回结果，不要包含 markdown 格式化符号。
  `;

  try {
    // 核心修改：请求你自己的后端 API，而不是直接请求 googleapis.com
    // 这样你的手机只负责连 Vercel，Vercel 负责连 Google
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        mimeType,
        base64Data
      })
    });

    if (!response.ok) {
      throw new Error("Analysis request failed");
    }

    const data = await response.json();
    
    // 解析逻辑保持不变
    const textResponse = data.candidates[0].content.parts[0].text;
    const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson) as AnalysisResult[];

  } catch (e) {
    console.error("Parsing Error:", e);
    throw e;
  }
};
