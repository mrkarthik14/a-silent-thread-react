import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Phone, Video, X, Mic, MicOff } from "lucide-react";

interface CallIndicatorProps {
  callStatus: "idle" | "ringing" | "active" | "ended";
  callDuration: number;
  onStartCall: (type: "voice" | "video") => void;
  onEndCall: () => void;
  userName: string;
  isMuted?: boolean;
  onToggleMute?: () => void;
}

export function CallIndicator({
  callStatus,
  callDuration,
  onStartCall,
  onEndCall,
  userName,
  isMuted,
  onToggleMute,
}: CallIndicatorProps) {
  return (
    <>
      {/* Header Status */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-semibold text-slate-900 dark:text-white">{userName}</p>
          {callStatus === "ringing" ? (
            <p className="text-xs text-orange-500 animate-pulse font-medium">Ringing...</p>
          ) : callStatus === "active" ? (
            <p className="text-xs text-emerald-500 font-medium flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              On call • {Math.floor(callDuration / 60)}:
              {String(callDuration % 60).padStart(2, "0")}
            </p>
          ) : null}
        </div>
        {callStatus === "active" && (
          <div className="flex gap-2">
            {onToggleMute && (
              <Button
                onClick={onToggleMute}
                size="sm"
                variant="ghost"
                className={`rounded-xl border ml-2 transition-all hover:scale-105 ${
                  isMuted 
                    ? "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20" 
                    : "bg-white/5 text-slate-500 dark:text-slate-400 border-white/10 hover:bg-white/10"
                }`}
              >
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}
            <Button
              onClick={onEndCall}
              size="sm"
              className="rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 transition-all hover:scale-105"
            >
              End Call
            </Button>
          </div>
        )}
      </div>

      {/* Call in Progress Banner */}
      {callStatus === "active" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 bg-emerald-500/5 backdrop-blur-md rounded-xl p-3 border border-emerald-500/10 flex items-center gap-3 shadow-sm"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"
          />
          <span className="text-sm font-medium text-emerald-500">
            Call in progress
          </span>
        </motion.div>
      )}

      {/* Call Buttons */}
      <div className="flex gap-2 mt-3">
        <Button
          onClick={() => onStartCall("voice")}
          disabled={callStatus !== "idle"}
          className="flex-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-700 dark:text-white transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md active:scale-95"
          title="Start voice call"
        >
          <Phone className="h-4 w-4 mr-2" />
          <span className="text-xs font-medium">Voice</span>
        </Button>
        <Button
          onClick={() => onStartCall("video")}
          disabled={callStatus !== "idle"}
          className="flex-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-700 dark:text-white transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md active:scale-95"
          title="Start video call"
        >
          <Video className="h-4 w-4 mr-2" />
          <span className="text-xs font-medium">Video</span>
        </Button>
      </div>
    </>
  );
}