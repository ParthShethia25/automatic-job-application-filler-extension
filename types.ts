export interface Experience {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
  current: boolean;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  major: string;
  graduationDate: string;
}

export interface CustomField {
  id: string;
  label: string;
  value: string;
}

export interface Resume {
  id: string;
  name: string;
  content: string; // Raw text content
  isActive: boolean;
}

export interface UserProfile {
  // Basic Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  linkedin: string;
  portfolio: string;
  location: string;
  
  // Professional
  currentTitle: string;
  yearsOfExperience: number;
  expectedSalary: string;
  noticePeriod: string;
  
  // Lists
  experience: Experience[];
  education: Education[];
  skills: string[]; // Comma separated for simplicity in UI
  customFields: CustomField[];
  
  // Resumes
  resumes: Resume[];
}

export interface AiConfig {
  apiKey: string;
  personality: string;
  tone: 'professional' | 'enthusiastic' | 'concise';
  responseLength: 'short' | 'medium' | 'long';
  selectedModel: string;
  tokenUsage: {
    input: number;
    output: number;
    total: number;
  };
  monthlyTokenBudget: number;
}

export interface DetectedField {
  id: string;
  name: string; // HTML name or label
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'date' | 'url';
  confidence: number;
  predictedValue?: string;
  isAiGenerated?: boolean;
  currentValue?: string;
}

export interface MockSite {
  name: string;
  url: string;
  fields: DetectedField[];
  jobDescription?: string; // For AI context
}

export const AI_MODELS = [
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 2.0 Flash',
    costDesc: 'Fast & Efficient. ~$0.10 / 1M tokens',
    inputCostPer1M: 0.10,
    outputCostPer1M: 0.40
  },
  {
    id: 'gemini-3-pro-preview',
    name: 'Gemini 2.0 Pro',
    costDesc: 'High Reasoning. ~$3.50 / 1M tokens',
    inputCostPer1M: 3.50,
    outputCostPer1M: 10.50
  },
  {
    id: 'gemini-2.5-flash-latest',
    name: 'Gemini 1.5 Flash',
    costDesc: 'Legacy Fast. ~$0.075 / 1M tokens',
    inputCostPer1M: 0.075,
    outputCostPer1M: 0.30
  }
];