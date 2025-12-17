import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserInput, AIPlanResponse, VideoRecommendation, ArticleRecommendation } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
          name: { type: Type.STRING, description: "Name of the tool" },
          description: { type: Type.STRING, description: "Brief description of the tool" },
          usage: { type: Type.STRING, description: "How to apply this tool specifically to the user's tasks" },
          url: { type: Type.STRING, description: "The official website URL of the tool (e.g., https://chat.openai.com)" },
          category: { 
            type: Type.STRING, 
            enum: ['writing', 'image', 'video', 'design', 'coding', 'productivity', 'other'],
            description: "The primary category of the tool" 
          },
          isPaid: {
             type: Type.BOOLEAN,
             description: "TRUE if the tool requires a subscription (e.g. ChatGPT Plus, Midjourney). FALSE if it is completely free."
          }
        },
        required: ["name", "description", "usage", "url", "category", "isPaid"],
      },
    },
    videos: {
      type: Type.ARRAY,
      description: "Recommended YouTube learning topics.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Title of the video or topic" },
          summary: { type: Type.STRING, description: "What the user will learn from this video" },
          searchQuery: { type: Type.STRING, description: "The optimal search query to find this on YouTube" },
        },
        required: ["title", "summary", "searchQuery"],
      },
    },
    courses: {
      type: Type.ARRAY,
      description: "Recommended professional courses from platforms like Udemy, Coursera, Yanfaa, Almentor, LinkedIn Learning.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Title of the course" },
          platform: { type: Type.STRING, description: "Name of the platform (e.g., Udemy, Coursera, Yanfaa, Almentor)" },
          instructor: { type: Type.STRING, description: "Name of instructor or organization if known (optional)" },
          summary: { type: Type.STRING, description: "Why this course is good for the user" },
          url: { type: Type.STRING, description: "Use a SEARCH URL for the platform to ensure it works (e.g., https://www.udemy.com/courses/search/?q=python). DO NOT guess specific course IDs." }
        },
        required: ["title", "platform", "summary", "url"]
      }
    },
    steps: {
      type: Type.ARRAY,
      description: "Exactly 3 actionable steps to start immediately.",
      items: { type: Type.STRING },
    },
    tips: {
      type: Type.ARRAY,
      description: "Practical tips to avoid distraction.",
      items: { type: Type.STRING },
    },
  },
  required: ["greeting", "tools", "videos", "courses", "steps", "tips"],
};

export const generatePlan = async (input: UserInput): Promise<AIPlanResponse> => {
  const model = "gemini-2.5-flash";
  
  // Removed the explicit request for articles from the prompt to avoid hallucinations
  const prompt = `
    أنت مستشار وظيفي متخصص في الذكاء الاصطناعي.
    المستخدم يعمل في المهنة التالية: "${input.profession}".
    المهام التي يريد إنجازها: "${input.tasks}".
    مستوى خبرته: "${input.experience}".
    
    المطلوب:
    1. **أدوات AI**: قائمة بأفضل أدوات الذكاء الاصطناعي (مزيج مجاني ومدفوع 40% مدفوع على الأقل). حدد بدقة في الحقل (isPaid) ما إذا كانت الأداة مدفوعة.
    2. **يوتيوب**: اقترح قنوات وفيديوهات يوتيوب تعليمية.
    3. **دورات تعليمية (Courses)**: اقترح 3-5 دورات تعليمية متخصصة من منصات معروفة مثل (Udemy, Coursera, EdX, LinkedIn Learning, Yanfaa, Almentor). حاول تنويع المنصات واذكر اسم المنصة بوضوح.
       *هام*: استخدم روابط البحث (Search URLs) للدورات لضمان عمل الروابط (مثال: https://www.udemy.com/courses/search/?q=marketing).
    4. خطة عمل من 3 خطوات.
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
    if (!text) {
        throw new Error("No response from AI");
    }
    
    const plan = JSON.parse(text) as AIPlanResponse;

    // 1. Inject "Ekteb Sah" YouTube Channel
    const ektebSahChannel: VideoRecommendation = {
        title: "قناة اكتب صح - حسام مصطفى إبراهيم",
        summary: "قناة متميزة لتبسيط أدوات الذكاء الاصطناعي وشرح كيفية توظيفها في العمل والحياة اليومية بأسلوب سهل وعملي.",
        searchQuery: "اكتب صح حسام مصطفى",
        url: "https://www.youtube.com/@Ektebsa7"
    };
    plan.videos = [ektebSahChannel, ...plan.videos];

    // 2. Inject "Ekteb Sah" Website Article (Static Link - No Hallucinations)
    const ektebSahArticle: ArticleRecommendation = {
        title: "مقالات عن الذكاء الاصطناعي - موقع اكتب صح",
        summary: "تصفح أحدث المقالات والشروحات حول أدوات الذكاء الاصطناعي وكيفية الاستفادة منها في مجالك.",
        url: "https://www.ektebsa7.com/?cat=631"
    };
    // Initialize articles array if it doesn't exist (since we removed it from schema requirement)
    plan.articles = [ektebSahArticle];

    return plan;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};