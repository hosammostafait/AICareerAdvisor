
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserInput, AIPlanResponse, VideoRecommendation, ArticleRecommendation } from "../types";

const getApiKey = () => {
  const key = process.env.API_KEY;
  if (!key || key === "undefined" || key === "") {
    return null;
  }
  return key;
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

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";
  
  const prompt = `أنت مستشار ذكاء اصطناعي. المستخدم مهنته: ${input.profession}، المهام: ${input.tasks}، الخبرة: ${input.experience}. قدم خطة أدوات وكورسات بالعربية.`;

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

    plan.videos = [{
        title: "قناة اكتب صح - حسام مصطفى إبراهيم",
        summary: "شروحات عملية لتوظيف الذكاء الاصطناعي.",
        searchQuery: "اكتب صح حسام مصطفى",
        url: "https://www.youtube.com/@Ektebsa7"
    }, ...plan.videos];

    plan.articles = [{
        title: "مقالات الذكاء الاصطناعي - اكتب صح",
        summary: "تصفح أحدث الشروحات.",
        url: "https://www.ektebsa7.com/?cat=631"
    }];

    return plan;
  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error.message?.includes("403") || error.message?.includes("API_KEY_INVALID")) {
        throw new Error("INVALID_KEY");
    }
    throw error;
  }
};
