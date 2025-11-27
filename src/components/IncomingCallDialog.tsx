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
      <DialogContent className="sm:max-w-md bg-[#0a0a0a]/90 backdrop-blur-2xl border-white/10 shadow-2xl p-0 overflow-hidden ring-1 ring-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-blue-500/5 pointer-events-none" />
        <DialogHeader className="pt-8 px-6 relative z-10">
          <DialogTitle className="text-center text-2xl font-bold text-white tracking-tight">Incoming Call</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center py-8 space-y-6 relative z-10">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-ping opacity-75" />
            <div className="absolute inset-0 bg-purple-500/10 rounded-full animate-pulse delay-75" />
            <Avatar className="h-28 w-28 border-4 border-[#0a0a0a] shadow-2xl relative z-10 ring-2 ring-white/10">
              <AvatarImage src={callerImage} />
              <AvatarFallback className="text-3xl bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                {callerName?.[0] || "IC"}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="text-center space-y-1">
            <p className="text-lg font-medium text-white/90">Incoming {callType} call</p>
            <p className="text-sm text-white/50">{callerName || "Someone"} is calling you...</p>
          </div>
          <div className="flex gap-10 mt-6">
            <Button
              onClick={onReject}
              size="lg"
              className="h-16 w-16 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 shadow-lg transition-all hover:scale-110 hover:shadow-red-500/10"
            >
              <PhoneOff className="h-7 w-7" />
            </Button>
            <Button
              onClick={onAccept}
              size="lg"
              className="h-16 w-16 rounded-full bg-green-500 text-white hover:bg-green-400 shadow-lg shadow-green-500/20 transition-all hover:scale-110 animate-bounce ring-4 ring-green-500/10"
            >
              {callType === "video" ? <Video className="h-7 w-7" /> : <Phone className="h-7 w-7" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}