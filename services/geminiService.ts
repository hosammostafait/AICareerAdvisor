
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserInput, AIPlanResponse, VideoRecommendation, ArticleRecommendation } from "../types";

// وظيفة للحصول على المفتاح مع التنبيه في حال فقدانه
const getApiKey = () => {
  const key = process.env.API_KEY;
  if (!key || key === "undefined") {
    console.error("خطأ: مفتاح API_KEY غير موجود في إعدادات البيئة (Environment Variables).");
    return "";
  }
  return key;
};

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    greeting: {
      type: Type.STRING,
      description: "A friendly, professional greeting tailored to the user's profession in Arabic.",
    },
    tools: {
      type: Type.ARRAY,
      description: "A list of 4-8 recommended AI tools (MUST include both Free and Paid options).",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          usage: { type: Type.STRING },
          url: { type: Type.STRING },
          category: { 
            type: Type.STRING, 
            enum: ['writing', 'image', 'video', 'design', 'coding', 'productivity', 'other']
          },
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
          instructor: { type: Type.STRING },
          summary: { type: Type.STRING },
          url: { type: Type.STRING }
        },
        required: ["title", "platform", "summary", "url"]
      }
    },
    steps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    tips: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: ["greeting", "tools", "videos", "courses", "steps", "tips"],
};

export const generatePlan = async (input: UserInput): Promise<AIPlanResponse> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("مفتاح الـ API غير مهيأ. يرجى إضافته في إعدادات البيئة باسم API_KEY");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    أنت مستشار وظيفي متخصص في الذكاء الاصطناعي.
    المستخدم يعمل في المهنة التالية: "${input.profession}".
    المهام التي يريد إنجازها: "${input.tasks}".
    مستوى خبرته: "${input.experience}".
    
    المطلوب:
    1. **أدوات AI**: قائمة بأفضل أدوات الذكاء الاصطناعي (مزيج مجاني ومدفوع).
    2. **يوتيوب**: اقترح قنوات وفيديوهات يوتيوب تعليمية.
    3. **دورات تعليمية**: اقترح 3-5 دورات من (Udemy, Coursera, LinkedIn Learning, Almentor).
    4. خطة عمل من 3 خطوات عملية.
    5. نصائح للتركيز.
    
    استخدم اللغة العربية السهلة والمشجعة.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const plan = JSON.parse(text) as AIPlanResponse;

    // حقن الروابط الثابتة لمبادرة اكتب صح
    const ektebSahChannel: VideoRecommendation = {
        title: "قناة اكتب صح - حسام مصطفى إبراهيم",
        summary: "شروحات عملية لتوظيف الذكاء الاصطناعي في العمل اليومي.",
        searchQuery: "اكتب صح حسام مصطفى",
        url: "https://www.youtube.com/@Ektebsa7"
    };
    plan.videos = [ektebSahChannel, ...plan.videos];

    const ektebSahArticle: ArticleRecommendation = {
        title: "مقالات عن الذكاء الاصطناعي - موقع اكتب صح",
        summary: "تصفح أحدث المقالات والشروحات حول أدوات الذكاء الاصطناعي وكيفية الاستفادة منها.",
        url: "https://www.ektebsa7.com/?cat=631"
    };
    plan.articles = [ektebSahArticle];

    return plan;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
