import { motion } from "framer-motion";
import { Share2, MessageCircle, Mail, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface SocialShareMenuProps {
  title: string;
  url?: string;
  onWhatsApp?: () => void;
  onFacebook?: () => void;
  onTwitter?: () => void;
  onLinkedIn?: () => void;
  onTelegram?: () => void;
  onCopyLink?: () => void;
}

export function SocialShareMenu({
  title,
  url,
  onWhatsApp,
  onFacebook,
  onTwitter,
  onLinkedIn,
  onTelegram,
  onCopyLink,
}: SocialShareMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-2 hover:bg-white/50 active:scale-95 transition-all duration-150"
        >
          <Share2 className="h-4 w-4 text-slate-900" strokeWidth={1.5} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="rounded-xl w-56">
        <div className="p-2 space-y-1">
          <p className="text-xs font-semibold text-slate-600 px-2 py-1">Share to Social Media</p>

          {onWhatsApp && (
            <DropdownMenuItem onClick={onWhatsApp} className="cursor-pointer">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">W</span>
                </div>
                <span className="text-green-600 font-semibold">WhatsApp</span>
              </div>
            </DropdownMenuItem>
          )}

          {onFacebook && (
            <DropdownMenuItem onClick={onFacebook} className="cursor-pointer">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">f</span>
                </div>
                <span className="text-blue-600 font-semibold">Facebook</span>
              </div>
            </DropdownMenuItem>
          )}

          {onTwitter && (
            <DropdownMenuItem onClick={onTwitter} className="cursor-pointer">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">𝕏</span>
                </div>
                <span className="text-black font-semibold">X (Twitter)</span>
              </div>
            </DropdownMenuItem>
          )}

          {onLinkedIn && (
            <DropdownMenuItem onClick={onLinkedIn} className="cursor-pointer">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-blue-700 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">in</span>
                </div>
                <span className="text-blue-700 font-semibold">LinkedIn</span>
              </div>
            </DropdownMenuItem>
          )}

          {onTelegram && (
            <DropdownMenuItem onClick={onTelegram} className="cursor-pointer">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✈</span>
                </div>
                <span className="text-blue-500 font-semibold">Telegram</span>
              </div>
            </DropdownMenuItem>
          )}

          {onCopyLink && (
            <DropdownMenuItem onClick={onCopyLink} className="cursor-pointer">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-slate-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">🔗</span>
                </div>
                <span className="text-slate-600 font-semibold">Copy Link</span>
              </div>
            </DropdownMenuItem>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
