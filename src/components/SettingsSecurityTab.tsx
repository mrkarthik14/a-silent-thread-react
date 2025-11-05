import { motion } from "framer-motion";
import { Shield, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginAlerts: boolean;
  sessionTimeout: number;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  messageNotifications: boolean;
  likeNotifications: boolean;
  followNotifications: boolean;
  bookingNotifications: boolean;
}

interface SettingsSecurityTabProps {
  securitySettings: SecuritySettings;
  notificationSettings: NotificationSettings;
  onSecurityChange: (key: string, value: any) => void;
  onNotificationChange: (key: string, value: boolean) => void;
}

export function SettingsSecurityTab({
  securitySettings,
  notificationSettings,
  onSecurityChange,
  onNotificationChange,
}: SettingsSecurityTabProps) {
  return (
    <div className="space-y-6 mt-6">
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
              onCheckedChange={(value) => onSecurityChange("twoFactorEnabled", value)}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div>
              <p className="font-semibold text-slate-900">Login Alerts</p>
              <p className="text-xs text-slate-600">Get notified of new login attempts</p>
            </div>
            <Switch 
              checked={securitySettings.loginAlerts}
              onCheckedChange={(value) => onSecurityChange("loginAlerts", value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-900 font-semibold">Session Timeout (minutes)</Label>
            <Input 
              type="number" 
              value={securitySettings.sessionTimeout}
              onChange={(e) => onSecurityChange("sessionTimeout", parseInt(e.target.value))}
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
              onCheckedChange={(value) => onNotificationChange("emailNotifications", value)}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div>
              <p className="font-semibold text-slate-900">Push Notifications</p>
              <p className="text-xs text-slate-600">Receive browser notifications</p>
            </div>
            <Switch 
              checked={notificationSettings.pushNotifications}
              onCheckedChange={(value) => onNotificationChange("pushNotifications", value)}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div>
              <p className="font-semibold text-slate-900">Message Notifications</p>
              <p className="text-xs text-slate-600">Get notified of new messages</p>
            </div>
            <Switch 
              checked={notificationSettings.messageNotifications}
              onCheckedChange={(value) => onNotificationChange("messageNotifications", value)}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div>
              <p className="font-semibold text-slate-900">Like Notifications</p>
              <p className="text-xs text-slate-600">Get notified when posts are liked</p>
            </div>
            <Switch 
              checked={notificationSettings.likeNotifications}
              onCheckedChange={(value) => onNotificationChange("likeNotifications", value)}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div>
              <p className="font-semibold text-slate-900">Follow Notifications</p>
              <p className="text-xs text-slate-600">Get notified when followed</p>
            </div>
            <Switch 
              checked={notificationSettings.followNotifications}
              onCheckedChange={(value) => onNotificationChange("followNotifications", value)}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div>
              <p className="font-semibold text-slate-900">Booking Notifications</p>
              <p className="text-xs text-slate-600">Get notified of booking requests</p>
            </div>
            <Switch 
              checked={notificationSettings.bookingNotifications || false}
              onCheckedChange={(value) => onNotificationChange("bookingNotifications", value)}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
