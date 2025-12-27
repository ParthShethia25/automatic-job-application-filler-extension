import { GoogleGenAI } from "@google/genai";
import { UserProfile, AiConfig } from "../types";

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  if (!apiKey) return false;
  try {
    const ai = new GoogleGenAI({ apiKey });
    // Simple fast call to validate
    await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: 'Hello',
    });
    return true;
  } catch (error) {
    console.error("API Validation failed:", error);
    return false;
  }
};

interface GenerationResult {
  text: string;
  usage?: {
    input: number;
    output: number;
    total: number;
  };
}

export const generateAnswer = async (
  question: string,
  profile: UserProfile,
  config: AiConfig,
  jobContext?: string
): Promise<GenerationResult> => {
  if (!config.apiKey) {
    return { text: "ERROR", usage: undefined };
  }

  const ai = new GoogleGenAI({ apiKey: config.apiKey });
  
  // Get Active Resume
  const activeResume = profile.resumes.find(r => r.isActive);
  const resumeContent = activeResume ? activeResume.content : "No resume text provided.";

  // Format profile for context
  const customDetails = profile.customFields
    .map(field => `${field.label}: ${field.value}`)
    .join('\n');

  const profileSummary = `
    Name: ${profile.firstName} ${profile.lastName}
    Email: ${profile.email}
    Phone: ${profile.phone}
    Location: ${profile.location}
    LinkedIn: ${profile.linkedin}
    Portfolio: ${profile.portfolio}
    Title: ${profile.currentTitle}
    Experience: ${profile.yearsOfExperience} years
    Skills: ${profile.skills.join(', ')}
    Education: ${profile.education.map(e => `${e.degree} from ${e.institution}`).join(', ')}
    
    Additional Details (High Priority):
    ${customDetails}
  `;

  const systemInstruction = `
    You are a professional job applicant assistant. 
    Personality: ${config.personality}
    Tone: ${config.tone}
    Target Length: ${config.responseLength}
    
    Task: Answer the job application question based on the User Profile and the Active Resume Content.
    
    CRITICAL RULES:
    1. **Dates:** If the question asks for a date (like start date, graduation), output it in standard format YYYY-MM-DD (e.g., 2026-06-01) unless the question implies a year-only or different format. If the user says "June 2026", infer the first day: 2026-06-01.
    2. **Dropdowns/Locations:** If the question asks "Where are you located?" or similar select fields, return the EXACT string that is most likely to be in a standard dropdown list based on the user's location (e.g., if user says "Bangalore, India", and the standard country list is expected, return "India").
    3. **Extraction:** If the question is a simple field label (e.g. "LinkedIn Profile", "Phone Number", "Website"), EXTRACT the exact value from the Resume or Profile. Do not generate a sentence. Just return the value (e.g., "https://linkedin.com/in/me").
    4. **Behavioral Questions:** For questions like "What are you proud of?", "Describe a challenge", "Why this role?", use the **Resume Content** to find specific projects, metrics, and achievements. Synthesize a coherent answer.
    5. **Missing Info:** If a specific fact is strictly required and NOT in the profile or resume, return: "[MISSING]"
    6. **Direct Answer:** Return ONLY the answer. No "Here is the answer" or quotes.
  `;

  const prompt = `
    User Profile Summary:
    ${profileSummary}

    Active Resume Content (Use this for detailed project/experience answers):
    ${resumeContent}

    ${jobContext ? `Job Page Context: ${jobContext}` : ''}

    ------------------------
    Question/Label to fill: "${question}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: config.selectedModel || 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.4, // Lower temperature for more deterministic extraction
      }
    });

    const usageMetadata = response.usageMetadata;
    const usage = usageMetadata ? {
      input: usageMetadata.promptTokenCount || 0,
      output: usageMetadata.candidatesTokenCount || 0,
      total: usageMetadata.totalTokenCount || 0,
    } : { input: 0, output: 0, total: 0 };

    let cleanText = response.text ? response.text.trim() : "";
    
    // Cleanup AI quirks
    cleanText = cleanText.replace(/^"|"$/g, ''); // Remove wrapping quotes
    cleanText = cleanText.replace(/^'|'$/g, '');

    if (cleanText.includes("[MISSING]")) {
        return { text: "[MISSING]", usage };
    }

    return {
      text: cleanText,
      usage
    };
  } catch (error) {
    console.error("Generation failed:", error);
    return { 
      text: "ERROR",
      usage: { input: 0, output: 0, total: 0 }
    };
  }
};