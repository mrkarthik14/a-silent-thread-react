import { motion } from "framer-motion";
import { Eye } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface PrivacySettings {
  profilePublic: boolean;
  allowMessages: boolean;
  showOnlineStatus: boolean;
  allowFollowing: boolean;
}

interface SettingsPrivacyTabProps {
  privacySettings: PrivacySettings;
  onPrivacyChange: (key: string, value: boolean) => void;
}

export function SettingsPrivacyTab({ privacySettings, onPrivacyChange }: SettingsPrivacyTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4 mt-6"
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
            onCheckedChange={(value) => onPrivacyChange("profilePublic", value)}
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div>
            <p className="font-semibold text-slate-900">Allow Messages</p>
            <p className="text-xs text-slate-600">Let anyone message you</p>
          </div>
          <Switch 
            checked={privacySettings.allowMessages}
            onCheckedChange={(value) => onPrivacyChange("allowMessages", value)}
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div>
            <p className="font-semibold text-slate-900">Show Online Status</p>
            <p className="text-xs text-slate-600">Let others see when you're online</p>
          </div>
          <Switch 
            checked={privacySettings.showOnlineStatus}
            onCheckedChange={(value) => onPrivacyChange("showOnlineStatus", value)}
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div>
            <p className="font-semibold text-slate-900">Allow Following</p>
            <p className="text-xs text-slate-600">Let others follow your account</p>
          </div>
          <Switch 
            checked={privacySettings.allowFollowing}
            onCheckedChange={(value) => onPrivacyChange("allowFollowing", value)}
          />
        </div>
      </div>
    </motion.div>
  );
}
