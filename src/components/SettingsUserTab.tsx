import { motion } from "framer-motion";
import { User, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface SettingsUserTabProps {
  onDeleteAccountClick: () => void;
}

export function SettingsUserTab({ onDeleteAccountClick }: SettingsUserTabProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-6 mt-6">
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
          onClick={onDeleteAccountClick}
          className="w-full rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold"
        >
          Delete Account
        </Button>
      </motion.div>
    </div>
  );
}
