import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Loader2, Palette, User, Eye, Shield, Bell } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { SettingsThemeTab } from "@/components/SettingsThemeTab";
import { SettingsUserTab } from "@/components/SettingsUserTab";
import { SettingsPrivacyTab } from "@/components/SettingsPrivacyTab";
import { SettingsSecurityTab } from "@/components/SettingsSecurityTab";

export default function Settings() {
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedAppTheme, setSelectedAppTheme] = useState("pastel-light");
  const [selectedChatTheme, setSelectedChatTheme] = useState("chat-warm");
  const [selectedFeedTheme, setSelectedFeedTheme] = useState("feed-colorful");
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("theme");
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  
  // Privacy Settings
  const [privacySettings, setPrivacySettings] = useState({
    profilePublic: true,
    allowMessages: true,
    showOnlineStatus: true,
    allowFollowing: true,
  });
  
  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    loginAlerts: true,
    sessionTimeout: 30,
  });
  
  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    messageNotifications: true,
    likeNotifications: true,
    followNotifications: true,
    bookingNotifications: true,
  });

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
    
    // Apply dark mode to document
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    toast.success("Theme preferences saved!");
  };

  const handleDarkModeToggleWithApply = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    // Apply immediately
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    localStorage.setItem("darkMode", JSON.stringify(newDarkMode));
    toast.success(newDarkMode ? "Dark mode enabled" : "Light mode enabled");
  };

  const handlePrivacyChange = (key: string, value: boolean) => {
    setPrivacySettings(prev => ({ ...prev, [key]: value }));
    toast.success("Privacy setting updated");
  };

  const handleSecurityChange = (key: string, value: any) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
    toast.success("Security setting updated");
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }));
    toast.success("Notification preference updated");
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

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6 rounded-xl bg-white/50 backdrop-blur-sm border border-slate-200 p-1 overflow-x-auto">
              <TabsTrigger value="theme" className="rounded-lg flex items-center gap-2 text-xs sm:text-sm">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Theme</span>
              </TabsTrigger>
              <TabsTrigger value="user" className="rounded-lg flex items-center gap-2 text-xs sm:text-sm">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">User</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="rounded-lg flex items-center gap-2 text-xs sm:text-sm">
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Privacy</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="rounded-lg flex items-center gap-2 text-xs sm:text-sm">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="rounded-lg flex items-center gap-2 text-xs sm:text-sm">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Alerts</span>
              </TabsTrigger>
              <TabsTrigger value="advanced" className="rounded-lg flex items-center gap-2 text-xs sm:text-sm">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Advanced</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="theme">
              <SettingsThemeTab
                selectedAppTheme={selectedAppTheme}
                selectedChatTheme={selectedChatTheme}
                selectedFeedTheme={selectedFeedTheme}
                darkMode={darkMode}
                onThemeSelect={handleThemeSelect}
                onSaveThemes={handleSaveThemes}
                onDarkModeToggle={handleDarkModeToggleWithApply}
              />
            </TabsContent>

            <TabsContent value="user">
              <SettingsUserTab onDeleteAccountClick={() => setDeleteAccountOpen(true)} />
            </TabsContent>

            <TabsContent value="privacy">
              <SettingsPrivacyTab
                privacySettings={privacySettings}
                onPrivacyChange={handlePrivacyChange}
              />
            </TabsContent>

            <TabsContent value="security">
              <SettingsSecurityTab
                securitySettings={securitySettings}
                notificationSettings={notificationSettings}
                onSecurityChange={handleSecurityChange}
                onNotificationChange={handleNotificationChange}
              />
            </TabsContent>

            <TabsContent value="notifications">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4 mt-6"
              >
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Alert Preferences
                </h2>
                
                <div className="space-y-4">
                  {/* ... keep existing code (notification switches) */}
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AlertDialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All your data, posts, and messages will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction className="rounded-xl bg-red-600 hover:bg-red-700 text-white">
              Delete Account
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}