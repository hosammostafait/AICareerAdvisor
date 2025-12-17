export enum ExperienceLevel {
  BEGINNER = 'مبتدئ',
  INTERMEDIATE = 'متوسط',
  ADVANCED = 'متقدم',
}

export interface UserInput {
  profession: string;
  tasks: string;
  experience: ExperienceLevel;
}

export type ToolCategory = 'writing' | 'image' | 'video' | 'design' | 'coding' | 'productivity' | 'other';

export interface ToolRecommendation {
  name: string;
  description: string;
  usage: string;
  url: string;
  category: ToolCategory;
  isPaid: boolean;
}

export interface VideoRecommendation {
  title: string;
  summary: string;
  searchQuery: string; // Using search query to ensure link validity
  url?: string; // Optional direct URL
}

export interface CourseRecommendation {
  title: string;
  platform: string; // e.g., 'Udemy', 'Coursera', 'Yanfaa', 'Almentor'
  instructor?: string;
  summary: string;
  url: string; // Direct link or search link
}

export interface ArticleRecommendation {
  title: string;
  summary: string;
  url: string;
}

export interface AIPlanResponse {
  tools: ToolRecommendation[];
  videos: VideoRecommendation[];
  courses: CourseRecommendation[];
  articles: ArticleRecommendation[];
  steps: string[];
  tips: string[];
  greeting: string;
}

export type AppState = 'input' | 'loading' | 'results' | 'error';