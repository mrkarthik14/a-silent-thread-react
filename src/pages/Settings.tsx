import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Loader2, Moon, Sun, Palette } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import { toast } from "sonner";

const THEMES = {
  app: [
    {
      id: "pastel-light",
      name: "Pastel Light",
      colors: ["#fce7f3", "#e9d5ff", "#dbeafe", "#fef3c7"],
      bgGradient: "from-slate-50 via-purple-50 to-blue-50"
    },
    {
      id: "pastel-dark",
      name: "Pastel Dark",
      colors: ["#86efac", "#60a5fa", "#c084fc", "#f87171"],
      bgGradient: "from-slate-900 via-purple-900 to-blue-900"
    },
    {
      id: "sunset",
      name: "Sunset",
      colors: ["#fed7aa", "#fb7185", "#f43f5e", "#dc2626"],
      bgGradient: "from-orange-100 via-red-100 to-pink-100"
    },
    {
      id: "ocean",
      name: "Ocean",
      colors: ["#0ea5e9", "#06b6d4", "#10b981", "#059669"],
      bgGradient: "from-blue-100 via-cyan-100 to-emerald-100"
    },
  ],
  chat: [
    {
      id: "chat-warm",
      name: "Warm",
      sent: "from-rose-100 to-pink-200",
      received: "from-amber-100 to-yellow-200",
      header: "from-rose-50 to-pink-50",
      footer: "from-cyan-50 to-emerald-50"
    },
    {
      id: "chat-cool",
      name: "Cool",
      sent: "from-blue-100 to-indigo-200",
      received: "from-cyan-100 to-blue-200",
      header: "from-blue-50 to-indigo-50",
      footer: "from-cyan-50 to-blue-50"
    },
    {
      id: "chat-modern",
      name: "Modern Dark",
      sent: "from-purple-600 to-pink-600",
      received: "from-gray-600 to-gray-700",
      header: "from-purple-900 to-pink-900",
      footer: "from-gray-900 to-gray-800"
    },
    {
      id: "chat-vibrant",
      name: "Vibrant",
      sent: "from-fuchsia-300 to-purple-300",
      received: "from-lime-300 to-emerald-300",
      header: "from-fuchsia-100 to-purple-100",
      footer: "from-lime-100 to-emerald-100"
    },
  ],
  feed: [
    {
      id: "feed-minimal",
      name: "Minimal",
      cardGradient: "from-white to-gray-50",
      textColor: "text-gray-900"
    },
    {
      id: "feed-colorful",
      name: "Colorful",
      cardGradient: "from-pink-50 via-purple-50 to-blue-50",
      textColor: "text-slate-900"
    },
    {
      id: "feed-dark",
      name: "Dark",
      cardGradient: "from-gray-800 to-gray-900",
      textColor: "text-white"
    },
    {
      id: "feed-sunset",
      name: "Sunset",
      cardGradient: "from-orange-50 via-red-50 to-pink-50",
      textColor: "text-orange-900"
    },
  ]
};

export default function Settings() {
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedAppTheme, setSelectedAppTheme] = useState("pastel-light");
  const [selectedChatTheme, setSelectedChatTheme] = useState("chat-warm");
  const [selectedFeedTheme, setSelectedFeedTheme] = useState("feed-colorful");
  const [darkMode, setDarkMode] = useState(false);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-900" strokeWidth={1.5} />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/auth");
    return null;
  }

  const handleThemeSelect = (themeType: string, themeId: string) => {
    if (themeType === "app") setSelectedAppTheme(themeId);
    if (themeType === "chat") setSelectedChatTheme(themeId);
    if (themeType === "feed") setSelectedFeedTheme(themeId);
    toast.success(`Theme updated to ${themeId}`);
  };

  const handleSaveThemes = () => {
    localStorage.setItem("appTheme", selectedAppTheme);
    localStorage.setItem("chatTheme", selectedChatTheme);
    localStorage.setItem("feedTheme", selectedFeedTheme);
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    toast.success("Theme preferences saved!");
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto ml-0 md:ml-20">
        <div className="max-w-6xl mx-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Settings</h1>
            <p className="text-slate-600">Customize your A Silent Thread experience</p>
          </motion.div>

          {/* Theme Mode Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-slate-200"
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
                onClick={() => setDarkMode(!darkMode)}
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

          {/* App Theme */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
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
                  transition={{ delay: 0.2 + idx * 0.05 }}
                  onClick={() => handleThemeSelect("app", theme.id)}
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

          {/* Chat Theme */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
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
                  transition={{ delay: 0.3 + idx * 0.05 }}
                  onClick={() => handleThemeSelect("chat", theme.id)}
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
                    <div className="flex gap-2 mt-2">
                      <div className={`bg-gradient-to-r ${theme.header} rounded h-8 flex-1`} />
                      <div className={`bg-gradient-to-r ${theme.footer} rounded h-8 flex-1`} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Feed Theme */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
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
                  transition={{ delay: 0.4 + idx * 0.05 }}
                  onClick={() => handleThemeSelect("feed", theme.id)}
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

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-6 border border-purple-200"
          >
            <h3 className="font-bold text-slate-900 mb-3">Your Theme Selection</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/80 rounded-lg p-3">
                <p className="text-xs text-slate-600">App Theme</p>
                <p className="font-semibold text-slate-900">{THEMES.app.find(t => t.id === selectedAppTheme)?.name}</p>
              </div>
              <div className="bg-white/80 rounded-lg p-3">
                <p className="text-xs text-slate-600">Chat Theme</p>
                <p className="font-semibold text-slate-900">{THEMES.chat.find(t => t.id === selectedChatTheme)?.name}</p>
              </div>
              <div className="bg-white/80 rounded-lg p-3">
                <p className="text-xs text-slate-600">Feed Theme</p>
                <p className="font-semibold text-slate-900">{THEMES.feed.find(t => t.id === selectedFeedTheme)?.name}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}