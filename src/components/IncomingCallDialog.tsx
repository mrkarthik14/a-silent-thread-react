import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Video } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface IncomingCallDialogProps {
  isOpen: boolean;
  callType?: "voice" | "video";
  callerName?: string;
  callerImage?: string;
  onAccept: () => void;
  onReject: () => void;
}

export function IncomingCallDialog({
  isOpen,
  callType,
  callerName,
  callerImage,
  onAccept,
  onReject,
}: IncomingCallDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onReject()}>
      <DialogContent className="sm:max-w-md bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-xl border-slate-200 dark:border-[#2a2a2a]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold dark:text-[#f0f0f0]">Incoming Call</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center py-6 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-ping" />
            <Avatar className="h-24 w-24 border-4 border-white dark:border-[#2a2a2a] shadow-xl relative z-10">
              <AvatarImage src={callerImage} />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                {callerName?.[0] || "IC"}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold dark:text-[#f0f0f0]">Incoming {callType} call</p>
            <p className="text-sm text-slate-500 dark:text-[#a0a0a0]">{callerName || "Someone"} is calling you...</p>
          </div>
          <div className="flex gap-8 mt-4">
            <Button
              onClick={onReject}
              size="lg"
              className="h-14 w-14 rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30 shadow-lg transition-all hover:scale-110"
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
            <Button
              onClick={onAccept}
              size="lg"
              className="h-14 w-14 rounded-full bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/30 transition-all hover:scale-110 animate-bounce"
            >
              {callType === "video" ? <Video className="h-6 w-6" /> : <Phone className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
