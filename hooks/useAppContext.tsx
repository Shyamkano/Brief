import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";

type Language = "EN" | "HI";
type Theme = "light" | "dark";

interface AppContextType {
  theme: Theme;
  language: Language;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
  isDark: boolean;
}

const AppContext = createContext<AppContextType>({
  theme: "light",
  language: "EN",
  toggleTheme: () => {},
  setLanguage: () => {},
  isDark: false,
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemTheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>("light");
  const [language, setLanguageState] = useState<Language>("EN");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem("theme");
      const storedLang = await AsyncStorage.getItem("language");
      
      if (storedTheme) setTheme(storedTheme as Theme);
      else setTheme(systemTheme || "light");
      
      if (storedLang) setLanguageState(storedLang as Language);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    await AsyncStorage.setItem("theme", newTheme);
  };

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    await AsyncStorage.setItem("language", lang);
  };

  const isDark = theme === "dark";

  return (
    <AppContext.Provider value={{ theme, language, toggleTheme, setLanguage, isDark }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};

// --- TRANSLATION HELPER ---
export const translations = {
  EN: {
    home: "Home",
    verify: "Verify",
    bookmarks: "Bookmarks",
    settings: "Settings",
    breaking: "Breaking News",
    topStories: "Top Stories",
    searchPlaceholder: "Search news...",
    aiSummary: "AI Intelligence Report",
    impactTitle: "HOW IT AFFECTS YOU",
    lensTitle: "PERSPECTIVE LENS",
    askAI: "Ask AI More",
    language: "Content Language",
    darkMode: "Dark Mode",
    notifications: "Notifications",
    privateMode: "PRIVATE MODE ENABLED",
  },
  HI: {
    home: "मुख्य पृष्ठ",
    verify: "सत्यापित करें",
    bookmarks: "बुकमार्क",
    settings: "सेटिंग्स",
    breaking: "ताज़ा खबर",
    topStories: "प्रमुख कहानियाँ",
    searchPlaceholder: "समाचार खोजें...",
    aiSummary: "एआई इंटेलिजेंस रिपोर्ट",
    impactTitle: "यह आपको कैसे प्रभावित करता है",
    lensTitle: "परिप्रेक्ष्य लेंस",
    askAI: "एआई से और पूछें",
    language: "सामग्री की भाषा",
    darkMode: "डार्क मोड",
    notifications: "सूचनाएं",
    privateMode: "निजी मोड सक्षम",
  }
};

export const t = (key: keyof typeof translations.EN, currentLang: Language): string => {
  try {
    const lang = currentLang || "EN";
    return (translations[lang] && translations[lang][key]) || translations.EN[key] || key;
  } catch (e) {
    return key;
  }
};
