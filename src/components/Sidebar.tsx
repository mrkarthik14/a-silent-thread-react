import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutGrid, 
  MessageSquare, 
  Calendar, 
  Settings, 
  LogOut, 
  Search, 
  PlusCircle, 
  Bell, 
  User,
  Briefcase,
  Home,
  Bookmark
} from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { useState } from "react";
import { CreatePostDialog } from "@/components/CreatePostDialog";
import { UserSearch } from "@/components/UserSearch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ============================================================================
// STATE AND CONFIGURATION
// ============================================================================

const MENU_ITEMS = [
  { icon: Home, label: "Feed", path: "/feed" },
  { icon: MessageSquare, label: "Messages", path: "/messages" },
  { icon: Bookmark, label: "Bookings", path: "/bookings" },
  { icon: User, label: "Profile", path: "/profile" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

// ============================================================================
// SIDEBAR COMPONENT
// ============================================================================

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user } = useAuth();

  // ========================================================================
  // STATE: Sidebar Expand/Collapse
  // ========================================================================
  const [isCollapsed, setIsCollapsed] = useState(true);

  // ========================================================================
  // STATE: Dialogs
  // ========================================================================
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  // ========================================================================
  // RENDER: Main Sidebar Container
  // ========================================================================
  return (
    <>
      <motion.div
        initial={{ width: 80 }}
        animate={{ width: isCollapsed ? 80 : 256 }}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="h-screen sticky top-0 left-0 z-50 flex flex-col border-r border-slate-200 dark:border-white/10 bg-white/50 dark:bg-[#0d0d0f]/80 backdrop-blur-xl shadow-lg dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-colors duration-500"
      >
        <div className="p-6 flex items-center gap-3 overflow-hidden">
          <div className="h-8 w-8 bg-gradient-to-br from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 rounded-xl flex-shrink-0 shadow-lg" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="flex flex-col overflow-hidden whitespace-nowrap"
              >
                <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white/90">
                  A Silent Thread
                </span>
                <span className="text-[10px] font-medium text-slate-500 dark:text-white/50 tracking-widest uppercase">
                  Connected experiences
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1 px-3 py-4 space-y-2 overflow-y-auto scrollbar-hide">
          {/* Actions */}
          <div className="mb-6 space-y-2">
            <Button
              onClick={() => setSearchOpen(true)}
              variant="ghost"
              className={`w-full justify-start gap-3 rounded-xl transition-all duration-300 group ${
                isCollapsed ? "px-2" : "px-4"
              } hover:bg-slate-100 dark:hover:bg-white/10 dark:text-white/80 dark:hover:text-white`}
            >
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 group-hover:bg-white dark:group-hover:bg-white/10 transition-colors shadow-sm dark:shadow-none dark:border dark:border-white/5">
                <Search className="h-5 w-5 text-slate-700 dark:text-white/80" strokeWidth={1.5} />
              </div>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="font-medium overflow-hidden whitespace-nowrap"
                  >
                    Search Users
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>

            <Button
              onClick={() => setCreatePostOpen(true)}
              className={`w-full justify-start gap-3 rounded-xl transition-all duration-300 group ${
                isCollapsed ? "px-2" : "px-4"
              } bg-slate-900 hover:bg-slate-800 text-white dark:bg-white/10 dark:hover:bg-white/20 dark:border dark:border-white/10 dark:backdrop-blur-md shadow-lg dark:shadow-[0_0_20px_rgba(255,255,255,0.05)]`}
            >
              <div className="p-2 rounded-lg bg-white/10 transition-colors">
                <PlusCircle className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="font-medium overflow-hidden whitespace-nowrap"
                  >
                    Create Post
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </div>

          <div className="h-px bg-slate-200 dark:bg-white/10 mx-2 my-4" />

          {/* Menu Items */}
          <nav className="space-y-1">
            {MENU_ITEMS.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <motion.div
                  key={item.path}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Button
                    onClick={() => navigate(item.path)}
                    variant="ghost"
                    className={`w-full justify-start gap-3 rounded-xl transition-all duration-300 relative overflow-hidden group ${
                      isCollapsed ? "px-2" : "px-4"
                    } ${
                      isActive
                        ? "bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-white dark:border dark:border-white/10 shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-white"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-slate-100 dark:bg-white/5 border-l-4 border-slate-900 dark:border-white"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <div className={`relative z-10 p-1 ${isActive ? "text-slate-900 dark:text-white" : ""}`}>
                      <item.icon className={`h-5 w-5 ${isActive ? "stroke-[2px]" : "stroke-[1.5px]"}`} />
                    </div>
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          className={`font-medium overflow-hidden whitespace-nowrap relative z-10 ${
                            isActive ? "font-semibold" : ""
                          }`}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-transparent">
          <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
            <Avatar className="h-9 w-9 border border-slate-200 dark:border-white/10 shadow-sm">
              <AvatarImage src={user?.image} />
              <AvatarFallback className="bg-slate-100 dark:bg-white/10 dark:text-white">
                {user?.name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex-1 overflow-hidden"
                >
                  <p className="text-sm font-semibold text-slate-900 dark:text-white/90 truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-white/50 truncate">
                    {user?.email}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-white/40 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      <CreatePostDialog open={createPostOpen} onOpenChange={setCreatePostOpen} />
      <UserSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}