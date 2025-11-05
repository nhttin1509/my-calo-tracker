
import { GoogleGenAI, Type } from "@google/genai";
import { AnalyzedFood } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY is not set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: {
        type: Type.STRING,
        description: "Tên của món ăn, ví dụ: 'Phở bò tái'",
      },
      calories: {
        type: Type.NUMBER,
        description: "Lượng calo ước tính của món ăn.",
      },
      protein: {
        type: Type.NUMBER,
        description: "Lượng protein (gam) ước tính.",
      },
      carbs: {
        type: Type.NUMBER,
        description: "Lượng carbohydrate (gam) ước tính.",
      },
      fat: {
        type: Type.NUMBER,
        description: "Lượng chất béo (gam) ước tính.",
      },
    },
    required: ["name", "calories", "protein", "carbs", "fat"],
  },
};

export async function analyzeFood(description: string): Promise<AnalyzedFood[]> {
  try {
    const prompt = `Phân tích mô tả bữa ăn sau đây và trả về một danh sách các món ăn cùng với thông tin dinh dưỡng ước tính của chúng. Mô tả: "${description}". Hãy ước tính cho từng món ăn một cách riêng biệt.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text.trim();
    const data = JSON.parse(jsonText);

    if (Array.isArray(data)) {
        return data as AnalyzedFood[];
    }
    
    console.error("Dữ liệu trả về không phải là một mảng:", data);
    return [];

  } catch (error) {
    console.error("Lỗi khi gọi Gemini API:", error);
    throw new Error("Không thể phân tích món ăn. Vui lòng thử lại.");
  }
}
