import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Bell, Bookmark, Home, LogOut, MessageSquare, Package, User } from "lucide-react";
import { useNavigate } from "react-router";

export function Sidebar() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const menuItems = [
    { icon: Home, label: "Feed", path: "/feed" },
    { icon: Package, label: "Services", path: "/services" },
    { icon: MessageSquare, label: "Messages", path: "/messages" },
    { icon: Bookmark, label: "Bookings", path: "/bookings" },
    { icon: Bell, label: "Notifications", path: "/notifications" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 h-screen bg-gradient-to-b from-pink-50 to-purple-50 border-r border-pink-100 p-4 flex flex-col"
    >
      <div className="mb-8 cursor-pointer" onClick={() => navigate("/")}>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-300 to-purple-300 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">🧵</span>
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">A Silent Thread</h1>
            <p className="text-xs text-muted-foreground">Connected experiences</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item, index) => (
          <motion.div
            key={item.path}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 hover:bg-white/50 rounded-xl"
              onClick={() => navigate(item.path)}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Button>
          </motion.div>
        ))}
      </nav>

      <div className="border-t border-pink-100 pt-4 space-y-2">
        <div className="px-3 py-2 bg-white/50 rounded-xl">
          <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 hover:bg-white/50 rounded-xl text-red-500"
          onClick={() => signOut()}
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </Button>
      </div>
    </motion.div>
  );
}
