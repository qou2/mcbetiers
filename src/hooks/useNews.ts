
import { useState, useEffect } from 'react';

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  description?: string;
  author: string;
  category: string;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export function useNews() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      // For now, we'll use dummy data since the news_articles table doesn't exist
      const dummyArticles: NewsArticle[] = [
        {
          id: '1',
          title: 'New Tournament Announced',
          content: 'Exciting tournament coming soon with amazing prizes...',
          description: 'Exciting tournament coming soon...',
          author: 'Admin',
          category: 'tournaments',
          published_at: '2024-01-15',
          created_at: '2024-01-15',
          updated_at: '2024-01-15'
        }
      ];

      setArticles(dummyArticles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  return { articles, loading, error, refetch: fetchNews };
}
