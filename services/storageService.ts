import { UserProfile, AiConfig } from '../types';

const PROFILE_KEY = 'job_filler_profile';
const AI_CONFIG_KEY = 'job_filler_ai_config';

const defaultProfile: UserProfile = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  linkedin: '',
  portfolio: '',
  location: '',
  currentTitle: '',
  yearsOfExperience: 0,
  expectedSalary: '',
  noticePeriod: '',
  experience: [],
  education: [],
  skills: [],
  customFields: [],
  resumes: []
};

const defaultAiConfig: AiConfig = {
  apiKey: '',
  personality: 'Professional, experienced, and solution-oriented.',
  tone: 'professional',
  responseLength: 'medium',
  selectedModel: 'gemini-3-flash-preview',
  tokenUsage: {
    input: 0,
    output: 0,
    total: 0
  },
  monthlyTokenBudget: 1000000 // Default 1 million tokens budget
};

export const loadProfile = (): UserProfile => {
  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    // Merge with default to ensure new fields (like resumes) exist for old users
    return stored ? { ...defaultProfile, ...JSON.parse(stored) } : defaultProfile;
  } catch (e) {
    console.error('Failed to load profile', e);
    return defaultProfile;
  }
};

export const saveProfile = (profile: UserProfile): void => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};

export const loadAiConfig = (): AiConfig => {
  try {
    const stored = localStorage.getItem(AI_CONFIG_KEY);
    return stored ? { ...defaultAiConfig, ...JSON.parse(stored) } : defaultAiConfig;
  } catch (e) {
    console.error('Failed to load AI config', e);
    return defaultAiConfig;
  }
};

export const saveAiConfig = (config: AiConfig): void => {
  localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
};