import { useEffect, useState } from "react";
// We import the specific function and interface from our service
import { Article, getLatestNews } from "../services/news-api";

export const useNews = (category: string) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const data = await getLatestNews(category);
      setArticles(data);
    } catch (error) {
      console.error("Hook Error:", error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [category]);

  return { articles, loading, refetch: fetchNews };
};
