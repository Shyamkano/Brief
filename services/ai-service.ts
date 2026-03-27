import axios from "axios";
import { KEYS } from "../constants/apis";

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${KEYS.GEMINI}`;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions";
const HUGGINGFACE_URL = "https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct/v1/chat/completions";

export interface Article {
  title: string;
  description: string;
  url: string;
  image: string;
  source: string;
  publishedAt: string;
}

export interface DeepAnalysisResult {
  summary: string[];
  impact: string;
  lenses: {
    left_view: string;
    right_view: string;
    neutral_view: string;
  };
}

export interface VerificationResult {
  status: "Verified" | "Suspect" | "False";
  score: number;
  reason: string;
}

// --- CACHING ---
const analysisCache: Record<string, DeepAnalysisResult> = {};
const verificationCache: Record<string, VerificationResult> = {};
const chatCache: Record<string, string> = {};

const fetchAIResponse = async (prompt: string, isJson = true): Promise<string> => {
  const providers = [
    // 1. Groq (Primary)
    async () => {
      const res = await axios.post(GROQ_URL, {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        ...(isJson ? { response_format: { type: "json_object" } } : {}),
      }, {
        headers: { Authorization: `Bearer ${KEYS.GROQ}` },
        timeout: 8000,
      });
      return res.data.choices[0].message.content;
    },
    // 2. Gemini
    async () => {
      const res = await axios.post(GEMINI_URL, {
        contents: [{ parts: [{ text: prompt }] }],
      });
      return res.data.candidates[0].content.parts[0].text;
    },
    // 3. Mistral
    async () => {
      const res = await axios.post(MISTRAL_URL, {
        model: "mistral-small-latest",
        messages: [{ role: "user", content: prompt }],
      }, {
        headers: { Authorization: `Bearer ${KEYS.MISTRAL}` },
        timeout: 8000,
      });
      return res.data.choices[0].message.content;
    },
    // 4. Hugging Face
    async () => {
      const res = await axios.post(HUGGINGFACE_URL, {
        model: "meta-llama/Llama-3.2-3B-Instruct",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
      }, {
        headers: { Authorization: `Bearer ${KEYS.HUGGINGFACE}` },
        timeout: 10000,
      });
      return res.data.choices[0].message.content;
    }
  ];

  for (let i = 0; i < providers.length; i++) {
    try {
      return await providers[i]();
    } catch (e) {
      console.warn(`[Brief AI] Provider ${i + 1} failed, trying next...`);
    }
  }
  throw new Error("All AI providers offline.");
};

const parseJSON = (text: string) => {
  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON Parsing Error:", e);
    throw e;
  }
};

export const getDeepAnalysis = async (
  articleTitle: string,
  articleContent: string,
  language: "EN" | "HI" = "EN",
): Promise<DeepAnalysisResult> => {
  const cacheKey = `${articleTitle}_${language}`;
  if (analysisCache[cacheKey]) return analysisCache[cacheKey];

  try {
    const today = new Date("2026-03-27").toDateString();
    const prompt = `
      Analyze this article as an expert journalist. 
      Today's Date: ${today}.
      Title: [${articleTitle}] - Context: [${articleContent}]
      
      Generate a JSON object with:
      - summary: 3 power bullet points.
      - impact: 1 sentence on why a user should care.
      - lenses: { left_view: ..., right_view: ..., neutral_view: ... }
      
      Output ONLY JSON. Language: ${language === "HI" ? "Hindi" : "English"}.
    `;

    const rawText = await fetchAIResponse(prompt);
    const parsed = parseJSON(rawText);
    
    const result: DeepAnalysisResult = {
      summary: Array.isArray(parsed.summary) ? parsed.summary : ["No summary available"],
      impact: parsed.impact || "Impact analysis pending.",
      lenses: {
        left_view: parsed.lenses?.left_view || "N/A",
        right_view: parsed.lenses?.right_view || "N/A",
        neutral_view: parsed.lenses?.neutral_view || "N/A",
      }
    };
    
    analysisCache[cacheKey] = result;
    return result;
  } catch (error) {
    return {
      summary: ["Analysis failed", "Please try again later"],
      impact: "N/A",
      lenses: { left_view: "N/A", right_view: "N/A", neutral_view: "N/A" },
    };
  }
};

export const verifyNewsHeadline = async (
  query: string,
  searchContext?: any[]
): Promise<VerificationResult> => {
  const cacheKey = searchContext ? `live_${query}` : query;
  if (verificationCache[cacheKey]) return verificationCache[cacheKey];

  try {
    const today = new Date("2026-03-27").toDateString();
    const contextString = searchContext && searchContext.length > 0
      ? `REAL-TIME WEB RESULTS:\n${searchContext.map(s => `- ${s.title}`).join("\n")}`
      : "No live results.";

    const prompt = `
      Fact-check: "${query}". Today: ${today}.
      ${contextString}
      Return JSON: { "status": "Verified"|"Suspect"|"False", "score": 0-100, "reason": "..." }
    `;

    const rawText = await fetchAIResponse(prompt);
    const result = parseJSON(rawText);
    verificationCache[cacheKey] = result;
    return result;
  } catch (error) {
    return { status: "Suspect", score: 50, reason: "Verification service busy." };
  }
};

export const getChatResponse = async (
  userMessage: string,
  articleContext?: string
): Promise<string> => {
  try {
    const prompt = `
      You are Brief AI, a helpful news assistant. 
      User Question: "${userMessage}"
      ${articleContext ? `Context about the current article: ${articleContext}` : "No specific article context."}
      
      Provide a concise, engaging, and factual answer in 2-3 sentences max.
    `;
    return await fetchAIResponse(prompt, false);
  } catch (error) {
    return "I'm currently overwhelmed with news updates. Try again in a moment!";
  }
};

export const getAISummary = async (t: string, c: string, l: "EN"|"HI") => {
    // Simple fallback for any old components
    const res = await getDeepAnalysis(t, c, l);
    return res.summary;
};
