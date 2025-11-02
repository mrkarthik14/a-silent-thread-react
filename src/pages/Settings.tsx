import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Loader2, Moon, Sun, Palette, Lock, Shield, User, Bell, Eye, EyeOff, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

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
  const [activeTab, setActiveTab] = useState("theme");
  
  // User Settings
  const [showPassword, setShowPassword] = useState(false);
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

  // Accessibility Settings
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    reducedMotion: false,
    largerText: false,
    highContrast: false,
  });

  // Data & Storage Settings
  const [dataSettings, setDataSettings] = useState({
    autoDeleteMessages: false,
    autoDeleteDays: 30,
    cacheMedia: true,
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
    toast.success("Theme preferences saved!");
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

            {/* Theme Tab */}
            <TabsContent value="theme" className="space-y-6 mt-6">
              {/* Theme Mode Toggle */}
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
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Feed Theme */}
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

              <Button onClick={handleSaveThemes} className="w-full rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold">
                Save Theme Preferences
              </Button>
            </TabsContent>

            {/* User Settings Tab */}
            <TabsContent value="user" className="space-y-6 mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4"
              >
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Settings
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-900 font-semibold">Email Address</Label>
                    <Input type="email" placeholder="your@email.com" className="rounded-xl mt-2" disabled />
                  </div>
                  
                  <div>
                    <Label className="text-slate-900 font-semibold">Password</Label>
                    <div className="flex gap-2 mt-2">
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        className="rounded-xl"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="rounded-xl"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold">
                    Change Password
                  </Button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-red-50 border border-red-200 rounded-2xl p-6 space-y-4"
              >
                <h2 className="text-xl font-bold text-red-900 flex items-center gap-2">
                  <Trash2 className="h-5 w-5" />
                  Danger Zone
                </h2>
                <p className="text-sm text-red-800">Permanently delete your account and all associated data</p>
                <Button 
                  onClick={() => setDeleteAccountOpen(true)}
                  className="w-full rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold"
                >
                  Delete Account
                </Button>
              </motion.div>
            </TabsContent>

            {/* Privacy Settings Tab */}
            <TabsContent value="privacy" className="space-y-6 mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4"
              >
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Privacy Controls
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">Public Profile</p>
                      <p className="text-xs text-slate-600">Allow others to view your profile</p>
                    </div>
                    <Switch 
                      checked={privacySettings.profilePublic}
                      onCheckedChange={(value) => handlePrivacyChange("profilePublic", value)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">Allow Messages</p>
                      <p className="text-xs text-slate-600">Let anyone message you</p>
                    </div>
                    <Switch 
                      checked={privacySettings.allowMessages}
                      onCheckedChange={(value) => handlePrivacyChange("allowMessages", value)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">Show Online Status</p>
                      <p className="text-xs text-slate-600">Let others see when you're online</p>
                    </div>
                    <Switch 
                      checked={privacySettings.showOnlineStatus}
                      onCheckedChange={(value) => handlePrivacyChange("showOnlineStatus", value)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">Allow Following</p>
                      <p className="text-xs text-slate-600">Let others follow your account</p>
                    </div>
                    <Switch 
                      checked={privacySettings.allowFollowing}
                      onCheckedChange={(value) => handlePrivacyChange("allowFollowing", value)}
                    />
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            {/* Security Settings Tab */}
            <TabsContent value="security" className="space-y-6 mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4"
              >
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">Two-Factor Authentication</p>
                      <p className="text-xs text-slate-600">Add an extra layer of security</p>
                    </div>
                    <Switch 
                      checked={securitySettings.twoFactorEnabled}
                      onCheckedChange={(value) => handleSecurityChange("twoFactorEnabled", value)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">Login Alerts</p>
                      <p className="text-xs text-slate-600">Get notified of new login attempts</p>
                    </div>
                    <Switch 
                      checked={securitySettings.loginAlerts}
                      onCheckedChange={(value) => handleSecurityChange("loginAlerts", value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-900 font-semibold">Session Timeout (minutes)</Label>
                    <Input 
                      type="number" 
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => handleSecurityChange("sessionTimeout", parseInt(e.target.value))}
                      className="rounded-xl"
                      min="5"
                      max="480"
                    />
                    <p className="text-xs text-slate-600">Auto-logout after inactivity</p>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">Device Management</p>
                      <p className="text-xs text-slate-600">View and manage active sessions</p>
                    </div>
                    <Button className="h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold">
                      Manage
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">Blocked Users</p>
                      <p className="text-xs text-slate-600">Manage your blocked users list</p>
                    </div>
                    <Button className="h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold">
                      View
                    </Button>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4"
              >
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">Email Notifications</p>
                      <p className="text-xs text-slate-600">Receive email updates</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(value) => handleNotificationChange("emailNotifications", value)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">Push Notifications</p>
                      <p className="text-xs text-slate-600">Receive browser notifications</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(value) => handleNotificationChange("pushNotifications", value)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">Message Notifications</p>
                      <p className="text-xs text-slate-600">Get notified of new messages</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.messageNotifications}
                      onCheckedChange={(value) => handleNotificationChange("messageNotifications", value)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">Like Notifications</p>
                      <p className="text-xs text-slate-600">Get notified when posts are liked</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.likeNotifications}
                      onCheckedChange={(value) => handleNotificationChange("likeNotifications", value)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">Follow Notifications</p>
                      <p className="text-xs text-slate-600">Get notified when followed</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.followNotifications}
                      onCheckedChange={(value) => handleNotificationChange("followNotifications", value)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">Booking Notifications</p>
                      <p className="text-xs text-slate-600">Get notified of booking requests</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.bookingNotifications || false}
                      onCheckedChange={(value) => handleNotificationChange("bookingNotifications", value)}
                    />
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6 mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4"
              >
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Alert Preferences
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">Email Notifications</p>
                      <p className="text-xs text-slate-600">Receive email updates</p>
                    </div>
                    <Switch 
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">Push Notifications</p>
                      <p className="text-xs text-slate-600">Receive browser notifications</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(value) => handleNotificationChange("pushNotifications", value)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">Message Notifications</p>
                      <p className="text-xs text-slate-600">Get notified of new messages</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.messageNotifications}
                      onCheckedChange={(value) => handleNotificationChange("messageNotifications", value)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">Like Notifications</p>
                      <p className="text-xs text-slate-600">Get notified when posts are liked</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.likeNotifications}
                      onCheckedChange={(value) => handleNotificationChange("likeNotifications", value)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">Follow Notifications</p>
                      <p className="text-xs text-slate-600">Get notified when followed</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.followNotifications}
                      onCheckedChange={(value) => handleNotificationChange("followNotifications", value)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">Booking Notifications</p>
                      <p className="text-xs text-slate-600">Get notified of booking requests</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.bookingNotifications}
                      onCheckedChange={(value) => handleNotificationChange("bookingNotifications", value)}
                    />
                  </div>
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Delete Account Confirmation */}
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