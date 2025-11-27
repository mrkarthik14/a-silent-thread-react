import { useTheme as useThemeContext } from "@/components/ThemeProvider";

export function useTheme() {
  return useThemeContext();
}
