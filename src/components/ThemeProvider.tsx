import { createContext, useContext, useEffect, useState } from "react";
import { THEMES } from "@/lib/theme-config";

type ThemeState = {
  appTheme: string;
  chatTheme: string;
  feedTheme: string;
  darkMode: boolean;
  setAppTheme: (theme: string) => void;
  setChatTheme: (theme: string) => void;
  setFeedTheme: (theme: string) => void;
  toggleDarkMode: () => void;
  currentAppTheme: typeof THEMES.app[0] | undefined;
  currentChatTheme: typeof THEMES.chat[0] | undefined;
  currentFeedTheme: typeof THEMES.feed[0] | undefined;
};

const ThemeContext = createContext<ThemeState | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [appTheme, setAppThemeState] = useState("pastel-light");
  const [chatTheme, setChatThemeState] = useState("chat-warm");
  const [feedTheme, setFeedThemeState] = useState("feed-colorful");
  const [darkMode, setDarkModeState] = useState(false);

  useEffect(() => {
    const savedAppTheme = localStorage.getItem("appTheme");
    const savedChatTheme = localStorage.getItem("chatTheme");
    const savedFeedTheme = localStorage.getItem("feedTheme");
    const savedDarkMode = localStorage.getItem("darkMode");

    if (savedAppTheme) setAppThemeState(savedAppTheme);
    if (savedChatTheme) setChatThemeState(savedChatTheme);
    if (savedFeedTheme) setFeedThemeState(savedFeedTheme);
    
    if (savedDarkMode === "true") {
      setDarkModeState(true);
      document.documentElement.classList.add("dark");
    } else if (savedDarkMode === "false") {
      setDarkModeState(false);
      document.documentElement.classList.remove("dark");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setDarkModeState(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const setAppTheme = (theme: string) => {
    setAppThemeState(theme);
    localStorage.setItem("appTheme", theme);
  };

  const setChatTheme = (theme: string) => {
    setChatThemeState(theme);
    localStorage.setItem("chatTheme", theme);
  };

  const setFeedTheme = (theme: string) => {
    setFeedThemeState(theme);
    localStorage.setItem("feedTheme", theme);
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkModeState(newMode);
    localStorage.setItem("darkMode", String(newMode));
    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const currentAppTheme = THEMES.app.find(t => t.id === appTheme);
  const currentChatTheme = THEMES.chat.find(t => t.id === chatTheme);
  const currentFeedTheme = THEMES.feed.find(t => t.id === feedTheme);

  return (
    <ThemeContext.Provider value={{
      appTheme,
      chatTheme,
      feedTheme,
      darkMode,
      setAppTheme,
      setChatTheme,
      setFeedTheme,
      toggleDarkMode,
      currentAppTheme,
      currentChatTheme,
      currentFeedTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
