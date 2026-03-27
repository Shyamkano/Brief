import axios from "axios";
import { KEYS } from "../constants/apis";

export interface Article {
  title: string;
  description: string;
  url: string;
  image: string;
  source: string;
  publishedAt: string;
}

// --- HELPERS ---

// Validates if the image URL is real and not an empty string
const getValidImage = (url: string | null | undefined) => {
  if (url && url.length > 10 && url.startsWith("http")) {
    return url;
  }
  return "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1000"; // High-quality fallback
};

// Maps UI categories to API-specific categories
const mapCategory = (
  cat: string,
  provider: "newsdata" | "newsapi" | "gnews",
) => {
  const mapping: any = {
    "for you": { newsdata: "top", newsapi: "general", gnews: "general" },
    tech: {
      newsdata: "technology",
      newsapi: "technology",
      gnews: "technology",
    },
    politics: { newsdata: "politics", newsapi: "politics", gnews: "world" },
    sports: { newsdata: "sports", newsapi: "sports", gnews: "sports" },
    health: { newsdata: "health", newsapi: "health", gnews: "health" },
  };

  const normalized = cat.toLowerCase();
  return mapping[normalized]
    ? mapping[normalized][provider]
    : mapping["for you"][provider];
};

// --- API FETCHERS ---

// 1. NewsData.io
const fetchNewsData = async (category: string) => {
  const apiCat = mapCategory(category, "newsdata");
  const res = await axios.get(
    `https://newsdata.io/api/1/news?apikey=${KEYS.NEWSDATA}&country=in&category=${apiCat}`,
    { timeout: 5000 }, // 5 second timeout
  );

  return res.data.results.map((item: any) => ({
    title: item.title || "No Title Available",
    description: item.description || "",
    url: item.link,
    image: getValidImage(item.image_url),
    source: item.source_id || "News",
    publishedAt: item.pubDate || new Date().toISOString(),
  }));
};

// 2. GNews
const fetchGNews = async (category: string) => {
  const apiCat = mapCategory(category, "gnews");
  const res = await axios.get(
    `https://gnews.io/api/4/top-headlines?category=${apiCat}&lang=en&country=in&max=10&apikey=${KEYS.GNEWS}`,
    { timeout: 5000 },
  );

  return res.data.articles.map((item: any) => ({
    title: item.title,
    description: item.description,
    url: item.url,
    image: getValidImage(item.image),
    source: item.source.name,
    publishedAt: item.publishedAt,
  }));
};

// 3. NewsAPI
const fetchNewsAPI = async (category: string) => {
  const apiCat = mapCategory(category, "newsapi");
  const res = await axios.get(
    `https://newsapi.org/v2/top-headlines?country=in&category=${apiCat}&apiKey=${KEYS.NEWS_API}`,
    { timeout: 5000 },
  );

  return res.data.articles.map((item: any) => ({
    title: item.title,
    description: item.description,
    url: item.url,
    image: getValidImage(item.urlToImage),
    source: item.source.name,
    publishedAt: item.publishedAt,
  }));
};

// --- MAIN EXPORT ---

export const getLatestNews = async (category = "for you") => {
  try {
    console.log(`[Brief] Fetching ${category} from NewsData.io`);
    return await fetchNewsData(category);
  } catch (e) {
    console.warn("NewsData.io failed.");
    try {
      return await fetchGNews(category);
    } catch (e2) {
      console.warn("GNews failed.");
      try {
        return await fetchNewsAPI(category);
      } catch (e3) {
        console.error("CRITICAL: All News APIs failed.");
        return [];
      }
    }
  }
};

// --- KEYWORD SEARCH (for search bar) ---
export const searchArticles = async (query: string): Promise<Article[]> => {
  const encoded = encodeURIComponent(query);

  // 1. Try NewsData keyword search
  try {
    const res = await axios.get(
      `https://newsdata.io/api/1/news?apikey=${KEYS.NEWSDATA}&q=${encoded}&language=en`,
      { timeout: 6000 }
    );
    const results = res.data.results;
    if (results && results.length > 0) {
      console.log(`[Brief Search] NewsData returned ${results.length} results`);
      return results.map((item: any) => ({
        title: item.title || "No Title",
        description: item.description || "",
        url: item.link,
        image: getValidImage(item.image_url),
        source: item.source_id || "News",
        publishedAt: item.pubDate || new Date().toISOString(),
      }));
    }
  } catch (e) {
    console.warn("[Brief Search] NewsData search failed, trying GNews...");
  }

  // 2. Try GNews keyword search
  try {
    const res = await axios.get(
      `https://gnews.io/api/4/search?q=${encoded}&lang=en&max=10&apikey=${KEYS.GNEWS}`,
      { timeout: 6000 }
    );
    const articles = res.data.articles;
    if (articles && articles.length > 0) {
      console.log(`[Brief Search] GNews returned ${articles.length} results`);
      return articles.map((item: any) => ({
        title: item.title,
        description: item.description,
        url: item.url,
        image: getValidImage(item.image),
        source: item.source?.name || "News",
        publishedAt: item.publishedAt,
      }));
    }
  } catch (e) {
    console.warn("[Brief Search] GNews search failed, trying NewsAPI...");
  }

  // 3. Try NewsAPI keyword search
  try {
    const res = await axios.get(
      `https://newsapi.org/v2/everything?q=${encoded}&language=en&sortBy=publishedAt&apiKey=${KEYS.NEWS_API}`,
      { timeout: 6000 }
    );
    const articles = res.data.articles;
    console.log(`[Brief Search] NewsAPI returned ${articles?.length || 0} results`);
    return (articles || []).map((item: any) => ({
      title: item.title,
      description: item.description,
      url: item.url,
      image: getValidImage(item.urlToImage),
      source: item.source?.name || "News",
      publishedAt: item.publishedAt,
    }));
  } catch (e) {
    console.warn("[Brief Search] All search APIs failed.");
    return [];
  }
};

export const searchNews = async (query: string) => {
  try {
    const res = await axios.get(
      `https://newsdata.io/api/1/news?apikey=${KEYS.NEWSDATA}&q=${encodeURIComponent(query)}&language=en`,
      { timeout: 5000 },
    );
    return res.data.results.map((item: any) => ({
        title: item.title || "",
        content: item.description || item.content || "",
        source: item.source_id || "Unverified Source",
    }));
  } catch (error) {
    console.warn("Search API failed:", error);
    return [];
  }
};
