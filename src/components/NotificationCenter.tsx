import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Check, Trash2 } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const notifications = useQuery(api.comments.getNotifications, {});
  const markAsRead = useMutation(api.comments.markNotificationAsRead);
  const clearAll = useMutation(api.comments.clearAllNotifications);

  const unreadCount = notifications?.filter((n) => !n.read).length || 0;

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead({ notificationId: notificationId as any });
    } catch (error) {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAll({});
      toast.success("All notifications cleared");
    } catch (error) {
      toast.error("Failed to clear notifications");
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return "❤️";
      case "comment":
        return "💬";
      case "share":
        return "🔄";
      case "message":
        return "💌";
      default:
        return "🔔";
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
      >
        <Bell className="h-5 w-5 text-slate-700 dark:text-slate-300" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 z-50"
          >
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleClearAll}
                  className="text-xs"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            <ScrollArea className="h-96">
              {notifications && notifications.length > 0 ? (
                <div className="p-2 space-y-2">
                  {notifications.map((notif) => (
                    <motion.div
                      key={notif._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        notif.read
                          ? "bg-slate-50 dark:bg-slate-700/30"
                          : "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                      }`}
                      onClick={() => handleMarkAsRead(notif._id)}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl">{getNotificationIcon(notif.type)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-900 dark:text-white break-words">
                            {notif.content}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {new Date(notif._creationTime).toLocaleDateString()}
                          </p>
                        </div>
                        {!notif.read && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"
                          />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <Bell className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">No notifications yet</p>
                </div>
              )}
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
