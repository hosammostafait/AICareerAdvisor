
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserInput, AIPlanResponse } from "../types";

const getApiKey = () => {
  // استخدام القيمة مباشرة من process.env كما هو مطلوب برمجياً
  const key = process.env.API_KEY;
  if (key && key !== "undefined" && key !== "") {
    return key;
  }
  return null;
};

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    greeting: { type: Type.STRING },
    tools: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          usage: { type: Type.STRING },
          url: { type: Type.STRING },
          category: { type: Type.STRING },
          isPaid: { type: Type.BOOLEAN }
        },
        required: ["name", "description", "usage", "url", "category", "isPaid"],
      },
    },
    videos: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          summary: { type: Type.STRING },
          searchQuery: { type: Type.STRING },
        },
        required: ["title", "summary", "searchQuery"],
      },
    },
    courses: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          platform: { type: Type.STRING },
          summary: { type: Type.STRING },
          url: { type: Type.STRING }
        },
        required: ["title", "platform", "summary", "url"]
      }
    },
    steps: { type: Type.ARRAY, items: { type: Type.STRING } },
    tips: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["greeting", "tools", "videos", "courses", "steps", "tips"],
};

export const generatePlan = async (input: UserInput): Promise<AIPlanResponse> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error("MISSING_KEY");
  }

  // إنشاء المثيل مباشرة قبل الطلب لضمان استخدام المفتاح الأحدث
  const ai = new GoogleGenAI({ apiKey });
  // استخدام الإصدار الاحترافي لنتائج أكثر ذكاءً
  const model = "gemini-3-pro-preview";
  
  const prompt = `أنت مستشار ذكاء اصطناعي خبير. المستخدم يعمل بمهنة: ${input.profession}. المهام الأساسية: ${input.tasks}. مستوى الخبرة: ${input.experience}. قدم خطة كاملة لتوظيف الذكاء الاصطناعي في عمله باللغة العربية بصيغة JSON.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("EMPTY_RESPONSE");
    
    const plan = JSON.parse(text) as AIPlanResponse;

    // موارد إضافية ثابتة
    plan.videos = [{
        title: "قناة اكتب صح - حسام مصطفى إبراهيم",
        summary: "شروحات عملية وتطبيقية لتوظيف الذكاء الاصطناعي في المهام اليومية.",
        searchQuery: "اكتب صح حسام مصطفى",
        url: "https://www.youtube.com/@Ektebsa7"
    }, ...plan.videos];

    plan.articles = [{
        title: "مقالات الذكاء الاصطناعي - موقع اكتب صح",
        summary: "تصفح أحدث المقالات والشروحات حول أدوات الذكاء الاصطناعي.",
        url: "https://www.ektebsa7.com/?cat=631"
    }];

    return plan;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("403") || error.message?.includes("API_KEY_INVALID")) {
        throw new Error("INVALID_KEY");
    }
    throw error;
  }
};
