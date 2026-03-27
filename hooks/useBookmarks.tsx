import React, { createContext, useContext, useState, useEffect } from 'react';
import { Article } from '../services/news-api';
import AsyncStorage from "@react-native-async-storage/async-storage";

interface BookmarkContextType {
  bookmarks: Article[];
  addBookmark: (article: Article) => void;
  removeBookmark: (url: string) => void;
  isBookmarked: (url: string) => boolean;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export const BookmarkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookmarks, setBookmarks] = useState<Article[]>([]);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      const data = await AsyncStorage.getItem("brief_bookmarks");
      if (data) setBookmarks(JSON.parse(data));
    } catch (e) {
      console.error(e);
    }
  };

  const saveBookmarks = async (newBookmarks: Article[]) => {
    try {
      await AsyncStorage.setItem("brief_bookmarks", JSON.stringify(newBookmarks));
    } catch (e) {
      console.error(e);
    }
  };

  const addBookmark = (article: Article) => {
    if (!bookmarks.some(b => b.url === article.url)) {
      const newList = [...bookmarks, article];
      setBookmarks(newList);
      saveBookmarks(newList);
    }
  };

  const removeBookmark = (url: string) => {
    const newList = bookmarks.filter(b => b.url !== url);
    setBookmarks(newList);
    saveBookmarks(newList);
  };

  const isBookmarked = (url: string) => {
    return bookmarks.some(b => b.url === url);
  };

  return (
    <BookmarkContext.Provider value={{ bookmarks, addBookmark, removeBookmark, isBookmarked }}>
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (context === undefined) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};
