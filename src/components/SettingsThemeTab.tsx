import { motion } from "framer-motion";
import { Palette, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { THEMES } from "@/lib/theme-config";

interface SettingsThemeTabProps {
  selectedAppTheme: string;
  selectedChatTheme: string;
  selectedFeedTheme: string;
  darkMode: boolean;
  onThemeSelect: (themeType: string, themeId: string) => void;
  onSaveThemes: () => void;
  onDarkModeToggle: () => void;
}

export function SettingsThemeTab({
  selectedAppTheme,
  selectedChatTheme,
  selectedFeedTheme,
  darkMode,
  onThemeSelect,
  onSaveThemes,
  onDarkModeToggle,
}: SettingsThemeTabProps) {
  return (
    <div className="space-y-6 mt-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-slate-200"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sun className="h-5 w-5" />
              Theme Mode
            </h2>
            <p className="text-sm text-slate-600 mt-1">Choose between light and dark mode</p>
          </div>
          <Button
            onClick={onDarkModeToggle}
            className={`rounded-xl px-6 transition-all duration-300 ${
              darkMode
                ? "bg-gray-800 text-white hover:bg-gray-900"
                : "bg-amber-100 text-amber-900 hover:bg-amber-200"
            }`}
          >
            {darkMode ? <Moon className="h-4 w-4 mr-2" /> : <Sun className="h-4 w-4 mr-2" />}
            {darkMode ? "Dark" : "Light"}
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Palette className="h-6 w-6" />
          App Theme
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {THEMES.app.map((theme, idx) => (
            <motion.div
              key={theme.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
              onClick={() => onThemeSelect("app", theme.id)}
              className={`cursor-pointer rounded-xl p-4 transition-all duration-300 border-2 ${
                selectedAppTheme === theme.id
                  ? "border-purple-500 shadow-lg scale-105"
                  : "border-slate-200 hover:border-purple-300"
              }`}
            >
              <div className={`bg-gradient-to-br ${theme.bgGradient} rounded-lg h-24 mb-3 shadow-md`} />
              <p className="font-semibold text-slate-900">{theme.name}</p>
              <div className="flex gap-2 mt-2">
                {theme.colors.map((color) => (
                  <div
                    key={color}
                    className="w-6 h-6 rounded-full border border-slate-300 shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Palette className="h-6 w-6" />
          Chat Theme
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {THEMES.chat.map((theme, idx) => (
            <motion.div
              key={theme.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + idx * 0.05 }}
              onClick={() => onThemeSelect("chat", theme.id)}
              className={`cursor-pointer rounded-xl p-4 transition-all duration-300 border-2 ${
                selectedChatTheme === theme.id
                  ? "border-purple-500 shadow-lg scale-105"
                  : "border-slate-200 hover:border-purple-300"
              }`}
            >
              <p className="font-semibold text-slate-900 mb-3">{theme.name}</p>
              <div className="space-y-2">
                <div className={`bg-gradient-to-r ${theme.sent} rounded-2xl px-3 py-2 text-sm text-slate-800 w-fit`}>
                  Your message
                </div>
                <div className={`bg-gradient-to-r ${theme.received} rounded-2xl px-3 py-2 text-sm text-slate-800`}>
                  Their message
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Palette className="h-6 w-6" />
          Feed Theme
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {THEMES.feed.map((theme, idx) => (
            <motion.div
              key={theme.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + idx * 0.05 }}
              onClick={() => onThemeSelect("feed", theme.id)}
              className={`cursor-pointer rounded-xl p-4 transition-all duration-300 border-2 ${
                selectedFeedTheme === theme.id
                  ? "border-purple-500 shadow-lg scale-105"
                  : "border-slate-200 hover:border-purple-300"
              }`}
            >
              <p className="font-semibold text-slate-900 mb-3">{theme.name}</p>
              <div className={`bg-gradient-to-br ${theme.cardGradient} rounded-lg p-4 shadow-md`}>
                <p className={`${theme.textColor} text-sm font-medium`}>Sample Post Card</p>
                <p className={`${theme.textColor} text-xs opacity-70 mt-2`}>This is how your feed will look</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <Button onClick={onSaveThemes} className="w-full rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold">
        Save Theme Preferences
      </Button>
    </div>
  );
}