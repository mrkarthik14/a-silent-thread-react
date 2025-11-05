import { useEffect } from "react";

export function useTheme() {
  useEffect(() => {
    // Load saved dark mode preference
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode === "true") {
      document.documentElement.classList.add("dark");
    } else if (savedDarkMode === "false") {
      document.documentElement.classList.remove("dark");
    } else {
      // Check system preference
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      }
    }
  }, []);
}
